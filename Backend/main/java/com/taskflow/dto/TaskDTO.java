package com.taskflow.dto;

import com.taskflow.model.Priority;
import com.taskflow.model.TaskStatus;
import com.taskflow.model.TaskType;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * Data Transfer Object for Task
 */
@Data
public class TaskDTO {
    private Long id;
    private Long version;
    private String title;
    private String description;
    private String sprint;
    private TaskType type;
    private TaskStatus status;
    private Priority priority;

    // Project info
    private Long projectId;
    private String projectName;

    // Assignee info
    private Long assignedToId;
    private String assignedToName;

    // Reporter info
    private Long reporterId;
    private String reporterName;

    // Parent task info (for subtasks)
    private Long parentTaskId;
    private String parentTaskTitle;

    // Subtasks (populated when fetching parent details)
    private java.util.List<TaskDTO> subtasks;

    // Audit
    private LocalDateTime createdAt;
}
