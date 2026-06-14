package com.demo.service;

import com.demo.model.SportCheckin;
import com.demo.model.User;
import com.demo.repository.SportCheckinRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

@Service
public class SportCheckinService {

    @Autowired
    private SportCheckinRepository sportCheckinRepository;

    public Map<String, Double> getCheckinByDate(User user, LocalDate date) {
        List<SportCheckin> list = sportCheckinRepository.findByUserIdAndCheckinDate(user.getId(), date);
        Map<String, Double> result = new HashMap<>();
        for (SportCheckin c : list) {
            result.put(c.getSportKey(), c.getValue());
        }
        return result;
    }

    @Transactional
    public void saveCheckin(User user, LocalDate date, String sportKey, Double value) {
        SportCheckin checkin = sportCheckinRepository
                .findByUserIdAndCheckinDateAndSportKey(user.getId(), date, sportKey)
                .orElse(new SportCheckin());
        checkin.setUser(user);
        checkin.setCheckinDate(date);
        checkin.setSportKey(sportKey);
        checkin.setValue(value);
        sportCheckinRepository.save(checkin);
    }

    public Map<String, Map<String, Double>> getCheckinRange(User user, LocalDate from, LocalDate to) {
        List<SportCheckin> list = sportCheckinRepository.findByUserIdAndCheckinDateBetween(
                user.getId(), from, to);
        Map<String, Map<String, Double>> result = new TreeMap<>();
        for (SportCheckin c : list) {
            String dateKey = c.getCheckinDate().toString();
            result.computeIfAbsent(dateKey, k -> new HashMap<>())
                  .put(c.getSportKey(), c.getValue());
        }
        return result;
    }
}
