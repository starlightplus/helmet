package com.demo.repository;

import com.demo.model.HelmetEvent;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface HelmetEventRepository extends JpaRepository<HelmetEvent, Long> {
    List<HelmetEvent> findByUserIdOrderByEventTimeDesc(Long userId, Pageable pageable);
    List<HelmetEvent> findByUserIdOrderByEventTimeDesc(Long userId);
}
