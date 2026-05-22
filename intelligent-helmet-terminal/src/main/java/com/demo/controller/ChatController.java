package com.demo.controller;

import com.demo.config.JwtUtil;
import com.demo.model.ChatMessage;
import com.demo.model.User;
import com.demo.repository.ChatMessageRepository;
import com.demo.repository.UserRepository;
import com.demo.service.ClaudeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "*")
public class ChatController {

    @Autowired private ClaudeService claudeService;
    @Autowired private JwtUtil jwtUtil;
    @Autowired private UserRepository userRepository;
    @Autowired private ChatMessageRepository chatMessageRepository;

    private User resolveUser(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) return null;
        String token = authHeader.substring(7);
        if (!jwtUtil.validateToken(token)) return null;
        String username = jwtUtil.extractUsername(token);
        return userRepository.findByUsername(username).orElse(null);
    }

    // ── GET /api/chat/history — 加载历史消息（最近 200 条）─────────────
    @GetMapping("/history")
    public ResponseEntity<?> getHistory(
            @RequestHeader("Authorization") String auth,
            @RequestParam(defaultValue = "200") int limit) {
        User user = resolveUser(auth);
        if (user == null) return ResponseEntity.status(401).body("Unauthorized");

        List<ChatMessage> rows = chatMessageRepository.findByUserIdOrderByCreatedAtAsc(
                user.getId(), PageRequest.of(0, limit));

        List<Map<String, Object>> list = new ArrayList<>();
        for (ChatMessage m : rows) {
            Map<String, Object> item = new HashMap<>();
            item.put("id",        m.getId());
            item.put("role",      m.getRole());
            item.put("content",   m.getContent());
            item.put("deviceId",  m.getDeviceId());
            item.put("createdAt", m.getCreatedAt().toString());
            list.add(item);
        }
        return ResponseEntity.ok(list);
    }

    // ── POST /api/chat — 发送消息并保存历史 ───────────────────────────
    @PostMapping
    public ResponseEntity<Map<String, Object>> chat(
            @RequestHeader(value = "Authorization", required = false) String auth,
            @RequestBody Map<String, Object> body) {
        try {
            @SuppressWarnings("unchecked")
            List<Map<String, String>> messages = (List<Map<String, String>>) body.get("messages");
            String deviceId = (String) body.get("deviceId");

            if (messages == null || messages.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "messages 不能为空"));
            }

            String reply = claudeService.chat(messages, deviceId);

            // 解析用户身份，保存本轮消息（user + assistant）
            User user = resolveUser(auth);
            if (user != null) {
                // 只保存最后一条 user 消息（避免重复保存历史）
                Map<String, String> lastUser = messages.get(messages.size() - 1);
                if ("user".equals(lastUser.get("role"))) {
                    ChatMessage userMsg = new ChatMessage();
                    userMsg.setUser(user);
                    userMsg.setRole("user");
                    userMsg.setContent(lastUser.get("content"));
                    userMsg.setDeviceId(deviceId);
                    userMsg.setCreatedAt(LocalDateTime.now());
                    chatMessageRepository.save(userMsg);
                }

                ChatMessage aiMsg = new ChatMessage();
                aiMsg.setUser(user);
                aiMsg.setRole("assistant");
                aiMsg.setContent(reply);
                aiMsg.setDeviceId(deviceId);
                aiMsg.setCreatedAt(LocalDateTime.now());
                chatMessageRepository.save(aiMsg);
            }

            Map<String, Object> result = new HashMap<>();
            result.put("content", reply);
            return ResponseEntity.ok(result);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "AI 服务异常: " + e.getMessage()));
        }
    }

    // ── DELETE /api/chat/history — 清空历史 ───────────────────────────
    @Transactional
    @DeleteMapping("/history")
    public ResponseEntity<?> clearHistory(@RequestHeader("Authorization") String auth) {
        User user = resolveUser(auth);
        if (user == null) return ResponseEntity.status(401).body("Unauthorized");
        chatMessageRepository.deleteByUserId(user.getId());
        return ResponseEntity.ok(Map.of("success", true));
    }
}
