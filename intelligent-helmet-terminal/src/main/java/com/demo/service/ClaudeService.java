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
     * 预设问答表：key 是关键词（用户消息包含该词即命中），value 是直接返回的答案。
     * 支持多个关键词命中同一答案，用 List 包多条 entry 即可。
     * 修改后重启后端生效。
     */
    private static final List<Map.Entry<String[], String>> FAQ = List.of(
        Map.entry(new String[]{"你是谁", "你叫什么", "介绍一下你自己"},
            "我是**灵盔 AI 助手**，专为智能头盔终端设计。我能帮你分析实时传感器数据、提供骑行安全建议、解读环境状况，以及回答头盔使用相关问题。"),
        Map.entry(new String[]{"紧急联系", "急救", "救援电话"},
            "紧急情况请立即拨打 **120**（急救）或 **110**（报警）。您也可以在「个人资料」页面设置紧急联系人，系统检测到跌倒时会自动提醒。"),
        Map.entry(new String[]{"头盔怎么用", "如何使用头盔", "头盔使用说明"},
            "智能头盔使用步骤：\n1. 开机后等待设备连接（设备ID会出现在主界面）\n2. 佩戴头盔，确保传感器贴合\n3. 主界面实时显示温度、湿度、姿态角和GPS位置\n4. 跌倒检测自动触发，无需手动操作\n5. 可在「骑行记录」查看历史轨迹"),
        Map.entry(new String[]{"跌倒检测", "摔倒检测", "fall"},
            "跌倒检测基于 IMU 传感器的角速度合量和倾斜合量综合判断。当检测到异常姿态变化时，系统会在界面顶部显示红色警告，并记录事件到「紧急事件预览」列表。"),
        Map.entry(new String[]{"电量", "没电", "充电"},
            "关于头盔电量：请参考头盔硬件说明书中的充电指引。建议每次骑行前确认电量充足，低电量时传感器数据可能不稳定。"),
        Map.entry(new String[]{"隐私", "数据安全", "数据会泄露吗"},
            "您的数据安全说明：\n- 传感器数据仅存储在本地服务器，不上传第三方\n- 账号使用 JWT 认证，token 24小时过期\n- 对话历史仅您本人可见\n- 如需删除数据，可在设置中清空"),
        Map.entry(new String[]{"骑行规划", "规划骑行", "每日计划","规划"},
            "骑行规划功能说明：\n1. 在使用骑行规划功能前，请您先在个人资料中填写好身高、体重数据，再点击骑行卡的骑行规划进入骑行规划页面。\n2. 系统会根据您填写的身高、体重数据以及骑行历史数据辅助制定每日骑行计划，您还需要在减重目标中填写目标体重，然后点击生成骑行规划。\n3. 等待一段时间后，灵盔AI会为您量身定做运动计划和饮食食谱，您可以选择将其作为每日计划，也可以重新生成一份适合您的计划。")
    );

    /**
     * 检查用户消息是否命中预设问答，命中返回答案，否则返回 null
     */
    private String matchFaq(String userMessage) {
        if (userMessage == null || userMessage.isBlank()) return null;
        String lower = userMessage.toLowerCase();
        for (Map.Entry<String[], String> entry : FAQ) {
            for (String keyword : entry.getKey()) {
                if (lower.contains(keyword.toLowerCase())) {
                    return entry.getValue();
                }
            }
        }
        return null;
    }

    /**
     * 发送对话请求到 DeepSeek API（OpenAI 兼容格式）
     */
    public String chat(List<Map<String, String>> messages, String deviceId) throws Exception {
        // 取最后一条 user 消息做 FAQ 匹配
        String lastUserContent = null;
        for (int i = messages.size() - 1; i >= 0; i--) {
            if ("user".equals(messages.get(i).get("role"))) {
                lastUserContent = messages.get(i).get("content");
                break;
            }
        }
        String faqAnswer = matchFaq(lastUserContent);
        if (faqAnswer != null) return faqAnswer;

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
