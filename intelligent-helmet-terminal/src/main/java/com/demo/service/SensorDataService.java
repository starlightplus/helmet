package com.demo.service;

import com.demo.model.EmergencyContact;
import com.demo.model.SensorData;
import com.demo.model.User;
import com.demo.model.UserProfile;
import com.demo.repository.EmergencyContactRepository;
import com.demo.repository.SensorDataRepository;
import com.demo.repository.UserProfileRepository;
import com.demo.repository.UserRepository;
import com.demo.websocket.SensorDataWebSocketHandler;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.stream.Collectors;

@Service
public class SensorDataService {

    @Autowired
    private SensorDataWebSocketHandler webSocketHandler;

    @Autowired
    private SensorDataRepository sensorDataRepository;

    @Autowired
    private SensorDataPersistService persistService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserProfileRepository userProfileRepository;

    @Autowired
    private EmergencyContactRepository emergencyContactRepository;

    @Autowired
    private EmailAlertService emailAlertService;

    // 内存缓存（保持实时推送性能）
    private final ConcurrentHashMap<String, CopyOnWriteArrayList<SensorData>> deviceDataMap = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, SensorData> latestDataMap = new ConcurrentHashMap<>();
    private static final int MAX_HISTORY_SIZE = 1000;

    // 每个设备上次写数据库的时间，用于 10 秒节流
    private final ConcurrentHashMap<String, LocalDateTime> lastPersistTimeMap = new ConcurrentHashMap<>();
    private static final int PERSIST_INTERVAL_SECONDS = 10;

    // 摔倒告警冷却：同一设备 5 分钟内只发一次邮件
    private final ConcurrentHashMap<String, LocalDateTime> lastFallAlertMap = new ConcurrentHashMap<>();
    private static final int FALL_ALERT_COOLDOWN_MINUTES = 5;

    public void saveSensorData(SensorData sensorData) {
        String deviceId = sensorData.getDeviceId();

        // 更新内存缓存
        latestDataMap.put(deviceId, sensorData);
        deviceDataMap.computeIfAbsent(deviceId, k -> new CopyOnWriteArrayList<>()).add(sensorData);
        CopyOnWriteArrayList<SensorData> dataList = deviceDataMap.get(deviceId);
        if (dataList.size() > MAX_HISTORY_SIZE) {
            dataList.remove(0);
        }

        // 10 秒节流写数据库（只有包含有效传感器值才写，flag-only 消息不写库）
        LocalDateTime now = LocalDateTime.now();
        boolean hasSensorValue = sensorData.getTemperature() != null
                || sensorData.getHumidity() != null
                || sensorData.getBattery() != null
                || sensorData.getHeartRate() != null
                || sensorData.getSpo2() != null
                || sensorData.getLongitude() != null;
        if (hasSensorValue) {
            LocalDateTime lastPersist = lastPersistTimeMap.get(deviceId);
            if (lastPersist == null || now.isAfter(lastPersist.plusSeconds(PERSIST_INTERVAL_SECONDS))) {
                lastPersistTimeMap.put(deviceId, now);
                persistService.persist(sensorData);
            }
        }

        // WebSocket 推送不受节流影响，保持实时
        if (webSocketHandler != null) {
            webSocketHandler.broadcastSensorData(sensorData);
        }

        // 摔倒检测：fallFlag=true 且冷却时间已过，发短信给优先联系人
        if (Boolean.TRUE.equals(sensorData.getFallFlag())) {
            LocalDateTime lastAlert = lastFallAlertMap.get(deviceId);
            if (lastAlert == null || now.isAfter(lastAlert.plusMinutes(FALL_ALERT_COOLDOWN_MINUTES))) {
                lastFallAlertMap.put(deviceId, now);
                triggerFallAlert(sensorData);
            }
        }
    }

