package com.taskflow.config;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

/**
 * Global exception handler — centralizes error responses so all controllers
 * return consistent JSON error objects instead of HTML error pages.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    /** Handle business logic exceptions (e.g. "Email already in use"). */
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<?> handleRuntimeException(RuntimeException ex) {
        return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
    }

    /** Handle entity not found (e.g. invalid project/task ID). */
    @ExceptionHandler(NoSuchElementException.class)
    public ResponseEntity<?> handleNotFound(NoSuchElementException ex) {
        return ResponseEntity.status(404).body(Map.of("error", "Resource not found"));
    }

    /** Handle @Valid validation failures — collects all field errors. */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> handleValidation(MethodArgumentNotValidException ex) {
        String errors = ex.getBindingResult().getFieldErrors().stream()
                .map(fe -> fe.getField() + ": " + fe.getDefaultMessage())
                .collect(Collectors.joining(", "));
        return ResponseEntity.badRequest().body(Map.of("error", errors));
    }

    /** Handle concurrent modifications (Optimistic Locking). */
    @ExceptionHandler(org.springframework.orm.ObjectOptimisticLockingFailureException.class)
    public ResponseEntity<?> handleOptimisticLockingFailure(Exception ex) {
        return ResponseEntity.status(409).body(Map.of("error", "This item was modified by another user. Please refresh and try again."));
    }

    /** Catch-all for unexpected server errors. */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleGeneric(Exception ex) {
        return ResponseEntity.internalServerError()
                .body(Map.of("error", "An unexpected error occurred. Please try again."));
    }
}
