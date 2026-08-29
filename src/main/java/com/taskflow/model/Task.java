package com.taskflow.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * A single unit of work inside a project (Ticket / User Story).
 */
@Entity
@Table(name = "tasks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Version
    private Long version; // Optimistic locking

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column
    private String sprint; // e.g. "Sprint 1"

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private TaskType type = TaskType.TASK;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private TaskStatus status = TaskStatus.TODO;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private Priority priority = Priority.MEDIUM;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    /** The project this task belongs to. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    /** The user who created/reported this task. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reporter_id")
    private User reporter;

    /** The user this task is assigned to (optional). */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_to")
    private User assignedTo;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }
}
