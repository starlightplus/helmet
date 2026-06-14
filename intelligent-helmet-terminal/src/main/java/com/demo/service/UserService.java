package com.demo.service;

import com.demo.config.JwtUtil;
import com.demo.model.User;
import com.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    /**
     * 从 Authorization header 解析当前用户，无效则返回 null
     */
    public User resolveUser(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) return null;
        String token = authHeader.substring(7);
        if (!jwtUtil.validateToken(token)) return null;
        String username = jwtUtil.extractUsername(token);
        return userRepository.findByUsername(username).orElse(null);
    }

    /**
     * 从 Authorization header 解析用户绑定的设备 ID
     */
    public String resolveDeviceId(String authHeader) {
        User user = resolveUser(authHeader);
        return user != null ? user.getDeviceId() : null;
    }

    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    public boolean existsByUsername(String username) {
        return userRepository.existsByUsername(username);
    }

    public User registerUser(String username, String password) {
        if (existsByUsername(username)) {
            throw new RuntimeException("用户名已存在");
        }
        User user = new User();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(password));
        user.setRole("user");
        return userRepository.save(user);
    }

    public boolean validateUser(String username, String password) {
        Optional<User> userOpt = findByUsername(username);
        if (userOpt.isPresent()) {
            return passwordEncoder.matches(password, userOpt.get().getPassword());
        }
        return false;
    }

    public List<User> findAllUsers() {
        return userRepository.findAll();
    }

    public User assignDevice(Long userId, String deviceId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("用户不存在"));
        user.setDeviceId(deviceId);
        return userRepository.save(user);
    }

    public User setRole(Long userId, String role) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("用户不存在"));
        user.setRole(role);
        return userRepository.save(user);
    }

    public User findById(Long id) {
        return userRepository.findById(id).orElse(null);
    }

    public User save(User user) {
        return userRepository.save(user);
    }

    public void deleteById(Long id) {
        userRepository.deleteById(id);
    }

    /**
     * GitHub OAuth 登录：按 githubId 查找用户，不存在则自动注册
     */
    public User findOrCreateByGithub(String githubId, String githubLogin) {
        Optional<User> existing = userRepository.findByGithubId(githubId);
        if (existing.isPresent()) {
            return existing.get();
        }
        String username = githubLogin;
        if (userRepository.existsByUsername(username)) {
            username = githubLogin + "_gh";
        }
        if (userRepository.existsByUsername(username)) {
            username = githubLogin + "_" + githubId.substring(Math.max(0, githubId.length() - 4));
        }
        User newUser = new User();
        newUser.setUsername(username);
        newUser.setPassword("");
        newUser.setRole("user");
        newUser.setGithubId(githubId);
        return userRepository.save(newUser);
    }

    /**
     * GitHub 绑定
     */
    public void bindGithub(User user, String githubId) {
        user.setGithubId(githubId);
        userRepository.save(user);
    }

    /**
     * GitHub 解绑
     */
    public void unbindGithub(User user) {
        user.setGithubId(null);
        userRepository.save(user);
    }

    public Optional<User> findByGithubId(String githubId) {
        return userRepository.findByGithubId(githubId);
    }
}