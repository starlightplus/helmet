package com.demo.controller;

import com.demo.model.User;
import com.demo.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = "*")
public class UserDataController {

    @Autowired private UserService userService;
    @Autowired private UserProfileService profileService;
    @Autowired private SportCheckinService sportCheckinService;
    @Autowired private EmergencyContactService contactService;
    @Autowired private RideSessionService rideSessionService;
    @Autowired private HelmetEventService eventService;

    // ── 个人资料 ───────────────────────────────────────────────────

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(@RequestHeader("Authorization") String auth) {
        User user = userService.resolveUser(auth);
        if (user == null) return ResponseEntity.status(401).body("Unauthorized");
        return ResponseEntity.ok(profileService.getProfile(user));
    }

    @PutMapping("/profile")
    public ResponseEntity<?> saveProfile(@RequestHeader("Authorization") String auth,
                                         @RequestBody Map<String, Object> body) {
        User user = userService.resolveUser(auth);
        if (user == null) return ResponseEntity.status(401).body("Unauthorized");
        profileService.saveProfile(user, body);
        return ResponseEntity.ok(Map.of("success", true));
    }

    // ── 运动打卡 ───────────────────────────────────────────────────

    @GetMapping("/sport-checkin")
    public ResponseEntity<?> getSportCheckin(
            @RequestHeader("Authorization") String auth,
            @RequestParam(required = false) String date) {
        User user = userService.resolveUser(auth);
        if (user == null) return ResponseEntity.status(401).body("Unauthorized");
        LocalDate d = (date != null) ? LocalDate.parse(date) : LocalDate.now();
        return ResponseEntity.ok(sportCheckinService.getCheckinByDate(user, d));
    }
// PLACEHOLDER_CONTINUE

    @PutMapping("/sport-checkin")
    public ResponseEntity<?> saveSportCheckin(
            @RequestHeader("Authorization") String auth,
            @RequestBody Map<String, Object> body) {
        User user = userService.resolveUser(auth);
        if (user == null) return ResponseEntity.status(401).body("Unauthorized");
        LocalDate date = LocalDate.parse((String) body.get("date"));
        String sportKey = (String) body.get("sportKey");
        Double value = ((Number) body.get("value")).doubleValue();
        sportCheckinService.saveCheckin(user, date, sportKey, value);
        return ResponseEntity.ok(Map.of("success", true));
    }

    @GetMapping("/sport-checkin/range")
    public ResponseEntity<?> getSportCheckinRange(
            @RequestHeader("Authorization") String auth,
            @RequestParam String from,
            @RequestParam String to) {
        User user = userService.resolveUser(auth);
        if (user == null) return ResponseEntity.status(401).body("Unauthorized");
        return ResponseEntity.ok(sportCheckinService.getCheckinRange(
                user, LocalDate.parse(from), LocalDate.parse(to)));
    }

    // ── 紧急联系人 ─────────────────────────────────────────────────

    @GetMapping("/contacts")
    public ResponseEntity<?> getContacts(@RequestHeader("Authorization") String auth) {
        User user = userService.resolveUser(auth);
        if (user == null) return ResponseEntity.status(401).body("Unauthorized");
        return ResponseEntity.ok(contactService.getContacts(user));
    }

    @PostMapping("/contacts")
    public ResponseEntity<?> addContact(@RequestHeader("Authorization") String auth,
                                        @RequestBody Map<String, Object> body) {
        User user = userService.resolveUser(auth);
        if (user == null) return ResponseEntity.status(401).body("Unauthorized");
        return ResponseEntity.ok(contactService.addContact(user, body));
    }

    @DeleteMapping("/contacts/{id}")
    public ResponseEntity<?> deleteContact(@RequestHeader("Authorization") String auth,
                                           @PathVariable Long id) {
        User user = userService.resolveUser(auth);
        if (user == null) return ResponseEntity.status(401).body("Unauthorized");
        contactService.deleteContact(user, id);
        return ResponseEntity.ok(Map.of("success", true));
    }
// PLACEHOLDER_CONTINUE2

    @PutMapping("/contacts/{id}")
    public ResponseEntity<?> updateContact(@RequestHeader("Authorization") String auth,
                                           @PathVariable Long id,
                                           @RequestBody Map<String, Object> body) {
        User user = userService.resolveUser(auth);
        if (user == null) return ResponseEntity.status(401).body("Unauthorized");
        Map<String, Object> result = contactService.updateContact(user, id, body);
        if (result == null) return ResponseEntity.status(404).body("Not found");
        return ResponseEntity.ok(result);
    }

    // ── 紧急事件 ───────────────────────────────────────────────────

    @GetMapping("/events")
    public ResponseEntity<?> getEvents(@RequestHeader("Authorization") String auth,
                                       @RequestParam(defaultValue = "50") int limit) {
        User user = userService.resolveUser(auth);
        if (user == null) return ResponseEntity.status(401).body("Unauthorized");
        return ResponseEntity.ok(eventService.getEvents(user, limit));
    }

    @PostMapping("/events")
    public ResponseEntity<?> saveEvent(@RequestHeader("Authorization") String auth,
                                       @RequestBody Map<String, Object> body) {
        User user = userService.resolveUser(auth);
        if (user == null) return ResponseEntity.status(401).body("Unauthorized");
        return ResponseEntity.ok(eventService.saveEvent(user, body));
    }

    // ── 骑行历史 ───────────────────────────────────────────────────

    @GetMapping("/rides")
    public ResponseEntity<?> getRides(@RequestHeader("Authorization") String auth,
                                      @RequestParam(defaultValue = "50") int limit) {
        User user = userService.resolveUser(auth);
        if (user == null) return ResponseEntity.status(401).body("Unauthorized");
        return ResponseEntity.ok(rideSessionService.getRides(user, limit));
    }

    @PostMapping("/rides")
    public ResponseEntity<?> saveRide(@RequestHeader("Authorization") String auth,
                                      @RequestBody Map<String, Object> body) {
        User user = userService.resolveUser(auth);
        if (user == null) return ResponseEntity.status(401).body("Unauthorized");
        return ResponseEntity.ok(rideSessionService.saveRide(user, body));
    }

    @DeleteMapping("/rides/{clientId}")
    public ResponseEntity<?> deleteRide(@RequestHeader("Authorization") String auth,
                                        @PathVariable String clientId) {
        User user = userService.resolveUser(auth);
        if (user == null) return ResponseEntity.status(401).body("Unauthorized");
        rideSessionService.deleteRide(user, clientId);
        return ResponseEntity.ok(Map.of("success", true));
    }

    @GetMapping("/rides/range")
    public ResponseEntity<?> getRidesRange(
            @RequestHeader("Authorization") String auth,
            @RequestParam String from,
            @RequestParam String to) {
        User user = userService.resolveUser(auth);
        if (user == null) return ResponseEntity.status(401).body("Unauthorized");
        return ResponseEntity.ok(rideSessionService.getRidesRange(
                user, LocalDate.parse(from), LocalDate.parse(to)));
    }
}
