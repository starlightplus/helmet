package com.demo.model;

import javax.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "sport_checkins",
       uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "checkin_date", "sport_key"}))
public class SportCheckin {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "checkin_date", nullable = false)
    private LocalDate checkinDate;

    @Column(name = "sport_key", length = 30, nullable = false)
    private String sportKey;

    // 完成量（时长分钟 / 距离km / 步数 / 跳绳个数，根据 sportKey 语义不同）
    private Double value;

    public SportCheckin() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public LocalDate getCheckinDate() { return checkinDate; }
    public void setCheckinDate(LocalDate checkinDate) { this.checkinDate = checkinDate; }

    public String getSportKey() { return sportKey; }
    public void setSportKey(String sportKey) { this.sportKey = sportKey; }

    public Double getValue() { return value; }
    public void setValue(Double value) { this.value = value; }
}
