package com.health.monitoring.service;

import com.health.monitoring.dto.AuthRequest;
import com.health.monitoring.dto.PasswordRequest;
import com.health.monitoring.exception.AuthenticationException;
import com.health.monitoring.model.Alert;
import com.health.monitoring.model.HealthRecord;
import com.health.monitoring.model.UserProfile;
import com.health.monitoring.repository.AlertRepository;
import com.health.monitoring.repository.HealthRecordRepository;
import com.health.monitoring.repository.UserProfileRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Instant;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class MonitoringService {
    private final Map<String, String> emailByToken = new ConcurrentHashMap<>();
    private final UserProfileRepository userProfileRepository;
    private final HealthRecordRepository healthRecordRepository;
    private final AlertRepository alertRepository;
    private final NotificationService notificationService;
    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    private final Path uploadDir;

    public MonitoringService(
            @Value("${app.upload-dir:uploads}") String uploadDir,
            NotificationService notificationService,
            UserProfileRepository userProfileRepository,
            HealthRecordRepository healthRecordRepository,
            AlertRepository alertRepository) throws IOException {
        this.notificationService = notificationService;
        this.userProfileRepository = userProfileRepository;
        this.healthRecordRepository = healthRecordRepository;
        this.alertRepository = alertRepository;
        this.uploadDir = Path.of(uploadDir).toAbsolutePath().normalize();
        Files.createDirectories(this.uploadDir);
    }

    public UserProfile register(UserProfile user) {
        user.setEmail(normalizeEmail(user.getEmail()));

        if (isBlank(user.getEmail()) || isBlank(user.getPassword())) {
            throw new IllegalArgumentException("Email and password are required");
        }

        if (userProfileRepository.existsById(user.getEmail())) {
            throw new IllegalArgumentException("Email is already registered");
        }

        if (isBlank(user.getName())) {
            user.setName(user.getEmail());
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return safeUser(userProfileRepository.save(user));
    }

    public UserProfile login(AuthRequest request) {
        String email = normalizeEmail(request.getEmail());
        UserProfile user = userProfileRepository.findById(email).orElse(null);

        if (user == null) {
            throw new AuthenticationException("Email is not registered");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new AuthenticationException("Incorrect password");
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
        if (!isBlank(update.getEmail())) user.setEmail(normalizeEmail(update.getEmail()));
        user.setAge(update.getAge());
        user.setGender(update.getGender());
        user.setHeight(update.getHeight());
        user.setWeight(update.getWeight());
        user.setAllergies(update.getAllergies());

        if (!oldEmail.equals(user.getEmail())) {
            userProfileRepository.deleteById(oldEmail);
            emailByToken.put(token, user.getEmail());
        }

        return safeUser(userProfileRepository.save(user));
    }

    public void changePassword(String token, PasswordRequest request) {
        UserProfile user = getCurrentUser(token);

        if (!isBlank(request.getOldPassword()) && !passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Old password is incorrect");
        }

        if (isBlank(request.getNewPassword())) {
            throw new IllegalArgumentException("New password is required");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userProfileRepository.save(user);
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
        return safeUser(userProfileRepository.save(user));
    }

    public List<HealthRecord> getHealthRecords() {
        return healthRecordRepository.findAllByOrderByRecordedAtDesc();
    }

    public HealthRecord addHealthRecord(HealthRecord record) {
        record.setId(UUID.randomUUID().toString());
        record.setCommand(normalizeCommand(record.getCommand()));

        if (record.getHeartRate() == null && record.getPulseValue() != null) {
            record.setHeartRate(record.getPulseValue());
        }

        if (record.getPulseValue() == null && record.getHeartRate() != null) {
            record.setPulseValue(record.getHeartRate());
        }

        if (record.getRecordedAt() == null) {
            record.setRecordedAt(Instant.now());
        }

        HealthRecord savedRecord = healthRecordRepository.save(record);

        if (isEmergencyCommand(savedRecord.getCommand())) {
            addAlert(buildEmergencyAlert(savedRecord));
        }

        return savedRecord;
    }

    public List<Alert> getAlerts() {
        return alertRepository.findAllByOrderByCreatedAtDesc();
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
        return alertRepository.save(alert);
    }

    private UserProfile getCurrentUser(String token) {
        String email = emailByToken.get(token);

        if (isBlank(email)) {
            email = emailFromToken(token);
        }

        if (!isBlank(email)) {
            return userProfileRepository.findById(email)
                    .orElseThrow(() -> new IllegalArgumentException("Invalid or missing login token"));
        }

        throw new IllegalArgumentException("Invalid or missing login token");
    }

    private String normalizeEmail(String email) {
        return email == null ? "" : email.trim().toLowerCase();
    }

    private String normalizeCommand(String command) {
        return command == null ? null : command.trim().toUpperCase();
    }

    private boolean isEmergencyCommand(String command) {
        return "E".equals(normalizeCommand(command));
    }

    private Alert buildEmergencyAlert(HealthRecord record) {
        Alert alert = new Alert();
        alert.setMessage("Emergency gesture detected");
        alert.setTemperature(record.getTemperature());
        alert.setPulseValue(record.getPulseValue());
        alert.setCommand(record.getCommand());
        alert.setSeverity("CRITICAL");
        alert.setCreatedAt(record.getRecordedAt() == null ? Instant.now() : record.getRecordedAt());
        return alert;
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
