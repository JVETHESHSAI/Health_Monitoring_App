package com.health.monitoring.controller;

import com.health.monitoring.dto.PasswordRequest;
import com.health.monitoring.model.UserProfile;
import com.health.monitoring.service.MonitoringService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@RestController
public class ProfileController {
    private final MonitoringService monitoringService;

    public ProfileController(MonitoringService monitoringService) {
        this.monitoringService = monitoringService;
    }

    @GetMapping("/user/profile")
    public UserProfile getProfile() {
        return monitoringService.getProfile();
    }

    @PutMapping("/user/profile")
    public UserProfile updateProfile(@RequestBody UserProfile update) {
        return monitoringService.updateProfile(update);
    }

    @PutMapping("/user/password")
    public ResponseEntity<Map<String, String>> changePassword(@RequestBody PasswordRequest request) {
        monitoringService.changePassword(request);
        return ResponseEntity.ok(Map.of("message", "Password updated successfully"));
    }

    @PostMapping("/user/profile/upload")
    public UserProfile uploadProfilePhoto(@RequestParam("file") MultipartFile file) throws IOException {
        return monitoringService.uploadProfilePhoto(file);
    }
}
