package com.health.monitoring.repository;

import com.health.monitoring.model.Alert;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AlertRepository extends JpaRepository<Alert, String> {
    List<Alert> findAllByOrderByCreatedAtDesc();
}
