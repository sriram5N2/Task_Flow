package com.taskflow.dto;

import lombok.Data;

/** Incoming payload for POST /api/auth/login */
@Data
public class LoginRequest {
    private String email;
    private String password;
}
