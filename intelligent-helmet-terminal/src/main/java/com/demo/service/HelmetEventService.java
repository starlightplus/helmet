package com.demo.service;

import com.demo.model.HelmetEvent;
import com.demo.model.User;
import com.demo.repository.HelmetEventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class HelmetEventService {

    @Autowired
    private HelmetEventRepository eventRepository;

    public List<Map<String, Object>> getEvents(User user, int limit) {
        List<HelmetEvent> events = eventRepository.findByUserIdOrderByEventTimeDesc(
                user.getId(), PageRequest.of(0, limit));

        List<Map<String, Object>> list = new ArrayList<>();
        for (HelmetEvent e : events) {
            Map<String, Object> m = new HashMap<>();
            m.put("id",        e.getId());
            m.put("eventType", e.getEventType());
            m.put("eventName", e.getEventName());
            m.put("deviceId",  e.getDeviceId());
            m.put("eventTime", e.getEventTime());
            m.put("longitude", e.getLongitude());
            m.put("latitude",  e.getLatitude());
            list.add(m);
        }
        return list;
    }

    @Transactional
    public Map<String, Object> saveEvent(User user, Map<String, Object> body) {
        HelmetEvent e = new HelmetEvent();
        e.setUser(user);
        e.setEventType((String) body.get("eventType"));
        e.setEventName((String) body.get("eventName"));
        e.setDeviceId((String) body.getOrDefault("deviceId", ""));
        e.setEventTime(LocalDateTime.now());
        if (body.get("longitude") != null)
            e.setLongitude(((Number) body.get("longitude")).doubleValue());
        if (body.get("latitude") != null)
            e.setLatitude(((Number) body.get("latitude")).doubleValue());

        eventRepository.save(e);
        return Map.of("success", true, "id", e.getId());
    }
}
