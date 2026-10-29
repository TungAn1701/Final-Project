package com.smartinsole.customer.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

import static org.junit.jupiter.api.Assertions.*;

class JwtProviderTest {

    private JwtProvider jwtProvider;
    private final String secret = "SmartOrthoticInsoleSuperSecureSecretKeyForJwtAuthenticationSpringSecurity2026!";

    @BeforeEach
    void setUp() {
        jwtProvider = new JwtProvider();
        ReflectionTestUtils.setField(jwtProvider, "jwtSecret", secret);
    }

    private String generateTestToken(String username, String role) {
        SecretKey key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        return Jwts.builder()
                .subject(username)
                .claim("role", role)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 3600000))
                .signWith(key)
                .compact();
    }

    @Test
    @DisplayName("Validate token and extract claims")
    void testValidateTokenAndClaims() {
        String token = generateTestToken("doctor_test", "CLINICIAN");
        assertTrue(jwtProvider.validateToken(token));
        assertEquals("doctor_test", jwtProvider.getUsernameFromToken(token));
        assertEquals("CLINICIAN", jwtProvider.getRoleFromToken(token));

        assertFalse(jwtProvider.validateToken("invalid-token"));
        assertFalse(jwtProvider.validateToken(null));
    }
}
