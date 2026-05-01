package com.health.monitoring.repository;

import com.health.monitoring.model.HealthRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface HealthRecordRepository extends JpaRepository<HealthRecord, String> {
    List<HealthRecord> findAllByOrderByRecordedAtDesc();
}
