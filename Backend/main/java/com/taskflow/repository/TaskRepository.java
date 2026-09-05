package com.taskflow.repository;

import com.taskflow.model.Project;
import com.taskflow.model.Task;
import com.taskflow.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/** Repository for task data access. */
@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    /** Get all tasks belonging to a specific project (for Kanban board). */
    List<Task> findByProject(Project project);

    /** Get all tasks assigned to a specific user. */
    List<Task> findByAssignedTo(User user);

    /** Get tasks by project ordered by creation date. */
    List<Task> findByProjectOrderByCreatedAtDesc(Project project);

    /** Get all subtasks for a parent task. */
    List<Task> findByParentTaskOrderByCreatedAtDesc(Task parentTask);

    /** Get top-level tasks (no parent) by project. */
    List<Task> findByProjectAndParentTaskIsNullOrderByCreatedAtDesc(Project project);

    /** Get all top-level tasks (no parent). */
    List<Task> findByParentTaskIsNull();
}
