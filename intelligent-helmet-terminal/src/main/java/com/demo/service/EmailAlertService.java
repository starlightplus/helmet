package com.demo.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

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

    /**
     * 发送摔倒告警邮件
     *
     * @param toEmail     收件人邮箱
     * @param contactName 紧急联系人姓名
     * @param riderName   骑行者姓名
     * @param time        摔倒时间（HH:mm）
     * @return true=发送成功
     */
    public boolean sendFallAlert(String toEmail, String contactName, String riderName, String time) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromAddress);
            helper.setTo(toEmail);
            helper.setSubject("【智能头盔】摔倒告警通知");

            String html = "<div style='font-family:sans-serif;max-width:480px;margin:0 auto;border:1px solid #e0e0e0;border-radius:8px;overflow:hidden'>"
                    + "<div style='background:#d32f2f;padding:16px 24px'>"
                    + "<h2 style='color:#fff;margin:0'>⚠️ 摔倒告警</h2>"
                    + "</div>"
                    + "<div style='padding:24px'>"
                    + "<p style='font-size:15px'>您好 <strong>" + contactName + "</strong>，</p>"
                    + "<p style='font-size:15px'>您的联系人 <strong>" + riderName + "</strong> 于 <strong>" + time + "</strong> 被智能头盔检测到疑似摔倒。</p>"
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
}
