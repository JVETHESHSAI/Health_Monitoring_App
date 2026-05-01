package com.health.monitoring.service;

import com.health.monitoring.dto.AuthRequest;
import com.health.monitoring.dto.PasswordRequest;
import com.health.monitoring.model.Alert;
import com.health.monitoring.model.HealthRecord;
import com.health.monitoring.model.UserProfile;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Base64;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
public class MonitoringService {
    private final Map<String, UserProfile> usersByEmail = new ConcurrentHashMap<>();
    private final Map<String, String> emailByToken = new ConcurrentHashMap<>();
    private final List<HealthRecord> healthRecords = new CopyOnWriteArrayList<>();
    private final List<Alert> alerts = new CopyOnWriteArrayList<>();
    private final NotificationService notificationService;
    private final Path uploadDir;

    public MonitoringService(
            @Value("${app.upload-dir:uploads}") String uploadDir,
            NotificationService notificationService) throws IOException {
        this.notificationService = notificationService;
        this.uploadDir = Path.of(uploadDir).toAbsolutePath().normalize();
        Files.createDirectories(this.uploadDir);

        UserProfile demoUser = new UserProfile("Demo User", "demo@health.local", "demo123");
        demoUser.setAge("21");
        demoUser.setGender("Not set");
        demoUser.setHeight("170");
        demoUser.setWeight("65");
        demoUser.setAllergies("None recorded");
        usersByEmail.put(demoUser.getEmail(), demoUser);
    }

    public UserProfile register(UserProfile user) {
        if (isBlank(user.getEmail()) || isBlank(user.getPassword())) {
            throw new IllegalArgumentException("Email and password are required");
        }

        if (isBlank(user.getName())) {
            user.setName(user.getEmail());
        }

        usersByEmail.put(user.getEmail(), user);
        return safeUser(user);
    }

    public UserProfile login(AuthRequest request) {
        UserProfile user = usersByEmail.get(request.getEmail());

        if (user == null) {
            user = new UserProfile(request.getEmail(), request.getEmail(), request.getPassword());
            usersByEmail.put(user.getEmail(), user);
        }

        if (!user.getPassword().equals(request.getPassword())) {
            throw new IllegalArgumentException("Invalid credentials");
        }

        return safeUser(user);
    }

    public String createToken(UserProfile user) {
        String encodedEmail = Base64.getUrlEncoder()
                .withoutPadding()
                .encodeToString(user.getEmail().getBytes());
        String token = "demo-token-" + encodedEmail + "-" + UUID.randomUUID();
        emailByToken.put(token, user.getEmail());
        return token;
    }

    public UserProfile getProfile(String token) {
        return safeUser(getCurrentUser(token));
    }

    public UserProfile updateProfile(String token, UserProfile update) {
        UserProfile user = getCurrentUser(token);
        String oldEmail = user.getEmail();

        if (!isBlank(update.getName())) user.setName(update.getName());
        if (!isBlank(update.getEmail())) user.setEmail(update.getEmail());
        user.setAge(update.getAge());
        user.setGender(update.getGender());
        user.setHeight(update.getHeight());
        user.setWeight(update.getWeight());
        user.setAllergies(update.getAllergies());

        if (!oldEmail.equals(user.getEmail())) {
            usersByEmail.remove(oldEmail);
            emailByToken.put(token, user.getEmail());
        }

        usersByEmail.put(user.getEmail(), user);
        return safeUser(user);
    }

    public void changePassword(String token, PasswordRequest request) {
        UserProfile user = getCurrentUser(token);

        if (!isBlank(request.getOldPassword()) && !user.getPassword().equals(request.getOldPassword())) {
            throw new IllegalArgumentException("Old password is incorrect");
        }

        if (isBlank(request.getNewPassword())) {
            throw new IllegalArgumentException("New password is required");
        }

        user.setPassword(request.getNewPassword());
    }

    public UserProfile uploadProfilePhoto(String token, MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is required");
        }

        String originalName = file.getOriginalFilename() == null ? "profile.jpg" : file.getOriginalFilename();
        String extension = "";
        int dotIndex = originalName.lastIndexOf('.');

        if (dotIndex >= 0) {
            extension = originalName.substring(dotIndex);
        }

        String filename = UUID.randomUUID() + extension;
        Path target = uploadDir.resolve(filename).normalize();
        file.transferTo(target);

        UserProfile user = getCurrentUser(token);
        user.setProfilePic(filename);
        return safeUser(user);
    }

    public List<HealthRecord> getHealthRecords() {
        List<HealthRecord> sorted = new ArrayList<>(healthRecords);
        sorted.sort(Comparator.comparing(HealthRecord::getRecordedAt).reversed());
        return sorted;
    }

    public HealthRecord addHealthRecord(HealthRecord record) {
        record.setId(UUID.randomUUID().toString());

        if (record.getHeartRate() == null && record.getPulseValue() != null) {
            record.setHeartRate(record.getPulseValue());
        }

        if (record.getPulseValue() == null && record.getHeartRate() != null) {
            record.setPulseValue(record.getHeartRate());
        }

        if (record.getRecordedAt() == null) {
            record.setRecordedAt(Instant.now());
        }

        healthRecords.add(record);
        return record;
    }

    public List<Alert> getAlerts() {
        List<Alert> sorted = new ArrayList<>(alerts);
        sorted.sort(Comparator.comparing(Alert::getCreatedAt).reversed());
        return sorted;
    }

    public Alert addAlert(Alert alert) {
        alert.setId(UUID.randomUUID().toString());

        if (isBlank(alert.getSeverity())) {
            alert.setSeverity("HIGH");
        }

        if (alert.getCreatedAt() == null) {
            alert.setCreatedAt(Instant.now());
        }

        notificationService.sendEmergencyEmail(alert);
        alerts.add(alert);
        return alert;
    }

    private UserProfile getCurrentUser(String token) {
        String email = emailByToken.get(token);

        if (isBlank(email)) {
            email = emailFromToken(token);
        }

        if (!isBlank(email) && usersByEmail.containsKey(email)) {
            return usersByEmail.get(email);
        }

        throw new IllegalArgumentException("Invalid or missing login token");
    }

    private String emailFromToken(String token) {
        if (isBlank(token) || !token.startsWith("demo-token-")) {
            return "";
        }

        String tokenBody = token.substring("demo-token-".length());
        int lastDashIndex = tokenBody.lastIndexOf('-');

        if (lastDashIndex <= 0) {
            return "";
        }

        try {
            byte[] decoded = Base64.getUrlDecoder().decode(tokenBody.substring(0, lastDashIndex));
            return new String(decoded);
        } catch (IllegalArgumentException exception) {
            return "";
        }
    }

    private UserProfile safeUser(UserProfile source) {
        UserProfile safe = new UserProfile();
        safe.setName(source.getName());
        safe.setEmail(source.getEmail());
        safe.setAge(source.getAge());
        safe.setGender(source.getGender());
        safe.setHeight(source.getHeight());
        safe.setWeight(source.getWeight());
        safe.setAllergies(source.getAllergies());
        safe.setProfilePic(source.getProfilePic());
        return safe;
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}
