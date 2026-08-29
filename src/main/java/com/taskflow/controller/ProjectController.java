package com.taskflow.controller;

import com.taskflow.dto.ProjectDTO;
import com.taskflow.service.ProjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Project REST API
 *
 * GET    /api/projects        — list all projects (role-filtered)
 * GET    /api/projects/{id}   — get one project
 * POST   /api/projects        — create a project
 * PUT    /api/projects/{id}   — update a project
 * DELETE /api/projects/{id}   — delete project + all its tasks
 */
@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;

    @GetMapping
    public ResponseEntity<List<ProjectDTO>> getAll() {
        return ResponseEntity.ok(projectService.getAllProjects());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProjectDTO> getOne(@PathVariable Long id) {
        return ResponseEntity.ok(projectService.getProject(id));
    }

    @PostMapping
    public ResponseEntity<ProjectDTO> create(@RequestBody ProjectDTO dto) {
        return ResponseEntity.ok(projectService.createProject(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProjectDTO> update(@PathVariable Long id, @RequestBody ProjectDTO dto) {
        return ResponseEntity.ok(projectService.updateProject(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        projectService.deleteProject(id);
        return ResponseEntity.noContent().build();
    }
}
