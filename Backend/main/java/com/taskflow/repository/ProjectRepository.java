package com.taskflow.repository;

import com.taskflow.model.Project;
import com.taskflow.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/** Repository for project data access. */
@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {

    /** Find all projects created by a specific user, newest first. */
    List<Project> findByCreatedByOrderByCreatedAtDesc(User user);

    /** Find all projects by a user (for stats). */
    List<Project> findByCreatedBy(User user);
}
