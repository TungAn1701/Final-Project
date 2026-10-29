package com.smartinsole.customer.repository;

import com.smartinsole.customer.entity.GaitSessionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GaitSessionRepository extends JpaRepository<GaitSessionEntity, String> {

    List<GaitSessionEntity> findByCustomerIdOrderByCreatedAtDesc(String customerId);

    List<GaitSessionEntity> findAllByOrderByCreatedAtDesc();

    @Modifying
    @Query("UPDATE GaitSessionEntity s SET s.stepCount = s.stepCount + 1 WHERE s.id = :id")
    void incrementStepCount(@Param("id") String id);
}
