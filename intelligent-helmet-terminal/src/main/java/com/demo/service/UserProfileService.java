package com.demo.service;

import com.demo.model.User;
import com.demo.model.UserProfile;
import com.demo.repository.UserProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
public class UserProfileService {

    @Autowired
    private UserProfileRepository profileRepository;

    public Map<String, Object> getProfile(User user) {
        UserProfile profile = profileRepository.findByUserId(user.getId())
                .orElse(new UserProfile());

        Map<String, Object> res = new HashMap<>();
        res.put("nickname",   profile.getNickname());
        res.put("age",        profile.getAge());
        res.put("height",     profile.getHeight());
        res.put("weight",     profile.getWeight());
        res.put("gender",     profile.getGender());
        res.put("avatarData", profile.getAvatarData());
        res.put("bio",        profile.getBio());
        res.put("weightUnit", profile.getWeightUnit() != null ? profile.getWeightUnit() : "kg");
        res.put("bloodType",  profile.getBloodType());
        res.put("planDailyRideMin",  profile.getPlanDailyRideMin());
        res.put("planDailyIntake",   profile.getPlanDailyIntake());
        res.put("planTargetWeight",  profile.getPlanTargetWeight());
        res.put("planWeeks",         profile.getPlanWeeks());
        res.put("planSportText",     profile.getPlanSportText());
        res.put("planDietText",      profile.getPlanDietText());
        res.put("planSports",        profile.getPlanSports());
        res.put("planSportsCfg",     profile.getPlanSportsCfg());
        res.put("planAcceptedAt",    profile.getPlanAcceptedAt() != null ? profile.getPlanAcceptedAt().toString() : null);
        return res;
    }

    @Transactional
    public void saveProfile(User user, Map<String, Object> body) {
        UserProfile profile = profileRepository.findByUserId(user.getId())
                .orElse(new UserProfile());
        profile.setUser(user);

        if (body.containsKey("nickname")) profile.setNickname((String) body.get("nickname"));
        if (body.containsKey("age") && body.get("age") != null)
            profile.setAge(((Number) body.get("age")).intValue());
        if (body.containsKey("height") && body.get("height") != null)
            profile.setHeight(((Number) body.get("height")).intValue());
        if (body.containsKey("weight") && body.get("weight") != null)
            profile.setWeight(((Number) body.get("weight")).doubleValue());
        if (body.containsKey("gender"))     profile.setGender((String) body.get("gender"));
        if (body.containsKey("avatarData")) profile.setAvatarData((String) body.get("avatarData"));
        if (body.containsKey("bio"))        profile.setBio((String) body.get("bio"));
        if (body.containsKey("weightUnit")) profile.setWeightUnit((String) body.get("weightUnit"));
        if (body.containsKey("bloodType"))  profile.setBloodType((String) body.get("bloodType"));

        // 骑行规划字段
        if (body.containsKey("planDailyRideMin") && body.get("planDailyRideMin") != null)
            profile.setPlanDailyRideMin(((Number) body.get("planDailyRideMin")).intValue());
        if (body.containsKey("planDailyIntake") && body.get("planDailyIntake") != null)
            profile.setPlanDailyIntake(((Number) body.get("planDailyIntake")).intValue());
        if (body.containsKey("planTargetWeight") && body.get("planTargetWeight") != null)
            profile.setPlanTargetWeight(((Number) body.get("planTargetWeight")).doubleValue());
        if (body.containsKey("planWeeks") && body.get("planWeeks") != null)
            profile.setPlanWeeks(((Number) body.get("planWeeks")).intValue());
        if (body.containsKey("planSportText"))
            profile.setPlanSportText((String) body.get("planSportText"));
        if (body.containsKey("planDietText"))
            profile.setPlanDietText((String) body.get("planDietText"));
        if (body.containsKey("planSports"))
            profile.setPlanSports((String) body.get("planSports"));
        if (body.containsKey("planSportsCfg"))
            profile.setPlanSportsCfg((String) body.get("planSportsCfg"));
        if (body.containsKey("clearPlan") && Boolean.TRUE.equals(body.get("clearPlan"))) {
            profile.setPlanDailyRideMin(null); profile.setPlanDailyIntake(null);
            profile.setPlanTargetWeight(null); profile.setPlanWeeks(null);
            profile.setPlanSportText(null);    profile.setPlanDietText(null);
            profile.setPlanSports(null);       profile.setPlanSportsCfg(null);
            profile.setPlanAcceptedAt(null);
        } else if (body.containsKey("planSportText")) {
            profile.setPlanAcceptedAt(LocalDateTime.now());
        }

        profileRepository.save(profile);
    }

    /**
     * 管理员获取指定用户的资料
     */
    public UserProfile getByUserId(Long userId) {
        return profileRepository.findByUserId(userId).orElse(new UserProfile());
    }

    /**
     * 管理员更新指定用户的资料
     */
    @Transactional
    public void adminUpdateProfile(User user, Map<String, Object> body) {
        UserProfile profile = profileRepository.findByUserId(user.getId())
                .orElse(new UserProfile());
        profile.setUser(user);
        if (body.containsKey("nickname") && body.get("nickname") != null)
            profile.setNickname(body.get("nickname").toString());
        if (body.containsKey("age") && body.get("age") != null)
            profile.setAge(((Number) body.get("age")).intValue());
        if (body.containsKey("height") && body.get("height") != null)
            profile.setHeight(((Number) body.get("height")).intValue());
        if (body.containsKey("weight") && body.get("weight") != null)
            profile.setWeight(((Number) body.get("weight")).doubleValue());
        if (body.containsKey("gender"))    profile.setGender((String) body.get("gender"));
        if (body.containsKey("bio"))       profile.setBio((String) body.get("bio"));
        if (body.containsKey("weightUnit"))profile.setWeightUnit((String) body.get("weightUnit"));
        if (body.containsKey("bloodType")) profile.setBloodType((String) body.get("bloodType"));
        profileRepository.save(profile);
    }
}
