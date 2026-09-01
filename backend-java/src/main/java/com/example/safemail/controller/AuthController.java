package com.example.safemail.controller;

import com.example.safemail.model.UserRecord;
import com.example.safemail.service.UserService;
import com.example.safemail.util.JwtUtil;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final UserService userService;
    private final JwtUtil jwtUtil;
    private final Map<String, String> resetTokens = new HashMap<>();

    public AuthController(UserService userService, JwtUtil jwtUtil) {
        this.userService = userService;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@RequestBody Map<String, Object> body) {
        try {
            String name = asString(body.get("name"));
            String email = asString(body.get("email"));
            String password = asString(body.get("password"));
            String confirmPassword = asString(body.get("confirmPassword"));
            String organization = asString(body.get("organization"));

            if (name == null || name.isBlank()) {
                return error(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "Full Name is required.");
            }
            if (email == null || !email.matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")) {
                return error(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "Please provide a valid email address.");
            }
            if (confirmPassword != null && !password.equals(confirmPassword)) {
                return error(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "Passwords do not match. Please re-enter your password.");
            }
            if (!isStrongPassword(password)) {
                return error(HttpStatus.BAD_REQUEST, "WEAK_PASSWORD", "Password must be at least 8 characters long and include uppercase, lowercase, and a number.");
            }

            UserRecord user = userService.registerUser(name, email, password, organization);
            String token = jwtUtil.generateToken(user.getId(), user.getEmail());
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Account created successfully.");
            response.put("user", userService.toPublicProfile(user));
            response.put("token", token);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException ex) {
            if (ex.getMessage().contains("already exists")) {
                return error(HttpStatus.CONFLICT, "ACCOUNT_EXISTS", "An account with this email already exists.");
            }
            return error(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", ex.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, Object> body) {
        try {
            String email = asString(body.get("email"));
            String password = asString(body.get("password"));
            if (email == null || password == null || email.isBlank() || password.isBlank()) {
                return error(HttpStatus.BAD_REQUEST, "MISSING_CREDENTIALS", "Email and password are required.");
            }

            UserRecord user = userService.authenticate(email, password);
            String token = jwtUtil.generateToken(user.getId(), user.getEmail());
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Authentication successful.");
            response.put("user", userService.toPublicProfile(user));
            response.put("token", token);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException ex) {
            return error(HttpStatus.UNAUTHORIZED, "INVALID_CREDENTIALS", ex.getMessage());
        }
    }

    @PostMapping("/change-password")
    public ResponseEntity<Map<String, Object>> changePassword(@RequestHeader("Authorization") String authHeader,
                                                             @RequestBody Map<String, Object> body) {
        try {
            String userId = getUserIdFromHeader(authHeader);
            String currentPassword = asString(body.get("currentPassword"));
            String newPassword = asString(body.get("newPassword"));
            String confirmNewPassword = asString(body.get("confirmNewPassword"));

            if (currentPassword == null || newPassword == null) {
                return error(HttpStatus.BAD_REQUEST, "MISSING_FIELDS", "Current password and new password are required.");
            }
            if (confirmNewPassword != null && !newPassword.equals(confirmNewPassword)) {
                return error(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "New passwords do not match.");
            }
            if (!isStrongPassword(newPassword)) {
                return error(HttpStatus.BAD_REQUEST, "WEAK_PASSWORD", "Password must be at least 8 characters long and include uppercase, lowercase, and a number.");
            }

            userService.changePassword(userId, currentPassword, newPassword);
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Password changed successfully. Please use your new password for future logins.");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException ex) {
            return error(HttpStatus.BAD_REQUEST, "PASSWORD_CHANGE_FAILED", ex.getMessage());
        } catch (Exception ex) {
            return error(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Authentication required.");
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, Object>> forgotPassword(@RequestBody Map<String, Object> body) {
        String email = asString(body.get("email"));
        if (email == null || email.isBlank()) {
            return error(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "Please provide an email address.");
        }

        String resetToken = UUID.randomUUID().toString();
        resetTokens.put(resetToken, email.trim().toLowerCase());

        Map<String, Object> response = new HashMap<>();
        response.put("message", "If an account exists for this email, password reset instructions have been generated.");
        response.put("resetTokenUrl", "/reset-password?token=" + resetToken);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, Object>> resetPassword(@RequestBody Map<String, Object> body) {
        String token = asString(body.get("token"));
        String newPassword = asString(body.get("newPassword"));
        String confirmPassword = asString(body.get("confirmPassword"));

        if (token == null || token.isBlank()) {
            return error(HttpStatus.BAD_REQUEST, "MISSING_TOKEN", "Reset token is required.");
        }
        if (confirmPassword != null && !newPassword.equals(confirmPassword)) {
            return error(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "Passwords do not match.");
        }
        if (!isStrongPassword(newPassword)) {
            return error(HttpStatus.BAD_REQUEST, "WEAK_PASSWORD", "Password must be at least 8 characters long and include uppercase, lowercase, and a number.");
        }

        String email = resetTokens.remove(token);
        if (email == null) {
            return error(HttpStatus.BAD_REQUEST, "INVALID_TOKEN", "Reset token is invalid or expired.");
        }

        userService.resetPasswordByEmail(email, newPassword);
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Password reset request accepted. Please sign in with your new password.");
        return ResponseEntity.ok(response);
    }

    private String getUserIdFromHeader(String header) {
        if (header == null || !header.startsWith("Bearer ")) {
            throw new IllegalArgumentException("Authentication required.");
        }
        String token = header.substring(7);
        return jwtUtil.getUserIdFromToken(token);
    }

    private static boolean isStrongPassword(String password) {
        if (password == null || password.length() < 8) {
            return false;
        }
        return password.matches(".*[A-Z].*")
                && password.matches(".*[a-z].*")
                && password.matches(".*[0-9].*");
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
        body.put("path", "/api/auth");
        return ResponseEntity.status(status).body(body);
    }
}
