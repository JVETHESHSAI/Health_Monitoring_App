package com.health.monitoring.controller;

import com.health.monitoring.model.Alert;
import com.health.monitoring.service.MonitoringService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class AlertController {
    private final MonitoringService monitoringService;

    public AlertController(MonitoringService monitoringService) {
        this.monitoringService = monitoringService;
    }

    @GetMapping("/alerts")
    public List<Alert> getAlerts() {
        return monitoringService.getAlerts();
    }

    @PostMapping("/alerts")
    public Alert addAlert(@RequestBody Alert alert) {
        return monitoringService.addAlert(alert);
    }
}
