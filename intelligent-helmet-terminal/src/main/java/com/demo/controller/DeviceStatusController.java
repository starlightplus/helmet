package com.demo.controller;

import com.demo.config.JwtUtil;
import com.demo.model.DeviceStatus;
import com.demo.model.User;
import com.demo.service.DeviceStatusService;
import com.demo.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/device")
@CrossOrigin(origins = "*")
public class DeviceStatusController {

    @Autowired
    private DeviceStatusService deviceStatusService;

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    /**
     * 查当前登录用户绑定设备的状态。未登录/未绑定/无数据返回空对象。
     */
    @GetMapping("/status")
    public ResponseEntity<?> getStatusByToken(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        String deviceId = resolveDeviceId(authHeader);
        if (deviceId == null) return ResponseEntity.ok(Map.of());
        DeviceStatus status = deviceStatusService.getByDeviceId(deviceId);
        return status != null ? ResponseEntity.ok(status) : ResponseEntity.ok(Map.of());
    }

    /**
     * 按 deviceId 直查（管理员或内部使用）。
     */
    @GetMapping("/status/{deviceId}")
    public ResponseEntity<?> getStatusByDevice(@PathVariable String deviceId) {
        DeviceStatus status = deviceStatusService.getByDeviceId(deviceId);
        return status != null ? ResponseEntity.ok(status) : ResponseEntity.ok(Map.of());
    }

    private String resolveDeviceId(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) return null;
        String token = authHeader.substring(7);
        if (!jwtUtil.validateToken(token)) return null;
        String username = jwtUtil.extractUsername(token);
        Optional<User> userOpt = userService.findByUsername(username);
        return userOpt.map(User::getDeviceId).orElse(null);
    }
}
