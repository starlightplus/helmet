package com.demo.controller;

import com.demo.config.JwtUtil;
import com.demo.model.*;
import com.demo.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = "*")
public class UserDataController {

    @Autowired private JwtUtil jwtUtil;
    @Autowired private UserRepository userRepository;
    @Autowired private UserProfileRepository profileRepository;
    @Autowired private EmergencyContactRepository contactRepository;
    @Autowired private HelmetEventRepository eventRepository;

    // ── 从 token 解析用户 ──────────────────────────────────────────

    private User resolveUser(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) return null;
        String token = authHeader.substring(7);
        if (!jwtUtil.validateToken(token)) return null;
        String username = jwtUtil.extractUsername(token);
        return userRepository.findByUsername(username).orElse(null);
    }

    // ── 个人资料 ───────────────────────────────────────────────────

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(@RequestHeader("Authorization") String auth) {
        User user = resolveUser(auth);
        if (user == null) return ResponseEntity.status(401).body("Unauthorized");

        UserProfile profile = profileRepository.findByUserId(user.getId())
                .orElse(new UserProfile());

        Map<String, Object> res = new HashMap<>();
        res.put("nickname",   profile.getNickname());
        res.put("age",        profile.getAge());
        res.put("height",     profile.getHeight());
        res.put("weight",     profile.getWeight());
        res.put("gender",     profile.getGender());
        res.put("avatarData", profile.getAvatarData());
        res.put("bio",        profile.getBio());
        res.put("weightUnit", profile.getWeightUnit() != null ? profile.getWeightUnit() : "kg");
        res.put("bloodType",  profile.getBloodType());
        res.put("allergies",  profile.getAllergies());
        // 骑行规划
        res.put("planDailyRideMin",  profile.getPlanDailyRideMin());
        res.put("planDailyIntake",   profile.getPlanDailyIntake());
        res.put("planTargetWeight",  profile.getPlanTargetWeight());
        res.put("planWeeks",         profile.getPlanWeeks());
        res.put("planSportText",     profile.getPlanSportText());
        res.put("planDietText",      profile.getPlanDietText());
        res.put("planAcceptedAt",    profile.getPlanAcceptedAt() != null ? profile.getPlanAcceptedAt().toString() : null);
        return ResponseEntity.ok(res);
    }

    @PutMapping("/profile")
    public ResponseEntity<?> saveProfile(@RequestHeader("Authorization") String auth,
                                         @RequestBody Map<String, Object> body) {
        User user = resolveUser(auth);
        if (user == null) return ResponseEntity.status(401).body("Unauthorized");

        UserProfile profile = profileRepository.findByUserId(user.getId())
                .orElse(new UserProfile());
        profile.setUser(user);

        if (body.containsKey("nickname")) profile.setNickname((String) body.get("nickname"));
        if (body.containsKey("age") && body.get("age") != null)
            profile.setAge(((Number) body.get("age")).intValue());
        if (body.containsKey("height") && body.get("height") != null)
            profile.setHeight(((Number) body.get("height")).intValue());
        if (body.containsKey("weight") && body.get("weight") != null)
            profile.setWeight(((Number) body.get("weight")).doubleValue());
        if (body.containsKey("gender"))     profile.setGender((String) body.get("gender"));
        if (body.containsKey("avatarData")) profile.setAvatarData((String) body.get("avatarData"));
        if (body.containsKey("bio"))        profile.setBio((String) body.get("bio"));
        if (body.containsKey("weightUnit")) profile.setWeightUnit((String) body.get("weightUnit"));
        if (body.containsKey("bloodType"))  profile.setBloodType((String) body.get("bloodType"));
        if (body.containsKey("allergies"))  profile.setAllergies((String) body.get("allergies"));
        // 骑行规划字段
        if (body.containsKey("planDailyRideMin") && body.get("planDailyRideMin") != null)
            profile.setPlanDailyRideMin(((Number) body.get("planDailyRideMin")).intValue());
        if (body.containsKey("planDailyIntake") && body.get("planDailyIntake") != null)
            profile.setPlanDailyIntake(((Number) body.get("planDailyIntake")).intValue());
        if (body.containsKey("planTargetWeight") && body.get("planTargetWeight") != null)
            profile.setPlanTargetWeight(((Number) body.get("planTargetWeight")).doubleValue());
        if (body.containsKey("planWeeks") && body.get("planWeeks") != null)
            profile.setPlanWeeks(((Number) body.get("planWeeks")).intValue());
        if (body.containsKey("planSportText"))
            profile.setPlanSportText((String) body.get("planSportText"));
        if (body.containsKey("planDietText"))
            profile.setPlanDietText((String) body.get("planDietText"));
        if (body.containsKey("clearPlan") && Boolean.TRUE.equals(body.get("clearPlan"))) {
            profile.setPlanDailyRideMin(null); profile.setPlanDailyIntake(null);
            profile.setPlanTargetWeight(null); profile.setPlanWeeks(null);
            profile.setPlanSportText(null);    profile.setPlanDietText(null);
            profile.setPlanAcceptedAt(null);
        } else if (body.containsKey("planSportText")) {
            profile.setPlanAcceptedAt(java.time.LocalDateTime.now());
        }

        profileRepository.save(profile);
        return ResponseEntity.ok(Map.of("success", true));
    }

    // ── 紧急联系人 ─────────────────────────────────────────────────

    @GetMapping("/contacts")
    public ResponseEntity<?> getContacts(@RequestHeader("Authorization") String auth) {
        User user = resolveUser(auth);
        if (user == null) return ResponseEntity.status(401).body("Unauthorized");

        List<Map<String, Object>> list = new ArrayList<>();
        for (EmergencyContact c : contactRepository.findByUserId(user.getId())) {
            Map<String, Object> m = new HashMap<>();
            m.put("id",       c.getId());
            m.put("name",     c.getName());
            m.put("phone",    c.getPhone());
            m.put("relation", c.getRelation());
            m.put("notes",    c.getNotes());
            list.add(m);
        }
        return ResponseEntity.ok(list);
    }

    @PostMapping("/contacts")
    public ResponseEntity<?> addContact(@RequestHeader("Authorization") String auth,
                                        @RequestBody Map<String, Object> body) {
        User user = resolveUser(auth);
        if (user == null) return ResponseEntity.status(401).body("Unauthorized");

        EmergencyContact c = new EmergencyContact();
        c.setUser(user);
        c.setName(body.getOrDefault("name", "").toString());
        c.setPhone(body.getOrDefault("phone", "").toString());
        c.setRelation(body.getOrDefault("relation", "").toString());
        c.setNotes(body.containsKey("notes") && body.get("notes") != null ? body.get("notes").toString() : "");
        contactRepository.save(c);

        Map<String, Object> res = new HashMap<>();
        res.put("id",       c.getId());
        res.put("name",     c.getName());
        res.put("phone",    c.getPhone());
        res.put("relation", c.getRelation());
        res.put("notes",    c.getNotes());
        return ResponseEntity.ok(res);
    }

    @DeleteMapping("/contacts/{id}")
    public ResponseEntity<?> deleteContact(@RequestHeader("Authorization") String auth,
                                           @PathVariable Long id) {
        User user = resolveUser(auth);
        if (user == null) return ResponseEntity.status(401).body("Unauthorized");

        contactRepository.deleteByIdAndUserId(id, user.getId());
        return ResponseEntity.ok(Map.of("success", true));
    }

    @PutMapping("/contacts/{id}")
    public ResponseEntity<?> updateContact(@RequestHeader("Authorization") String auth,
                                           @PathVariable Long id,
                                           @RequestBody Map<String, Object> body) {
        User user = resolveUser(auth);
        if (user == null) return ResponseEntity.status(401).body("Unauthorized");

        EmergencyContact c = contactRepository.findById(id).orElse(null);
        if (c == null || !c.getUser().getId().equals(user.getId()))
            return ResponseEntity.status(404).body("Not found");

        if (body.containsKey("name"))     c.setName(body.get("name").toString());
        if (body.containsKey("phone"))    c.setPhone(body.get("phone").toString());
        if (body.containsKey("relation")) c.setRelation(body.get("relation").toString());
        if (body.containsKey("notes"))    c.setNotes(body.get("notes") != null ? body.get("notes").toString() : "");
        contactRepository.save(c);
        return ResponseEntity.ok(Map.of("success", true));
    }

    // ── 紧急事件 ───────────────────────────────────────────────────

    @GetMapping("/events")
    public ResponseEntity<?> getEvents(@RequestHeader("Authorization") String auth,
                                       @RequestParam(defaultValue = "50") int limit) {
        User user = resolveUser(auth);
        if (user == null) return ResponseEntity.status(401).body("Unauthorized");

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
        return ResponseEntity.ok(list);
    }

    @PostMapping("/events")
    public ResponseEntity<?> saveEvent(@RequestHeader("Authorization") String auth,
                                       @RequestBody Map<String, Object> body) {
        User user = resolveUser(auth);
        if (user == null) return ResponseEntity.status(401).body("Unauthorized");

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
        return ResponseEntity.ok(Map.of("success", true, "id", e.getId()));
    }
}
