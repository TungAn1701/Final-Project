package com.smartinsole.customer.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.context.SecurityContextHolder;

import java.io.IOException;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class JwtAuthenticationFilterTest {

    @Mock
    private JwtProvider jwtProvider;

    @Mock
    private HttpServletRequest request;

    @Mock
    private HttpServletResponse response;

    @Mock
    private FilterChain filterChain;

    private JwtAuthenticationFilter filter;

    @BeforeEach
    void setUp() {
        filter = new JwtAuthenticationFilter(jwtProvider);
        SecurityContextHolder.clearContext();
    }

    @Test
    @DisplayName("Filter sets authentication with valid Bearer token")
    void testFilterWithBearerToken() throws ServletException, IOException {
        when(request.getHeader("Authorization")).thenReturn("Bearer valid-token");
        when(jwtProvider.validateToken("valid-token")).thenReturn(true);
        when(jwtProvider.getUsernameFromToken("valid-token")).thenReturn("dr_test");
        when(jwtProvider.getRoleFromToken("valid-token")).thenReturn("CLINICIAN");

        filter.doFilterInternal(request, response, filterChain);

        verify(filterChain, times(1)).doFilter(request, response);
        assertNotNull(SecurityContextHolder.getContext().getAuthentication());
        assertEquals("dr_test", SecurityContextHolder.getContext().getAuthentication().getName());
    }

    @Test
    @DisplayName("Filter sets authentication with Internal Service Key")
    void testFilterWithInternalServiceKey() throws ServletException, IOException {
        when(request.getHeader("Authorization")).thenReturn(null);
        when(request.getHeader("X-Internal-Service-Key")).thenReturn("smart-insole-internal-service-secret");

        filter.doFilterInternal(request, response, filterChain);

        verify(filterChain, times(1)).doFilter(request, response);
        assertNotNull(SecurityContextHolder.getContext().getAuthentication());
        assertEquals("internal-service", SecurityContextHolder.getContext().getAuthentication().getName());
    }

    @Test
    @DisplayName("Filter passes through without auth when no header present")
    void testFilterWithoutHeaders() throws ServletException, IOException {
        when(request.getHeader("Authorization")).thenReturn(null);
        when(request.getHeader("X-Internal-Service-Key")).thenReturn(null);

        filter.doFilterInternal(request, response, filterChain);

        verify(filterChain, times(1)).doFilter(request, response);
        assertNull(SecurityContextHolder.getContext().getAuthentication());
    }
}
