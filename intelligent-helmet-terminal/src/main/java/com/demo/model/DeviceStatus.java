package com.demo.model;

import com.fasterxml.jackson.annotation.JsonFormat;

import javax.persistence.*;
import java.time.LocalDateTime;

/**
 * 设备状态：每个头盔（deviceId）对应唯一一条记录，新数据到来时更新（upsert）。
 * 状态码含义：
 *   0 未初始化, 1 初始化中, 2 就绪, 3 错误, 4 超时, 5 断开连接（仅网络设备）
 * wifi_status 取值 0-5 全部可能；其余传感器仅 0/2/3（未初始化/就绪/错误）。
 */
@Entity
@Table(name = "device_status", indexes = {
    @Index(name = "idx_status_device_id", columnList = "device_id", unique = true)
})
public class DeviceStatus {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "device_id", length = 100, unique = true, nullable = false)
    private String deviceId;

    // 设备运行时间（单位由设备端决定，一般为秒）
    @Column(name = "uptime")
    private Long uptime;

    @Column(name = "mpu6050_status")
    private Integer mpu6050Status;

    @Column(name = "wifi_status")
    private Integer wifiStatus;

    @Column(name = "gps_status")
    private Integer gpsStatus;

    @Column(name = "dht_status")
    private Integer dhtStatus;

    @Column(name = "max_status")
    private Integer maxStatus;

    @Column(name = "update_time")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime updateTime;

    public DeviceStatus() {
        this.updateTime = LocalDateTime.now();
    }

    public DeviceStatus(String deviceId) {
        this();
        this.deviceId = deviceId;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getDeviceId() { return deviceId; }
    public void setDeviceId(String deviceId) { this.deviceId = deviceId; }

    public Long getUptime() { return uptime; }
    public void setUptime(Long uptime) { this.uptime = uptime; }

    public Integer getMpu6050Status() { return mpu6050Status; }
    public void setMpu6050Status(Integer mpu6050Status) { this.mpu6050Status = mpu6050Status; }

    public Integer getWifiStatus() { return wifiStatus; }
    public void setWifiStatus(Integer wifiStatus) { this.wifiStatus = wifiStatus; }

    public Integer getGpsStatus() { return gpsStatus; }
    public void setGpsStatus(Integer gpsStatus) { this.gpsStatus = gpsStatus; }

    public Integer getDhtStatus() { return dhtStatus; }
    public void setDhtStatus(Integer dhtStatus) { this.dhtStatus = dhtStatus; }

    public Integer getMaxStatus() { return maxStatus; }
    public void setMaxStatus(Integer maxStatus) { this.maxStatus = maxStatus; }

    public LocalDateTime getUpdateTime() { return updateTime; }
    public void setUpdateTime(LocalDateTime updateTime) { this.updateTime = updateTime; }
}
