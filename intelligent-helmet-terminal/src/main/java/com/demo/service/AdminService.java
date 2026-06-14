package com.demo.service;

import com.demo.model.SensorData;
import com.demo.model.User;
import com.demo.model.UserProfile;
import com.demo.repository.SensorDataRepository;
import com.demo.repository.UserProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AdminService {

    @Autowired
    private SensorDataRepository sensorDataRepository;

    @Autowired
    private UserProfileRepository profileRepository;

    /**
     * 查询指定设备的传感器历史数据（分页）
     */
    public Map<String, Object> getUserSensorData(String deviceId, int page, int size) {
        List<SensorData> records = sensorDataRepository.findByDeviceIdOrderByReceiveTimeDesc(
                deviceId, PageRequest.of(page, size));
        long total = sensorDataRepository.countByDeviceId(deviceId);

        List<Map<String, Object>> list = records.stream().map(s -> {
            Map<String, Object> m = new HashMap<>();
            m.put("id", s.getId());
            m.put("deviceId", s.getDeviceId());
            m.put("temperature", s.getTemperature());
            m.put("humidity", s.getHumidity());
            m.put("longitude", s.getLongitude());
            m.put("latitude", s.getLatitude());
            m.put("roll", s.getRoll());
            m.put("pitch", s.getPitch());
            m.put("avm", s.getAvm());
            m.put("gvm", s.getGvm());
            m.put("heartRate", s.getHeartRate());
            m.put("spo2", s.getSpo2());
            m.put("battery", s.getBattery());
            m.put("voltage", s.getVoltage());
            m.put("fallFlag", s.getFallFlag());
            m.put("slowFlag", s.getSlowFlag());
            m.put("receiveTime", s.getReceiveTime());
            return m;
        }).collect(Collectors.toList());

        return Map.of("records", list, "total", total);
    }

    @Transactional
    public boolean deleteSensorData(Long dataId) {
        if (!sensorDataRepository.existsById(dataId)) return false;
        sensorDataRepository.deleteById(dataId);
        return true;
    }

    @Transactional
    public SensorData updateSensorData(Long dataId, Map<String, Object> body) {
        SensorData s = sensorDataRepository.findById(dataId).orElse(null);
        if (s == null) return null;

        if (body.containsKey("temperature") && body.get("temperature") != null)
            s.setTemperature(((Number) body.get("temperature")).doubleValue());
        if (body.containsKey("humidity") && body.get("humidity") != null)
            s.setHumidity(((Number) body.get("humidity")).doubleValue());
        if (body.containsKey("longitude") && body.get("longitude") != null)
            s.setLongitude(((Number) body.get("longitude")).doubleValue());
        if (body.containsKey("latitude") && body.get("latitude") != null)
            s.setLatitude(((Number) body.get("latitude")).doubleValue());
        if (body.containsKey("heartRate") && body.get("heartRate") != null)
            s.setHeartRate(((Number) body.get("heartRate")).intValue());
        if (body.containsKey("spo2") && body.get("spo2") != null)
            s.setSpo2(((Number) body.get("spo2")).intValue());
        if (body.containsKey("battery") && body.get("battery") != null)
            s.setBattery(((Number) body.get("battery")).intValue());
        if (body.containsKey("fallFlag"))
            s.setFallFlag((Boolean) body.get("fallFlag"));

        return sensorDataRepository.save(s);
    }

    @Transactional
    public SensorData addSensorData(Map<String, Object> body) {
        String deviceId = (String) body.get("deviceId");
        if (deviceId == null || deviceId.isEmpty()) return null;

        SensorData s = new SensorData();
        s.setDeviceId(deviceId);
        if (body.get("temperature") != null) s.setTemperature(((Number) body.get("temperature")).doubleValue());
        if (body.get("humidity") != null) s.setHumidity(((Number) body.get("humidity")).doubleValue());
        if (body.get("longitude") != null) s.setLongitude(((Number) body.get("longitude")).doubleValue());
        if (body.get("latitude") != null) s.setLatitude(((Number) body.get("latitude")).doubleValue());
        if (body.get("heartRate") != null) s.setHeartRate(((Number) body.get("heartRate")).intValue());
        if (body.get("spo2") != null) s.setSpo2(((Number) body.get("spo2")).intValue());
        if (body.get("battery") != null) s.setBattery(((Number) body.get("battery")).intValue());
        if (body.get("fallFlag") != null) s.setFallFlag((Boolean) body.get("fallFlag"));
        s.setReceiveTime(LocalDateTime.now());

        return sensorDataRepository.save(s);
    }
}
