package com.taskflow.controller;

import com.taskflow.dto.CommentDTO;
import com.taskflow.service.CommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller for task comments.
 * All authenticated users can comment on tasks they can view.
 */
@RestController
@RequestMapping("/api/tasks/{taskId}/comments")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    @GetMapping
    public ResponseEntity<List<CommentDTO>> getComments(@PathVariable Long taskId) {
        return ResponseEntity.ok(commentService.getCommentsByTask(taskId));
    }

    @PostMapping
    public ResponseEntity<CommentDTO> addComment(@PathVariable Long taskId, @RequestBody CommentDTO dto) {
        return ResponseEntity.ok(commentService.addComment(taskId, dto));
    }

    @PutMapping("/{commentId}")
    public ResponseEntity<CommentDTO> updateComment(
            @PathVariable Long taskId,
            @PathVariable Long commentId,
            @RequestBody CommentDTO dto) {
        return ResponseEntity.ok(commentService.updateComment(taskId, commentId, dto));
    }
}
