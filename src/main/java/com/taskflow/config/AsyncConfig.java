package com.taskflow.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;

/**
 * Enables async method execution for @Async annotated methods.
 * Required for EmailService to send emails without blocking the API response.
 */
@Configuration
@EnableAsync
public class AsyncConfig {
}
