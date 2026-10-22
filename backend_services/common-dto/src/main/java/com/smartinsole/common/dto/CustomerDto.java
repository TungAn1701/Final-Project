package com.smartinsole.common.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * Customer / Patient Profile Information DTO.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerDto implements Serializable {

    private String id;
    private String fullName;
    private String email;
    private String phoneNumber;
    private int age;
    private String gender; // "male", "female", "other"
    private double shoeSizeEu;
    private double weightKg;
    private double heightCm;
    private String address;
    private String medicalNotes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
