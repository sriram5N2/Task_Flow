package com.taskflow.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

/**
 * Sends email notifications to the admin when task status changes.
 * Runs asynchronously so it doesn't block the API response.
 *
 * If SMTP is not configured, the email sending will fail gracefully
 * with a log warning (won't crash the app).
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${notification.admin.email}")
    private String adminEmail;

    @Value("${spring.mail.username}")
    private String fromEmail;

    /**
     * Notify admin that a task status has changed.
     *
     * @param userName      Name of the user who moved the task
     * @param taskTitle     Title of the task
     * @param projectName   Project the task belongs to
     * @param oldStatus     Previous status (e.g., "TODO")
     * @param newStatus     New status (e.g., "IN_PROGRESS")
     */
    @Async
    public void notifyAdminOnStatusChange(String userName, String taskTitle,
                                           String projectName, String oldStatus,
                                           String newStatus) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(adminEmail);
            message.setSubject("TaskFlow: '" + taskTitle + "' moved to " + newStatus);
            message.setText(
                "Hi Admin,\n\n" +
                "A task status has been updated on TaskFlow:\n\n" +
                "  Task:      " + taskTitle + "\n" +
                "  Project:   " + projectName + "\n" +
                "  Changed by: " + userName + "\n" +
                "  Status:    " + oldStatus + " → " + newStatus + "\n\n" +
                "— TaskFlow Notification System"
            );
            mailSender.send(message);
            log.info("Email sent to admin: task '{}' moved {} → {} by {}",
                     taskTitle, oldStatus, newStatus, userName);
        } catch (Exception e) {
            // Don't crash the app if email fails — just log a warning
            log.warn("Failed to send email notification: {}. " +
                     "Check SMTP config in application.properties.", e.getMessage());
        }
    }
}
