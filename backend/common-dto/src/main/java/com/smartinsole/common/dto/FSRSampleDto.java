package com.smartinsole.common.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

/**
 * Single time-point 6-channel FSR sensor measurement in kPa.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class FSRSampleDto implements Serializable {

    private double timestampMs;
    private double p0; // Heel
    private double p1; // Hallux (Great Toe)
    private double p2; // 1st Metatarsal head
    private double p3; // 5th Metatarsal head
    private double p4; // Medial Arch
    private double p5; // Lateral Arch

    @JsonIgnore
    public double getTotalPressure() {
        return p0 + p1 + p2 + p3 + p4 + p5;
    }

    @JsonIgnore
    public double[] getPressuresAsArray() {
        return new double[]{p0, p1, p2, p3, p4, p5};
    }
}
