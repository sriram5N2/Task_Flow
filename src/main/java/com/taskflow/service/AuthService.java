package com.taskflow.service;

import com.taskflow.config.JwtUtils;
import com.taskflow.dto.LoginRequest;
import com.taskflow.dto.LoginResponse;
import com.taskflow.dto.RegisterRequest;
import com.taskflow.model.Role;
import com.taskflow.model.User;
import com.taskflow.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * Handles user registration and login.
 * All registrations create USER role accounts only.
 * Admin is pre-seeded via DataSeeder — not through registration.
 */
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;
    private final UserDetailsService userDetailsService;

    /**
     * Register a new USER account.
     * Always assigns USER role — admin is seeded separately.
     */
    public String register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email is already registered. Please login or use a different email.");
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.USER)   // Always USER — admin is seeded, not registered
                .build();

        userRepository.save(user);
        return "Registration successful! You can now log in.";
    }

    /**
     * Authenticate user and return a JWT token with user details.
     */
    public LoginResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail()).orElseThrow();
        var userDetails = userDetailsService.loadUserByUsername(request.getEmail());
        String token = jwtUtils.generateToken(userDetails);

        return new LoginResponse(token, user.getId(), user.getName(), user.getEmail(), user.getRole().name());
    }
}
