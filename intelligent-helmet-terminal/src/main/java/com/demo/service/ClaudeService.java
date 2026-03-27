package com.demo.service;

import com.demo.model.SensorData;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
public class ClaudeService {

    @Value("${claude.api.key}")
    private String apiKey;

    @Value("${claude.api.url}")
    private String apiUrl;

    @Value("${claude.api.model}")
    private String model;

    @Autowired
    private SensorDataService sensorDataService;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * 发送对话请求到 DeepSeek API（OpenAI 兼容格式）
     */
    public String chat(List<Map<String, String>> messages, String deviceId) throws Exception {
        String systemPrompt = buildSystemPrompt(deviceId);

        // 构建请求体
        ObjectNode body = objectMapper.createObjectNode();
        body.put("model", model);
        body.put("max_tokens", 1024);

        ArrayNode msgArray = body.putArray("messages");

        // system 消息
        ObjectNode sysMsg = objectMapper.createObjectNode();
        sysMsg.put("role", "system");
        sysMsg.put("content", systemPrompt);
        msgArray.add(sysMsg);

        // 对话历史
        for (Map<String, String> msg : messages) {
            ObjectNode m = objectMapper.createObjectNode();
            m.put("role", msg.get("role"));
            m.put("content", msg.get("content"));
            msgArray.add(m);
        }

        // 设置请求头
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        HttpEntity<String> request = new HttpEntity<>(objectMapper.writeValueAsString(body), headers);

        ResponseEntity<String> response = restTemplate.postForEntity(apiUrl, request, String.class);

        // 解析响应
        JsonNode root = objectMapper.readTree(response.getBody());
        return root.path("choices").get(0).path("message").path("content").asText();
    }

    /**
     * 构建包含实时传感器数据的系统提示词
     */
    private String buildSystemPrompt(String deviceId) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("你是智能头盔终端的 AI 助手，名叫「灵盔」。");
        prompt.append("你能帮助用户了解头盔传感器数据、骑行安全建议、环境状况分析等。");
        prompt.append("回答简洁专业，使用中文。\n\n");

        SensorData data = null;
        if (deviceId != null && !deviceId.isEmpty()) {
            data = sensorDataService.getLatestSensorData(deviceId);
        } else {
            List<SensorData> allData = sensorDataService.getAllLatestSensorData();
            if (!allData.isEmpty()) data = allData.get(0);
        }

        if (data != null) {
            prompt.append("【当前设备实时数据】\n");
            if (data.getDeviceId() != null)
                prompt.append("设备ID: ").append(data.getDeviceId()).append("\n");
            if (data.getTemperature() != null)
                prompt.append("温度: ").append(String.format("%.1f", data.getTemperature())).append("°C\n");
            if (data.getHumidity() != null)
                prompt.append("湿度: ").append(String.format("%.1f", data.getHumidity())).append("%\n");
            if (data.getLongitude() != null && data.getLatitude() != null)
                prompt.append("GPS位置: 经度 ").append(data.getLongitude())
                        .append("，纬度 ").append(data.getLatitude()).append("\n");
            if (data.getRoll() != null)
                prompt.append("横滚角(Roll): ").append(String.format("%.1f", data.getRoll())).append("°\n");
            if (data.getPitch() != null)
                prompt.append("俯仰角(Pitch): ").append(String.format("%.1f", data.getPitch())).append("°\n");
            if (data.getAvm() != null)
                prompt.append("角速度合量(AVM): ").append(String.format("%.1f", data.getAvm())).append("°/s\n");
            if (data.getGvm() != null)
                prompt.append("倾斜合量(GVM): ").append(String.format("%.1f", data.getGvm())).append("°\n");
            if (Boolean.TRUE.equals(data.getFallFlag()))
                prompt.append("跌倒检测: ⚠️ 已触发\n");
            if (Boolean.TRUE.equals(data.getSlowFlag()))
                prompt.append("状态: 缓慢行驶\n");
            if (data.getReceiveTime() != null)
                prompt.append("数据时间: ").append(data.getReceiveTime()).append("\n");
        } else {
            prompt.append("【当前设备状态】暂无传感器数据（设备未连接或未上报数据）\n");
        }

        return prompt.toString();
    }
}
