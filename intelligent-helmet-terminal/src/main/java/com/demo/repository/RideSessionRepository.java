package com.demo.repository;

import com.demo.model.RideSession;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RideSessionRepository extends JpaRepository<RideSession, Long> {

    List<RideSession> findByUserIdOrderByStartTimeDesc(Long userId, Pageable pageable);

    Optional<RideSession> findByClientId(String clientId);

    boolean existsByClientId(String clientId);
}
