package com.taskflow.controller;

import com.taskflow.dto.TaskDTO;
import com.taskflow.service.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Task REST API
 *
 * GET    /api/tasks                       — list tasks (all or by ?projectId=)
 * POST   /api/tasks                       — create a task
 * PUT    /api/tasks/{id}                  — update task fields
 * PATCH  /api/tasks/{id}/status           — update status only (Kanban drag-drop)
 * DELETE /api/tasks/{id}                  — delete a task
 */
@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    @GetMapping
    public ResponseEntity<List<TaskDTO>> getAll(
            @RequestParam(required = false) Long projectId) {
        if (projectId != null) {
            return ResponseEntity.ok(taskService.getTasksByProject(projectId));
        }
        return ResponseEntity.ok(taskService.getAllTasks());
    }

    @PostMapping
    public ResponseEntity<TaskDTO> create(@RequestBody TaskDTO dto) {
        return ResponseEntity.ok(taskService.createTask(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TaskDTO> update(@PathVariable Long id, @RequestBody TaskDTO dto) {
        return ResponseEntity.ok(taskService.updateTask(id, dto));
    }

    /**
     * Lightweight status-only update — called when a card is dragged to another Kanban column.
     * Body: { "status": "IN_PROGRESS" }
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<TaskDTO> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(taskService.updateStatus(id, body.get("status")));
    }

    /**
     * Get all subtasks for a specific parent task.
     */
    @GetMapping("/{id}/subtasks")
    public ResponseEntity<List<TaskDTO>> getSubtasks(@PathVariable Long id) {
        return ResponseEntity.ok(taskService.getSubtasks(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        taskService.deleteTask(id);
        return ResponseEntity.noContent().build();
    }
}
