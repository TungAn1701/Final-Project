package com.smartinsole.customer.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "footstep_measurements")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FootstepMeasurementEntity {

    @Id
    @Column(length = 36)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    private GaitSessionEntity session;

    @Column(nullable = false)
    private int stepNumber;

    @Column(length = 10, nullable = false)
    private String footSide; // "left" or "right"

    @Column(nullable = false)
    private double durationMs;

    @Column(nullable = false)
    private int sampleCount;

    private double peakPressureP0;
    private double peakPressureP1;
    private double peakPressureP2;
    private double peakPressureP3;
    private double peakPressureP4;
    private double peakPressureP5;

    private double avgTotalPressure;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime recordedAt;
}
