package com.health.monitoring.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;

@Entity
@Table(name = "health_records")
public class HealthRecord {
    @Id
    private String id;
    private Double temperature;
    private Integer pulseValue;
    private Integer heartRate;
    private Integer spo2;
    private String bp;
    private String command;
    private Integer accX;
    private Integer accY;
    private Integer accZ;
    private Instant recordedAt;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public Double getTemperature() {
        return temperature;
    }

    public void setTemperature(Double temperature) {
        this.temperature = temperature;
    }

    public Integer getPulseValue() {
        return pulseValue;
    }

    public void setPulseValue(Integer pulseValue) {
        this.pulseValue = pulseValue;
    }

    public Integer getHeartRate() {
        return heartRate;
    }

    public void setHeartRate(Integer heartRate) {
        this.heartRate = heartRate;
    }

    public Integer getSpo2() {
        return spo2;
    }

    public void setSpo2(Integer spo2) {
        this.spo2 = spo2;
    }

    public String getBp() {
        return bp;
    }

    public void setBp(String bp) {
        this.bp = bp;
    }

    public String getCommand() {
        return command;
    }

    public void setCommand(String command) {
        this.command = command;
    }

    public Integer getAccX() {
        return accX;
    }

    public void setAccX(Integer accX) {
        this.accX = accX;
    }

    public Integer getAccY() {
        return accY;
    }

    public void setAccY(Integer accY) {
        this.accY = accY;
    }

    public Integer getAccZ() {
        return accZ;
    }

    public void setAccZ(Integer accZ) {
        this.accZ = accZ;
    }

    public Instant getRecordedAt() {
        return recordedAt;
    }

    public void setRecordedAt(Instant recordedAt) {
        this.recordedAt = recordedAt;
    }
}
