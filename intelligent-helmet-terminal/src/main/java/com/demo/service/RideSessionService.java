package com.demo.service;

import com.demo.model.RideSession;
import com.demo.model.User;
import com.demo.repository.RideSessionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class RideSessionService {

    @Autowired
    private RideSessionRepository rideSessionRepository;

    public List<Map<String, Object>> getRides(User user, int limit) {
        List<RideSession> sessions = rideSessionRepository.findByUserIdOrderByStartTimeDesc(
                user.getId(), PageRequest.of(0, limit));

        List<Map<String, Object>> list = new ArrayList<>();
        for (RideSession s : sessions) {
            Map<String, Object> m = new HashMap<>();
            m.put("id",             s.getClientId() != null ? s.getClientId() : s.getId().toString());
            m.put("startTime",      s.getStartTime() != null ? s.getStartTime().toString() : null);
            m.put("endTime",        s.getEndTime()   != null ? s.getEndTime().toString()   : null);
            m.put("duration",       s.getDuration());
            m.put("distance",       s.getDistance());
            m.put("avgSpeed",       s.getAvgSpeed());
            m.put("maxSpeed",       s.getMaxSpeed());
            m.put("calories",       s.getCalories());
            m.put("pace",           s.getPace());
            m.put("safetyScore",    s.getSafetyScore());
            m.put("avgTemp",        s.getAvgTemp());
            m.put("avgHumidity",    s.getAvgHumidity());
            m.put("speedOverCount", s.getSpeedOverCount());
            m.put("trackPoints",    s.getTrackPoints());
            list.add(m);
        }
        return list;
    }

    @Transactional
    public Map<String, Object> saveRide(User user, Map<String, Object> body) {
        String clientId = body.containsKey("id") ? body.get("id").toString() : null;
        if (clientId != null && rideSessionRepository.existsByClientId(clientId)) {
            return Map.of("success", true, "duplicate", true);
        }

        RideSession s = new RideSession();
        s.setUser(user);
        s.setClientId(clientId);
        if (body.get("startTime") != null)
            s.setStartTime(LocalDateTime.parse(body.get("startTime").toString().replace(" ", "T").substring(0, 19)));
        if (body.get("endTime") != null)
            s.setEndTime(LocalDateTime.parse(body.get("endTime").toString().replace(" ", "T").substring(0, 19)));
        if (body.get("duration") != null)    s.setDuration(((Number) body.get("duration")).intValue());
        if (body.get("distance") != null)    s.setDistance(((Number) body.get("distance")).doubleValue());
        if (body.get("avgSpeed") != null)    s.setAvgSpeed(((Number) body.get("avgSpeed")).doubleValue());
        if (body.get("maxSpeed") != null)    s.setMaxSpeed(((Number) body.get("maxSpeed")).doubleValue());
        if (body.get("calories") != null)    s.setCalories(((Number) body.get("calories")).doubleValue());
        if (body.get("pace") != null)        s.setPace(((Number) body.get("pace")).doubleValue());
        if (body.get("safetyScore") != null) s.setSafetyScore(((Number) body.get("safetyScore")).intValue());
        if (body.get("avgTemp") != null)     s.setAvgTemp(((Number) body.get("avgTemp")).doubleValue());
        if (body.get("avgHumidity") != null) s.setAvgHumidity(((Number) body.get("avgHumidity")).doubleValue());
        if (body.get("speedOverCount") != null) s.setSpeedOverCount(((Number) body.get("speedOverCount")).intValue());
        if (body.get("trackPoints") != null) s.setTrackPoints(body.get("trackPoints").toString());

        rideSessionRepository.save(s);
        return Map.of("success", true, "dbId", s.getId());
    }

    @Transactional
    public void deleteRide(User user, String clientId) {
        rideSessionRepository.findByClientId(clientId).ifPresent(s -> {
            if (s.getUser().getId().equals(user.getId())) {
                rideSessionRepository.delete(s);
            }
        });
    }

    public Map<String, Map<String, Object>> getRidesRange(User user, LocalDate from, LocalDate to) {
        LocalDateTime fromDt = from.atStartOfDay();
        LocalDateTime toDt = to.atTime(23, 59, 59);

        List<RideSession> sessions = rideSessionRepository
                .findByUserIdAndStartTimeBetweenOrderByStartTimeAsc(user.getId(), fromDt, toDt);

        Map<String, Map<String, Object>> result = new TreeMap<>();
        for (RideSession s : sessions) {
            if (s.getStartTime() == null) continue;
            String dateKey = s.getStartTime().toLocalDate().toString();
            Map<String, Object> day = result.computeIfAbsent(dateKey, k -> {
                Map<String, Object> m = new HashMap<>();
                m.put("durationMin", 0.0);
                m.put("distanceKm",  0.0);
                m.put("calories",    0.0);
                m.put("count",       0);
                return m;
            });
            double dur = s.getDuration() != null ? s.getDuration() / 60.0 : 0;
            day.put("durationMin", (Double) day.get("durationMin") + dur);
            day.put("distanceKm",  (Double) day.get("distanceKm")  + (s.getDistance()  != null ? s.getDistance()  : 0));
            day.put("calories",    (Double) day.get("calories")    + (s.getCalories()  != null ? s.getCalories()  : 0));
            day.put("count",       (Integer) day.get("count") + 1);
        }
        return result;
    }
}
