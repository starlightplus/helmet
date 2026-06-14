package com.demo.controller;

import com.demo.config.JwtUtil;
import com.demo.model.User;
import com.demo.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth/oauth/github")
public class GitHubOAuthController {

    @Value("${github.oauth.client-id}")
    private String clientId;

    @Value("${github.oauth.client-secret}")
    private String clientSecret;

    @Value("${github.oauth.redirect-uri}")
    private String redirectUri;

    @Value("${github.oauth.frontend-callback}")
    private String frontendCallback;

    @Autowired private UserService userService;
    @Autowired private JwtUtil jwtUtil;

    private final RestTemplate restTemplate = new RestTemplate();

    @GetMapping("/authorize")
    public void authorize(
            @RequestParam(required = false) String action,
            @RequestParam(required = false) String token,
            HttpServletResponse response) throws IOException {
// PLACEHOLDER_GITHUB_CONTINUE
        String state = "";
        if ("bind".equals(action) && token != null && !token.isEmpty()) {
            state = "&state=bind:" + URLEncoder.encode(token, StandardCharsets.UTF_8);
        }

        String url = "https://github.com/login/oauth/authorize"
                + "?client_id=" + clientId
                + "&redirect_uri=" + URLEncoder.encode(redirectUri, StandardCharsets.UTF_8)
                + "&scope=user:email"
                + "&allow_signup=true"
                + state;
        response.sendRedirect(url);
    }

    @GetMapping("/callback")
    public void callback(
            @RequestParam String code,
            @RequestParam(required = false) String state,
            HttpServletResponse response) throws IOException {
        try {
            String accessToken = exchangeAccessToken(code);
            if (accessToken == null) {
                response.sendRedirect(frontendCallback + "?error=token_failed");
                return;
            }

            Map userInfo = fetchGitHubUser(accessToken);
            if (userInfo == null) {
                response.sendRedirect(frontendCallback + "?error=user_info_failed");
                return;
            }

            String githubId = String.valueOf(userInfo.get("id"));
            String githubLogin = (String) userInfo.get("login");

            // ── 绑定模式 ──
            if (state != null && state.startsWith("bind:")) {
                String existingToken = state.substring(5);
                if (!jwtUtil.validateToken(existingToken)) {
                    response.sendRedirect(frontendCallback + "?error=invalid_token&action=bind");
                    return;
                }
                String username = jwtUtil.extractUsername(existingToken);
                Optional<User> userOpt = userService.findByUsername(username);
                if (userOpt.isEmpty()) {
                    response.sendRedirect(frontendCallback + "?error=user_not_found&action=bind");
                    return;
                }
                Optional<User> existingGithub = userService.findByGithubId(githubId);
                if (existingGithub.isPresent() && !existingGithub.get().getUsername().equals(username)) {
                    response.sendRedirect(frontendCallback + "?error=github_already_bound&action=bind");
                    return;
                }
                userService.bindGithub(userOpt.get(), githubId);
                response.sendRedirect(frontendCallback + "?action=bind&success=true&username="
                        + URLEncoder.encode(username, StandardCharsets.UTF_8));
                return;
            }
// PLACEHOLDER_GITHUB_CONTINUE2

            // ── 登录模式 ──
            User user = userService.findOrCreateByGithub(githubId, githubLogin);
            String jwt = jwtUtil.generateToken(user.getUsername(), user.getRole());

            String redirectUrl = frontendCallback
                    + "?token=" + URLEncoder.encode(jwt, StandardCharsets.UTF_8)
                    + "&username=" + URLEncoder.encode(user.getUsername(), StandardCharsets.UTF_8)
                    + "&role=" + URLEncoder.encode(user.getRole(), StandardCharsets.UTF_8);
            response.sendRedirect(redirectUrl);

        } catch (Exception e) {
            response.sendRedirect(frontendCallback + "?error=" +
                    URLEncoder.encode(e.getMessage() != null ? e.getMessage() : "unknown_error", StandardCharsets.UTF_8));
        }
    }

    @GetMapping("/bind-status")
    public ResponseEntity<?> bindStatus() {
        String username = getCurrentUsername();
        if (username == null) return ResponseEntity.status(401).body(Map.of("error", "未登录"));

        Optional<User> userOpt = userService.findByUsername(username);
        if (userOpt.isEmpty()) return ResponseEntity.status(404).body(Map.of("error", "用户不存在"));

        User user = userOpt.get();
        boolean bound = user.getGithubId() != null && !user.getGithubId().isEmpty();
        return ResponseEntity.ok(Map.of(
                "bound", bound,
                "githubLogin", bound ? user.getGithubId() : ""
        ));
    }

    @PostMapping("/unbind")
    public ResponseEntity<?> unbind() {
        String username = getCurrentUsername();
        if (username == null) return ResponseEntity.status(401).body(Map.of("error", "未登录"));

        Optional<User> userOpt = userService.findByUsername(username);
        if (userOpt.isEmpty()) return ResponseEntity.status(404).body(Map.of("error", "用户不存在"));

        User user = userOpt.get();
        if (user.getPassword() == null || user.getPassword().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "该账号通过 GitHub 创建，无法解绑（请先设置密码）"));
        }
        userService.unbindGithub(user);
        return ResponseEntity.ok(Map.of("success", true, "message", "GitHub 解绑成功"));
    }

    // ── 内部工具方法 ──────────────────────────────────────────────

    private String exchangeAccessToken(String code) {
        HttpHeaders headers = new HttpHeaders();
        headers.setAccept(List.of(MediaType.APPLICATION_JSON));
        headers.setContentType(MediaType.APPLICATION_JSON);
        Map<String, String> body = Map.of(
                "client_id", clientId,
                "client_secret", clientSecret,
                "code", code,
                "redirect_uri", redirectUri
        );
        ResponseEntity<Map> resp = restTemplate.postForEntity(
                "https://github.com/login/oauth/access_token",
                new HttpEntity<>(body, headers), Map.class);
        if (resp.getBody() == null) return null;
        return (String) resp.getBody().get("access_token");
    }

    private Map fetchGitHubUser(String accessToken) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);
        headers.set("User-Agent", "IntelligentHelmet/1.0");
        headers.setAccept(List.of(MediaType.APPLICATION_JSON));
        ResponseEntity<Map> resp = restTemplate.exchange(
                "https://api.github.com/user", HttpMethod.GET,
                new HttpEntity<>(headers), Map.class);
        return resp.getBody();
    }

    private String getCurrentUsername() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) return null;
        Object principal = auth.getPrincipal();
        return principal instanceof String ? (String) principal : null;
    }
}
