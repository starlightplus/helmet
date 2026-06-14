package com.demo.repository;

import com.demo.model.SportCheckin;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface SportCheckinRepository extends JpaRepository<SportCheckin, Long> {

    List<SportCheckin> findByUserIdAndCheckinDate(Long userId, LocalDate date);

    List<SportCheckin> findByUserIdAndCheckinDateBetween(Long userId, LocalDate from, LocalDate to);

    Optional<SportCheckin> findByUserIdAndCheckinDateAndSportKey(Long userId, LocalDate date, String sportKey);
}
