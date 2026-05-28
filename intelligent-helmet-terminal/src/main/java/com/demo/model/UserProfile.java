package com.demo.model;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_profiles")
public class UserProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(length = 20)
    private String nickname;

    private Integer age;
    private Integer height;
    private Double  weight;

    @Column(length = 10)
    private String gender;

    @Column(columnDefinition = "MEDIUMTEXT")
    private String avatarData;

    @Column(length = 200)
    private String bio;

    @Column(length = 5)
    private String weightUnit;

    @Column(length = 10)
    private String bloodType;

    // ── 骑行规划 ──────────────────────────────────────────────────
    private Integer planDailyRideMin;
    private Integer planDailyIntake;
    private Double  planTargetWeight;
    private Integer planWeeks;

    @Column(columnDefinition = "TEXT")
    private String planSportText;

    @Column(columnDefinition = "TEXT")
    private String planDietText;

    @Column(columnDefinition = "TEXT")
    private String planSports;

    @Column(columnDefinition = "TEXT")
    private String planSportsCfg;

    private LocalDateTime planAcceptedAt;

    public UserProfile() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getNickname() { return nickname; }
    public void setNickname(String nickname) { this.nickname = nickname; }

    public Integer getAge() { return age; }
    public void setAge(Integer age) { this.age = age; }

    public Integer getHeight() { return height; }
    public void setHeight(Integer height) { this.height = height; }

    public Double getWeight() { return weight; }
    public void setWeight(Double weight) { this.weight = weight; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public String getAvatarData() { return avatarData; }
    public void setAvatarData(String avatarData) { this.avatarData = avatarData; }

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }

    public String getWeightUnit() { return weightUnit; }
    public void setWeightUnit(String weightUnit) { this.weightUnit = weightUnit; }

    public String getBloodType() { return bloodType; }
    public void setBloodType(String bloodType) { this.bloodType = bloodType; }

    public Integer getPlanDailyRideMin() { return planDailyRideMin; }
    public void setPlanDailyRideMin(Integer v) { this.planDailyRideMin = v; }

    public Integer getPlanDailyIntake() { return planDailyIntake; }
    public void setPlanDailyIntake(Integer v) { this.planDailyIntake = v; }

    public Double getPlanTargetWeight() { return planTargetWeight; }
    public void setPlanTargetWeight(Double v) { this.planTargetWeight = v; }

    public Integer getPlanWeeks() { return planWeeks; }
    public void setPlanWeeks(Integer v) { this.planWeeks = v; }

    public String getPlanSportText() { return planSportText; }
    public void setPlanSportText(String v) { this.planSportText = v; }

    public String getPlanDietText() { return planDietText; }
    public void setPlanDietText(String v) { this.planDietText = v; }

    public String getPlanSports() { return planSports; }
    public void setPlanSports(String v) { this.planSports = v; }

    public String getPlanSportsCfg() { return planSportsCfg; }
    public void setPlanSportsCfg(String v) { this.planSportsCfg = v; }

    public LocalDateTime getPlanAcceptedAt() { return planAcceptedAt; }
    public void setPlanAcceptedAt(LocalDateTime v) { this.planAcceptedAt = v; }
}
