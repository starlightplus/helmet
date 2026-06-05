package com.demo.websocket;

import com.demo.model.SensorData;
import com.demo.model.DeviceStatus;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.*;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.CopyOnWriteArraySet;

/**
 * WebSocket处理器
 * 管理WebSocket连接并向前端推送实时数据
 */
@Component
public class SensorDataWebSocketHandler implements WebSocketHandler {
    
    // 使用线程安全的Set存储所有WebSocket会话
    private final CopyOnWriteArraySet<WebSocketSession> sessions = new CopyOnWriteArraySet<>();
    
    // 注入Spring配置的ObjectMapper（包含JavaTimeModule）
    @Autowired
    private ObjectMapper objectMapper;
    
    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        sessions.add(session);
        System.out.println("WebSocket连接已建立，当前连接数: " + sessions.size());
        
        // 向新连接的客户端发送欢迎消息
        sendMessage(session, "连接成功，等待传感器数据...");
    }
    
    @Override
    public void handleMessage(WebSocketSession session, WebSocketMessage<?> message) throws Exception {
        // 处理客户端发送的消息（如果需要的话）
        System.out.println("收到客户端消息: " + message.getPayload());
    }
    
    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) throws Exception {
        System.err.println("WebSocket传输错误: " + exception.getMessage());
        sessions.remove(session);
    }
    
    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus closeStatus) throws Exception {
        sessions.remove(session);
        System.out.println("WebSocket连接已关闭，当前连接数: " + sessions.size());
    }
    
    @Override
    public boolean supportsPartialMessages() {
        return false;
    }
    
    /**
     * 向所有连接的客户端广播传感器数据
     * @param sensorData 传感器数据
     */
    public void broadcastSensorData(SensorData sensorData) {
        if (sessions.isEmpty()) {
            return; // 没有客户端连接，不需要发送
        }
        
        try {
            String jsonData = objectMapper.writeValueAsString(sensorData);
            broadcast(jsonData);
            System.out.println("已向 " + sessions.size() + " 个WebSocket客户端推送数据");
        } catch (Exception e) {
            System.err.println("序列化传感器数据失败: " + e.getMessage());
        }
    }
    
    /**
     * 向所有连接的客户端广播设备状态（包一层 type，前端据此区分）
     */
    public void broadcastDeviceStatus(DeviceStatus status) {
        if (sessions.isEmpty()) {
            return;
        }
        try {
            Map<String, Object> envelope = new HashMap<>();
            envelope.put("type", "deviceStatus");
            envelope.put("payload", status);
            String jsonData = objectMapper.writeValueAsString(envelope);
            broadcast(jsonData);
        } catch (Exception e) {
            System.err.println("序列化设备状态失败: " + e.getMessage());
        }
    }

    /**
     * 向所有连接的客户端广播消息
     * @param message 消息内容
     */
    public void broadcast(String message) {
        // 使用迭代器避免并发修改异常
        sessions.removeIf(session -> {
            try {
                if (session.isOpen()) {
                    session.sendMessage(new TextMessage(message));
                    return false; // 保留这个会话
                } else {
                    return true; // 移除已关闭的会话
                }
            } catch (IOException e) {
                System.err.println("发送WebSocket消息失败: " + e.getMessage());
                return true; // 移除有问题的会话
            }
        });
    }
    
    /**
     * 向指定会话发送消息
     * @param session WebSocket会话
     * @param message 消息内容
     */
    private void sendMessage(WebSocketSession session, String message) {
        try {
            if (session.isOpen()) {
                session.sendMessage(new TextMessage(message));
            }
        } catch (IOException e) {
            System.err.println("发送WebSocket消息失败: " + e.getMessage());
        }
    }
    
    /**
     * 获取当前连接数
     * @return 连接数
     */
    public int getConnectionCount() {
        return sessions.size();
    }
    
    /**
     * 向所有客户端发送系统状态消息
     * @param status 状态信息
     */
    public void broadcastStatus(String status) {
        try {
            // 创建状态消息对象
            Map<String, Object> statusMessage = new java.util.HashMap<String, Object>();
            statusMessage.put("type", "status");
            statusMessage.put("message", status);
            statusMessage.put("timestamp", java.time.LocalDateTime.now());
            
            String jsonMessage = objectMapper.writeValueAsString(statusMessage);
            broadcast(jsonMessage);
        } catch (Exception e) {
            System.err.println("广播状态消息失败: " + e.getMessage());
        }
    }
}