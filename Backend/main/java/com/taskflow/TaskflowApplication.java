package com.taskflow;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * TaskFlow — Project & Task Management System
 * Resume project demonstrating Spring Boot, Spring Security (JWT),
 * Spring Data JPA, MySQL, and Bootstrap frontend.
 *
 * Run: mvn spring-boot:run
 * Open: http://localhost:8080
 */
@SpringBootApplication
public class TaskflowApplication {

    public static void main(String[] args) {
        SpringApplication.run(TaskflowApplication.class, args);
    }
}
