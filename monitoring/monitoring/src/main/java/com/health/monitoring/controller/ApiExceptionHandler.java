package com.health.monitoring.controller;

import com.health.monitoring.exception.AuthenticationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.io.IOException;
import java.util.Map;

@RestControllerAdvice
public class ApiExceptionHandler {

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleBadRequest(IllegalArgumentException exception) {
        HttpStatus status = exception.getMessage().toLowerCase().contains("token")
                ? HttpStatus.UNAUTHORIZED
                : HttpStatus.BAD_REQUEST;
        return ResponseEntity.status(status).body(Map.of("message", exception.getMessage()));
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<Map<String, String>> handleAuthentication(AuthenticationException exception) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("message", exception.getMessage()));
    }

    @ExceptionHandler(IOException.class)
    public ResponseEntity<Map<String, String>> handleFileError(IOException exception) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", "File upload failed"));
    }
}
