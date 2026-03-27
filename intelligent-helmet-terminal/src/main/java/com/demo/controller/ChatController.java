package com.demo.controller;

import com.demo.service.ClaudeService;
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

    @Autowired
    private ClaudeService claudeService;

    /**
     * POST /api/chat
     * Body: { "messages": [{"role":"user","content":"..."},...], "deviceId": "xxx" }
     * Response: { "content": "AI回复" }
     */
    @PostMapping
    public ResponseEntity<Map<String, String>> chat(@RequestBody Map<String, Object> body) {
        try {
            @SuppressWarnings("unchecked")
            List<Map<String, String>> messages = (List<Map<String, String>>) body.get("messages");
            String deviceId = (String) body.get("deviceId");

            if (messages == null || messages.isEmpty()) {
                Map<String, String> err = new HashMap<>();
                err.put("error", "messages 不能为空");
                return ResponseEntity.badRequest().body(err);
            }

            String reply = claudeService.chat(messages, deviceId);

            Map<String, String> result = new HashMap<>();
            result.put("content", reply);
            return ResponseEntity.ok(result);

        } catch (Exception e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", "AI 服务异常: " + e.getMessage());
            return ResponseEntity.internalServerError().body(err);
        }
    }
}
