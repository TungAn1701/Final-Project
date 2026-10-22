package com.smartinsole.ingestion.controller;

import com.smartinsole.common.dto.FSRSampleDto;
import com.smartinsole.common.dto.FootstepRawDataDto;
import com.smartinsole.ingestion.service.BufferManagerService;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping
public class IngestionController {

    private final BufferManagerService bufferManagerService;

    public IngestionController(BufferManagerService bufferManagerService) {
        this.bufferManagerService = bufferManagerService;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SampleIngestRequest {
        private String sessionId;
        private String footSide = "right";
        private FSRSampleDto sample;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BatchIngestRequest {
        private String sessionId;
        private String footSide = "right";
        private List<FSRSampleDto> samples;
    }

    @PostMapping("/api/v1/ingest/sample")
    public ResponseEntity<Map<String, Object>> ingestSample(@RequestBody SampleIngestRequest req) {
        Optional<FootstepRawDataDto> stepOpt = bufferManagerService.processSample(
                req.getSessionId(), req.getFootSide(), req.getSample()
        );

        Map<String, Object> resp = new HashMap<>();
        if (stepOpt.isPresent()) {
            FootstepRawDataDto step = stepOpt.get();
            resp.put("status", "step_completed");
            resp.put("stepId", step.getStepId());
            resp.put("durationMs", step.getDurationMs());
            resp.put("sampleCount", step.getSamples().size());
        } else {
            resp.put("status", "buffering");
        }
        return ResponseEntity.ok(resp);
    }

    @PostMapping("/api/v1/ingest/batch")
    public ResponseEntity<Map<String, Object>> ingestBatch(@RequestBody BatchIngestRequest req) {
        List<FootstepRawDataDto> completed = new ArrayList<>();
        if (req.getSamples() != null) {
            for (FSRSampleDto s : req.getSamples()) {
                Optional<FootstepRawDataDto> stepOpt = bufferManagerService.processSample(
                        req.getSessionId(), req.getFootSide(), s
                );
                stepOpt.ifPresent(completed::add);
            }
        }

        Map<String, Object> resp = new HashMap<>();
        resp.put("status", "processed");
        resp.put("processedSamples", req.getSamples() != null ? req.getSamples().size() : 0);
        resp.put("detectedSteps", completed.size());
        List<Integer> stepIds = new ArrayList<>();
        for (FootstepRawDataDto st : completed) {
            stepIds.add(st.getStepId());
        }
        resp.put("stepIds", stepIds);

        return ResponseEntity.ok(resp);
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> map = new HashMap<>();
        map.put("status", "UP");
        map.put("service", "ingestion-service");
        map.put("port", 8081);
        return ResponseEntity.ok(map);
    }
}
