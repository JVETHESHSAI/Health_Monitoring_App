package com.health.monitoring.controller;

import com.health.monitoring.dto.AuthRequest;
import com.health.monitoring.dto.AuthResponse;
import com.health.monitoring.model.UserProfile;
import com.health.monitoring.service.MonitoringService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.UUID;

@RestController
public class AuthController {
    private final MonitoringService monitoringService;

    public AuthController(MonitoringService monitoringService) {
        this.monitoringService = monitoringService;
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@RequestBody UserProfile user) {
        UserProfile registeredUser = monitoringService.register(user);
        return ResponseEntity.ok(Map.of(
                "message", "Registration successful",
                "user", registeredUser
        ));
    }

    @PostMapping("/login")
    public AuthResponse login(@RequestBody AuthRequest request) {
        UserProfile user = monitoringService.login(request);
        return new AuthResponse("demo-token-" + UUID.randomUUID(), user);
    }
}
