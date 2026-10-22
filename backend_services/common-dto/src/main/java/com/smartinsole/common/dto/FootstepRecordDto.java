package com.smartinsole.common.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * Footstep measurement summary record saved during customer sessions.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FootstepRecordDto implements Serializable {

    private String id;
    private String sessionId;
    private int stepNumber;
    private String footSide; // "left" or "right"
    private double durationMs;
    private int sampleCount;
    private double peakPressureP0; // Heel peak
    private double peakPressureP1; // Toe peak
    private double peakPressureP2; // 1st Metatarsal peak
    private double peakPressureP3; // 5th Metatarsal peak
    private double peakPressureP4; // Medial arch peak
    private double peakPressureP5; // Lateral arch peak
    private double avgTotalPressure;
    private LocalDateTime recordedAt;
}
