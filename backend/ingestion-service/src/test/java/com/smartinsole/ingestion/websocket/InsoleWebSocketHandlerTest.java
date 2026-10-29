package com.smartinsole.ingestion.websocket;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartinsole.common.dto.FSRSampleDto;
import com.smartinsole.common.dto.FootstepRawDataDto;
import com.smartinsole.ingestion.service.BufferManagerService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.socket.BinaryMessage;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

import java.net.URI;
import java.nio.ByteBuffer;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InsoleWebSocketHandlerTest {

    @Mock
    private BufferManagerService bufferManager;

    @Mock
    private WebSocketSession session;

    private InsoleWebSocketHandler handler;
    private final ObjectMapper mapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        handler = new InsoleWebSocketHandler(bufferManager);
    }

    @Test
    @DisplayName("WebSocket connection established extracts query parameters")
    void testAfterConnectionEstablished() {
        URI uri = URI.create("ws://localhost:8081/ws/sensor-stream?session_id=sess-99&foot_side=left");
        when(session.getUri()).thenReturn(uri);

        Map<String, Object> attributes = new HashMap<>();
        when(session.getAttributes()).thenReturn(attributes);

        handler.afterConnectionEstablished(session);

        assertEquals("sess-99", attributes.get("session_id"));
        assertEquals("left", attributes.get("foot_side"));
    }

    @Test
    @DisplayName("WebSocket handles incoming JSON text message")
    void testHandleTextMessageWithStepSegmentation() throws Exception {
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("session_id", "sess-100");
        attributes.put("foot_side", "right");
        when(session.getAttributes()).thenReturn(attributes);
        when(session.isOpen()).thenReturn(true);

        FSRSampleDto sample = FSRSampleDto.builder().p0(250.0).build();
        String jsonPayload = mapper.writeValueAsString(sample);

        FootstepRawDataDto step = FootstepRawDataDto.builder()
                .stepId(1)
                .durationMs(650.0)
                .samples(List.of(sample))
                .build();

        when(bufferManager.processSample(eq("sess-100"), eq("right"), any(FSRSampleDto.class)))
                .thenReturn(Optional.of(step));

        handler.handleTextMessage(session, new TextMessage(jsonPayload));

        verify(session, times(1)).sendMessage(any(TextMessage.class));
    }

    @Test
    @DisplayName("WebSocket handles binary BLE frame")
    void testHandleBinaryMessage() throws Exception {
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("session_id", "sess-101");
        attributes.put("foot_side", "left");
        when(session.getAttributes()).thenReturn(attributes);

        byte[] dummyBytes = new byte[16];
        when(bufferManager.parseBleBinaryPacket(any(byte[].class))).thenReturn(new FSRSampleDto());
        when(bufferManager.processSample(eq("sess-101"), eq("left"), any(FSRSampleDto.class))).thenReturn(Optional.empty());

        handler.handleBinaryMessage(session, new BinaryMessage(ByteBuffer.wrap(dummyBytes)));

        verify(bufferManager, times(1)).parseBleBinaryPacket(any(byte[].class));
    }

    @Test
    @DisplayName("WebSocket disconnect triggers buffer cleanup")
    void testAfterConnectionClosed() {
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("session_id", "sess-102");
        attributes.put("foot_side", "right");
        when(session.getAttributes()).thenReturn(attributes);
        when(session.getId()).thenReturn("ws-conn-102");

        handler.afterConnectionClosed(session, CloseStatus.NORMAL);

        verify(bufferManager, times(1)).clearBuffer("sess-102", "right");
    }
}
