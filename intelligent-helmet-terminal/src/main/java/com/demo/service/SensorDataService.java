package com.demo.service;

import com.demo.model.SensorData;
import com.demo.repository.SensorDataRepository;
import com.demo.websocket.SensorDataWebSocketHandler;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
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

    // 内存缓存（保持实时推送性能）
    private final ConcurrentHashMap<String, CopyOnWriteArrayList<SensorData>> deviceDataMap = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, SensorData> latestDataMap = new ConcurrentHashMap<>();
    private static final int MAX_HISTORY_SIZE = 1000;

    // 每个设备上次写数据库的时间，用于 10 秒节流
    private final ConcurrentHashMap<String, LocalDateTime> lastPersistTimeMap = new ConcurrentHashMap<>();
    private static final int PERSIST_INTERVAL_SECONDS = 10;

    public void saveSensorData(SensorData sensorData) {
        String deviceId = sensorData.getDeviceId();

        // 更新内存缓存
        latestDataMap.put(deviceId, sensorData);
        deviceDataMap.computeIfAbsent(deviceId, k -> new CopyOnWriteArrayList<>()).add(sensorData);
        CopyOnWriteArrayList<SensorData> dataList = deviceDataMap.get(deviceId);
        if (dataList.size() > MAX_HISTORY_SIZE) {
            dataList.remove(0);
        }

        // 10 秒节流写数据库（通过独立 Bean 确保 @Async 生效）
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime lastPersist = lastPersistTimeMap.get(deviceId);
        if (lastPersist == null || now.isAfter(lastPersist.plusSeconds(PERSIST_INTERVAL_SECONDS))) {
            lastPersistTimeMap.put(deviceId, now);
            persistService.persist(sensorData);
        }

        // WebSocket 推送不受节流影响，保持实时
        if (webSocketHandler != null) {
            webSocketHandler.broadcastSensorData(sensorData);
        }
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