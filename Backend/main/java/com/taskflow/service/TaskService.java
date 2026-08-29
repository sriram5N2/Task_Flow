package com.taskflow.service;

import com.taskflow.dto.TaskDTO;
import com.taskflow.model.*;
import com.taskflow.repository.ProjectRepository;
import com.taskflow.repository.TaskRepository;
import com.taskflow.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Business logic for Task management.
 * - ADMIN: full CRUD on all tasks, can assign tasks to users
 * - USER: can only view their assigned tasks and update status (Kanban drag)
 * - Status changes trigger email notifications to admin
 */
@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email).orElseThrow();
    }

    /**
     * Get all tasks for a specific project (Kanban board view).
     * All users can view all tasks in the project (to see team members' boards).
     */
    public List<TaskDTO> getTasksByProject(Long projectId) {
        Project project = projectRepository.findById(projectId).orElseThrow();
        List<Task> tasks = taskRepository.findByProjectOrderByCreatedAtDesc(project);
        return tasks.stream().map(this::toDTO).collect(Collectors.toList());
    }

    /**
     * Get all tasks.
     * All users can view all tasks (to see their team members' boards).
     */
    public List<TaskDTO> getAllTasks() {
        return taskRepository.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    /** Create a new task inside a project (ADMIN only — enforced by SecurityConfig). */
    public TaskDTO createTask(TaskDTO dto) {
        Project project = projectRepository.findById(dto.getProjectId()).orElseThrow();
        User assignedTo = null;
        if (dto.getAssignedToId() != null) {
            assignedTo = userRepository.findById(dto.getAssignedToId()).orElse(null);
        }
        User reporter = null;
        if (dto.getReporterId() != null) {
            reporter = userRepository.findById(dto.getReporterId()).orElse(null);
        } else {
            reporter = getCurrentUser(); // Default to admin creating it
        }

        Task task = Task.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .sprint(dto.getSprint())
                .type(dto.getType() != null ? dto.getType() : TaskType.TASK)
                .status(dto.getStatus() != null ? dto.getStatus() : TaskStatus.TODO)
                .priority(dto.getPriority() != null ? dto.getPriority() : Priority.MEDIUM)
                .project(project)
                .assignedTo(assignedTo)
                .reporter(reporter)
                .build();

        return toDTO(taskRepository.save(task));
    }

    /** Update all editable fields of an existing task (ADMIN only). */
    public TaskDTO updateTask(Long id, TaskDTO dto) {
        Task task = taskRepository.findById(id).orElseThrow();
        
        // Optimistic locking check
        if (dto.getVersion() != null && !dto.getVersion().equals(task.getVersion())) {
            throw new org.springframework.orm.ObjectOptimisticLockingFailureException(Task.class, id);
        }

        task.setTitle(dto.getTitle());
        task.setDescription(dto.getDescription());
        task.setSprint(dto.getSprint());
        if (dto.getType() != null) task.setType(dto.getType());
        task.setStatus(dto.getStatus());
        task.setPriority(dto.getPriority());
        if (dto.getAssignedToId() != null) {
            task.setAssignedTo(userRepository.findById(dto.getAssignedToId()).orElse(null));
        }
        if (dto.getReporterId() != null) {
            task.setReporter(userRepository.findById(dto.getReporterId()).orElse(null));
        }
        return toDTO(taskRepository.save(task));
    }

    /**
     * Update only the task status — called by the Kanban drag-and-drop.
     * Any authenticated user can do this IF they are the assignee (or Admin).
     * Sends email notification to admin with details of the change.
     */
    public TaskDTO updateStatus(Long id, String status) {
        Task task = taskRepository.findById(id).orElseThrow();
        User currentUser = getCurrentUser();

        // Enforce permissions: Admin OR Assignee
        if (currentUser.getRole() != Role.ADMIN) {
            if (task.getAssignedTo() == null || !task.getAssignedTo().getId().equals(currentUser.getId())) {
                throw new RuntimeException("You do not have permission to update this ticket's status.");
            }
        }

        String oldStatus = task.getStatus().name();
        String newStatus = status;

        task.setStatus(TaskStatus.valueOf(status));
        TaskDTO result = toDTO(taskRepository.save(task));

        // Send email notification to admin (async — won't block the response)
        String projectName = task.getProject() != null ? task.getProject().getName() : "Unknown Project";
        emailService.notifyAdminOnStatusChange(
                currentUser.getName(),
                task.getTitle(),
                projectName,
                oldStatus,
                newStatus
        );

        return result;
    }

    /** Delete a task by ID (ADMIN only). */
    public void deleteTask(Long id) {
        taskRepository.deleteById(id);
    }

    /** Convert Task entity → TaskDTO for the API response. */
    private TaskDTO toDTO(Task t) {
        TaskDTO dto = new TaskDTO();
        dto.setId(t.getId());
        dto.setVersion(t.getVersion());
        dto.setTitle(t.getTitle());
        dto.setDescription(t.getDescription());
        dto.setSprint(t.getSprint());
        dto.setType(t.getType());
        dto.setStatus(t.getStatus());
        dto.setPriority(t.getPriority());
        dto.setCreatedAt(t.getCreatedAt());

        if (t.getProject() != null) {
            dto.setProjectId(t.getProject().getId());
            dto.setProjectName(t.getProject().getName());
        }
        if (t.getAssignedTo() != null) {
            dto.setAssignedToId(t.getAssignedTo().getId());
            dto.setAssignedToName(t.getAssignedTo().getName());
        }
        if (t.getReporter() != null) {
            dto.setReporterId(t.getReporter().getId());
            dto.setReporterName(t.getReporter().getName());
        }
        return dto;
    }
}
