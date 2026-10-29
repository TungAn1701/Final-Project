package com.smartinsole.gateway.controller;

import com.smartinsole.gateway.security.JwtUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import reactor.core.publisher.Mono;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    @Mock
    private JwtUtils jwtUtils;

    private AuthController authController;

    @BeforeEach
    void setUp() {
        authController = new AuthController(jwtUtils);
    }

    @Test
    @DisplayName("Login succeeds with valid clinician credentials")
    void testLoginSuccess() {
        when(jwtUtils.generateToken(eq("dr_nguyen"), eq("CLINICIAN"), anyMap()))
                .thenReturn("mock-jwt-token-123");

        AuthController.LoginRequest req = new AuthController.LoginRequest("dr_nguyen", "password123", "CLINICIAN");
        Mono<ResponseEntity<AuthController.AuthResponse>> result = authController.login(req);

        ResponseEntity<AuthController.AuthResponse> resp = result.block();
        assertNotNull(resp);
        assertEquals(HttpStatus.OK, resp.getStatusCode());
        assertNotNull(resp.getBody());
        assertEquals("mock-jwt-token-123", resp.getBody().getAccessToken());
        assertEquals("Bearer", resp.getBody().getTokenType());
        assertEquals("dr_nguyen", resp.getBody().getUsername());
        assertEquals("CLINICIAN", resp.getBody().getRole());
    }

    @Test
    @DisplayName("Login succeeds for PATIENT and normalizes to CUSTOMER")
    void testLoginPatientRoleNormalization() {
        when(jwtUtils.generateToken(eq("patient_le"), eq("CUSTOMER"), anyMap()))
                .thenReturn("mock-patient-token");

        AuthController.LoginRequest req = new AuthController.LoginRequest("patient_le", "pass123", "PATIENT");
        ResponseEntity<AuthController.AuthResponse> resp = authController.login(req).block();

        assertNotNull(resp);
        assertEquals(HttpStatus.OK, resp.getStatusCode());
        assertEquals("CUSTOMER", resp.getBody().getRole());
    }

    @Test
    @DisplayName("Login rejected when username or password empty")
    void testLoginValidationFailures() {
        // Null request
        assertEquals(HttpStatus.BAD_REQUEST, authController.login(null).block().getStatusCode());

        // Empty username
        AuthController.LoginRequest emptyUser = new AuthController.LoginRequest("", "pass123", "CLINICIAN");
        assertEquals(HttpStatus.BAD_REQUEST, authController.login(emptyUser).block().getStatusCode());

        // Empty password
        AuthController.LoginRequest emptyPass = new AuthController.LoginRequest("dr_nguyen", "", "CLINICIAN");
        assertEquals(HttpStatus.BAD_REQUEST, authController.login(emptyPass).block().getStatusCode());

        // Short password (< 4 chars)
        AuthController.LoginRequest shortPass = new AuthController.LoginRequest("dr_nguyen", "12", "CLINICIAN");
        assertEquals(HttpStatus.UNAUTHORIZED, authController.login(shortPass).block().getStatusCode());

        // Invalid role
        AuthController.LoginRequest invalidRole = new AuthController.LoginRequest("dr_nguyen", "password123", "HACKER");
        assertEquals(HttpStatus.BAD_REQUEST, authController.login(invalidRole).block().getStatusCode());
    }

    @Test
    @DisplayName("Validate token endpoint works correctly")
    void testValidateTokenEndpoint() {
        when(jwtUtils.validateToken("valid-token")).thenReturn(true);
        when(jwtUtils.getUsernameFromToken("valid-token")).thenReturn("dr_nguyen");
        when(jwtUtils.getRoleFromToken("valid-token")).thenReturn("CLINICIAN");

        ResponseEntity<Map<String, Object>> validResp = authController.validateToken("valid-token").block();
        assertNotNull(validResp);
        assertEquals(true, validResp.getBody().get("valid"));
        assertEquals("dr_nguyen", validResp.getBody().get("username"));
        assertEquals("CLINICIAN", validResp.getBody().get("role"));

        when(jwtUtils.validateToken("bad-token")).thenReturn(false);
        ResponseEntity<Map<String, Object>> invalidResp = authController.validateToken("bad-token").block();
        assertNotNull(invalidResp);
        assertEquals(false, invalidResp.getBody().get("valid"));
        assertNull(invalidResp.getBody().get("username"));
    }

    @Test
    @DisplayName("Health check endpoint returns UP")
    void testHealthCheck() {
        ResponseEntity<Map<String, Object>> resp = authController.healthCheck().block();
        assertNotNull(resp);
        assertEquals(HttpStatus.OK, resp.getStatusCode());
        assertEquals("UP", resp.getBody().get("status"));
        assertEquals("api-gateway", resp.getBody().get("service"));
    }
}
