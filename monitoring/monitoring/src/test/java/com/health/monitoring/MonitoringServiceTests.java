package com.health.monitoring;

import com.health.monitoring.dto.AuthRequest;
import com.health.monitoring.dto.PasswordRequest;
import com.health.monitoring.model.Alert;
import com.health.monitoring.model.HealthRecord;
import com.health.monitoring.exception.AuthenticationException;
import com.health.monitoring.model.UserProfile;
import com.health.monitoring.repository.AlertRepository;
import com.health.monitoring.repository.HealthRecordRepository;
import com.health.monitoring.repository.UserProfileRepository;
import com.health.monitoring.service.MonitoringService;
import com.health.monitoring.service.NotificationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.verify;

@SpringBootTest
class MonitoringServiceTests {
    @Autowired
    private MonitoringService service;

    @Autowired
    private UserProfileRepository userProfileRepository;

    @Autowired
    private HealthRecordRepository healthRecordRepository;

    @Autowired
    private AlertRepository alertRepository;

    @MockitoBean
    private NotificationService notificationService;

    @BeforeEach
    void cleanDatabase() {
        alertRepository.deleteAll();
        healthRecordRepository.deleteAll();
        userProfileRepository.deleteAll();
    }

    @Test
    void loginRejectsUnregisteredEmail() {
        AuthRequest request = new AuthRequest();
        request.setEmail("unknown@example.com");
        request.setPassword("pass123");

        AuthenticationException exception = assertThrows(AuthenticationException.class,
                () -> service.login(request));

        assertEquals("Email is not registered", exception.getMessage());
    }

    @Test
    void loginRequiresPasswordForRegisteredEmail() {
        service.register(user("Ravi", "ravi@example.com", "rightpass"));

        AuthRequest request = new AuthRequest();
        request.setEmail("ravi@example.com");
        request.setPassword("wrongpass");

        AuthenticationException exception = assertThrows(AuthenticationException.class,
                () -> service.login(request));

        assertEquals("Incorrect password", exception.getMessage());
    }

    @Test
    void profileUpdatesStayWithLoggedInUser() {
        UserProfile userA = service.register(user("Asha", "asha@example.com", "a1234"));
        UserProfile userB = service.register(user("Bala", "bala@example.com", "b1234"));

        String tokenA = service.createToken(userA);
        String tokenB = service.createToken(userB);

        UserProfile update = new UserProfile();
        update.setName("Asha Updated");
        update.setEmail("asha@example.com");
        update.setAge("22");
        update.setAllergies("Peanuts");

        service.updateProfile(tokenA, update);

        assertEquals("Asha Updated", service.getProfile(tokenA).getName());
        assertEquals("Peanuts", service.getProfile(tokenA).getAllergies());
        assertEquals("Bala", service.getProfile(tokenB).getName());
    }

    @Test
    void passwordChangeRequiresOldPasswordAndAllowsNewLogin() {
        UserProfile user = service.register(user("Meera", "meera@example.com", "oldpass"));
        String token = service.createToken(user);

        PasswordRequest wrongRequest = new PasswordRequest();
        wrongRequest.setOldPassword("badpass");
        wrongRequest.setNewPassword("newpass");

        assertThrows(IllegalArgumentException.class, () -> service.changePassword(token, wrongRequest));

        PasswordRequest request = new PasswordRequest();
        request.setOldPassword("oldpass");
        request.setNewPassword("newpass");
        service.changePassword(token, request);

        AuthRequest login = new AuthRequest();
        login.setEmail("meera@example.com");
        login.setPassword("newpass");

        assertEquals("Meera", service.login(login).getName());
    }

    @Test
    void duplicateRegistrationIsRejected() {
        service.register(user("First", "same@example.com", "pass1"));

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> service.register(user("Second", "same@example.com", "pass2")));

        assertTrue(exception.getMessage().contains("already registered"));
    }

    @Test
    void emergencyCommandInHealthRecordCreatesAlertAndSendsEmail() {
        HealthRecord record = new HealthRecord();
        record.setTemperature(38.8);
        record.setPulseValue(2400);
        record.setCommand("E ");

        HealthRecord savedRecord = service.addHealthRecord(record);
        List<Alert> alerts = service.getAlerts();

        assertEquals("E", savedRecord.getCommand());
        assertEquals(1, alerts.size());
        assertEquals("Emergency gesture detected", alerts.get(0).getMessage());
        assertEquals("CRITICAL", alerts.get(0).getSeverity());
        verify(notificationService).sendEmergencyEmail(argThat(alert ->
                "E".equals(alert.getCommand())
                        && "CRITICAL".equals(alert.getSeverity())
                        && "Emergency gesture detected".equals(alert.getMessage())));
    }

    private UserProfile user(String name, String email, String password) {
        UserProfile user = new UserProfile();
        user.setName(name);
        user.setEmail(email);
        user.setPassword(password);
        return user;
    }
}
