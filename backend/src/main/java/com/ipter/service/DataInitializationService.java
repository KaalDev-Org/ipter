package com.ipter.service;

import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.ipter.model.User;
import com.ipter.model.UserRole;
import com.ipter.repository.UserRepository;

/**
 * Service to initialize default data when the application starts
 */
@Service
public class DataInitializationService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    /**
     * Initialize default data when application is ready
     */
    @EventListener
    public void onApplicationReady(ApplicationReadyEvent event) {
        createDefaultAdminUser();
        // Migration not needed with create-drop mode
        // migrateExistingUserPermissions();
    }
    
    /**
     * Create default admin user if none exists
     */
    private void createDefaultAdminUser() {
        // Check if any admin user exists
        long adminCount = 0;
        try {
            adminCount = userRepository.countByRole(UserRole.ADMINISTRATOR);
        } catch (Exception e) {
            // If there's an error (like enum mismatch), assume no admin exists
            System.out.println("Could not count admin users, will create default admin");
        }

        if (adminCount == 0) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setLoginId("admin01");
            admin.setEmail("admin@ipter.local");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole(UserRole.ADMINISTRATOR);
            admin.setActive(true);
            admin.setCanViewAuditTrail(true);
            admin.setCanCreateProjects(true);
            admin.setCanViewReports(true);
            admin.setCreatedAt(LocalDateTime.now());
            admin.setUpdatedAt(LocalDateTime.now());
            
            userRepository.save(admin);
            
            System.out.println("=================================================");
            System.out.println("DEFAULT ADMIN USER CREATED:");
            System.out.println("Username: admin");
            System.out.println("Password: admin123");
            System.out.println("Email: admin@ipter.local");
            System.out.println("⚠️  PLEASE CHANGE THE DEFAULT PASSWORD ON FIRST LOGIN!");
            System.out.println("=================================================");
        }
    }
    
    /**
     * Create sample users for development/testing
     */
    public void createSampleUsers() {
        if (userRepository.count() <= 1) { // Only admin exists
            // Create a regular user
            User user = new User();
            user.setUsername("user");
            user.setLoginId("user01");
            user.setEmail("user@ipter.local");
            user.setPassword(passwordEncoder.encode("user123"));
            user.setRole(UserRole.USER);
            user.setActive(true);
            user.setCanViewAuditTrail(false);
            user.setCanCreateProjects(false);
            user.setCanViewReports(false);
            user.setCreatedAt(LocalDateTime.now());
            user.setUpdatedAt(LocalDateTime.now());
            userRepository.save(user);
            
            // Create a reviewer user
            User reviewer = new User();
            reviewer.setUsername("reviewer");
            reviewer.setLoginId("reviewer01");
            reviewer.setEmail("reviewer@ipter.local");
            reviewer.setPassword(passwordEncoder.encode("reviewer123"));
            reviewer.setRole(UserRole.REVIEWER);
            reviewer.setActive(true);
            reviewer.setCanViewAuditTrail(false);
            reviewer.setCanCreateProjects(true);
            reviewer.setCanViewReports(true);
            reviewer.setCreatedAt(LocalDateTime.now());
            reviewer.setUpdatedAt(LocalDateTime.now());
            userRepository.save(reviewer);
            
            System.out.println("Sample users created:");
            System.out.println("- user/user123 (USER role)");
            System.out.println("- reviewer/reviewer123 (REVIEWER role)");
        }
    }


}
