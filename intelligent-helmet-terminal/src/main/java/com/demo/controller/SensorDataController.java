package com.demo.controller;

import com.demo.config.JwtUtil;
import com.demo.model.SensorData;
import com.demo.model.User;
import com.demo.service.SensorDataService;
import com.demo.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/sensor")
@CrossOrigin(origins = "*")
public class SensorDataController {

    @Autowired
    private SensorDataService sensorDataService;

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    @GetMapping("/latest")
    public ResponseEntity<List<SensorData>> getAllLatestData() {
        return ResponseEntity.ok(sensorDataService.getAllLatestSensorData());
    }

    // 从数据库查最新一条有 GPS 的记录，用于地图初始定位（不依赖内存缓存）
    @GetMapping("/latest-gps")
    public ResponseEntity<?> getLatestGps() {
        SensorData data = sensorDataService.getLatestGpsFromDB();
        if (data == null) return ResponseEntity.ok(Map.of());
        return ResponseEntity.ok(data);
    }

    @GetMapping("/latest/{deviceId}")
    public ResponseEntity<SensorData> getLatestDataByDevice(@PathVariable String deviceId) {
        SensorData latestData = sensorDataService.getLatestSensorData(deviceId);
        return latestData != null ? ResponseEntity.ok(latestData) : ResponseEntity.notFound().build();
    }

    // 小时级别历史（按 token 过滤，返回最近N小时每小时均值）
    @GetMapping("/history/hourly")
    public ResponseEntity<?> getHourlyHistoryByToken(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestParam(defaultValue = "24") int hours) {
        String deviceId = resolveDeviceId(authHeader);
        if (deviceId == null) return ResponseEntity.ok(List.of());
        return ResponseEntity.ok(sensorDataService.getHourlyHistoryFromDB(deviceId, hours));
    }

    // 天级别历史（按 token 过滤，返回最近N天每天均值）
    @GetMapping("/history/daily")
    public ResponseEntity<?> getDailyHistoryByToken(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestParam(defaultValue = "30") int days) {
        String deviceId = resolveDeviceId(authHeader);
        if (deviceId == null) return ResponseEntity.ok(List.of());
        return ResponseEntity.ok(sensorDataService.getDailyHistoryFromDB(deviceId, days));
    }

    // 从数据库查历史数据，按 token 中的用户绑定设备过滤
    @GetMapping("/history")
    public ResponseEntity<?> getHistoryByToken(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestParam(defaultValue = "20") int limit) {

        String deviceId = resolveDeviceId(authHeader);
        if (deviceId == null) {
            // 未登录或未绑定设备，返回空数组而不是 401，避免前端跳转登录页
            return ResponseEntity.ok(List.of());
        }
        List<SensorData> data = sensorDataService.getHistoryFromDB(deviceId, limit);
        return ResponseEntity.ok(data);
    }

    // 按 deviceId 直接查（管理员或内部使用）
    @GetMapping("/history/{deviceId}")
    public ResponseEntity<List<SensorData>> getHistoryData(
            @PathVariable String deviceId,
            @RequestParam(defaultValue = "100") int limit) {
        return ResponseEntity.ok(sensorDataService.getHistoryData(deviceId, limit));
    }

    @GetMapping("/devices")
    public ResponseEntity<List<String>> getAllDevices() {
        return ResponseEntity.ok(sensorDataService.getAllDeviceIds());
    }

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getSystemStatus() {
        Map<String, Object> status = new HashMap<>();
        status.put("status", "运行中");
        status.put("timestamp", LocalDateTime.now());
        status.put("statistics", sensorDataService.getDataStatistics());
        status.put("deviceCount", sensorDataService.getAllDeviceIds().size());
        return ResponseEntity.ok(status);
    }

    @DeleteMapping("/data/{deviceId}")
    public ResponseEntity<Map<String, String>> clearDeviceData(@PathVariable String deviceId) {
        sensorDataService.clearDeviceData(deviceId);
        Map<String, String> response = new HashMap<>();
        response.put("message", "设备 " + deviceId + " 的数据已清除");
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/data/all")
    public ResponseEntity<Map<String, String>> clearAllData() {
        sensorDataService.clearAllData();
        Map<String, String> response = new HashMap<>();
        response.put("message", "所有数据已清除");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> healthCheck() {
        Map<String, String> health = new HashMap<>();
        health.put("status", "healthy");
        health.put("service", "sensor-data-api");
        health.put("timestamp", LocalDateTime.now().toString());
        return ResponseEntity.ok(health);
    }

    @PostMapping("/test")
    public ResponseEntity<Map<String, String>> generateTestData() {
        try {
            SensorData testData = new SensorData();
            testData.setDeviceId("test_smart_helmet");
            testData.setAppId("test_app_id");
            testData.setTemperature(25.6);
            testData.setHumidity(65.2);
            testData.setLongitude(116.3974);
            testData.setLatitude(39.9093);
            testData.setRoll(10.0);
            testData.setPitch(5.0);
            testData.setAvm(8.5);
            testData.setGvm(11.2);
            testData.setFallFlag(true);
            testData.setSlowFlag(false);
            testData.setReceiveTime(LocalDateTime.now());
            sensorDataService.saveSensorData(testData);
            Map<String, String> response = new HashMap<>();
            response.put("message", "测试数据已生成");
            response.put("deviceId", testData.getDeviceId());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "生成测试数据失败: " + e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }

    private String resolveDeviceId(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) return null;
        String token = authHeader.substring(7);
        if (!jwtUtil.validateToken(token)) return null;
        String username = jwtUtil.extractUsername(token);
        Optional<User> userOpt = userService.findByUsername(username);
        return userOpt.map(User::getDeviceId).orElse(null);
    }
}