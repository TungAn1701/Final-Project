package com.smartinsole.customer.controller;

import com.smartinsole.common.dto.GaitSessionDto;
import com.smartinsole.customer.entity.CustomerEntity;
import com.smartinsole.customer.entity.GaitSessionEntity;
import com.smartinsole.customer.repository.CustomerRepository;
import com.smartinsole.customer.repository.GaitSessionRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping
public class SessionController {

    private final GaitSessionRepository sessionRepository;
    private final CustomerRepository customerRepository;

    public SessionController(GaitSessionRepository sessionRepository, CustomerRepository customerRepository) {
        this.sessionRepository = sessionRepository;
        this.customerRepository = customerRepository;
    }

    private GaitSessionDto toDto(GaitSessionEntity e) {
        return GaitSessionDto.builder()
                .id(e.getId())
                .customerId(e.getCustomer().getId())
                .deviceMac(e.getDeviceMac())
                .activityType(e.getActivityType())
                .stepCount(e.getStepCount())
                .status(e.getStatus())
                .notes(e.getNotes())
                .startTime(e.getStartTime())
                .endTime(e.getEndTime())
                .createdAt(e.getCreatedAt())
                .build();
    }

    // 1. Create a new Measurement Session
    @PostMapping("/api/v1/sessions")
    public ResponseEntity<GaitSessionDto> createSession(@RequestBody GaitSessionDto dto) {
        Optional<CustomerEntity> customerOpt = customerRepository.findById(dto.getCustomerId());
        if (customerOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        GaitSessionEntity entity = GaitSessionEntity.builder()
                .id(dto.getId() != null ? dto.getId() : UUID.randomUUID().toString())
                .customer(customerOpt.get())
                .deviceMac(dto.getDeviceMac())
                .activityType(dto.getActivityType() != null ? dto.getActivityType() : "walking")
                .stepCount(0)
                .status(dto.getStatus() != null ? dto.getStatus() : "RECORDING")
                .notes(dto.getNotes())
                .startTime(dto.getStartTime() != null ? dto.getStartTime() : LocalDateTime.now())
                .build();

        GaitSessionEntity saved = sessionRepository.save(entity);
        return ResponseEntity.status(HttpStatus.CREATED).body(toDto(saved));
    }

    // 2. Get Session by ID
    @GetMapping("/api/v1/sessions/{id}")
    public ResponseEntity<GaitSessionDto> getSession(@PathVariable String id) {
        return sessionRepository.findById(id)
                .map(s -> ResponseEntity.ok(toDto(s)))
                .orElse(ResponseEntity.notFound().build());
    }

    // 3. Mark Session Completed
    @PutMapping("/api/v1/sessions/{id}/complete")
    public ResponseEntity<GaitSessionDto> completeSession(@PathVariable String id) {
        return sessionRepository.findById(id).map(session -> {
            session.setStatus("COMPLETED");
            session.setEndTime(LocalDateTime.now());
            GaitSessionEntity saved = sessionRepository.save(session);
            return ResponseEntity.ok(toDto(saved));
        }).orElse(ResponseEntity.notFound().build());
    }

    // 4. List all sessions of a Customer
    @GetMapping({"/api/v1/customers/{customerId}/sessions", "/api/v1/patients/{customerId}/sessions"})
    public ResponseEntity<List<GaitSessionDto>> listCustomerSessions(@PathVariable String customerId) {
        List<GaitSessionEntity> list = sessionRepository.findByCustomerIdOrderByCreatedAtDesc(customerId);
        return ResponseEntity.ok(list.stream().map(this::toDto).collect(Collectors.toList()));
    }

    // 5. List all active / recent sessions across all patients
    @GetMapping("/api/v1/sessions")
    public ResponseEntity<List<GaitSessionDto>> listAllSessions() {
        List<GaitSessionEntity> list = sessionRepository.findAllByOrderByCreatedAtDesc();
        return ResponseEntity.ok(list.stream().map(this::toDto).collect(Collectors.toList()));
    }
}
