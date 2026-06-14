package com.demo.service;

import com.demo.model.ChatMessage;
import com.demo.model.User;
import com.demo.repository.ChatMessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class ChatService {

    @Autowired
    private ChatMessageRepository chatMessageRepository;

    public List<Map<String, Object>> getHistory(User user, int limit) {
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
        return list;
    }

    @Transactional
    public void saveUserMessage(User user, String content, String deviceId) {
        ChatMessage msg = new ChatMessage();
        msg.setUser(user);
        msg.setRole("user");
        msg.setContent(content);
        msg.setDeviceId(deviceId);
        msg.setCreatedAt(LocalDateTime.now());
        chatMessageRepository.save(msg);
    }

    @Transactional
    public void saveAssistantMessage(User user, String content, String deviceId) {
        ChatMessage msg = new ChatMessage();
        msg.setUser(user);
        msg.setRole("assistant");
        msg.setContent(content);
        msg.setDeviceId(deviceId);
        msg.setCreatedAt(LocalDateTime.now());
        chatMessageRepository.save(msg);
    }

    @Transactional
    public void clearHistory(User user) {
        chatMessageRepository.deleteByUserId(user.getId());
    }
}
