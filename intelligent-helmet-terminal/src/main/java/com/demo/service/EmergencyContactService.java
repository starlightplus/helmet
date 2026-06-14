package com.demo.service;

import com.demo.model.EmergencyContact;
import com.demo.model.User;
import com.demo.repository.EmergencyContactRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class EmergencyContactService {

    @Autowired
    private EmergencyContactRepository contactRepository;

    public List<Map<String, Object>> getContacts(User user) {
        List<Map<String, Object>> list = new ArrayList<>();
        for (EmergencyContact c : contactRepository.findByUserId(user.getId())) {
            Map<String, Object> m = new HashMap<>();
            m.put("id",       c.getId());
            m.put("name",     c.getName());
            m.put("phone",    c.getPhone());
            m.put("email",    c.getEmail());
            m.put("relation", c.getRelation());
            m.put("notes",    c.getNotes());
            m.put("priority", c.isPriority());
            list.add(m);
        }
        return list;
    }

    @Transactional
    public Map<String, Object> addContact(User user, Map<String, Object> body) {
        EmergencyContact c = new EmergencyContact();
        c.setUser(user);
        c.setName(body.getOrDefault("name", "").toString());
        c.setPhone(body.getOrDefault("phone", "").toString());
        c.setRelation(body.getOrDefault("relation", "").toString());
        c.setNotes(body.containsKey("notes") && body.get("notes") != null ? body.get("notes").toString() : "");
        c.setEmail(body.containsKey("email") && body.get("email") != null ? body.get("email").toString() : "");
        c.setPriority(Boolean.TRUE.equals(body.get("priority")));
        contactRepository.save(c);

        Map<String, Object> res = new HashMap<>();
        res.put("id",       c.getId());
        res.put("name",     c.getName());
        res.put("phone",    c.getPhone());
        res.put("email",    c.getEmail());
        res.put("relation", c.getRelation());
        res.put("notes",    c.getNotes());
        res.put("priority", c.isPriority());
        return res;
    }

    @Transactional
    public void deleteContact(User user, Long id) {
        contactRepository.deleteByIdAndUserId(id, user.getId());
    }

    /**
     * 更新联系人，如果不存在或不属于该用户则返回 null
     */
    @Transactional
    public Map<String, Object> updateContact(User user, Long id, Map<String, Object> body) {
        EmergencyContact c = contactRepository.findById(id).orElse(null);
        if (c == null || !c.getUser().getId().equals(user.getId())) return null;

        if (body.containsKey("name"))     c.setName(body.get("name").toString());
        if (body.containsKey("phone"))    c.setPhone(body.get("phone").toString());
        if (body.containsKey("email"))    c.setEmail(body.get("email") != null ? body.get("email").toString() : "");
        if (body.containsKey("relation")) c.setRelation(body.get("relation").toString());
        if (body.containsKey("notes"))    c.setNotes(body.get("notes") != null ? body.get("notes").toString() : "");
        if (body.containsKey("priority")) c.setPriority(Boolean.TRUE.equals(body.get("priority")));
        contactRepository.save(c);
        return Map.of("success", true);
    }
}
