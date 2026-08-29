package com.taskflow.config;

import com.taskflow.model.Role;
import com.taskflow.model.User;
import com.taskflow.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Seeds the admin user on application startup.
 * Also performs lightweight database migrations for legacy data.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JdbcTemplate jdbcTemplate;

    @Value("${admin.name}")
    private String adminName;

    @Value("${admin.email}")
    private String adminEmail;

    @Value("${admin.password}")
    private String adminPassword;

    @Override
    public void run(String... args) {
        log.info("Running database fixes for legacy data...");
        // Fix: Alter Enum columns to VARCHAR to prevent MySQL "Data truncated" errors when we add new enum values
        try {
            jdbcTemplate.execute("ALTER TABLE tasks MODIFY COLUMN status VARCHAR(255) NOT NULL");
            jdbcTemplate.execute("ALTER TABLE tasks MODIFY COLUMN type VARCHAR(255) NOT NULL");
            jdbcTemplate.execute("ALTER TABLE tasks MODIFY COLUMN priority VARCHAR(255) NOT NULL");
        } catch (Exception e) {
            log.warn("Could not alter columns, maybe they are already correct or DB dialect differs: {}", e.getMessage());
        }

        // Fix legacy data: New @Version columns will be NULL for existing records, which breaks JPA updates.
        jdbcTemplate.update("UPDATE tasks SET version = 0 WHERE version IS NULL");
        jdbcTemplate.update("UPDATE tasks SET type = 'TASK' WHERE type IS NULL");
        jdbcTemplate.update("UPDATE comments SET version = 0 WHERE version IS NULL");

        if (userRepository.existsByEmail(adminEmail)) {
            log.info("Admin account already exists: {}", adminEmail);
            return;
        }

        User admin = User.builder()
                .name(adminName)
                .email(adminEmail)
                .password(passwordEncoder.encode(adminPassword))
                .role(Role.ADMIN)
                .build();

        userRepository.save(admin);
        log.info("✅ Admin account created: {} / {}", adminEmail, adminPassword);
    }
}
