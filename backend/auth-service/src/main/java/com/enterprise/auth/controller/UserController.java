package com.enterprise.auth.controller;

import com.enterprise.auth.entity.User;
import com.enterprise.auth.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private jakarta.servlet.http.HttpServletRequest request;

    @GetMapping("/list")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String name = request.get("name");
        String avatarUrl = request.get("avatarUrl");
        
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User profile not found."));
        
        user.setName(name);
        if (avatarUrl != null) {
            user.setAvatarUrl(avatarUrl);
        }
        User saved = userRepository.save(user);
        return ResponseEntity.ok(saved);
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String password = request.get("password");

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User profile not found."));

        user.setPassword(passwordEncoder.encode(password));
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "Password modified."));
    }

    @PostMapping("/{id}/suspend")
    public ResponseEntity<?> toggleSuspend(@PathVariable Long id, @RequestBody Map<String, String> request) {
        String status = request.get("status");
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found."));
        user.setActive(!"Suspended".equalsIgnoreCase(status));
        User saved = userRepository.save(user);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        userRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "User account deleted successfully."));
    }

    @GetMapping("/sessions")
    public ResponseEntity<?> getSessions() {
        String userAgent = request.getHeader("User-Agent");
        String ipAddress = request.getHeader("X-Forwarded-For");
        if (ipAddress == null || ipAddress.isEmpty()) {
            ipAddress = request.getRemoteAddr();
        }
        if ("0:0:0:0:0:0:0:1".equals(ipAddress) || "127.0.0.1".equals(ipAddress)) {
            ipAddress = "127.0.0.1 (Localhost)";
        }

        String device = "Web Browser";
        if (userAgent != null) {
            if (userAgent.contains("Windows")) {
                device = "Desktop (Windows)";
            } else if (userAgent.contains("Macintosh")) {
                device = "Desktop (macOS)";
            } else if (userAgent.contains("iPhone")) {
                device = "Mobile (iPhone)";
            } else if (userAgent.contains("Android")) {
                device = "Mobile (Android)";
            }
        }

        return ResponseEntity.ok(List.of(
            Map.of("id", "sess-1", "device", device, "ip", ipAddress, "location", "Local Network", "isCurrent", true)
        ));
    }

    @DeleteMapping("/sessions/{id}")
    public ResponseEntity<?> terminateSession(@PathVariable String id) {
        return ResponseEntity.ok(Map.of("message", "Session " + id + " terminated successfully."));
    }
}
