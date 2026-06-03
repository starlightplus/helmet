package com.demo.repository;

import com.demo.model.EmergencyContact;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface EmergencyContactRepository extends JpaRepository<EmergencyContact, Long> {
    List<EmergencyContact> findByUserId(Long userId);
    void deleteByIdAndUserId(Long id, Long userId);
    List<EmergencyContact> findByUserIdAndPriorityTrue(Long userId);
}
