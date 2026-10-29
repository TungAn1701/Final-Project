package com.smartinsole.gateway.config;

import com.smartinsole.gateway.security.JwtAuthenticationWebFilter;
import com.smartinsole.gateway.security.JwtUtils;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class SecurityConfigTest {

    @Test
    @DisplayName("SecurityWebFilterChain bean builds properly")
    void testSecurityWebFilterChainCreation() {
        JwtUtils jwtUtils = mock(JwtUtils.class);
        JwtAuthenticationWebFilter filter = new JwtAuthenticationWebFilter(jwtUtils);
        SecurityConfig config = new SecurityConfig(filter);

        ServerHttpSecurity http = ServerHttpSecurity.http();
        SecurityWebFilterChain chain = config.springSecurityFilterChain(http);
        assertNotNull(chain);
    }
}
