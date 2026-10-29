package com.smartinsole.ingestion.websocket;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartinsole.common.dto.FSRSampleDto;
import com.smartinsole.common.dto.FootstepRawDataDto;
import com.smartinsole.ingestion.service.BufferManagerService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.*;
import org.springframework.web.socket.handler.AbstractWebSocketHandler;

import java.net.URI;
import java.nio.ByteBuffer;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Slf4j
@Component
public class InsoleWebSocketHandler extends AbstractWebSocketHandler {

    private final BufferManagerService bufferManager;
    private final ObjectMapper objectMapper;

    public InsoleWebSocketHandler(BufferManagerService bufferManager) {
        this.bufferManager = bufferManager;
        this.objectMapper = new ObjectMapper();
    }

    private String extractQueryParam(URI uri, String paramName, String defaultValue) {
        if (uri == null || uri.getQuery() == null) return defaultValue;
        for (String pair : uri.getQuery().split("&")) {
            String[] kv = pair.split("=");
            if (kv.length == 2 && kv[0].equalsIgnoreCase(paramName)) {
                return kv[1];
            }
        }
        return defaultValue;
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        String sessionId = extractQueryParam(session.getUri(), "session_id", session.getId());
        String footSide = extractQueryParam(session.getUri(), "foot_side", "right");
        session.getAttributes().put("session_id", sessionId);
        session.getAttributes().put("foot_side", footSide);
        log.info("WebSocket connected for session: {} ({})", sessionId, footSide);
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        String payload = message.getPayload();
        FSRSampleDto sample = objectMapper.readValue(payload, FSRSampleDto.class);

        String sessionId = (String) session.getAttributes().get("session_id");
        String footSide = (String) session.getAttributes().get("foot_side");

        Optional<FootstepRawDataDto> stepOpt = bufferManager.processSample(sessionId, footSide, sample);
        if (stepOpt.isPresent()) {
            FootstepRawDataDto step = stepOpt.get();
            Map<String, Object> resp = new HashMap<>();
            resp.put("event", "step_segmented");
            resp.put("stepId", step.getStepId());
            resp.put("durationMs", step.getDurationMs());
            resp.put("sampleCount", step.getSamples().size());
            String json = objectMapper.writeValueAsString(resp);
            synchronized (session) {
                if (session.isOpen()) {
                    session.sendMessage(new TextMessage(json));
                }
            }
        }
    }

    @Override
    protected void handleBinaryMessage(WebSocketSession session, BinaryMessage message) throws Exception {
        ByteBuffer byteBuffer = message.getPayload();
        byte[] bytes = new byte[byteBuffer.remaining()];
        byteBuffer.get(bytes);

        FSRSampleDto sample = bufferManager.parseBleBinaryPacket(bytes);
        if (sample != null) {
            String sessionId = (String) session.getAttributes().get("session_id");
            String footSide = (String) session.getAttributes().get("foot_side");

            Optional<FootstepRawDataDto> stepOpt = bufferManager.processSample(sessionId, footSide, sample);
            if (stepOpt.isPresent()) {
                FootstepRawDataDto step = stepOpt.get();
                Map<String, Object> resp = new HashMap<>();
                resp.put("event", "step_segmented");
                resp.put("stepId", step.getStepId());
                resp.put("durationMs", step.getDurationMs());
                String json = objectMapper.writeValueAsString(resp);
                synchronized (session) {
                    if (session.isOpen()) {
                        session.sendMessage(new TextMessage(json));
                    }
                }
            }
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        String sessionId = (String) session.getAttributes().get("session_id");
        String footSide = (String) session.getAttributes().get("foot_side");
        if (sessionId != null) {
            bufferManager.clearBuffer(sessionId, footSide);
        }
        log.info("WebSocket disconnected and cleaned: {} (session: {}, foot: {})", session.getId(), sessionId, footSide);
    }
}
