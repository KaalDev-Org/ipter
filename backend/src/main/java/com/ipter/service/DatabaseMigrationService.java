package com.ipter.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import com.ipter.model.User;
import com.ipter.repository.UserRepository;

/**
 * Service to handle database migrations and schema updates
 */
@Service
public class DatabaseMigrationService {
    
    @Autowired
    private JdbcTemplate jdbcTemplate;
    
    @Autowired
    private UserRepository userRepository;
    
    /**
     * Run database migrations after application is ready
     * Disabled when using create-drop mode
     */
    // @EventListener
    // @Transactional
    public void onApplicationReady(ApplicationReadyEvent event) {
        try {
            migrateUserPermissions();
        } catch (Exception e) {
            System.err.println("Database migration error: " + e.getMessage());
            // Don't fail the application startup for migration errors
        }
    }
    
    /**
     * Migrate user permissions by adding default values for new columns
     */
    private void migrateUserPermissions() {
        try {
            // Check if the new columns exist and add them if they don't
            addColumnIfNotExists("users", "login_id", "VARCHAR(50) UNIQUE");
            addColumnIfNotExists("users", "organization", "VARCHAR(100)");
            addColumnIfNotExists("users", "designation", "VARCHAR(100)");
            addColumnIfNotExists("users", "address", "VARCHAR(500)");
            addColumnIfNotExists("users", "can_view_audit_trail", "BOOLEAN DEFAULT FALSE");
            addColumnIfNotExists("users", "can_create_projects", "BOOLEAN DEFAULT FALSE");
            addColumnIfNotExists("users", "can_view_reports", "BOOLEAN DEFAULT FALSE");
            addColumnIfNotExists("users", "must_change_password", "BOOLEAN DEFAULT FALSE");

            // Add audit log review columns
            migrateAuditLogReviewColumns();

            // Update role values from old enum to new enum
            updateUserRoles();

            // Update existing users with appropriate permissions
            updateUserPermissions();

            System.out.println("Database migration completed successfully");
        } catch (Exception e) {
            System.err.println("Error during database migration: " + e.getMessage());
        }
    }
    
    /**
     * Add a column to a table if it doesn't exist
     */
    private void addColumnIfNotExists(String tableName, String columnName, String columnDefinition) {
        try {
            // Try to select from the column to see if it exists
            jdbcTemplate.queryForObject("SELECT " + columnName + " FROM " + tableName + " LIMIT 1", Object.class);
        } catch (Exception e) {
            // Column doesn't exist, add it
            try {
                String sql = "ALTER TABLE " + tableName + " ADD COLUMN " + columnName + " " + columnDefinition;
                jdbcTemplate.execute(sql);
                System.out.println("Added column " + columnName + " to table " + tableName);
            } catch (Exception addException) {
                System.err.println("Failed to add column " + columnName + ": " + addException.getMessage());
            }
        }
    }

    /**
     * Add review-related columns to audit_logs table
     */
    private void migrateAuditLogReviewColumns() {
        try {
            addColumnIfNotExists("audit_logs", "review_status", "VARCHAR(20) DEFAULT 'PENDING'");
            addColumnIfNotExists("audit_logs", "reviewed_by", "UUID");
            addColumnIfNotExists("audit_logs", "reviewed_at", "TIMESTAMP");
            addColumnIfNotExists("audit_logs", "review_comments", "VARCHAR(2000)");

            // Add foreign key constraint for reviewed_by if it doesn't exist
            try {
                jdbcTemplate.execute("ALTER TABLE audit_logs ADD CONSTRAINT fk_audit_logs_reviewed_by FOREIGN KEY (reviewed_by) REFERENCES users(id)");
                System.out.println("Added foreign key constraint for reviewed_by column");
            } catch (Exception e) {
                // Constraint might already exist, ignore
                System.out.println("Foreign key constraint for reviewed_by already exists or could not be added: " + e.getMessage());
            }

            System.out.println("Audit log review columns migration completed");
        } catch (Exception e) {
            System.err.println("Error migrating audit log review columns: " + e.getMessage());
        }
    }
    
    /**
     * Update role values from old enum to new enum
     */
    private void updateUserRoles() {
        try {
            // Update role values directly in database to avoid enum parsing issues
            jdbcTemplate.update("UPDATE users SET role = 'ADMINISTRATOR' WHERE role = 'ADMIN'");
            jdbcTemplate.update("UPDATE users SET role = 'REVIEWER' WHERE role = 'SUPER_USER'");

            // Set default login_id for existing users if not set
            jdbcTemplate.update("UPDATE users SET login_id = CONCAT(LOWER(username), '01') WHERE login_id IS NULL");

            System.out.println("Updated user roles and login IDs");
        } catch (Exception e) {
            System.err.println("Error updating user roles: " + e.getMessage());
        }
    }

    /**
     * Update existing users with default permissions based on their roles
     */
    private void updateUserPermissions() {
        try {
            List<User> users = userRepository.findAll();
            boolean updated = false;
            
            for (User user : users) {
                boolean userUpdated = false;
                
                // Set default permissions based on role if they are still false/null
                switch (user.getRole()) {
                    case ADMINISTRATOR:
                        if (!user.isCanViewAuditTrail() || !user.isCanCreateProjects() || !user.isCanViewReports()) {
                            user.setCanViewAuditTrail(true);
                            user.setCanCreateProjects(true);
                            user.setCanViewReports(true);
                            userUpdated = true;
                        }
                        break;
                    case REVIEWER:
                        if (!user.isCanCreateProjects() || !user.isCanViewReports()) {
                            user.setCanViewAuditTrail(false);
                            user.setCanCreateProjects(true);
                            user.setCanViewReports(true);
                            userUpdated = true;
                        }
                        break;
                    case USER:
                    default:
                        // Regular users get no special permissions by default
                        if (user.isCanViewAuditTrail() || user.isCanCreateProjects() || user.isCanViewReports()) {
                            user.setCanViewAuditTrail(false);
                            user.setCanCreateProjects(false);
                            user.setCanViewReports(false);
                            userUpdated = true;
                        }
                        break;
                }
                
                if (userUpdated) {
                    userRepository.save(user);
                    updated = true;
                }
            }
            
            if (updated) {
                System.out.println("Updated permissions for existing users");
            }
        } catch (Exception e) {
            System.err.println("Error updating user permissions: " + e.getMessage());
        }
    }
}
