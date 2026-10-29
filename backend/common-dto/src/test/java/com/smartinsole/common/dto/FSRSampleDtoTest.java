package com.smartinsole.common.dto;

import com.smartinsole.common.constants.SensorConstants;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class FSRSampleDtoTest {

    @Test
    @DisplayName("Calculate total pressure across all 6 FSR channels accurately")
    void testGetTotalPressure() {
        FSRSampleDto sample = FSRSampleDto.builder()
                .timestampMs(100.0)
                .p0(120.5) // Heel
                .p1(80.2)  // Hallux
                .p2(65.0)  // 1st Metatarsal
                .p3(45.3)  // 5th Metatarsal
                .p4(25.0)  // Medial Arch
                .p5(15.0)  // Lateral Arch
                .build();

        double total = sample.getTotalPressure();
        assertEquals(351.0, total, 0.001);

        double[] arr = sample.getPressuresAsArray();
        assertNotNull(arr);
        assertEquals(6, arr.length);
        assertEquals(120.5, arr[0]);
        assertEquals(80.2, arr[1]);
        assertEquals(65.0, arr[2]);
        assertEquals(45.3, arr[3]);
        assertEquals(25.0, arr[4]);
        assertEquals(15.0, arr[5]);
    }

    @Test
    @DisplayName("Empty or zero pressure sample")
    void testZeroPressure() {
        FSRSampleDto sample = new FSRSampleDto();
        assertEquals(0.0, sample.getTotalPressure());
        assertEquals(0.0, sample.getP0());

        sample.setTimestampMs(50.0);
        sample.setP0(10.0);
        sample.setP1(20.0);
        sample.setP2(30.0);
        sample.setP3(40.0);
        sample.setP4(50.0);
        sample.setP5(60.0);

        assertEquals(210.0, sample.getTotalPressure());
    }

    @Test
    @DisplayName("Verify SensorConstants 1-2-2-1 layout constraints")
    void testSensorConstants() {
        assertEquals(20, SensorConstants.BLE_PACKET_SIZE);
        assertEquals(50.0, SensorConstants.DEFAULT_SAMPLING_RATE_HZ);
        assertEquals(10.0, SensorConstants.STEP_START_PRESSURE_THRESHOLD_KPA);
        assertEquals(5.0, SensorConstants.STEP_END_PRESSURE_THRESHOLD_KPA);
        assertEquals(12, SensorConstants.MIN_STANCE_SAMPLES);
        assertEquals(120, SensorConstants.MAX_STANCE_SAMPLES);

        assertEquals(6, SensorConstants.SENSOR_COORDINATES_X.length);
        assertEquals(6, SensorConstants.SENSOR_COORDINATES_Y.length);
        assertArrayEquals(new byte[]{(byte) 0xAA, (byte) 0x55}, SensorConstants.BLE_PACKET_HEADER);
    }
}