    private void triggerFallAlert(SensorData sensorData) {
        // 通过 deviceId 找到绑定的用户
        User user = userRepository.findAll().stream()
                .filter(u -> sensorData.getDeviceId().equals(u.getDeviceId()))
                .findFirst().orElse(null);
        if (user == null) {
            System.err.println("[Email] 未找到绑定设备 " + sensorData.getDeviceId() + " 的用户，跳过告警");
            return;
        }

        // 查找优先联系人
        List<EmergencyContact> priorities = emergencyContactRepository.findByUserIdAndPriorityTrue(user.getId());
        if (priorities.isEmpty()) {
            System.err.println("[Email] 用户 " + user.getUsername() + " 未设置优先联系人，跳过告警");
            return;
        }

        // 收件人称呼优先用个人资料里的姓名（nickname），没填则回退到用户名
        String riderName = userProfileRepository.findByUserId(user.getId())
                .map(UserProfile::getNickname)
                .filter(n -> n != null && !n.isBlank())
                .orElse(user.getUsername());
        String time = now().format(DateTimeFormatter.ofPattern("HH:mm"));

        // 经纬度：优先用本次摔倒帧；若无效（null 或未定位的 0,0），回退到该设备最近一次有效 GPS
        Double lng = sensorData.getLongitude();
        Double lat = sensorData.getLatitude();
        if (!isValidGps(lng, lat)) {
            SensorData lastGps = findLastValidGps(sensorData.getDeviceId());
            if (lastGps != null) {
                lng = lastGps.getLongitude();
                lat = lastGps.getLatitude();
                System.out.println("[Email] 摔倒帧 GPS 无效，回退到最近有效定位 -> ["
                        + lng + ", " + lat + "] @ " + lastGps.getReceiveTime());
            } else {
                lng = null;
                lat = null;
                System.err.println("[Email] 摔倒帧 GPS 无效，且数据库无该设备历史有效定位");
            }
        }
        final Double fLng = lng;
        final Double fLat = lat;

        for (EmergencyContact contact : priorities) {
            if (contact.getEmail() != null && !contact.getEmail().isEmpty()) {
                emailAlertService.sendFallAlert(contact.getEmail(), contact.getName(), riderName, time,
                        fLng, fLat,
                        sensorData.getAvm(), sensorData.getGvm());
            } else {
                System.err.println("[Email] 联系人 " + contact.getName() + " 未填写邮箱，跳过");
            }
        }
    }

    /**
     * 判断一对经纬度是否为有效定位：非 null，且不是未定位时的 (0,0)。
     */
    private boolean isValidGps(Double lng, Double lat) {
        if (lng == null || lat == null) return false;
        return !(lng == 0.0 && lat == 0.0);
    }

    /**
     * 查该设备最近一次有效 GPS 记录：先看内存缓存（更实时），再回退数据库。
     */
    private SensorData findLastValidGps(String deviceId) {
        // 内存缓存倒序找第一条有效 GPS 的
        CopyOnWriteArrayList<SensorData> cached = deviceDataMap.get(deviceId);
        if (cached != null) {
            for (int i = cached.size() - 1; i >= 0; i--) {
                SensorData s = cached.get(i);
                if (isValidGps(s.getLongitude(), s.getLatitude())) {
                    return s;
                }
            }
        }
        // 数据库回退
        List<SensorData> rows = sensorDataRepository.findLatestWithGpsByDeviceId(
                deviceId, PageRequest.of(0, 1));
        return rows.isEmpty() ? null : rows.get(0);
    }

    private LocalDateTime now() {
        return LocalDateTime.now();
    }

    public SensorData getLatestSensorData(String deviceId) {
        return latestDataMap.get(deviceId);
    }

    public List<SensorData> getAllLatestSensorData() {
        return latestDataMap.values().stream().collect(Collectors.toList());
    }

    public List<SensorData> getHistoryData(String deviceId, int limit) {
        CopyOnWriteArrayList<SensorData> dataList = deviceDataMap.get(deviceId);
        if (dataList == null || dataList.isEmpty()) {
            return List.of();
        }
        int size = dataList.size();
        int startIndex = Math.max(0, size - limit);
        return dataList.subList(startIndex, size).stream()
                .sorted((a, b) -> b.getReceiveTime().compareTo(a.getReceiveTime()))
                .collect(Collectors.toList());
    }

    // 从数据库查最近N条历史（分钟级别，供前端初始化）
    public List<SensorData> getHistoryFromDB(String deviceId, int limit) {
        return sensorDataRepository.findByDeviceIdOrderByReceiveTimeDesc(
                deviceId, PageRequest.of(0, limit));
    }

    // 从数据库查全局最新一条有 GPS 的记录（不限设备，用于地图初始定位）
    public SensorData getLatestGpsFromDB() {
        List<SensorData> list = sensorDataRepository.findLatestWithGps(PageRequest.of(0, 1));
        return list.isEmpty() ? null : list.get(0);
    }

