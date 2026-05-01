package com.health.monitoring.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

@RestController
public class StatusController {

    @GetMapping("/")
    public Map<String, Object> status() {
        return Map.of(
                "name", "health-monitoring-backend",
                "status", "running",
                "time", Instant.now().toString(),
                "endpoints", new String[]{
                        "/login",
                        "/register",
                        "/user/profile",
                        "/health/data",
                        "/alerts"
                }
        );
    }
}
