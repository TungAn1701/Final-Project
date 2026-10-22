package com.smartinsole.gateway.controller;

import com.smartinsole.gateway.security.JwtUtils;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping
public class AuthController {

    private final JwtUtils jwtUtils;

    public AuthController(JwtUtils jwtUtils) {
        this.jwtUtils = jwtUtils;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LoginRequest {
        private String username;
        private String password;
        private String role; // "clinician" or "patient"
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AuthResponse {
        private String accessToken;
        private String tokenType;
        private String username;
        private String role;
        private long expiresInMs;
    }

    @PostMapping("/api/v1/auth/login")
    public Mono<ResponseEntity<AuthResponse>> login(@RequestBody LoginRequest req) {
        // Clinical / App user authentication
        String role = req.getRole() != null ? req.getRole().toUpperCase() : "CLINICIAN";
        Map<String, Object> extra = new HashMap<>();
        extra.put("clientType", "SMART_INSOLE_CLIENT");

        String token = jwtUtils.generateToken(req.getUsername(), role, extra);

        AuthResponse resp = AuthResponse.builder()
                .accessToken(token)
                .tokenType("Bearer")
                .username(req.getUsername())
                .role(role)
                .expiresInMs(86400000L)
                .build();

        return Mono.just(ResponseEntity.ok(resp));
    }

    @GetMapping("/api/v1/auth/validate")
    public Mono<ResponseEntity<Map<String, Object>>> validateToken(@RequestParam String token) {
        boolean valid = jwtUtils.validateToken(token);
        Map<String, Object> res = new HashMap<>();
        res.put("valid", valid);
        if (valid) {
            res.put("username", jwtUtils.getUsernameFromToken(token));
            res.put("role", jwtUtils.getRoleFromToken(token));
        }
        return Mono.just(ResponseEntity.ok(res));
    }

    @GetMapping("/health")
    public Mono<ResponseEntity<Map<String, Object>>> healthCheck() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "UP");
        health.put("service", "api-gateway");
        health.put("gatewayPort", 8000);
        health.put("security", "Spring Security 6 Stateless JWT WebFlux");
        return Mono.just(ResponseEntity.ok(health));
    }
}
