package com.health.monitoring.service;

import com.health.monitoring.model.Alert;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class NotificationService {
    private final ObjectProvider<JavaMailSender> mailSenderProvider;
    private final boolean emailEnabled;
    private final String emailTo;
    private final String emailFrom;

    public NotificationService(
            ObjectProvider<JavaMailSender> mailSenderProvider,
            @Value("${app.notifications.email.enabled:false}") boolean emailEnabled,
            @Value("${app.notifications.email.to:}") String emailTo,
            @Value("${app.notifications.email.from:no-reply@health-monitor.local}") String emailFrom) {
        this.mailSenderProvider = mailSenderProvider;
        this.emailEnabled = emailEnabled;
        this.emailTo = emailTo;
        this.emailFrom = emailFrom;
    }

    public void sendEmergencyEmail(Alert alert) {
        if (!emailEnabled) {
            alert.setEmailSent(false);
            alert.setEmailStatus("Email notifications disabled");
            return;
        }

        if (isBlank(emailTo)) {
            alert.setEmailSent(false);
            alert.setEmailStatus("Caregiver email is not configured");
            return;
        }

        try {
            JavaMailSender mailSender = mailSenderProvider.getIfAvailable();

            if (mailSender == null) {
                alert.setEmailSent(false);
                alert.setEmailStatus("Mail sender is not available");
                return;
            }

            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(emailFrom);
            message.setTo(emailTo);
            message.setSubject("Emergency Alert - Health Monitoring Wheelchair");
            message.setText(buildMessage(alert));

            mailSender.send(message);
            alert.setEmailSent(true);
            alert.setEmailStatus("Email sent to " + emailTo);
        } catch (Exception exception) {
            alert.setEmailSent(false);
            alert.setEmailStatus("Email failed: " + exception.getMessage());
        }
    }

    private String buildMessage(Alert alert) {
        return """
                Emergency alert received from the health monitoring wheelchair.

                Message: %s
                Severity: %s
                Temperature: %s C
                Pulse Signal: %s
                Wheelchair Command: %s
                Time: %s

                Please check the user immediately.
                """.formatted(
                valueOrDefault(alert.getMessage()),
                valueOrDefault(alert.getSeverity()),
                valueOrDefault(alert.getTemperature()),
                valueOrDefault(alert.getPulseValue()),
                valueOrDefault(alert.getCommand()),
                valueOrDefault(alert.getCreatedAt())
        );
    }

    private String valueOrDefault(Object value) {
        return value == null ? "-" : value.toString();
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}
