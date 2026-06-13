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
                "请推荐3个该城市真实存在、适合骑行的具体目的地（公园/绿道/景区/湖边/江边），" +
                "必须是%s附近真实的地名，不要编造。每个给出目的地名称、一句推荐理由、" +
                "距当前位置的大概距离（公里）、预计骑行时间（分钟）。" +
                "严格要求：只返回合法 JSON 数组，不要有任何其他文字，" +
                "distanceKm 和 durationMin 必须是纯数字（不加引号），例如：" +
                "[{\"name\":\"示例公园\",\"reason\":\"风景优美\",\"keywords\":\"公园\",\"distanceKm\":5,\"durationMin\":20}]",
                regionName, distanceRange, regionName
            );

            String aiReply = claudeService.chat(
                List.of(Map.of("role", "user", "content", prompt)),
                null
            );

            // 4. 解析 AI 返回的 JSON 数组
            String jsonStr = extractJson(aiReply);
            JsonNode root = objectMapper.readTree(jsonStr);

            // 支持数组或单对象
            java.util.List<java.util.Map<String,Object>> results = new java.util.ArrayList<>();
            java.util.function.Consumer<JsonNode> addItem = node -> results.add(Map.of(
                "name",        node.path("name").asText("推荐目的地"),
                "reason",      node.path("reason").asText("适合骑行"),
                "keywords",    node.path("keywords").asText("公园"),
                "distanceKm",  node.path("distanceKm").asInt(0),
                "durationMin", node.path("durationMin").asInt(0)
            ));
            if (root.isArray()) {
                root.forEach(addItem);
            } else {
                addItem.accept(root);
            }

            return ResponseEntity.ok(Map.of("recommendations", results));

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
     * 从 AI 回复中提取并修复 JSON 字符串（支持数组和对象）
     */
    private String extractJson(String text) {
        if (text == null) return "[]";
        // 优先找数组
        int arrStart = text.indexOf('[');
        int arrEnd   = text.lastIndexOf(']');
        int objStart = text.indexOf('{');
        int objEnd   = text.lastIndexOf('}');

        String json;
        if (arrStart >= 0 && arrEnd > arrStart &&
            (objStart < 0 || arrStart <= objStart)) {
            json = text.substring(arrStart, arrEnd + 1);
        } else if (objStart >= 0 && objEnd > objStart) {
            json = text.substring(objStart, objEnd + 1);
        } else {
            return "[]";
        }

        // 把全角引号替换为普通引号
        json = json.replace('\u201C', '"').replace('\u201D', '"')
                   .replace('\u2018', '\'').replace('\u2019', '\'');

        // 修复 AI 在数字后面多写一个 " 的问题：如 20"} → 20}  或  32", → 32,
        json = json.replaceAll("(\\d)\"(\\s*[,}\\]])", "$1$2");

        // 修复 AI 在布尔/null 后面多写一个 " 的问题
        json = json.replaceAll("(true|false|null)\"(\\s*[,}\\]])", "$1$2");

        return json;
    }
}
