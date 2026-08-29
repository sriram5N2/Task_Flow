package com.taskflow.controller;

import com.taskflow.model.User;
import com.taskflow.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * User REST API (ADMIN only)
 *
 * GET /api/users — list all registered users (for "assign to" dropdown)
 */
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;

    /**
     * Returns a simplified user list for task assignment dropdowns.
     * Only accessible by ADMIN.
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> getAllUsers() {
        List<Map<String, Object>> users = userRepository.findAll().stream()
                .map(u -> Map.<String, Object>of(
                        "id", u.getId(),
                        "name", u.getName(),
                        "email", u.getEmail(),
                        "role", u.getRole().name()
                ))
                .collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }
}
