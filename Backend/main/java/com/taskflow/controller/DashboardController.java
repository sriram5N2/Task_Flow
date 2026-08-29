package com.taskflow.controller;

import com.taskflow.model.*;
import com.taskflow.repository.ProjectRepository;
import com.taskflow.repository.TaskRepository;
import com.taskflow.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Dashboard REST API
 *
 * GET /api/dashboard/stats  — returns aggregate stats:
 *     ADMIN: all projects, all tasks
 *     USER:  tasks assigned to them only
 *     Includes inReviewTasks count for the 4-column Kanban
 */
@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow();

        List<Project> projects;
        List<Task> tasks;

        if (user.getRole() == Role.ADMIN) {
            projects = projectRepository.findAll();
            tasks = taskRepository.findAll();
        } else {
            // Regular user sees projects they have tasks in, and only their assigned tasks
            tasks = taskRepository.findByAssignedTo(user);
            projects = tasks.stream()
                    .map(Task::getProject)
                    .distinct()
                    .collect(Collectors.toList());
        }

        Map<String, Object> stats = new HashMap<>();
        stats.put("userName", user.getName());
        stats.put("userRole", user.getRole().name());
        stats.put("totalProjects", projects.size());
        stats.put("activeProjects", projects.stream().filter(p -> p.getStatus() == ProjectStatus.ACTIVE).count());
        stats.put("completedProjects", projects.stream().filter(p -> p.getStatus() == ProjectStatus.COMPLETED).count());
        stats.put("onHoldProjects", projects.stream().filter(p -> p.getStatus() == ProjectStatus.ON_HOLD).count());
        stats.put("totalTasks", tasks.size());
        stats.put("todoTasks", tasks.stream().filter(t -> t.getStatus() == TaskStatus.TODO).count());
        stats.put("inProgressTasks", tasks.stream().filter(t -> t.getStatus() == TaskStatus.IN_PROGRESS).count());
        stats.put("inReviewTasks", tasks.stream().filter(t -> t.getStatus() == TaskStatus.IN_REVIEW).count());
        stats.put("doneTasks", tasks.stream().filter(t -> t.getStatus() == TaskStatus.DONE).count());

        return ResponseEntity.ok(stats);
    }
}
