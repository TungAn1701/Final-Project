package com.smartinsole.customer.controller;

import com.smartinsole.common.dto.FSRSampleDto;
import com.smartinsole.common.dto.FootstepRawDataDto;
import com.smartinsole.common.dto.FootstepRecordDto;
import com.smartinsole.customer.entity.FootstepMeasurementEntity;
import com.smartinsole.customer.entity.GaitSessionEntity;
import com.smartinsole.customer.repository.FootstepMeasurementRepository;
import com.smartinsole.customer.repository.GaitSessionRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping
public class FootstepController {

    private final FootstepMeasurementRepository footstepRepository;
    private final GaitSessionRepository sessionRepository;

    public FootstepController(FootstepMeasurementRepository footstepRepository, GaitSessionRepository sessionRepository) {
        this.footstepRepository = footstepRepository;
        this.sessionRepository = sessionRepository;
    }

    private FootstepRecordDto toDto(FootstepMeasurementEntity e) {
        return FootstepRecordDto.builder()
                .id(e.getId())
                .sessionId(e.getSession().getId())
                .stepNumber(e.getStepNumber())
                .footSide(e.getFootSide())
                .durationMs(e.getDurationMs())
                .sampleCount(e.getSampleCount())
                .peakPressureP0(e.getPeakPressureP0())
                .peakPressureP1(e.getPeakPressureP1())
                .peakPressureP2(e.getPeakPressureP2())
                .peakPressureP3(e.getPeakPressureP3())
                .peakPressureP4(e.getPeakPressureP4())
                .peakPressureP5(e.getPeakPressureP5())
                .avgTotalPressure(e.getAvgTotalPressure())
                .recordedAt(e.getRecordedAt())
                .build();
    }

    // 1. Ingest segmented footstep from Ingestion Service
    @Transactional
    @PostMapping("/api/v1/sessions/{sessionId}/footsteps")
    public ResponseEntity<FootstepRecordDto> recordFootstep(
            @PathVariable String sessionId,
            @RequestBody FootstepRawDataDto rawStep
    ) {
        Optional<GaitSessionEntity> sessionOpt = sessionRepository.findById(sessionId);
        if (sessionOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        GaitSessionEntity session = sessionOpt.get();

        // Calculate peak pressures and averages
        double[] peaks = new double[6];
        double sumTotalPressure = 0.0;
        List<FSRSampleDto> samples = rawStep.getSamples();
        int n = samples != null ? samples.size() : 0;

        if (samples != null) {
            for (FSRSampleDto s : samples) {
                peaks[0] = Math.max(peaks[0], s.getP0());
                peaks[1] = Math.max(peaks[1], s.getP1());
                peaks[2] = Math.max(peaks[2], s.getP2());
                peaks[3] = Math.max(peaks[3], s.getP3());
                peaks[4] = Math.max(peaks[4], s.getP4());
                peaks[5] = Math.max(peaks[5], s.getP5());
                sumTotalPressure += s.getTotalPressure();
            }
        }
        double avgTotalPressure = n > 0 ? (sumTotalPressure / n) : 0.0;

        FootstepMeasurementEntity entity = FootstepMeasurementEntity.builder()
                .id(UUID.randomUUID().toString())
                .session(session)
                .stepNumber(rawStep.getStepId())
                .footSide(rawStep.getFootSide() != null ? rawStep.getFootSide() : "right")
                .durationMs(rawStep.getDurationMs())
                .sampleCount(n)
                .peakPressureP0(Math.round(peaks[0] * 10.0) / 10.0)
                .peakPressureP1(Math.round(peaks[1] * 10.0) / 10.0)
                .peakPressureP2(Math.round(peaks[2] * 10.0) / 10.0)
                .peakPressureP3(Math.round(peaks[3] * 10.0) / 10.0)
                .peakPressureP4(Math.round(peaks[4] * 10.0) / 10.0)
                .peakPressureP5(Math.round(peaks[5] * 10.0) / 10.0)
                .avgTotalPressure(Math.round(avgTotalPressure * 10.0) / 10.0)
                .build();

        FootstepMeasurementEntity saved = footstepRepository.save(entity);

        // Atomic step count increment
        sessionRepository.incrementStepCount(sessionId);

        return ResponseEntity.status(HttpStatus.CREATED).body(toDto(saved));
    }

    // 2. List footsteps of a session
    @GetMapping("/api/v1/sessions/{sessionId}/footsteps")
    public ResponseEntity<List<FootstepRecordDto>> listSessionFootsteps(@PathVariable String sessionId) {
        List<FootstepMeasurementEntity> list = footstepRepository.findBySessionIdOrderByStepNumberAsc(sessionId);
        return ResponseEntity.ok(list.stream().map(this::toDto).collect(Collectors.toList()));
    }

    // 3. Health check
    @GetMapping("/health")
    public ResponseEntity<Object> healthCheck() {
        return ResponseEntity.ok().body("{\"status\":\"UP\",\"service\":\"customer-service\",\"port\":8082}");
    }
}
