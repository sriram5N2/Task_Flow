package com.taskflow.repository;

import com.taskflow.model.Comment;
import com.taskflow.model.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByTaskOrderByCreatedAtAsc(Task task);
}
