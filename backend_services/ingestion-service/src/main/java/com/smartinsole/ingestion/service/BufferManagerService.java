package com.smartinsole.ingestion.service;

import com.smartinsole.common.constants.SensorConstants;
import com.smartinsole.common.dto.FSRSampleDto;
import com.smartinsole.common.dto.FootstepRawDataDto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.nio.ByteBuffer;
import java.nio.ByteOrder;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
public class BufferManagerService {

    @Value("${customer.service.url:http://localhost:8082}")
    private String customerServiceUrl;

    private final RestTemplate restTemplate;

    public BufferManagerService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    private enum GaitPhase {
        SWING_PHASE,
        STANCE_PHASE
    }

    private static class SessionBuffer {
        final String sessionId;
        final String footSide;
        GaitPhase currentPhase = GaitPhase.SWING_PHASE;
        int currentStepId = 0;
        final List<FSRSampleDto> currentSamples = new ArrayList<>();
        int consecutiveLowCount = 0;

        SessionBuffer(String sessionId, String footSide) {
            this.sessionId = sessionId;
            this.footSide = footSide;
        }
    }

    private final Map<String, SessionBuffer> buffers = new ConcurrentHashMap<>();

    private SessionBuffer getBuffer(String sessionId, String footSide) {
        String key = sessionId + "_" + (footSide != null ? footSide : "right");
        return buffers.computeIfAbsent(key, k -> new SessionBuffer(sessionId, footSide));
    }

    public synchronized Optional<FootstepRawDataDto> processSample(String sessionId, String footSide, FSRSampleDto sample) {
        SessionBuffer buf = getBuffer(sessionId, footSide);
        double totalP = sample.getTotalPressure();

        if (buf.currentPhase == GaitPhase.SWING_PHASE) {
            // Heel strike detection
            if (totalP >= SensorConstants.STEP_START_PRESSURE_THRESHOLD_KPA) {
                buf.currentPhase = GaitPhase.STANCE_PHASE;
                buf.currentStepId++;
                buf.currentSamples.clear();
                buf.currentSamples.add(sample);
                buf.consecutiveLowCount = 0;
                log.debug("Step {} started for session {} (P_total: {} kPa)", buf.currentStepId, sessionId, totalP);
            }
            return Optional.empty();

        } else {
            // Stance phase in progress
            buf.currentSamples.add(sample);

            if (totalP < SensorConstants.STEP_END_PRESSURE_THRESHOLD_KPA) {
                buf.consecutiveLowCount++;
            } else {
                buf.consecutiveLowCount = 0;
            }

            boolean isEndOfStep = buf.consecutiveLowCount >= 2;
            boolean isOverflow = buf.currentSamples.size() >= SensorConstants.MAX_STANCE_SAMPLES;

            if (isEndOfStep || isOverflow) {
                buf.currentPhase = GaitPhase.SWING_PHASE;
                int count = buf.currentSamples.size();

                if (count >= SensorConstants.MIN_STANCE_SAMPLES) {
                    double tStart = buf.currentSamples.get(0).getTimestampMs();
                    double tEnd = buf.currentSamples.get(count - 1).getTimestampMs();
                    double durationMs = Math.max(tEnd - tStart, (count / SensorConstants.DEFAULT_SAMPLING_RATE_HZ) * 1000.0);

                    FootstepRawDataDto step = FootstepRawDataDto.builder()
                            .sessionId(buf.sessionId)
                            .stepId(buf.currentStepId)
                            .footSide(buf.footSide)
                            .samplingRateHz(SensorConstants.DEFAULT_SAMPLING_RATE_HZ)
                            .samples(new ArrayList<>(buf.currentSamples))
                            .durationMs(Math.round(durationMs * 10.0) / 10.0)
                            .build();

                    buf.currentSamples.clear();
                    log.info("Footstep {} segmented: {} samples, {} ms for session {}",
                            step.getStepId(), count, step.getDurationMs(), sessionId);

                    // Persist step into Customer Session history
                    saveStepToCustomerSession(step);

                    return Optional.of(step);
                } else {
                    log.debug("Step discarded: too short ({} samples)", count);
                    buf.currentSamples.clear();
                    return Optional.empty();
                }
            }
        }
        return Optional.empty();
    }

    public void saveStepToCustomerSession(FootstepRawDataDto step) {
        new Thread(() -> {
            try {
                String url = customerServiceUrl + "/api/v1/sessions/" + step.getSessionId() + "/footsteps";
                restTemplate.postForObject(url, step, Object.class);
                log.debug("Saved footstep {} to customer session {}", step.getStepId(), step.getSessionId());
            } catch (Exception e) {
                log.debug("Could not record step to customer session (session might be standalone): {}", e.getMessage());
            }
        }).start();
    }

    public FSRSampleDto parseBleBinaryPacket(byte[] packet) {
        if (packet == null || packet.length != SensorConstants.BLE_PACKET_SIZE) {
            log.warn("Invalid BLE packet length: {}", packet != null ? packet.length : 0);
            return null;
        }

        // Header check: 0xAA 0x55
        if (packet[0] != (byte) 0xAA || packet[1] != (byte) 0x55) {
            log.warn("Invalid BLE header: [{}, {}]", packet[0], packet[1]);
            return null;
        }

        ByteBuffer buffer = ByteBuffer.wrap(packet).order(ByteOrder.LITTLE_ENDIAN);
        buffer.position(2); // Skip header

        long timestamp = Integer.toUnsignedLong(buffer.getInt());

        double[] p = new double[6];
        for (int i = 0; i < 6; i++) {
            int raw = Short.toUnsignedInt(buffer.getShort());
            p[i] = raw > 1000 ? raw / 10.0 : raw;
        }

        return FSRSampleDto.builder()
                .timestampMs(timestamp)
                .p0(p[0])
                .p1(p[1])
                .p2(p[2])
                .p3(p[3])
                .p4(p[4])
                .p5(p[5])
                .build();
    }
}
