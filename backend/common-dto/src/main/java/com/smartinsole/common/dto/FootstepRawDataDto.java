package com.smartinsole.common.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.List;

/**
 * Segmented gait cycle representing one stance phase.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FootstepRawDataDto implements Serializable {

    private String sessionId;
    private int stepId;
    private String footSide; // "left" or "right"
    private double samplingRateHz;
    private List<FSRSampleDto> samples;
    private double durationMs;
}
