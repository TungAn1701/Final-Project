package com.smartinsole.ingestion.config;

import com.smartinsole.ingestion.websocket.InsoleWebSocketHandler;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

    private final InsoleWebSocketHandler insoleWebSocketHandler;

    public WebSocketConfig(InsoleWebSocketHandler insoleWebSocketHandler) {
        this.insoleWebSocketHandler = insoleWebSocketHandler;
    }

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(insoleWebSocketHandler, "/ws/sensor-stream")
                .setAllowedOrigins("*");
    }
}
