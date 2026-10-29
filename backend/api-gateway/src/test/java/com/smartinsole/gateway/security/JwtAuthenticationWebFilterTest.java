package com.smartinsole.gateway.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpHeaders;
import org.springframework.mock.http.server.reactive.MockServerHttpRequest;
import org.springframework.mock.web.server.MockServerWebExchange;
import org.springframework.security.core.context.ReactiveSecurityContextHolder;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class JwtAuthenticationWebFilterTest {

    @Mock
    private JwtUtils jwtUtils;

    @Mock
    private WebFilterChain chain;

    private JwtAuthenticationWebFilter filter;

    @BeforeEach
    void setUp() {
        filter = new JwtAuthenticationWebFilter(jwtUtils);
        when(chain.filter(any())).thenReturn(Mono.empty());
    }

    @Test
    @DisplayName("Valid Bearer token sets ReactiveSecurityContext")
    void testFilterWithValidBearerToken() {
        String token = "valid.jwt.token";
        when(jwtUtils.validateToken(token)).thenReturn(true);
        when(jwtUtils.getUsernameFromToken(token)).thenReturn("doctor_nguyen");
        when(jwtUtils.getRoleFromToken(token)).thenReturn("CLINICIAN");

        MockServerHttpRequest request = MockServerHttpRequest.get("/api/v1/customers")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                .build();
        MockServerWebExchange exchange = MockServerWebExchange.from(request);

        Mono<Void> result = filter.filter(exchange, chain);
        result.block();

        verify(chain, times(1)).filter(exchange);
        verify(jwtUtils, times(1)).validateToken(token);
    }

    @Test
    @DisplayName("Request without Authorization header passes through without error")
    void testFilterWithoutAuthHeader() {
        MockServerHttpRequest request = MockServerHttpRequest.get("/api/v1/auth/login").build();
        MockServerWebExchange exchange = MockServerWebExchange.from(request);

        filter.filter(exchange, chain).block();

        verify(chain, times(1)).filter(exchange);
        verifyNoInteractions(jwtUtils);
    }

    @Test
    @DisplayName("Invalid token passes through without setting security context")
    void testFilterWithInvalidToken() {
        when(jwtUtils.validateToken("bad.token")).thenReturn(false);

        MockServerHttpRequest request = MockServerHttpRequest.get("/api/v1/customers")
                .header(HttpHeaders.AUTHORIZATION, "Bearer bad.token")
                .build();
        MockServerWebExchange exchange = MockServerWebExchange.from(request);

        filter.filter(exchange, chain).block();

        verify(chain, times(1)).filter(exchange);
        verify(jwtUtils, times(1)).validateToken("bad.token");
        verify(jwtUtils, never()).getUsernameFromToken(anyString());
    }
}
