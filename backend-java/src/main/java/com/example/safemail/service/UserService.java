package com.example.safemail.service;

import com.example.safemail.model.UserRecord;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class UserService {
    private final Map<String, UserRecord> usersById = new ConcurrentHashMap<>();
    private final Map<String, String> emailToUserId = new ConcurrentHashMap<>();
    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public UserRecord registerUser(String name, String email, String password, String organization) {
        String normalizedEmail = email.trim();
        if (emailToUserId.containsKey(normalizedEmail.toLowerCase())) {
            throw new IllegalArgumentException("An account with this email already exists.");
        }
        if (password == null || password.length() < 8) {
            throw new IllegalArgumentException("Password must be at least 8 characters long.");
        }

        String userId = UUID.randomUUID().toString();
        UserRecord user = new UserRecord();
        user.setId(userId);
        user.setName(name.trim());
        user.setEmail(normalizedEmail);
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setRole("SOC Analyst");
        user.setOrganization(organization != null ? organization.trim() : "");
        user.setAccountStatus("ACTIVE");
        user.setCreatedAt(Instant.now());
        user.setLastLoginAt(Instant.now());
        user.setTotalAnalyses(0);

        usersById.put(userId, user);
        emailToUserId.put(normalizedEmail.toLowerCase(), userId);
        return user;
    }

    public UserRecord authenticate(String email, String password) {
        String userId = emailToUserId.get(email.trim().toLowerCase());
        if (userId == null) {
            throw new IllegalArgumentException("Invalid email or password.");
        }

        UserRecord user = usersById.get(userId);
        if (user == null || !passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid email or password.");
        }

        user.setLastLoginAt(Instant.now());
        return user;
    }

    public UserRecord findById(String userId) {
        return usersById.get(userId);
    }

    public UserRecord updateProfile(String userId, String name, String organization) {
        UserRecord user = usersById.get(userId);
        if (user == null) {
            throw new IllegalArgumentException("User not found.");
        }
        user.setName(name.trim());
        user.setOrganization(organization != null ? organization.trim() : "");
        return user;
    }

    public void changePassword(String userId, String currentPassword, String newPassword) {
        UserRecord user = usersById.get(userId);
        if (user == null) {
            throw new IllegalArgumentException("User not found.");
        }
        if (!passwordEncoder.matches(currentPassword, user.getPasswordHash())) {
            throw new IllegalArgumentException("Current password is incorrect.");
        }
        if (newPassword == null || newPassword.length() < 8) {
            throw new IllegalArgumentException("Password must be at least 8 characters long.");
        }
        user.setPasswordHash(passwordEncoder.encode(newPassword));
    }

    public void resetPasswordByEmail(String email, String newPassword) {
        String userId = emailToUserId.get(email.trim().toLowerCase());
        if (userId == null) {
            throw new IllegalArgumentException("No account exists for this email.");
        }
        if (newPassword == null || newPassword.length() < 8) {
            throw new IllegalArgumentException("Password must be at least 8 characters long.");
        }
        UserRecord user = usersById.get(userId);
        if (user == null) {
            throw new IllegalArgumentException("User not found.");
        }
        user.setPasswordHash(passwordEncoder.encode(newPassword));
    }

    public Map<String, Object> toPublicProfile(UserRecord user) {
        return Map.of(
                "id", user.getId(),
                "name", user.getName(),
                "email", user.getEmail(),
                "role", user.getRole(),
                "organization", user.getOrganization(),
                "accountStatus", user.getAccountStatus(),
                "createdAt", user.getCreatedAt(),
                "lastLoginAt", user.getLastLoginAt(),
                "totalAnalyses", user.getTotalAnalyses()
        );
    }
}
