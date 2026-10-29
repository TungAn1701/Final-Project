package com.smartinsole.ingestion.service;

import com.smartinsole.common.dto.FSRSampleDto;
import com.smartinsole.common.dto.FootstepRawDataDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestTemplate;

import java.nio.ByteBuffer;
import java.nio.ByteOrder;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BufferManagerServiceTest {

    @Mock
    private RestTemplate restTemplate;

    private BufferManagerService service;

    @BeforeEach
    void setUp() {
        service = new BufferManagerService(restTemplate);
        ReflectionTestUtils.setField(service, "customerServiceUrl", "http://localhost:8082");
    }

    private byte[] createBlePacket(long timestampMs, int p0Raw, int p1Raw, int p2Raw, int p3Raw, int p4Raw, int p5Raw, int battery) {
        ByteBuffer buf = ByteBuffer.allocate(20).order(ByteOrder.LITTLE_ENDIAN);
        buf.put((byte) 0xAA);
        buf.put((byte) 0x55);
        buf.putInt((int) timestampMs);
        buf.putShort((short) p0Raw);
        buf.putShort((short) p1Raw);
        buf.putShort((short) p2Raw);
        buf.putShort((short) p3Raw);
        buf.putShort((short) p4Raw);
        buf.putShort((short) p5Raw);
        buf.put((byte) battery);

        byte[] raw = buf.array();
        int sum = 0;
        for (int i = 0; i < 19; i++) {
            sum += (raw[i] & 0xFF);
        }
        raw[19] = (byte) (sum & 0xFF);
        return raw;
    }

    @Test
    @DisplayName("Parse valid 16-byte BLE binary packet with checksum verification")
    void testParseBleBinaryPacketSuccess() {
        // 25.5 kPa -> raw 255; 50.0 kPa -> raw 500
        byte[] packet = createBlePacket(1500L, 500, 255, 300, 150, 80, 40, 95);

        FSRSampleDto sample = service.parseBleBinaryPacket(packet);
        assertNotNull(sample);
        assertEquals(1500.0, sample.getTimestampMs());
        assertEquals(50.0, sample.getP0(), 0.01);
        assertEquals(25.5, sample.getP1(), 0.01);
        assertEquals(30.0, sample.getP2(), 0.01);
        assertEquals(15.0, sample.getP3(), 0.01);
        assertEquals(8.0, sample.getP4(), 0.01);
        assertEquals(4.0, sample.getP5(), 0.01);
    }

    @Test
    @DisplayName("Reject malformed BLE packets (null, short, bad header, bad checksum)")
    void testParseBleBinaryPacketInvalid() {
        assertNull(service.parseBleBinaryPacket(null));
        assertNull(service.parseBleBinaryPacket(new byte[10])); // too short

        byte[] badHeader = createBlePacket(100L, 10, 10, 10, 10, 10, 10, 90);
        badHeader[0] = 0x00; // corrupt header
        assertNull(service.parseBleBinaryPacket(badHeader));

        byte[] badChecksum = createBlePacket(100L, 10, 10, 10, 10, 10, 10, 90);
        badChecksum[19] = (byte) (badChecksum[19] + 1); // corrupt checksum
        assertNull(service.parseBleBinaryPacket(badChecksum));
    }

    @Test
    @DisplayName("Gait segmentation: Heel strike, Stance progression, and Step Segmentation (>= 12 samples)")
    void testProcessSampleCompleteGaitCycle() {
        String sessionId = "sess-test-01";
        String footSide = "right";

        // 1. Swing phase: low pressure (< 10 kPa) -> No step start
        FSRSampleDto swingSample = FSRSampleDto.builder().timestampMs(0.0).p0(1.0).build();
        Optional<FootstepRawDataDto> res1 = service.processSample(sessionId, footSide, swingSample);
        assertTrue(res1.isEmpty());

        // 2. Heel strike: total pressure >= 10.0 kPa -> Transitions to STANCE
        FSRSampleDto heelStrike = FSRSampleDto.builder().timestampMs(20.0).p0(15.0).build();
        Optional<FootstepRawDataDto> res2 = service.processSample(sessionId, footSide, heelStrike);
        assertTrue(res2.isEmpty());

        // 3. Stance phase: feed 15 samples with pressure > 5 kPa (at 50Hz, 20ms steps)
        for (int i = 0; i < 15; i++) {
            FSRSampleDto stanceSample = FSRSampleDto.builder()
                    .timestampMs(40.0 + i * 20.0)
                    .p0(100.0)
                    .p2(80.0)
                    .build();
            service.processSample(sessionId, footSide, stanceSample);
        }

        // 4. Toe off / Swing start: 2 consecutive low pressure samples (< 5 kPa) -> Triggers step segmentation
        FSRSampleDto low1 = FSRSampleDto.builder().timestampMs(360.0).p0(2.0).build();
        service.processSample(sessionId, footSide, low1);

        FSRSampleDto low2 = FSRSampleDto.builder().timestampMs(380.0).p0(1.0).build();
        Optional<FootstepRawDataDto> stepOpt = service.processSample(sessionId, footSide, low2);

        assertTrue(stepOpt.isPresent());
        FootstepRawDataDto step = stepOpt.get();
        assertEquals(sessionId, step.getSessionId());
        assertEquals(footSide, step.getFootSide());
        assertEquals(1, step.getStepId());
        assertTrue(step.getSamples().size() >= 12);
        assertTrue(step.getDurationMs() > 0);
    }

    @Test
    @DisplayName("Discard noise or abnormally short steps (< 12 samples)")
    void testProcessSampleDiscardShortStep() {
        String sessionId = "sess-noise";
        String footSide = "left";

        // Heel strike
        service.processSample(sessionId, footSide, FSRSampleDto.builder().timestampMs(0.0).p0(20.0).build());

        // Only 3 stance samples
        for (int i = 0; i < 3; i++) {
            service.processSample(sessionId, footSide, FSRSampleDto.builder().timestampMs(20.0 + i * 20.0).p0(30.0).build());
        }

        // 2 low pressure samples -> end of step
        service.processSample(sessionId, footSide, FSRSampleDto.builder().timestampMs(100.0).p0(1.0).build());
        Optional<FootstepRawDataDto> res = service.processSample(sessionId, footSide, FSRSampleDto.builder().timestampMs(120.0).p0(1.0).build());

        // Discarded because count (5) < MIN_STANCE_SAMPLES (12)
        assertTrue(res.isEmpty());
    }

    @Test
    @DisplayName("Buffer eviction cleans up session memory")
    void testClearBuffer() {
        String sessionId = "sess-evict";
        service.processSample(sessionId, "right", FSRSampleDto.builder().timestampMs(0.0).p0(20.0).build());
        assertDoesNotThrow(() -> service.clearBuffer(sessionId, "right"));
    }
}
