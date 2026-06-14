package com.demo.controller;

import com.demo.model.User;
import com.demo.service.ChatService;
import com.demo.service.ClaudeService;
import com.demo.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "*")
public class ChatController {

    @Autowired private ClaudeService claudeService;
    @Autowired private UserService userService;
    @Autowired private ChatService chatService;

    @GetMapping("/history")
    public ResponseEntity<?> getHistory(
            @RequestHeader("Authorization") String auth,
            @RequestParam(defaultValue = "200") int limit) {
        User user = userService.resolveUser(auth);
        if (user == null) return ResponseEntity.status(401).body("Unauthorized");
        return ResponseEntity.ok(chatService.getHistory(user, limit));
    }

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

            boolean saveHistory = !Boolean.FALSE.equals(body.get("saveHistory"));
            User user = userService.resolveUser(auth);
            if (user != null && saveHistory) {
                Map<String, String> lastUser = messages.get(messages.size() - 1);
                if ("user".equals(lastUser.get("role"))) {
                    chatService.saveUserMessage(user, lastUser.get("content"), deviceId);
                }
                chatService.saveAssistantMessage(user, reply, deviceId);
            }

            Map<String, Object> result = new HashMap<>();
            result.put("content", reply);
            return ResponseEntity.ok(result);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "AI 服务异常: " + e.getMessage()));
        }
    }

    @DeleteMapping("/history")
    public ResponseEntity<?> clearHistory(@RequestHeader("Authorization") String auth) {
        User user = userService.resolveUser(auth);
        if (user == null) return ResponseEntity.status(401).body("Unauthorized");
        chatService.clearHistory(user);
        return ResponseEntity.ok(Map.of("success", true));
    }
}
