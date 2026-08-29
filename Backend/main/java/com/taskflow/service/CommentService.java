package com.taskflow.service;

import com.taskflow.dto.CommentDTO;
import com.taskflow.model.Comment;
import com.taskflow.model.Task;
import com.taskflow.model.User;
import com.taskflow.repository.CommentRepository;
import com.taskflow.repository.TaskRepository;
import com.taskflow.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service to handle Comments on Tasks.
 * Allows users to fetch, create, and edit their comments.
 */
@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email).orElseThrow();
    }

    public List<CommentDTO> getCommentsByTask(Long taskId) {
        Task task = taskRepository.findById(taskId).orElseThrow();
        return commentRepository.findByTaskOrderByCreatedAtAsc(task)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public CommentDTO addComment(Long taskId, CommentDTO dto) {
        Task task = taskRepository.findById(taskId).orElseThrow();
        User currentUser = getCurrentUser();

        Comment comment = Comment.builder()
                .text(dto.getText())
                .task(task)
                .author(currentUser)
                .build();

        return toDTO(commentRepository.save(comment));
    }

    public CommentDTO updateComment(Long taskId, Long commentId, CommentDTO dto) {
        Comment comment = commentRepository.findById(commentId).orElseThrow();
        User currentUser = getCurrentUser();

        if (!comment.getAuthor().getId().equals(currentUser.getId())) {
            throw new RuntimeException("You can only edit your own comments.");
        }
        if (!comment.getTask().getId().equals(taskId)) {
            throw new RuntimeException("Comment does not belong to this task.");
        }

        // Optimistic locking check
        if (dto.getVersion() != null && !dto.getVersion().equals(comment.getVersion())) {
            throw new org.springframework.orm.ObjectOptimisticLockingFailureException(Comment.class, commentId);
        }

        comment.setText(dto.getText());
        return toDTO(commentRepository.save(comment));
    }

    private CommentDTO toDTO(Comment c) {
        CommentDTO dto = new CommentDTO();
        dto.setId(c.getId());
        dto.setVersion(c.getVersion());
        dto.setText(c.getText());
        dto.setCreatedAt(c.getCreatedAt());
        if (c.getTask() != null) dto.setTaskId(c.getTask().getId());
        if (c.getAuthor() != null) {
            dto.setAuthorId(c.getAuthor().getId());
            dto.setAuthorName(c.getAuthor().getName());
        }
        return dto;
    }
}
