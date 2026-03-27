package com.demo.controller;

import com.demo.model.User;
import com.demo.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*") // 允许跨域访问
public class AuthController {
    
    @Autowired
    private UserService userService;
    
    // 用户注册接口
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
    
    // 用户登录接口
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> request) {
        String username = request.get("username");
        String password = request.get("password");
        
        boolean isValid = userService.validateUser(username, password);
        
        Map<String, Object> response = new HashMap<>();
        if (isValid) {
            response.put("success", true);
            response.put("message", "登录成功");
            response.put("username", username);
        } else {
            response.put("success", false);
            response.put("message", "用户名或密码错误");
        }
        
        return ResponseEntity.ok(response);
    }
    
    // 检查用户名是否已存在
    @GetMapping("/check-username/{username}")
    public ResponseEntity<Map<String, Boolean>> checkUsername(@PathVariable String username) {
        Map<String, Boolean> response = new HashMap<>();
        response.put("exists", userService.existsByUsername(username));
        return ResponseEntity.ok(response);
    }
}