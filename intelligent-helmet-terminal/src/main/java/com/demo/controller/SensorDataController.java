package com.demo.controller;

import com.demo.model.SensorData;
import com.demo.service.SensorDataService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 传感器数据REST API控制器
 * 提供各种数据查询接口给前端调用
 */
@RestController
@RequestMapping("/api/sensor")
@CrossOrigin(origins = "*") // 允许跨域访问
public class SensorDataController {
    
    @Autowired
    private SensorDataService sensorDataService;
    
    /**
     * 获取所有设备的最新传感器数据
     * GET /api/sensor/latest
     */
    @GetMapping("/latest")
    public ResponseEntity<List<SensorData>> getAllLatestData() {
        List<SensorData> latestData = sensorDataService.getAllLatestSensorData();
        return ResponseEntity.ok(latestData);
    }
    
    /**
     * 获取指定设备的最新传感器数据
     * GET /api/sensor/latest/{deviceId}
     */
    @GetMapping("/latest/{deviceId}")
    public ResponseEntity<SensorData> getLatestDataByDevice(@PathVariable String deviceId) {
        SensorData latestData = sensorDataService.getLatestSensorData(deviceId);
        if (latestData != null) {
            return ResponseEntity.ok(latestData);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * 获取指定设备的历史数据
     * GET /api/sensor/history/{deviceId}?limit=100
     */
    @GetMapping("/history/{deviceId}")
    public ResponseEntity<List<SensorData>> getHistoryData(
            @PathVariable String deviceId,
            @RequestParam(defaultValue = "100") int limit) {
        List<SensorData> historyData = sensorDataService.getHistoryData(deviceId, limit);
        return ResponseEntity.ok(historyData);
    }
    

    
    /**
     * 获取所有设备ID列表
     * GET /api/sensor/devices
     */
    @GetMapping("/devices")
    public ResponseEntity<List<String>> getAllDevices() {
        List<String> deviceIds = sensorDataService.getAllDeviceIds();
        return ResponseEntity.ok(deviceIds);
    }
    
    /**
     * 获取系统状态和统计信息
     * GET /api/sensor/status
     */
    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getSystemStatus() {
        Map<String, Object> status = new HashMap<>();
        status.put("status", "运行中");
        status.put("timestamp", LocalDateTime.now());
        status.put("statistics", sensorDataService.getDataStatistics());
        status.put("deviceCount", sensorDataService.getAllDeviceIds().size());
        
        return ResponseEntity.ok(status);
    }
    
    /**
     * 清除指定设备的数据
     * DELETE /api/sensor/data/{deviceId}
     */
    @DeleteMapping("/data/{deviceId}")
    public ResponseEntity<Map<String, String>> clearDeviceData(@PathVariable String deviceId) {
        sensorDataService.clearDeviceData(deviceId);
        Map<String, String> response = new HashMap<>();
        response.put("message", "设备 " + deviceId + " 的数据已清除");
        return ResponseEntity.ok(response);
    }
    
    /**
     * 清除所有数据
     * DELETE /api/sensor/data/all
     */
    @DeleteMapping("/data/all")
    public ResponseEntity<Map<String, String>> clearAllData() {
        sensorDataService.clearAllData();
        Map<String, String> response = new HashMap<>();
        response.put("message", "所有数据已清除");
        return ResponseEntity.ok(response);
    }
    
    /**
     * 清除测试设备数据，只保留真实设备
     * DELETE /api/sensor/data/test-devices
     */
    @DeleteMapping("/data/test-devices")
    public ResponseEntity<Map<String, Object>> clearTestDevices() {
        try {
            // 获取所有设备ID
            List<String> allDevices = sensorDataService.getAllDeviceIds();
            int removedCount = 0;
            
            // 清除以"smart_helmet_"开头的测试设备
            for (String deviceId : allDevices) {
                if (deviceId.startsWith("smart_helmet_") || deviceId.startsWith("test_") || deviceId.startsWith("demo_")) {
                    sensorDataService.clearDeviceData(deviceId);
                    removedCount++;
                }
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "测试设备数据清除完成");
            response.put("removedDevices", removedCount);
            response.put("remainingDevices", sensorDataService.getAllDeviceIds());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "清除测试设备失败: " + e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }
    
    /**
     * 健康检查接口
     * GET /api/sensor/health
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> healthCheck() {
        Map<String, String> health = new HashMap<>();
        health.put("status", "healthy");
        health.put("service", "sensor-data-api");
        health.put("timestamp", LocalDateTime.now().toString());
        return ResponseEntity.ok(health);
    }
    
    /**
     * 生成测试数据接口（用于验证前端显示）
     * POST /api/sensor/test
     */
    @PostMapping("/test")
    public ResponseEntity<Map<String, String>> generateTestData() {
        try {
            // 创建测试数据
            SensorData testData = new SensorData();
            testData.setDeviceId("test_smart_helmet");
            testData.setAppId("test_app_id");
            testData.setTemperature(25.6);
            testData.setHumidity(65.2);
            // 按照GPS坐标显示规范，使用4位小数的十进制度格式
            testData.setLongitude(116.3974); // 东经116.3974°（北京天安门附近）
            testData.setLatitude(39.9093);   // 北纬39.9093°
            testData.setRoll(10.0);          // 横滚角
            testData.setPitch(5.0);          // 俯仰角
            testData.setAvm(8.5);            // 角速度合量
            testData.setGvm(11.2);           // 倾斜合量
            testData.setFallFlag(true);
            testData.setSlowFlag(false);
            testData.setReceiveTime(LocalDateTime.now());
            
            // 保存测试数据
            sensorDataService.saveSensorData(testData);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "测试数据已生成（包含GPS坐标）");
            response.put("deviceId", testData.getDeviceId());
            response.put("gps", "东经" + testData.getLongitude() + "°, 北纬" + testData.getLatitude() + "°");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "生成测试数据失败: " + e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }
    

}