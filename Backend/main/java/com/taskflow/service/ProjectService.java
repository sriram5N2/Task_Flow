package com.taskflow.service;

import com.taskflow.dto.ProjectDTO;
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
 * Business logic for Project management.
 * ADMIN users see all projects; regular USERs see only their own.
 */
@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    /** Get the currently authenticated User entity. */
    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email).orElseThrow();
    }

    /** List projects — all for ADMIN, own for USER. */
    public List<ProjectDTO> getAllProjects() {
        User user = getCurrentUser();
        List<Project> projects = user.getRole() == Role.ADMIN
                ? projectRepository.findAll()
                : projectRepository.findByCreatedByOrderByCreatedAtDesc(user);
        return projects.stream().map(this::toDTO).collect(Collectors.toList());
    }

    /** Get a single project by ID. */
    public ProjectDTO getProject(Long id) {
        return toDTO(projectRepository.findById(id).orElseThrow());
    }

    /** Create a new project owned by the current user. */
    public ProjectDTO createProject(ProjectDTO dto) {
        User user = getCurrentUser();
        Project project = Project.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .status(dto.getStatus() != null ? dto.getStatus() : ProjectStatus.ACTIVE)
                .deadline(dto.getDeadline())
                .createdBy(user)
                .build();
        return toDTO(projectRepository.save(project));
    }

    /** Update an existing project's fields. */
    public ProjectDTO updateProject(Long id, ProjectDTO dto) {
        Project project = projectRepository.findById(id).orElseThrow();
        project.setName(dto.getName());
        project.setDescription(dto.getDescription());
        project.setStatus(dto.getStatus());
        project.setDeadline(dto.getDeadline());
        return toDTO(projectRepository.save(project));
    }

    /** Delete a project and all its tasks (cascade). */
    public void deleteProject(Long id) {
        projectRepository.deleteById(id);
    }

    /** Convert Project entity → ProjectDTO (include task counts for progress bar). */
    private ProjectDTO toDTO(Project p) {
        ProjectDTO dto = new ProjectDTO();
        dto.setId(p.getId());
        dto.setName(p.getName());
        dto.setDescription(p.getDescription());
        dto.setStatus(p.getStatus());
        dto.setDeadline(p.getDeadline());
        dto.setCreatedAt(p.getCreatedAt());
        dto.setCreatedBy(p.getCreatedBy() != null ? p.getCreatedBy().getName() : null);

        List<Task> tasks = taskRepository.findByProject(p);
        dto.setTotalTasks(tasks.size());
        dto.setCompletedTasks((int) tasks.stream()
                .filter(t -> t.getStatus() == TaskStatus.DONE)
                .count());
        return dto;
    }
}
