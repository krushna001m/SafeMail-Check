package com.example.safemail.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class HealthController {

    @GetMapping("/api/health")
    public Map<String, Object> health() {
        return Map.of(
                "status", "ok",
                "version", "SafeMail Java Backend",
                "authMode", "JWT + BCrypt + User Data Isolation"
        );
    }
}
