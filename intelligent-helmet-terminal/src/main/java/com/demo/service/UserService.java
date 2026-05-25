package com.demo.service;

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
        // 先按 github_id 查
        Optional<User> existing = userRepository.findByGithubId(githubId);
        if (existing.isPresent()) {
            return existing.get();
        }
        // 用户名冲突时加后缀
        String username = githubLogin;
        if (userRepository.existsByUsername(username)) {
            username = githubLogin + "_gh";
        }
        // 仍然冲突则加 githubId 后几位
        if (userRepository.existsByUsername(username)) {
            username = githubLogin + "_" + githubId.substring(Math.max(0, githubId.length() - 4));
        }
        User newUser = new User();
        newUser.setUsername(username);
        newUser.setPassword(""); // OAuth 用户无密码
        newUser.setRole("user");
        newUser.setGithubId(githubId);
        return userRepository.save(newUser);
    }
}