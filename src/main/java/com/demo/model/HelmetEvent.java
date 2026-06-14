package com.demo.model;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "helmet_events")
public class HelmetEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "event_type", nullable = false, length = 30)
    private String eventType;   // e.g. "fall", "slow"

    @Column(name = "event_name", length = 50)
    private String eventName;   // e.g. "摔倒事件"

    @Column(name = "device_id", length = 100)
    private String deviceId;

    @Column(name = "event_time", nullable = false)
    private LocalDateTime eventTime;

    @Column(precision = 10, scale = 6)
    private Double longitude;

    @Column(precision = 10, scale = 6)
    private Double latitude;

    public HelmetEvent() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getEventType() { return eventType; }
    public void setEventType(String eventType) { this.eventType = eventType; }

    public String getEventName() { return eventName; }
    public void setEventName(String eventName) { this.eventName = eventName; }

    public String getDeviceId() { return deviceId; }
    public void setDeviceId(String deviceId) { this.deviceId = deviceId; }

    public LocalDateTime getEventTime() { return eventTime; }
    public void setEventTime(LocalDateTime eventTime) { this.eventTime = eventTime; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }
}
