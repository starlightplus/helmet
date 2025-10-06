package com.demo.service;

import com.demo.model.SensorData;
import com.demo.websocket.SensorDataWebSocketHandler;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.stream.Collectors;

/**
 * 传感器数据服务类
 * 负责管理传感器数据的存储、获取和实时推送
 */
@Service
public class SensorDataService {
    
    @Autowired
    private SensorDataWebSocketHandler webSocketHandler;
    
    // 使用线程安全的集合存储数据
    // Key: deviceId, Value: 该设备的历史数据列表
    private final ConcurrentHashMap<String, CopyOnWriteArrayList<SensorData>> deviceDataMap = new ConcurrentHashMap<>();
    
    // 存储最新的传感器数据（用于快速获取当前状态）
    private final ConcurrentHashMap<String, SensorData> latestDataMap = new ConcurrentHashMap<>();
    
    // 最大存储的历史记录数量（防止内存溢出）
    private static final int MAX_HISTORY_SIZE = 1000;
    
    /**
     * 保存新的传感器数据
     * @param sensorData 传感器数据
     */
    public void saveSensorData(SensorData sensorData) {
        String deviceId = sensorData.getDeviceId();
        
        // 更新最新数据
        latestDataMap.put(deviceId, sensorData);
        
        // 添加到历史数据
        deviceDataMap.computeIfAbsent(deviceId, k -> new CopyOnWriteArrayList<>()).add(sensorData);
        
        // 限制历史数据大小，移除最旧的数据
        CopyOnWriteArrayList<SensorData> dataList = deviceDataMap.get(deviceId);
        if (dataList.size() > MAX_HISTORY_SIZE) {
            dataList.remove(0); // 移除最旧的数据
        }
        
        System.out.println("保存传感器数据: " + sensorData);
        
        // 通过WebSocket实时推送数据到前端
        if (webSocketHandler != null) {
            webSocketHandler.broadcastSensorData(sensorData);
        }
    }
    
    /**
     * 获取指定设备的最新传感器数据
     * @param deviceId 设备ID
     * @return 最新的传感器数据
     */
    public SensorData getLatestSensorData(String deviceId) {
        return latestDataMap.get(deviceId);
    }
    
    /**
     * 获取所有设备的最新传感器数据
     * @return 所有设备的最新数据列表
     */
    public List<SensorData> getAllLatestSensorData() {
        return latestDataMap.values().stream().collect(Collectors.toList());
    }
    
    /**
     * 获取指定设备的历史数据
     * @param deviceId 设备ID
     * @param limit 返回的最大记录数
     * @return 历史数据列表（按时间倒序）
     */
    public List<SensorData> getHistoryData(String deviceId, int limit) {
        CopyOnWriteArrayList<SensorData> dataList = deviceDataMap.get(deviceId);
        if (dataList == null || dataList.isEmpty()) {
            return List.of();
        }
        
        // 返回最新的limit条记录（倒序）
        int size = dataList.size();
        int startIndex = Math.max(0, size - limit);
        List<SensorData> result = dataList.subList(startIndex, size);
        
        // 倒序排列，最新的在前面
        return result.stream()
                .sorted((a, b) -> b.getReceiveTime().compareTo(a.getReceiveTime()))
                .collect(Collectors.toList());
    }
    
    /**
     * 获取指定设备在某个时间段内的数据
     * @param deviceId 设备ID
     * @param startTime 开始时间
     * @param endTime 结束时间
     * @return 时间段内的数据列表
     */
    public List<SensorData> getDataByTimeRange(String deviceId, LocalDateTime startTime, LocalDateTime endTime) {
        CopyOnWriteArrayList<SensorData> dataList = deviceDataMap.get(deviceId);
        if (dataList == null || dataList.isEmpty()) {
            return List.of();
        }
        
        return dataList.stream()
                .filter(data -> {
                    LocalDateTime receiveTime = data.getReceiveTime();
                    return receiveTime.isAfter(startTime) && receiveTime.isBefore(endTime);
                })
                .sorted((a, b) -> b.getReceiveTime().compareTo(a.getReceiveTime()))
                .collect(Collectors.toList());
    }
    
    /**
     * 获取所有设备ID列表
     * @return 设备ID列表
     */
    public List<String> getAllDeviceIds() {
        return latestDataMap.keySet().stream().collect(Collectors.toList());
    }
    
    /**
     * 清除指定设备的所有数据
     * @param deviceId 设备ID
     */
    public void clearDeviceData(String deviceId) {
        latestDataMap.remove(deviceId);
        deviceDataMap.remove(deviceId);
        System.out.println("已清除设备 " + deviceId + " 的所有数据");
    }
    
    /**
     * 清除所有数据
     */
    public void clearAllData() {
        latestDataMap.clear();
        deviceDataMap.clear();
        System.out.println("已清除所有传感器数据");
    }
    
    /**
     * 获取数据统计信息
     * @return 包含统计信息的字符串
     */
    public String getDataStatistics() {
        int totalDevices = latestDataMap.size();
        int totalRecords = deviceDataMap.values().stream()
                .mapToInt(List::size)
                .sum();
        
        return String.format("设备总数: %d, 历史记录总数: %d", totalDevices, totalRecords);
    }
}