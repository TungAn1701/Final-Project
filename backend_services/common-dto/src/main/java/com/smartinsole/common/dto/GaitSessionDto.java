package com.smartinsole.common.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * Gait recording session associated with a customer.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GaitSessionDto implements Serializable {

    private String id;
    private String customerId;
    private String deviceMac;
    private String activityType; // "walking", "running", "standing"
    private int stepCount;
    private String status;       // "RECORDING", "COMPLETED", "PAUSED"
    private String notes;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private LocalDateTime createdAt;
}
