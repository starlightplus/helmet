package com.demo.model;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "ride_sessions")
public class RideSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /** 前端生成的唯一 ID（UUID），用于去重 */
    @Column(name = "client_id", length = 64, unique = true)
    private String clientId;

    @Column(name = "start_time")
    private LocalDateTime startTime;

    @Column(name = "end_time")
    private LocalDateTime endTime;

    /** 骑行时长（秒） */
    private Integer duration;

    /** 骑行距离（km） */
    private Double distance;

    @Column(name = "avg_speed")
    private Double avgSpeed;

    @Column(name = "max_speed")
    private Double maxSpeed;

    private Double calories;

    /** 配速（min/km） */
    private Double pace;

    @Column(name = "safety_score")
    private Integer safetyScore;

    @Column(name = "avg_temp")
    private Double avgTemp;

    @Column(name = "avg_humidity")
    private Double avgHumidity;

    @Column(name = "speed_over_count")
    private Integer speedOverCount;

    /** 轨迹点 JSON 字符串 */
    @Column(name = "track_points", columnDefinition = "TEXT")
    private String trackPoints;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    public RideSession() {
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getClientId() { return clientId; }
    public void setClientId(String clientId) { this.clientId = clientId; }

    public LocalDateTime getStartTime() { return startTime; }
    public void setStartTime(LocalDateTime startTime) { this.startTime = startTime; }

    public LocalDateTime getEndTime() { return endTime; }
    public void setEndTime(LocalDateTime endTime) { this.endTime = endTime; }

    public Integer getDuration() { return duration; }
    public void setDuration(Integer duration) { this.duration = duration; }

    public Double getDistance() { return distance; }
    public void setDistance(Double distance) { this.distance = distance; }

    public Double getAvgSpeed() { return avgSpeed; }
    public void setAvgSpeed(Double avgSpeed) { this.avgSpeed = avgSpeed; }

    public Double getMaxSpeed() { return maxSpeed; }
    public void setMaxSpeed(Double maxSpeed) { this.maxSpeed = maxSpeed; }

    public Double getCalories() { return calories; }
    public void setCalories(Double calories) { this.calories = calories; }

    public Double getPace() { return pace; }
    public void setPace(Double pace) { this.pace = pace; }

    public Integer getSafetyScore() { return safetyScore; }
    public void setSafetyScore(Integer safetyScore) { this.safetyScore = safetyScore; }

    public Double getAvgTemp() { return avgTemp; }
    public void setAvgTemp(Double avgTemp) { this.avgTemp = avgTemp; }

    public Double getAvgHumidity() { return avgHumidity; }
    public void setAvgHumidity(Double avgHumidity) { this.avgHumidity = avgHumidity; }

    public Integer getSpeedOverCount() { return speedOverCount; }
    public void setSpeedOverCount(Integer speedOverCount) { this.speedOverCount = speedOverCount; }

    public String getTrackPoints() { return trackPoints; }
    public void setTrackPoints(String trackPoints) { this.trackPoints = trackPoints; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
