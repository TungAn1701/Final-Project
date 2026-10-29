package com.smartinsole.common.dto;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class DtoModelsTest {

    @Test
    @DisplayName("Verify CustomerDto getters, setters and builder")
    void testCustomerDto() {
        LocalDateTime now = LocalDateTime.now();
        CustomerDto dto = CustomerDto.builder()
                .id("cust-1")
                .fullName("Nguyen Van A")
                .email("a@gmail.com")
                .phoneNumber("0912345678")
                .age(30)
                .gender("male")
                .shoeSizeEu(42.5)
                .weightKg(70.0)
                .heightCm(175.0)
                .address("Hanoi")
                .medicalNotes("Flatfoot")
                .createdAt(now)
                .updatedAt(now)
                .build();

        assertEquals("cust-1", dto.getId());
        assertEquals("Nguyen Van A", dto.getFullName());
        assertEquals("a@gmail.com", dto.getEmail());
        assertEquals("0912345678", dto.getPhoneNumber());
        assertEquals(30, dto.getAge());
        assertEquals("male", dto.getGender());
        assertEquals(42.5, dto.getShoeSizeEu());
        assertEquals(70.0, dto.getWeightKg());
        assertEquals(175.0, dto.getHeightCm());
        assertEquals("Hanoi", dto.getAddress());
        assertEquals("Flatfoot", dto.getMedicalNotes());
        assertEquals(now, dto.getCreatedAt());
        assertEquals(now, dto.getUpdatedAt());
        assertNotNull(dto.toString());
        assertEquals(dto, dto);
        assertNotEquals(dto, new CustomerDto());
        assertTrue(dto.hashCode() != 0);

        CustomerDto noArg = new CustomerDto();
        noArg.setId("cust-2");
        noArg.setFullName("Test");
        noArg.setEmail("test2@example.com");
        noArg.setPhoneNumber("0988776655");
        noArg.setAge(25);
        noArg.setGender("female");
        noArg.setShoeSizeEu(38.0);
        noArg.setWeightKg(55.0);
        noArg.setHeightCm(162.0);
        noArg.setAddress("Danang");
        noArg.setMedicalNotes("Normal");
        noArg.setCreatedAt(now);
        noArg.setUpdatedAt(now);

        assertEquals("Test", noArg.getFullName());
        assertEquals("cust-2", noArg.getId());
        assertEquals("test2@example.com", noArg.getEmail());
        assertEquals("0988776655", noArg.getPhoneNumber());
        assertEquals(25, noArg.getAge());
        assertEquals("female", noArg.getGender());
        assertEquals(38.0, noArg.getShoeSizeEu());
        assertEquals(55.0, noArg.getWeightKg());
        assertEquals(162.0, noArg.getHeightCm());
        assertEquals("Danang", noArg.getAddress());
        assertEquals("Normal", noArg.getMedicalNotes());
    }

    @Test
    @DisplayName("Verify GaitSessionDto and FootstepRecordDto")
    void testSessionAndFootstepDto() {
        LocalDateTime now = LocalDateTime.now();
        GaitSessionDto session = GaitSessionDto.builder()
                .id("sess-1")
                .customerId("cust-1")
                .deviceMac("AA:BB:CC:DD:EE:FF")
                .activityType("walking")
                .stepCount(50)
                .status("COMPLETED")
                .notes("Test notes")
                .startTime(now)
                .endTime(now.plusMinutes(5))
                .createdAt(now)
                .build();

        assertEquals("sess-1", session.getId());
        assertEquals("cust-1", session.getCustomerId());
        assertEquals("AA:BB:CC:DD:EE:FF", session.getDeviceMac());
        assertEquals("walking", session.getActivityType());
        assertEquals(50, session.getStepCount());
        assertEquals("COMPLETED", session.getStatus());
        assertEquals("Test notes", session.getNotes());
        assertEquals(now, session.getStartTime());
        assertNotNull(session.getEndTime());
        assertEquals(now, session.getCreatedAt());
        assertNotNull(session.toString());
        assertEquals(session, session);
        assertTrue(session.hashCode() != 0);

        GaitSessionDto session2 = new GaitSessionDto();
        session2.setId("sess-2");
        session2.setCustomerId("cust-2");
        session2.setDeviceMac("MAC");
        session2.setActivityType("running");
        session2.setStepCount(10);
        session2.setStatus("RECORDING");
        session2.setNotes("Notes");
        session2.setStartTime(now);
        session2.setEndTime(now);
        session2.setCreatedAt(now);
        assertEquals("sess-2", session2.getId());

        FootstepRecordDto step = FootstepRecordDto.builder()
                .id("step-rec-1")
                .sessionId("sess-1")
                .stepNumber(1)
                .footSide("right")
                .durationMs(650.0)
                .sampleCount(35)
                .peakPressureP0(290.0)
                .peakPressureP1(250.0)
                .peakPressureP2(210.0)
                .peakPressureP3(180.0)
                .peakPressureP4(95.0)
                .peakPressureP5(70.0)
                .avgTotalPressure(150.0)
                .recordedAt(now)
                .build();

        assertEquals("step-rec-1", step.getId());
        assertEquals("sess-1", step.getSessionId());
        assertEquals(1, step.getStepNumber());
        assertEquals("right", step.getFootSide());
        assertEquals(650.0, step.getDurationMs());
        assertEquals(35, step.getSampleCount());
        assertEquals(290.0, step.getPeakPressureP0());
        assertEquals(250.0, step.getPeakPressureP1());
        assertEquals(210.0, step.getPeakPressureP2());
        assertEquals(180.0, step.getPeakPressureP3());
        assertEquals(95.0, step.getPeakPressureP4());
        assertEquals(70.0, step.getPeakPressureP5());
        assertEquals(150.0, step.getAvgTotalPressure());
        assertEquals(now, step.getRecordedAt());
        assertNotNull(step.toString());
        assertEquals(step, step);
        assertTrue(step.hashCode() != 0);

        FootstepRecordDto step2 = new FootstepRecordDto();
        step2.setId("step-2");
        step2.setSessionId("sess-2");
        step2.setStepNumber(2);
        step2.setFootSide("left");
        step2.setDurationMs(600.0);
        step2.setSampleCount(30);
        step2.setPeakPressureP0(200.0);
        step2.setPeakPressureP1(190.0);
        step2.setPeakPressureP2(180.0);
        step2.setPeakPressureP3(170.0);
        step2.setPeakPressureP4(80.0);
        step2.setPeakPressureP5(60.0);
        step2.setAvgTotalPressure(110.0);
        step2.setRecordedAt(now);
        assertEquals("step-2", step2.getId());

        FootstepRawDataDto raw = FootstepRawDataDto.builder()
                .sessionId("sess-1")
                .stepId(1)
                .footSide("right")
                .samplingRateHz(50.0)
                .samples(List.of(new FSRSampleDto()))
                .durationMs(600.0)
                .build();

        assertEquals("sess-1", raw.getSessionId());
        assertEquals(1, raw.getStepId());
        assertEquals("right", raw.getFootSide());
        assertEquals(1, raw.getSamples().size());
        assertEquals(50.0, raw.getSamplingRateHz());
        assertEquals(600.0, raw.getDurationMs());
        assertNotNull(raw.toString());
        assertEquals(raw, raw);
        assertTrue(raw.hashCode() != 0);

        FootstepRawDataDto raw2 = new FootstepRawDataDto();
        raw2.setSessionId("sess-2");
        raw2.setStepId(2);
        raw2.setFootSide("left");
        raw2.setSamplingRateHz(100.0);
        raw2.setSamples(List.of());
        raw2.setDurationMs(500.0);
        assertEquals("sess-2", raw2.getSessionId());
    }

    @Test
    @DisplayName("Verify FSRSampleDto equals, hashCode and toString")
    void testFSRSampleDtoDetails() {
        FSRSampleDto s1 = FSRSampleDto.builder()
                .timestampMs(10.0)
                .p0(100.0)
                .p1(90.0)
                .p2(80.0)
                .p3(70.0)
                .p4(60.0)
                .p5(50.0)
                .build();

        FSRSampleDto s2 = FSRSampleDto.builder()
                .timestampMs(10.0)
                .p0(100.0)
                .p1(90.0)
                .p2(80.0)
                .p3(70.0)
                .p4(60.0)
                .p5(50.0)
                .build();

        assertEquals(s1, s2);
        assertEquals(s1.hashCode(), s2.hashCode());
        assertNotNull(s1.toString());
    }
}
