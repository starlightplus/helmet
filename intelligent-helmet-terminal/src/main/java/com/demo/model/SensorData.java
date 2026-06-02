package com.demo.model;

import com.fasterxml.jackson.annotation.JsonFormat;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "sensor_data", indexes = {
    @Index(name = "idx_device_id", columnList = "device_id"),
    @Index(name = "idx_receive_time", columnList = "receive_time")
})
public class SensorData {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 设备信息
    @Column(name = "device_id", length = 100)
    private String deviceId;

    @Column(name = "app_id", length = 100)
    private String appId;

    // 环境数据
    private Double temperature;
    private Double humidity;

    // GPS定位数据
    private Double longitude;
    private Double latitude;

    // 姿态数据
    private Double roll;
    private Double pitch;
    private Double avm;
    private Double gvm;

    // 健康数据
    @Column(name = "heart_rate")
    private Integer heartRate;

    @Column(name = "spo2")
    private Integer spo2;

    // 电源数据
    @Column(name = "voltage")
    private Double voltage;

    @Column(name = "battery")
    private Integer battery;

    // 状态标志
    @Column(name = "fall_flag")
    private Boolean fallFlag;

    @Column(name = "slow_flag")
    private Boolean slowFlag;

    // 接收时间
    @Column(name = "receive_time")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime receiveTime;

    public SensorData() {
        this.receiveTime = LocalDateTime.now();
    }

    public SensorData(String deviceId, String appId) {
        this();
        this.deviceId = deviceId;
        this.appId = appId;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getDeviceId() { return deviceId; }
    public void setDeviceId(String deviceId) { this.deviceId = deviceId; }

    public String getAppId() { return appId; }
    public void setAppId(String appId) { this.appId = appId; }

    public Double getTemperature() { return temperature; }
    public void setTemperature(Double temperature) { this.temperature = temperature; }

    public Double getHumidity() { return humidity; }
    public void setHumidity(Double humidity) { this.humidity = humidity; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) {
        if (longitude != null) {
            this.longitude = Math.round(longitude * 10000.0) / 10000.0;
        } else {
            this.longitude = null;
        }
    }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) {
        if (latitude != null) {
            this.latitude = Math.round(latitude * 10000.0) / 10000.0;
        } else {
            this.latitude = null;
        }
    }

    public Double getRoll() { return roll; }
    public void setRoll(Double roll) { this.roll = roll; }

    public Double getPitch() { return pitch; }
    public void setPitch(Double pitch) { this.pitch = pitch; }

    public Double getAvm() { return avm; }
    public void setAvm(Double avm) { this.avm = avm; }

    public Double getGvm() { return gvm; }
    public void setGvm(Double gvm) { this.gvm = gvm; }

    public Integer getHeartRate() { return heartRate; }
    public void setHeartRate(Integer heartRate) { this.heartRate = heartRate; }

    public Integer getSpo2() { return spo2; }
    public void setSpo2(Integer spo2) { this.spo2 = spo2; }

    public Double getVoltage() { return voltage; }
    public void setVoltage(Double voltage) { this.voltage = voltage; }

    public Integer getBattery() { return battery; }
    public void setBattery(Integer battery) { this.battery = battery; }

    public Boolean getFallFlag() { return fallFlag; }
    public void setFallFlag(Boolean fallFlag) { this.fallFlag = fallFlag; }

    public Boolean getSlowFlag() { return slowFlag; }
    public void setSlowFlag(Boolean slowFlag) { this.slowFlag = slowFlag; }

    public LocalDateTime getReceiveTime() { return receiveTime; }
    public void setReceiveTime(LocalDateTime receiveTime) { this.receiveTime = receiveTime; }

    @Override
    public String toString() {
        return "SensorData{deviceId='" + deviceId + "', temperature=" + temperature +
                ", humidity=" + humidity + ", receiveTime=" + receiveTime + '}';
    }
}