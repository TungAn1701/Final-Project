package com.smartinsole.customer.repository;

import com.smartinsole.customer.entity.GaitSessionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GaitSessionRepository extends JpaRepository<GaitSessionEntity, String> {

    List<GaitSessionEntity> findByCustomerIdOrderByCreatedAtDesc(String customerId);
}