    // 从数据库查全局最新一条记录（不限设备，用于终端初始化）
    public SensorData getLatestFromDB() {
        PageRequest one = PageRequest.of(0, 1);
        // 以最新一条记录为基础，再用各字段最新非 null 值填充空缺
        List<SensorData> base = sensorDataRepository.findLatestOne(one);
        SensorData result = base.isEmpty() ? new SensorData() : base.get(0);

        if (result.getTemperature() == null) {
            List<Double> v = sensorDataRepository.findLatestTemperature(one);
            if (!v.isEmpty()) result.setTemperature(v.get(0));
        }
        if (result.getHumidity() == null) {
            List<Double> v = sensorDataRepository.findLatestHumidity(one);
            if (!v.isEmpty()) result.setHumidity(v.get(0));
        }
        if (result.getBattery() == null) {
            List<Integer> v = sensorDataRepository.findLatestBattery(one);
            if (!v.isEmpty()) result.setBattery(v.get(0));
        }
        if (result.getVoltage() == null) {
            List<Double> v = sensorDataRepository.findLatestVoltage(one);
            if (!v.isEmpty()) result.setVoltage(v.get(0));
        }
        if (result.getHeartRate() == null) {
            List<Integer> v = sensorDataRepository.findLatestHeartRate(one);
            if (!v.isEmpty()) result.setHeartRate(v.get(0));
        }
        if (result.getSpo2() == null) {
            List<Integer> v = sensorDataRepository.findLatestSpo2(one);
            if (!v.isEmpty()) result.setSpo2(v.get(0));
        }
        return result;
    }

    // 心率历史
    public List<SensorData> getHeartRateHistory(String deviceId, int limit) {
        return sensorDataRepository.findHeartRateHistory(deviceId, PageRequest.of(0, limit));
    }

    // 血氧历史
    public List<SensorData> getSpo2History(String deviceId, int limit) {
        return sensorDataRepository.findSpo2History(deviceId, PageRequest.of(0, limit));
    }

    // 电量历史
    public List<SensorData> getBatteryHistory(String deviceId, int limit) {
        return sensorDataRepository.findBatteryHistory(deviceId, PageRequest.of(0, limit));
    }

    // 从数据库查最近N小时每小时平均值（小时级别）
    public List<Map<String, Object>> getHourlyHistoryFromDB(String deviceId, int hours) {
        LocalDateTime end = LocalDateTime.now();
        LocalDateTime start = end.minusHours(hours);
        List<Object[]> rows = sensorDataRepository.findHourlyAvgByDeviceId(deviceId, start, end);
        List<Map<String, Object>> result = new ArrayList<>();
        for (Object[] row : rows) {
            Map<String, Object> point = new java.util.HashMap<>();
            // row[0] 格式 "2025-03-15 14:00"，只取 HH:00 部分显示
            String hourStr = row[0].toString();
            point.put("hour", hourStr);
            point.put("label", hourStr.length() >= 16 ? hourStr.substring(11, 16) : hourStr);
            point.put("temp", row[1] != null ? ((Number) row[1]).doubleValue() : 0.0);
            point.put("hum",  row[2] != null ? ((Number) row[2]).doubleValue() : 0.0);
            result.add(point);
        }
        return result;
    }

    // 从数据库查最近N天的每天平均值（天级别）
    public List<Map<String, Object>> getDailyHistoryFromDB(String deviceId, int days) {
        LocalDateTime end = LocalDateTime.now();
        LocalDateTime start = end.minusDays(days);
        List<Object[]> rows = sensorDataRepository.findDailyAvgByDeviceId(deviceId, start, end);
        List<Map<String, Object>> result = new ArrayList<>();
        for (Object[] row : rows) {
            Map<String, Object> point = new java.util.HashMap<>();
            point.put("day", row[0].toString());   // DATE 字符串，如 "2025-03-15"
            point.put("temp", row[1] != null ? ((Number) row[1]).doubleValue() : 0.0);
            point.put("hum",  row[2] != null ? ((Number) row[2]).doubleValue() : 0.0);
            result.add(point);
        }
        return result;
    }

    public List<SensorData> getDataByTimeRange(String deviceId, LocalDateTime startTime, LocalDateTime endTime) {
        CopyOnWriteArrayList<SensorData> dataList = deviceDataMap.get(deviceId);
        if (dataList == null || dataList.isEmpty()) {
            return List.of();
        }
        return dataList.stream()
                .filter(data -> {
                    LocalDateTime t = data.getReceiveTime();
                    return t.isAfter(startTime) && t.isBefore(endTime);
                })
                .sorted((a, b) -> b.getReceiveTime().compareTo(a.getReceiveTime()))
                .collect(Collectors.toList());
    }

    public List<String> getAllDeviceIds() {
        return latestDataMap.keySet().stream().collect(Collectors.toList());
    }

    public void clearDeviceData(String deviceId) {
        latestDataMap.remove(deviceId);
        deviceDataMap.remove(deviceId);
    }

    public void clearAllData() {
        latestDataMap.clear();
        deviceDataMap.clear();
    }

    public String getDataStatistics() {
        int totalDevices = latestDataMap.size();
        int totalRecords = deviceDataMap.values().stream().mapToInt(List::size).sum();
        return String.format("设备总数: %d, 内存记录总数: %d", totalDevices, totalRecords);
    }
}