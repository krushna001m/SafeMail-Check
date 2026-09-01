package com.example.safemail.controller;

import com.example.safemail.model.UserRecord;
import com.example.safemail.service.UserService;
import com.example.safemail.util.JwtUtil;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class UserController {
    private final UserService userService;
    private final JwtUtil jwtUtil;

    public UserController(UserService userService, JwtUtil jwtUtil) {
        this.userService = userService;
        this.jwtUtil = jwtUtil;
    }

    @GetMapping("/users/me")
    public ResponseEntity<Map<String, Object>> getCurrentUser(@RequestHeader("Authorization") String authHeader) {
        try {
            String userId = getUserIdFromHeader(authHeader);
            UserRecord user = userService.findById(userId);
            if (user == null) {
                return error(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "User profile not found.");
            }
            return ResponseEntity.ok(userService.toPublicProfile(user));
        } catch (Exception ex) {
            return error(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Authentication required.");
        }
    }

    @PutMapping("/users/profile")
    public ResponseEntity<Map<String, Object>> updateProfile(@RequestHeader("Authorization") String authHeader,
                                                            @RequestBody Map<String, Object> body) {
        try {
            String userId = getUserIdFromHeader(authHeader);
            String name = asString(body.get("name"));
            String organization = asString(body.get("organization"));
            if (name == null || name.isBlank()) {
                return error(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "Name cannot be empty.");
            }
            UserRecord user = userService.updateProfile(userId, name, organization);
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Profile updated successfully.");
            response.put("user", userService.toPublicProfile(user));
            return ResponseEntity.ok(response);
        } catch (Exception ex) {
            return error(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Authentication required.");
        }
    }

    private String getUserIdFromHeader(String header) {
        if (header == null || !header.startsWith("Bearer ")) {
            throw new IllegalArgumentException("Authentication required.");
        }
        return jwtUtil.getUserIdFromToken(header.substring(7));
    }

    private static String asString(Object value) {
        return value == null ? null : String.valueOf(value).trim();
    }

    private static ResponseEntity<Map<String, Object>> error(HttpStatus status, String code, String message) {
        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", java.time.Instant.now().toString());
        body.put("status", status.value());
        body.put("code", code);
        body.put("message", message);
        body.put("path", "/api");
        return ResponseEntity.status(status).body(body);
    }
}
