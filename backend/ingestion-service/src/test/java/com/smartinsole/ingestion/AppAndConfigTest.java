package com.smartinsole.ingestion;

import com.smartinsole.ingestion.config.OpenApiConfig;
import com.smartinsole.ingestion.config.WebSocketConfig;
import com.smartinsole.ingestion.websocket.InsoleWebSocketHandler;
import io.swagger.v3.oas.models.OpenAPI;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class AppAndConfigTest {

    @Test
    @DisplayName("Instantiate IngestionApplication and test RestTemplate bean")
    void testApp() {
        IngestionApplication app = new IngestionApplication();
        assertNotNull(app);
        assertNotNull(app.restTemplate());
    }

    @Test
    @DisplayName("OpenApiConfig produces OpenAPI bean")
    void testOpenApi() {
        OpenApiConfig config = new OpenApiConfig();
        OpenAPI openAPI = config.customOpenAPI();
        assertNotNull(openAPI);
        assertEquals("Smart Insole - Sensor Ingestion API", openAPI.getInfo().getTitle());
    }

    @Test
    @DisplayName("WebSocketConfig registers insole handler")
    void testWebSocketConfig() {
        InsoleWebSocketHandler handler = mock(InsoleWebSocketHandler.class);
        WebSocketConfig config = new WebSocketConfig(handler);
        WebSocketHandlerRegistry registry = mock(WebSocketHandlerRegistry.class, RETURNS_DEEP_STUBS);

        assertDoesNotThrow(() -> config.registerWebSocketHandlers(registry));
    }
}
