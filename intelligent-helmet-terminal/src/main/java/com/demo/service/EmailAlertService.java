package com.demo.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import javax.mail.internet.MimeMessage;

/**
 * 邮件告警服务
 * 摔倒时通过阿里云邮件推送 SMTP 发送告警邮件给紧急联系人
 */
@Service
public class EmailAlertService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromAddress;

    @Value("${amap.api.key:f693a401338ee91c2f19ee1dc4b10a0f}")
    private String amapKey;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * 发送摔倒告警邮件
     *
     * @param toEmail     收件人邮箱
     * @param contactName 紧急联系人姓名
     * @param riderName   骑行者姓名
     * @param time        摔倒时间（HH:mm）
     * @param longitude   摔倒经度（可为 null）
     * @param latitude    摔倒纬度（可为 null）
     * @param avm         加速度幅值（用于推断撞击程度，可为 null）
     * @param gvm         角速度幅值（用于推断撞击程度，可为 null）
     * @return true=发送成功
     */
    public boolean sendFallAlert(String toEmail, String contactName, String riderName, String time,
                                 Double longitude, Double latitude, Double avm, Double gvm) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromAddress);
            helper.setTo(toEmail);
            helper.setSubject("【灵盔佑驰】用户摔倒告警通知");

            // 经纬度文本 + 逆地理编码地名
            String coordText;
            String placeName;
            if (longitude != null && latitude != null) {
                coordText = String.format("东经 %.6f° , 北纬 %.6f°", longitude, latitude);
                placeName = reverseGeocode(latitude, longitude);
            } else {
                coordText = "未获取到定位信息";
                placeName = "未知位置";
            }

            // 根据 AVM / GVM 推断撞击程度
            String impactLevel = impactLevel(avm, gvm);
            String impactColor = impactColor(avm, gvm);

            String html = "<div style='font-family:sans-serif;max-width:480px;margin:0 auto;border:1px solid #e0e0e0;border-radius:8px;overflow:hidden'>"
                    + "<div style='background:#d32f2f;padding:16px 24px'>"
                    + "<h2 style='color:#fff;margin:0'>⚠️ 摔倒告警</h2>"
                    + "</div>"
                    + "<div style='padding:24px'>"
                    + "<p style='font-size:15px'>您好 <strong>" + contactName + "</strong>，</p>"
                    + "<p style='font-size:15px'>用户 <strong>" + riderName + "</strong> 设置您为紧急联系人</p>"
                    + "<p style='font-size:15px'>用户于 <strong>" + time + "</strong> 被智能头盔检测到疑似摔倒。</p>"
                    + "<div style='margin:16px 0;padding:14px 16px;background:#fafafa;border:1px solid #eee;border-radius:6px'>"
                    + "<p style='font-size:14px;margin:0 0 8px'>📍 <strong>摔倒位置：</strong>" + placeName + "</p>"
                    + "<p style='font-size:13px;margin:0 0 8px;color:#666'>经纬度坐标：" + coordText + "</p>"
                    + "<p style='font-size:14px;margin:0'>💥 <strong>撞击程度：</strong>"
                    + "<span style='color:" + impactColor + ";font-weight:700'>" + impactLevel + "</span></p>"
                    + "</div>"
                    + "<p style='font-size:15px;color:#d32f2f'>请尽快联系确认安全。</p>"
                    + "</div>"
                    + "<div style='background:#f5f5f5;padding:12px 24px;font-size:12px;color:#999'>"
                    + "此邮件由智能头盔系统自动发送，请勿回复。"
                    + "</div>"
                    + "</div>";

            helper.setText(html, true);
            mailSender.send(message);
            System.out.println("[Email] 告警邮件发送成功 -> " + toEmail);
            return true;
        } catch (Exception e) {
            System.err.println("[Email] 发送失败: " + e.getMessage());
            return false;
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
            JsonNode regeo = root.path("regeocode");
            String formatted = regeo.path("formatted_address").asText("");
            if (!formatted.isBlank()) {
                return formatted;
            }
            JsonNode addr = regeo.path("addressComponent");
            String province = addr.path("province").asText("");
            String city     = addr.path("city").asText("");
            String district = addr.path("district").asText("");
            String township = addr.path("township").asText("");
            StringBuilder sb = new StringBuilder();
            if (!province.isBlank()) sb.append(province);
            if (!city.isBlank())     sb.append(city);
            if (!district.isBlank()) sb.append(district);
            if (!township.isBlank()) sb.append(township);
            return sb.length() > 0 ? sb.toString() : "未知位置";
        } catch (Exception e) {
            return "未知位置（逆地理编码失败）";
        }
    }

    /**
     * 根据加速度幅值 AVM 与角速度幅值 GVM 推断本次摔倒的撞击程度。
     * AVM 反映冲击力度，GVM 反映翻滚 / 旋转剧烈程度，两者综合分级。
     */
    private String impactLevel(Double avm, Double gvm) {
        if (avm == null && gvm == null) return "未知（缺少传感器数据）";
        double a = avm == null ? 0 : avm;
        double g = gvm == null ? 0 : gvm;
        // 综合评分：加速度为主，角速度为辅
        double score = a + g * 0.5;
        if (score >= 80) return "极严重撞击（建议立即拨打急救电话）";
        if (score >= 50) return "严重撞击";
        if (score >= 30) return "中等撞击";
        return "轻微撞击";
    }

    private String impactColor(Double avm, Double gvm) {
        double a = avm == null ? 0 : avm;
        double g = gvm == null ? 0 : gvm;
        double score = a + g * 0.5;
        if (score >= 50) return "#d32f2f";
        if (score >= 30) return "#f57c00";
        return "#388e3c";
    }
}
