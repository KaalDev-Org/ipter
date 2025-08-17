package com.ipter.service;

import com.ipter.model.User;
import com.ipter.model.UserRole;
import com.ipter.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

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
    }
    
    /**
     * Create default admin user if none exists
     */
    private void createDefaultAdminUser() {
        // Check if any admin user exists
        if (userRepository.countByRole(UserRole.ADMIN) == 0) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setEmail("admin@ipter.local");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole(UserRole.ADMIN);
            admin.setActive(true);
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
            user.setEmail("user@ipter.local");
            user.setPassword(passwordEncoder.encode("user123"));
            user.setRole(UserRole.USER);
            user.setActive(true);
            user.setCreatedAt(LocalDateTime.now());
            user.setUpdatedAt(LocalDateTime.now());
            userRepository.save(user);
            
            // Create a super user
            User superUser = new User();
            superUser.setUsername("superuser");
            superUser.setEmail("superuser@ipter.local");
            superUser.setPassword(passwordEncoder.encode("super123"));
            superUser.setRole(UserRole.SUPER_USER);
            superUser.setActive(true);
            superUser.setCreatedAt(LocalDateTime.now());
            superUser.setUpdatedAt(LocalDateTime.now());
            userRepository.save(superUser);
            
            System.out.println("Sample users created:");
            System.out.println("- user/user123 (USER role)");
            System.out.println("- superuser/super123 (SUPER_USER role)");
        }
    }
}
