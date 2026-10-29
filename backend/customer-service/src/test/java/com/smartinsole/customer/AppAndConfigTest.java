package com.smartinsole.customer;

import com.smartinsole.customer.config.OpenApiConfig;
import com.smartinsole.customer.config.SecurityConfig;
import com.smartinsole.customer.security.JwtAuthenticationFilter;
import com.smartinsole.customer.security.JwtProvider;
import io.swagger.v3.oas.models.OpenAPI;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class AppAndConfigTest {

    @Test
    @DisplayName("Instantiate CustomerApplication")
    void testApp() {
        CustomerApplication app = new CustomerApplication();
        assertNotNull(app);
    }

    @Test
    @DisplayName("OpenApiConfig produces OpenAPI specification bean")
    void testOpenApiConfig() {
        OpenApiConfig config = new OpenApiConfig();
        OpenAPI openAPI = config.customOpenAPI();
        assertNotNull(openAPI);
        assertNotNull(openAPI.getInfo());
        assertEquals("Smart Insole - Customer & Session API", openAPI.getInfo().getTitle());
    }

    @Test
    @DisplayName("SecurityConfig instantiates properly")
    void testSecurityConfig() {
        JwtProvider jwtProvider = mock(JwtProvider.class);
        JwtAuthenticationFilter filter = new JwtAuthenticationFilter(jwtProvider);
        SecurityConfig config = new SecurityConfig(filter);
        assertNotNull(config);
    }
}
