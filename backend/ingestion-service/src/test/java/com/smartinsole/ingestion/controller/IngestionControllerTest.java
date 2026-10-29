package com.smartinsole.ingestion.controller;

import com.smartinsole.common.dto.FSRSampleDto;
import com.smartinsole.common.dto.FootstepRawDataDto;
import com.smartinsole.ingestion.service.BufferManagerService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class IngestionControllerTest {

    @Mock
    private BufferManagerService bufferManagerService;

    private IngestionController controller;

    @BeforeEach
    void setUp() {
        controller = new IngestionController(bufferManagerService);
    }

    @Test
    @DisplayName("Ingest single sample: buffering state")
    void testIngestSampleBuffering() {
        when(bufferManagerService.processSample(eq("s1"), eq("right"), any(FSRSampleDto.class)))
                .thenReturn(Optional.empty());

        IngestionController.SampleIngestRequest req = new IngestionController.SampleIngestRequest("s1", "right", new FSRSampleDto());
        ResponseEntity<Map<String, Object>> resp = controller.ingestSample(req);

        assertEquals(HttpStatus.OK, resp.getStatusCode());
        assertEquals("buffering", resp.getBody().get("status"));
    }

    @Test
    @DisplayName("Ingest single sample: step completed state")
    void testIngestSampleStepCompleted() {
        FootstepRawDataDto step = FootstepRawDataDto.builder()
                .stepId(3)
                .durationMs(620.0)
                .samples(List.of(new FSRSampleDto(), new FSRSampleDto()))
                .build();

        when(bufferManagerService.processSample(eq("s1"), eq("right"), any(FSRSampleDto.class)))
                .thenReturn(Optional.of(step));

        IngestionController.SampleIngestRequest req = new IngestionController.SampleIngestRequest("s1", "right", new FSRSampleDto());
        ResponseEntity<Map<String, Object>> resp = controller.ingestSample(req);

        assertEquals(HttpStatus.OK, resp.getStatusCode());
        assertEquals("step_completed", resp.getBody().get("status"));
        assertEquals(3, resp.getBody().get("stepId"));
        assertEquals(620.0, resp.getBody().get("durationMs"));
    }

    @Test
    @DisplayName("Ingest batch of samples")
    void testIngestBatch() {
        FootstepRawDataDto step = FootstepRawDataDto.builder()
                .stepId(1)
                .durationMs(700.0)
                .samples(List.of(new FSRSampleDto()))
                .build();

        when(bufferManagerService.processSample(eq("s1"), eq("right"), any(FSRSampleDto.class)))
                .thenReturn(Optional.empty())
                .thenReturn(Optional.of(step));

        IngestionController.BatchIngestRequest req = new IngestionController.BatchIngestRequest(
                "s1", "right", List.of(new FSRSampleDto(), new FSRSampleDto())
        );

        ResponseEntity<Map<String, Object>> resp = controller.ingestBatch(req);
        assertEquals(HttpStatus.OK, resp.getStatusCode());
        assertEquals("processed", resp.getBody().get("status"));
        assertEquals(2, resp.getBody().get("processedSamples"));
        assertEquals(1, resp.getBody().get("detectedSteps"));
    }

    @Test
    @DisplayName("Health check returns UP status")
    void testHealthCheck() {
        ResponseEntity<Map<String, Object>> resp = controller.healthCheck();
        assertEquals(HttpStatus.OK, resp.getStatusCode());
        assertEquals("UP", resp.getBody().get("status"));
        assertEquals("ingestion-service", resp.getBody().get("service"));
    }
}
