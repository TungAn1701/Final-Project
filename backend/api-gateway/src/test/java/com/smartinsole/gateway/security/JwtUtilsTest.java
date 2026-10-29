package com.smartinsole.gateway.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class JwtUtilsTest {

    private JwtUtils jwtUtils;

    @BeforeEach
    void setUp() {
        jwtUtils = new JwtUtils();
        ReflectionTestUtils.setField(jwtUtils, "jwtSecret", "SmartOrthoticInsoleSuperSecureSecretKeyForJwtAuthenticationSpringSecurity2026!");
        ReflectionTestUtils.setField(jwtUtils, "jwtExpirationMs", 3600000L); // 1 hour
    }

    @Test
    @DisplayName("Generate and validate valid JWT token")
    void testGenerateAndValidateToken() {
        String token = jwtUtils.generateToken("doctor_nguyen", "CLINICIAN", Map.of("clinicId", "HANOI_ORTHO"));
        assertNotNull(token);
        assertTrue(jwtUtils.validateToken(token));

        String username = jwtUtils.getUsernameFromToken(token);
        assertEquals("doctor_nguyen", username);

        String role = jwtUtils.getRoleFromToken(token);
        assertEquals("CLINICIAN", role);
    }

    @Test
    @DisplayName("Reject invalid, corrupted or null tokens")
    void testInvalidToken() {
        assertFalse(jwtUtils.validateToken("invalid.token.string"));
        assertFalse(jwtUtils.validateToken(null));
        assertFalse(jwtUtils.validateToken(""));

        // Tampered token
        String validToken = jwtUtils.generateToken("test_user", "CUSTOMER", Map.of());
        String tampered = validToken.substring(0, validToken.length() - 5) + "abcde";
        assertFalse(jwtUtils.validateToken(tampered));
    }
}
