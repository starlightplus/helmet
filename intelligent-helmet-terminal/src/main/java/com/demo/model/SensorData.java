package com.demo.model;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDateTime;

/**
 * 传感器数据模型类
 * 存储从单片机接收到的所有传感器数据
 */
public class SensorData {
    
    // 设备信息
    private String deviceId;
    private String appId;
    
    // Date服务数据（环境数据）
    private Double temperature;    // 温度
    private Double humidity;       // 湿度
    
    // GPS定位数据
    private Double longitude;      // 经度（东经，十进制度格式，4位小数）
    private Double latitude;       // 纬度（北纬，十进制度格式，4位小数）

    // 姿态数据
    private Double roll;           // 横滚角（度）
    private Double pitch;          // 俯仰角（度）
    private Double avm;            // 角速度合量（度/秒）
    private Double gvm;            // 倾斜合量（度）

    // Flag服务数据（状态标志）
    private Boolean fallFlag;      // 跌倒标志
    private Boolean slowFlag;      // 缓慢标志
    
    // 接收时间
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime receiveTime;
    
    // 构造函数
    public SensorData() {
        this.receiveTime = LocalDateTime.now();
    }
    
    public SensorData(String deviceId, String appId) {
        this();
        this.deviceId = deviceId;
        this.appId = appId;
    }
    
    // Getter 和 Setter 方法
    public String getDeviceId() {
        return deviceId;
    }
    
    public void setDeviceId(String deviceId) {
        this.deviceId = deviceId;
    }
    
    public String getAppId() {
        return appId;
    }
    
    public void setAppId(String appId) {
        this.appId = appId;
    }
    
    public Double getTemperature() {
        return temperature;
    }
    
    public void setTemperature(Double temperature) {
        this.temperature = temperature;
    }
    
    public Double getHumidity() {
        return humidity;
    }
    
    public void setHumidity(Double humidity) {
        this.humidity = humidity;
    }
    
    public Double getLongitude() {
        return longitude;
    }
    
    public void setLongitude(Double longitude) {
        // 按照GPS坐标显示规范，保疙4位小数
        if (longitude != null) {
            this.longitude = Math.round(longitude * 10000.0) / 10000.0;
        } else {
            this.longitude = longitude;
        }
    }
    
    public Double getLatitude() {
        return latitude;
    }
    
    public void setLatitude(Double latitude) {
        // 按照GPS坐标显示规范，保疙4位小数
        if (latitude != null) {
            this.latitude = Math.round(latitude * 10000.0) / 10000.0;
        } else {
            this.latitude = latitude;
        }
    }
    
    public Boolean getFallFlag() {
        return fallFlag;
    }
    
    public void setFallFlag(Boolean fallFlag) {
        this.fallFlag = fallFlag;
    }
    
    public Boolean getSlowFlag() {
        return slowFlag;
    }

    public void setSlowFlag(Boolean slowFlag) {
        this.slowFlag = slowFlag;
    }

    public Double getRoll() {
        return roll;
    }

    public void setRoll(Double roll) {
        this.roll = roll;
    }

    public Double getPitch() {
        return pitch;
    }

    public void setPitch(Double pitch) {
        this.pitch = pitch;
    }

    public Double getAvm() {
        return avm;
    }

    public void setAvm(Double avm) {
        this.avm = avm;
    }

    public Double getGvm() {
        return gvm;
    }

    public void setGvm(Double gvm) {
        this.gvm = gvm;
    }

    public LocalDateTime getReceiveTime() {
        return receiveTime;
    }
    
    public void setReceiveTime(LocalDateTime receiveTime) {
        this.receiveTime = receiveTime;
    }
    
    @Override
    public String toString() {
        return "SensorData{" +
                "deviceId='" + deviceId + '\'' +
                ", appId='" + appId + '\'' +
                ", temperature=" + temperature +
                ", humidity=" + humidity +
                ", longitude=" + longitude +
                ", latitude=" + latitude +
                ", roll=" + roll +
                ", pitch=" + pitch +
                ", avm=" + avm +
                ", gvm=" + gvm +
                ", fallFlag=" + fallFlag +
                ", slowFlag=" + slowFlag +
                ", receiveTime=" + receiveTime +
                '}';
    }
}