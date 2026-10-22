package com.smartinsole.customer.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "gait_sessions")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GaitSessionEntity {

    @Id
    @Column(length = 36)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private CustomerEntity customer;

    @Column(length = 30)
    private String deviceMac;

    @Column(length = 50)
    private String activityType;

    private int stepCount;

    @Column(length = 30)
    private String status; // "RECORDING", "COMPLETED", "PAUSED"

    @Column(columnDefinition = "TEXT")
    private String notes;

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "session", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<FootstepMeasurementEntity> footsteps = new ArrayList<>();
}
