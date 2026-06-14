package com.demo.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;
import com.demo.websocket.SensorDataWebSocketHandler;
import org.springframework.beans.factory.annotation.Autowired;

/**
 * WebSocket配置类
 * 配置WebSocket端点和处理器
 */
@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {
    
    @Autowired
    private SensorDataWebSocketHandler sensorDataWebSocketHandler;
    
    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        // 注册WebSocket处理器，允许跨域
        registry.addHandler(sensorDataWebSocketHandler, "/ws/sensor-data")
                .setAllowedOrigins("*"); // 在生产环境中应该配置具体的域名
    }
}