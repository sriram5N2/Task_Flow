package com.taskflow.controller;

import com.taskflow.dto.LoginRequest;
import com.taskflow.dto.LoginResponse;
import com.taskflow.dto.RegisterRequest;
import com.taskflow.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Auth REST API
 *
 * POST /api/auth/register  — create a new account
 * POST /api/auth/login     — authenticate and receive a JWT token
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<java.util.Map<String, String>> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(java.util.Map.of("message", authService.register(request)));
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }
}
