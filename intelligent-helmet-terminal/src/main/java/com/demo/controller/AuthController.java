package com.demo.controller;

import com.demo.config.JwtUtil;
import com.demo.model.SensorData;
import com.demo.model.User;
import com.demo.model.UserProfile;
import com.demo.service.AdminService;
import com.demo.service.UserProfileService;
import com.demo.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired private UserService userService;
    @Autowired private UserProfileService profileService;
    @Autowired private AdminService adminService;
    @Autowired private JwtUtil jwtUtil;
    @Autowired private PasswordEncoder passwordEncoder;

    @PostMapping("/register")
    public ResponseEntity<Map<String, String>> register(@RequestBody Map<String, String> request) {
        String username = request.get("username");
        String password = request.get("password");
        try {
            User user = userService.registerUser(username, password);
            Map<String, String> response = new HashMap<>();
            response.put("message", "注册成功");
            response.put("username", user.getUsername());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> request) {
// PLACEHOLDER_AUTH_CONTINUE
        String username = request.get("username");
        String password = request.get("password");

        Map<String, Object> response = new HashMap<>();
        if (userService.validateUser(username, password)) {
            User user = userService.findByUsername(username).get();
            String token = jwtUtil.generateToken(username, user.getRole());
            response.put("success", true);
            response.put("token", token);
            response.put("username", username);
            response.put("role", user.getRole());
            response.put("deviceId", user.getDeviceId());
        } else {
            response.put("success", false);
            response.put("message", "用户名或密码错误");
        }
        return ResponseEntity.ok(response);
    }

    @GetMapping("/check-username/{username}")
    public ResponseEntity<Map<String, Boolean>> checkUsername(@PathVariable String username) {
        Map<String, Boolean> response = new HashMap<>();
        response.put("exists", userService.existsByUsername(username));
        return ResponseEntity.ok(response);
    }

    // ── 管理员接口 ──────────────────────────────────────────────────

    @PostMapping("/admin/users")
    public ResponseEntity<?> createUser(@RequestBody Map<String, String> body, Authentication auth) {
        if (!isAdmin(auth)) return ResponseEntity.status(403).body("Forbidden");
        String username = body.get("username");
        String password = body.get("password");
        String role = body.getOrDefault("role", "user");
        if (username == null || username.trim().isEmpty())
            return ResponseEntity.badRequest().body("用户名不能为空");
        if (password == null || password.length() < 6)
            return ResponseEntity.badRequest().body("密码至少6位");
        if (userService.existsByUsername(username))
            return ResponseEntity.badRequest().body("用户名已存在");
        User user = new User();
        user.setUsername(username.trim());
        user.setPassword(passwordEncoder.encode(password));
        user.setRole(role);
        userService.save(user);
        Map<String, Object> res = new HashMap<>();
        res.put("success", true);
        res.put("id", user.getId());
        res.put("username", user.getUsername());
        res.put("role", user.getRole());
        return ResponseEntity.ok(res);
    }

    @GetMapping("/admin/users")
    public ResponseEntity<?> listUsers(Authentication auth) {
        if (!isAdmin(auth)) return ResponseEntity.status(403).body("Forbidden");
        List<Map<String, Object>> users = userService.findAllUsers().stream().map(u -> {
            Map<String, Object> m = new HashMap<>();
            m.put("id",        u.getId());
            m.put("username",  u.getUsername());
            m.put("role",      u.getRole());
            m.put("deviceId",  u.getDeviceId());
            m.put("githubId",  u.getGithubId());
            m.put("createdAt", u.getCreatedAt());
            return m;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }
// PLACEHOLDER_AUTH_CONTINUE2

    @GetMapping("/admin/users/{id}/profile")
    public ResponseEntity<?> getUserProfile(@PathVariable Long id, Authentication auth) {
        if (!isAdmin(auth)) return ResponseEntity.status(403).body("Forbidden");
        User user = userService.findById(id);
        if (user == null) return ResponseEntity.status(404).body("用户不存在");

        UserProfile profile = profileService.getByUserId(id);
        Map<String, Object> res = new HashMap<>();
        res.put("id",        user.getId());
        res.put("username",  user.getUsername());
        res.put("role",      user.getRole());
        res.put("deviceId",  user.getDeviceId());
        res.put("githubId",  user.getGithubId());
        res.put("createdAt", user.getCreatedAt());
        res.put("nickname",  profile.getNickname());
        res.put("age",       profile.getAge());
        res.put("height",    profile.getHeight());
        res.put("weight",    profile.getWeight());
        res.put("gender",    profile.getGender());
        res.put("bio",       profile.getBio());
        res.put("weightUnit",profile.getWeightUnit() != null ? profile.getWeightUnit() : "kg");
        res.put("bloodType", profile.getBloodType());
        return ResponseEntity.ok(res);
    }

    @PutMapping("/admin/users/{id}/profile")
    public ResponseEntity<?> updateUserProfile(@PathVariable Long id,
                                               @RequestBody Map<String, Object> body,
                                               Authentication auth) {
        if (!isAdmin(auth)) return ResponseEntity.status(403).body("Forbidden");
        User user = userService.findById(id);
        if (user == null) return ResponseEntity.status(404).body("用户不存在");

        if (body.containsKey("deviceId")) user.setDeviceId((String) body.get("deviceId"));
        if (body.containsKey("role"))     user.setRole((String) body.get("role"));
        userService.save(user);
        profileService.adminUpdateProfile(user, body);
        return ResponseEntity.ok(Map.of("success", true));
    }

    @PutMapping("/admin/users/{id}/password")
    public ResponseEntity<?> resetPassword(@PathVariable Long id,
                                           @RequestBody Map<String, String> body,
                                           Authentication auth) {
        if (!isAdmin(auth)) return ResponseEntity.status(403).body("Forbidden");
        User user = userService.findById(id);
        if (user == null) return ResponseEntity.status(404).body("用户不存在");
        String newPassword = body.get("password");
        if (newPassword == null || newPassword.length() < 6)
            return ResponseEntity.badRequest().body("密码至少6位");
        user.setPassword(passwordEncoder.encode(newPassword));
        userService.save(user);
        return ResponseEntity.ok(Map.of("success", true));
    }

    @DeleteMapping("/admin/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id, Authentication auth) {
        if (!isAdmin(auth)) return ResponseEntity.status(403).body("Forbidden");
        User user = userService.findById(id);
        if (user == null) return ResponseEntity.status(404).body("用户不存在");
        if ("admin".equals(user.getRole()))
            return ResponseEntity.badRequest().body("不能删除管理员账号");
        userService.deleteById(id);
        return ResponseEntity.ok(Map.of("success", true));
    }
// PLACEHOLDER_AUTH_CONTINUE3

    @PostMapping("/admin/assign-device")
    public ResponseEntity<?> assignDevice(@RequestBody Map<String, Object> request, Authentication auth) {
        if (!isAdmin(auth)) return ResponseEntity.status(403).body("Forbidden");
        Long userId = Long.valueOf(request.get("userId").toString());
        String deviceId = (String) request.get("deviceId");
        User user = userService.assignDevice(userId, deviceId);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("username", user.getUsername());
        response.put("deviceId", user.getDeviceId());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/admin/set-role")
    public ResponseEntity<?> setRole(@RequestBody Map<String, Object> request, Authentication auth) {
        if (!isAdmin(auth)) return ResponseEntity.status(403).body("Forbidden");
        Long userId = Long.valueOf(request.get("userId").toString());
        String role = (String) request.get("role");
        User user = userService.setRole(userId, role);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("username", user.getUsername());
        response.put("role", user.getRole());
        return ResponseEntity.ok(response);
    }

    // ── 管理员：传感器数据 CRUD ──────────────────────────────────────

    @GetMapping("/admin/users/{id}/sensor-data")
    public ResponseEntity<?> getUserSensorData(@PathVariable Long id,
                                               @RequestParam(defaultValue = "0") int page,
                                               @RequestParam(defaultValue = "20") int size,
                                               Authentication auth) {
        if (!isAdmin(auth)) return ResponseEntity.status(403).body("Forbidden");
        User user = userService.findById(id);
        if (user == null) return ResponseEntity.status(404).body("用户不存在");
        if (user.getDeviceId() == null || user.getDeviceId().isEmpty())
            return ResponseEntity.ok(Map.of("records", List.of(), "total", 0));
        return ResponseEntity.ok(adminService.getUserSensorData(user.getDeviceId(), page, size));
    }

    @DeleteMapping("/admin/sensor-data/{dataId}")
    public ResponseEntity<?> deleteSensorData(@PathVariable Long dataId, Authentication auth) {
        if (!isAdmin(auth)) return ResponseEntity.status(403).body("Forbidden");
        if (!adminService.deleteSensorData(dataId))
            return ResponseEntity.status(404).body("记录不存在");
        return ResponseEntity.ok(Map.of("success", true));
    }

    @PutMapping("/admin/sensor-data/{dataId}")
    public ResponseEntity<?> updateSensorData(@PathVariable Long dataId,
                                              @RequestBody Map<String, Object> body,
                                              Authentication auth) {
        if (!isAdmin(auth)) return ResponseEntity.status(403).body("Forbidden");
        SensorData result = adminService.updateSensorData(dataId, body);
        if (result == null) return ResponseEntity.status(404).body("记录不存在");
        return ResponseEntity.ok(Map.of("success", true));
    }

    @PostMapping("/admin/sensor-data")
    public ResponseEntity<?> addSensorData(@RequestBody Map<String, Object> body, Authentication auth) {
        if (!isAdmin(auth)) return ResponseEntity.status(403).body("Forbidden");
        SensorData result = adminService.addSensorData(body);
        if (result == null) return ResponseEntity.badRequest().body("deviceId不能为空");
        return ResponseEntity.ok(Map.of("success", true, "id", result.getId()));
    }

    private boolean isAdmin(Authentication auth) {
        return auth != null && auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
    }
}
