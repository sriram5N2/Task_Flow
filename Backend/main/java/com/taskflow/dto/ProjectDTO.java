package com.taskflow.dto;

import com.taskflow.model.ProjectStatus;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Data Transfer Object for Project — used for both request (create/update)
 * and response (list/get). Avoids exposing JPA entity directly to the frontend.
 */
@Data
public class ProjectDTO {
    private Long id;
    private String name;
    private String description;
    private ProjectStatus status;
    private LocalDate deadline;

    // Read-only fields set by the server
    private String createdBy;
    private int totalTasks;
    private int completedTasks;
    private LocalDateTime createdAt;
}
