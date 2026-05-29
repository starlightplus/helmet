package com.demo.controller;

import com.demo.service.ClaudeService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/navigation")
@CrossOrigin(origins = "*")
public class NavigationController {

    @Autowired
    private ClaudeService claudeService;

    @Value("${amap.api.key:f693a401338ee91c2f19ee1dc4b10a0f}")
    private String amapKey;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * POST /api/navigation/recommend
     * 根据当前位置和距离档位，用 AI 推荐骑行目的地
     * Body: { distanceLevel: "short"|"medium"|"long", lat: double, lng: double }
     */
    @PostMapping("/recommend")
    public ResponseEntity<?> recommend(@RequestBody Map<String, Object> body) {
        try {
            String distanceLevel = (String) body.getOrDefault("distanceLevel", "short");
            double lat = ((Number) body.getOrDefault("lat", 39.915)).doubleValue();
            double lng = ((Number) body.getOrDefault("lng", 116.404)).doubleValue();

            // 1. 逆地理编码：坐标 → 区域名
            String regionName = reverseGeocode(lat, lng);

            // 2. 距离范围文字
            String distanceRange;
            if ("medium".equals(distanceLevel)) {
                distanceRange = "15-25";
            } else if ("long".equals(distanceLevel)) {
                distanceRange = "35-50";
            } else {
                distanceRange = "5-10";
            }

            // 3. 构造 Prompt
            String prompt = String.format(
                "你是骑行路线推荐助手。用户当前位置：%s，想骑行%s公里。" +
                "请推荐一个该城市真实存在、适合骑行的具体目的地（公园/绿道/景区/湖边/江边），" +
                "必须是%s附近真实的地名，不要编造。给出目的地名称、一句推荐理由、" +
                "距当前位置的大概距离（公里，整数）、预计骑行时间（分钟，整数，按平均15km/h计算）。" +
                "只返回 JSON，不要有任何其他文字：" +
                "{\"name\":\"目的地全称\",\"reason\":\"推荐理由\",\"keywords\":\"公园\",\"distanceKm\":8,\"durationMin\":32}",
                regionName, distanceRange, regionName
            );

            String aiReply = claudeService.chat(
                List.of(Map.of("role", "user", "content", prompt)),
                null
            );

            // 4. 解析 AI 返回的 JSON
            String jsonStr = extractJson(aiReply);
            JsonNode result = objectMapper.readTree(jsonStr);

            return ResponseEntity.ok(Map.of(
                "name",        result.path("name").asText("推荐目的地"),
                "reason",      result.path("reason").asText("适合骑行"),
                "keywords",    result.path("keywords").asText("公园"),
                "distanceKm",  result.path("distanceKm").asInt(0),
                "durationMin", result.path("durationMin").asInt(0)
            ));

        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "推荐失败: " + e.getMessage()));
        }
    }

    /**
     * 调用高德逆地理编码接口，把坐标转成"城市+区+街道"完整描述
     */
    private String reverseGeocode(double lat, double lng) {
        try {
            String url = String.format(
                "https://restapi.amap.com/v3/geocode/regeo?key=%s&location=%s,%s&radius=500&extensions=base&batch=false&roadlevel=0",
                amapKey, lng, lat
            );
            String resp = restTemplate.getForObject(url, String.class);
            JsonNode root = objectMapper.readTree(resp);
            JsonNode addr = root.path("regeocode").path("addressComponent");
            String city     = addr.path("city").asText("");
            String district = addr.path("district").asText("");
            String township = addr.path("township").asText("");
            // 拼成"福州市鼓楼区温泉街道"这样的完整描述
            StringBuilder sb = new StringBuilder();
            if (!city.isBlank())     sb.append(city);
            if (!district.isBlank()) sb.append(district);
            if (!township.isBlank()) sb.append(township);
            return sb.length() > 0 ? sb.toString() : "当前位置";
        } catch (Exception e) {
            return "当前位置";
        }
    }

    /**
     * 从 AI 回复中提取并修复 JSON 字符串
     * 处理 AI 常见问题：全角引号、字符串值内嵌引号
     */
    private String extractJson(String text) {
        if (text == null) return "{}";
        int start = text.indexOf('{');
        int end = text.lastIndexOf('}');
        if (start < 0 || end <= start) return "{}";
        String json = text.substring(start, end + 1);

        // 把全角引号替换为中文括号（避免破坏 JSON 结构）
        json = json.replace('\u201C', '\uff08').replace('\u201D', '\uff09')
                   .replace('\u2018', '\uff08').replace('\u2019', '\uff09');
        return json;
    }
}
