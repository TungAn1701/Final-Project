package com.smartinsole.customer.repository;

import com.smartinsole.customer.entity.FootstepMeasurementEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FootstepMeasurementRepository extends JpaRepository<FootstepMeasurementEntity, String> {

    List<FootstepMeasurementEntity> findBySessionIdOrderByStepNumberAsc(String sessionId);
}
