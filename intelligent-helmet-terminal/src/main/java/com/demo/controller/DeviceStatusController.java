package com.demo.controller;

import com.demo.model.DeviceStatus;
import com.demo.service.DeviceStatusService;
import com.demo.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/device")
@CrossOrigin(origins = "*")
public class DeviceStatusController {

    @Autowired
    private DeviceStatusService deviceStatusService;

    @Autowired
    private UserService userService;

    @GetMapping("/status")
    public ResponseEntity<?> getStatusByToken(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        String deviceId = userService.resolveDeviceId(authHeader);
        if (deviceId == null) return ResponseEntity.ok(Map.of());
        DeviceStatus status = deviceStatusService.getByDeviceId(deviceId);
        return status != null ? ResponseEntity.ok(status) : ResponseEntity.ok(Map.of());
    }

    @GetMapping("/status/{deviceId}")
    public ResponseEntity<?> getStatusByDevice(@PathVariable String deviceId) {
        DeviceStatus status = deviceStatusService.getByDeviceId(deviceId);
        return status != null ? ResponseEntity.ok(status) : ResponseEntity.ok(Map.of());
    }
}
