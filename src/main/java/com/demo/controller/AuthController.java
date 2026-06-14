package com.demo.controller;

import com.demo.config.JwtUtil;
import com.demo.model.User;
import com.demo.model.UserProfile;
import com.demo.model.SensorData;
import com.demo.repository.UserProfileRepository;
import com.demo.repository.SensorDataRepository;
import com.demo.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserProfileRepository profileRepository;

    @Autowired
    private SensorDataRepository sensorDataRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

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

    @GetMapping("/admin/users/{id}/profile")
    public ResponseEntity<?> getUserProfile(@PathVariable Long id, Authentication auth) {
        if (!isAdmin(auth)) return ResponseEntity.status(403).body("Forbidden");
        User user = userService.findById(id);
        if (user == null) return ResponseEntity.status(404).body("用户不存在");

        UserProfile profile = profileRepository.findByUserId(id).orElse(new UserProfile());
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

        // 更新 User 字段
        if (body.containsKey("deviceId")) user.setDeviceId((String) body.get("deviceId"));
        if (body.containsKey("role"))     user.setRole((String) body.get("role"));
        userService.save(user);

        // 更新 UserProfile 字段
        UserProfile profile = profileRepository.findByUserId(id).orElse(new UserProfile());
        profile.setUser(user);
        if (body.containsKey("nickname") && body.get("nickname") != null)
            profile.setNickname(body.get("nickname").toString());
        if (body.containsKey("age") && body.get("age") != null)
            profile.setAge(((Number) body.get("age")).intValue());
        if (body.containsKey("height") && body.get("height") != null)
            profile.setHeight(((Number) body.get("height")).intValue());
        if (body.containsKey("weight") && body.get("weight") != null)
            profile.setWeight(((Number) body.get("weight")).doubleValue());
        if (body.containsKey("gender"))    profile.setGender((String) body.get("gender"));
        if (body.containsKey("bio"))       profile.setBio((String) body.get("bio"));
        if (body.containsKey("weightUnit"))profile.setWeightUnit((String) body.get("weightUnit"));
        if (body.containsKey("bloodType")) profile.setBloodType((String) body.get("bloodType"));
        profileRepository.save(profile);

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

    /** 查询用户设备的传感器历史数据（分页） */
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

        List<SensorData> records = sensorDataRepository.findByDeviceIdOrderByReceiveTimeDesc(
                user.getDeviceId(), PageRequest.of(page, size));
        long total = sensorDataRepository.countByDeviceId(user.getDeviceId());

        List<Map<String, Object>> list = records.stream().map(s -> {
            Map<String, Object> m = new HashMap<>();
            m.put("id", s.getId());
            m.put("deviceId", s.getDeviceId());
            m.put("temperature", s.getTemperature());
            m.put("humidity", s.getHumidity());
            m.put("longitude", s.getLongitude());
            m.put("latitude", s.getLatitude());
            m.put("roll", s.getRoll());
            m.put("pitch", s.getPitch());
            m.put("avm", s.getAvm());
            m.put("gvm", s.getGvm());
            m.put("heartRate", s.getHeartRate());
            m.put("spo2", s.getSpo2());
            m.put("battery", s.getBattery());
            m.put("voltage", s.getVoltage());
            m.put("fallFlag", s.getFallFlag());
            m.put("slowFlag", s.getSlowFlag());
            m.put("receiveTime", s.getReceiveTime());
            return m;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(Map.of("records", list, "total", total));
    }

    /** 删除单条传感器记录 */
    @DeleteMapping("/admin/sensor-data/{dataId}")
    public ResponseEntity<?> deleteSensorData(@PathVariable Long dataId, Authentication auth) {
        if (!isAdmin(auth)) return ResponseEntity.status(403).body("Forbidden");
        if (!sensorDataRepository.existsById(dataId))
            return ResponseEntity.status(404).body("记录不存在");
        sensorDataRepository.deleteById(dataId);
        return ResponseEntity.ok(Map.of("success", true));
    }

    /** 修改单条传感器记录 */
    @PutMapping("/admin/sensor-data/{dataId}")
    public ResponseEntity<?> updateSensorData(@PathVariable Long dataId,
                                              @RequestBody Map<String, Object> body,
                                              Authentication auth) {
        if (!isAdmin(auth)) return ResponseEntity.status(403).body("Forbidden");
        SensorData s = sensorDataRepository.findById(dataId).orElse(null);
        if (s == null) return ResponseEntity.status(404).body("记录不存在");

        if (body.containsKey("temperature") && body.get("temperature") != null)
            s.setTemperature(((Number) body.get("temperature")).doubleValue());
        if (body.containsKey("humidity") && body.get("humidity") != null)
            s.setHumidity(((Number) body.get("humidity")).doubleValue());
        if (body.containsKey("longitude") && body.get("longitude") != null)
            s.setLongitude(((Number) body.get("longitude")).doubleValue());
        if (body.containsKey("latitude") && body.get("latitude") != null)
            s.setLatitude(((Number) body.get("latitude")).doubleValue());
        if (body.containsKey("heartRate") && body.get("heartRate") != null)
            s.setHeartRate(((Number) body.get("heartRate")).intValue());
        if (body.containsKey("spo2") && body.get("spo2") != null)
            s.setSpo2(((Number) body.get("spo2")).intValue());
        if (body.containsKey("battery") && body.get("battery") != null)
            s.setBattery(((Number) body.get("battery")).intValue());
        if (body.containsKey("fallFlag"))
            s.setFallFlag((Boolean) body.get("fallFlag"));

        sensorDataRepository.save(s);
        return ResponseEntity.ok(Map.of("success", true));
    }

    /** 手动添加一条传感器记录 */
    @PostMapping("/admin/sensor-data")
    public ResponseEntity<?> addSensorData(@RequestBody Map<String, Object> body, Authentication auth) {
        if (!isAdmin(auth)) return ResponseEntity.status(403).body("Forbidden");
        String deviceId = (String) body.get("deviceId");
        if (deviceId == null || deviceId.isEmpty())
            return ResponseEntity.badRequest().body("deviceId不能为空");

        SensorData s = new SensorData();
        s.setDeviceId(deviceId);
        if (body.get("temperature") != null) s.setTemperature(((Number) body.get("temperature")).doubleValue());
        if (body.get("humidity") != null) s.setHumidity(((Number) body.get("humidity")).doubleValue());
        if (body.get("longitude") != null) s.setLongitude(((Number) body.get("longitude")).doubleValue());
        if (body.get("latitude") != null) s.setLatitude(((Number) body.get("latitude")).doubleValue());
        if (body.get("heartRate") != null) s.setHeartRate(((Number) body.get("heartRate")).intValue());
        if (body.get("spo2") != null) s.setSpo2(((Number) body.get("spo2")).intValue());
        if (body.get("battery") != null) s.setBattery(((Number) body.get("battery")).intValue());
        if (body.get("fallFlag") != null) s.setFallFlag((Boolean) body.get("fallFlag"));
        s.setReceiveTime(LocalDateTime.now());

        sensorDataRepository.save(s);
        return ResponseEntity.ok(Map.of("success", true, "id", s.getId()));
    }

    private boolean isAdmin(Authentication auth) {
        return auth != null && auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
    }
}
