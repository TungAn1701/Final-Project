package com.smartinsole.customer.controller;

import com.smartinsole.common.dto.FSRSampleDto;
import com.smartinsole.common.dto.FootstepRawDataDto;
import com.smartinsole.common.dto.FootstepRecordDto;
import com.smartinsole.customer.entity.CustomerEntity;
import com.smartinsole.customer.entity.FootstepMeasurementEntity;
import com.smartinsole.customer.entity.GaitSessionEntity;
import com.smartinsole.customer.repository.FootstepMeasurementRepository;
import com.smartinsole.customer.repository.GaitSessionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FootstepControllerTest {

    @Mock
    private FootstepMeasurementRepository footstepRepository;

    @Mock
    private GaitSessionRepository sessionRepository;

    private FootstepController controller;

    @BeforeEach
    void setUp() {
        controller = new FootstepController(footstepRepository, sessionRepository);
    }

    @Test
    @DisplayName("Record footstep: session not found")
    void testRecordFootstepSessionNotFound() {
        when(sessionRepository.findById("s-none")).thenReturn(Optional.empty());

        FootstepRawDataDto raw = FootstepRawDataDto.builder().stepId(1).build();
        ResponseEntity<FootstepRecordDto> resp = controller.recordFootstep("s-none", raw);

        assertEquals(HttpStatus.NOT_FOUND, resp.getStatusCode());
    }

    @Test
    @DisplayName("Record footstep calculates peak pressures, avg total pressure, and increments step count")
    void testRecordFootstepSuccess() {
        CustomerEntity customer = CustomerEntity.builder().id("cust-1").fullName("Nam").build();
        GaitSessionEntity session = GaitSessionEntity.builder()
                .id("sess-1")
                .customer(customer)
                .stepCount(5)
                .build();

        when(sessionRepository.findById("sess-1")).thenReturn(Optional.of(session));

        FSRSampleDto s1 = FSRSampleDto.builder().p0(290.0).p1(20.0).p2(30.0).p3(40.0).p4(50.0).p5(60.0).build();
        FSRSampleDto s2 = FSRSampleDto.builder().p0(150.0).p1(240.0).p2(180.0).p3(120.0).p4(90.0).p5(70.0).build();

        FootstepRawDataDto raw = FootstepRawDataDto.builder()
                .sessionId("sess-1")
                .stepId(6)
                .footSide("right")
                .durationMs(640.0)
                .samples(List.of(s1, s2))
                .build();

        when(footstepRepository.save(any(FootstepMeasurementEntity.class))).thenAnswer(inv -> {
            FootstepMeasurementEntity entity = inv.getArgument(0);
            entity.setRecordedAt(LocalDateTime.now());
            return entity;
        });

        doNothing().when(sessionRepository).incrementStepCount("sess-1");

        ResponseEntity<FootstepRecordDto> resp = controller.recordFootstep("sess-1", raw);

        assertEquals(HttpStatus.CREATED, resp.getStatusCode());
        assertNotNull(resp.getBody());
        assertEquals("sess-1", resp.getBody().getSessionId());
        assertEquals(6, resp.getBody().getStepNumber());
        assertEquals(290.0, resp.getBody().getPeakPressureP0()); // max(290, 150)
        assertEquals(240.0, resp.getBody().getPeakPressureP1()); // max(20, 240)
        verify(sessionRepository, times(1)).incrementStepCount("sess-1");
    }

    @Test
    @DisplayName("List footsteps of a session")
    void testListSessionFootsteps() {
        GaitSessionEntity session = GaitSessionEntity.builder().id("s-1").build();
        FootstepMeasurementEntity m1 = FootstepMeasurementEntity.builder()
                .id("m-1")
                .session(session)
                .stepNumber(1)
                .footSide("right")
                .durationMs(600.0)
                .sampleCount(30)
                .peakPressureP0(250.0)
                .avgTotalPressure(120.0)
                .recordedAt(LocalDateTime.now())
                .build();

        when(footstepRepository.findBySessionIdOrderByStepNumberAsc("s-1")).thenReturn(List.of(m1));

        ResponseEntity<List<FootstepRecordDto>> resp = controller.listSessionFootsteps("s-1");
        assertEquals(HttpStatus.OK, resp.getStatusCode());
        assertEquals(1, resp.getBody().size());
        assertEquals("m-1", resp.getBody().get(0).getId());
    }

    @Test
    @DisplayName("Health check endpoint")
    void testHealthCheck() {
        ResponseEntity<Object> resp = controller.healthCheck();
        assertEquals(HttpStatus.OK, resp.getStatusCode());
    }
}
