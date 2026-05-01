package com.health.monitoring.controller;

import com.health.monitoring.model.HealthRecord;
import com.health.monitoring.service.MonitoringService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class HealthController {
    private final MonitoringService monitoringService;

    public HealthController(MonitoringService monitoringService) {
        this.monitoringService = monitoringService;
    }

    @GetMapping("/health/data")
    public List<HealthRecord> getHealthRecords() {
        return monitoringService.getHealthRecords();
    }

    @PostMapping("/health/data")
    public HealthRecord addHealthRecord(@RequestBody HealthRecord record) {
        return monitoringService.addHealthRecord(record);
    }
}
