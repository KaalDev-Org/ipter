package com.ipter.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ipter.dto.CreateUserRequest;
import com.ipter.dto.ResetPasswordRequest;
import com.ipter.dto.UpdateUserRequest;
import com.ipter.dto.UserResponse;
import com.ipter.model.UserRole;
import com.ipter.service.UserManagementService;

import jakarta.validation.Valid;

/**
 * Controller for user management operations
 */
@RestController
@RequestMapping("/users")
@CrossOrigin(origins = "*", maxAge = 3600)
public class UserController {
    
    @Autowired
    private UserManagementService userManagementService;
    
    /**
     * Create a new user (Admin only)
     */
    @PostMapping("/create")
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    public ResponseEntity<?> createUser(@Valid @RequestBody CreateUserRequest request) {
        try {
            UserResponse user = userManagementService.createUser(request);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "User created successfully");
            response.put("user", user);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    /**
     * Get all users with pagination
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    public ResponseEntity<?> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        try {
            Sort sort = sortDir.equalsIgnoreCase("desc") ? 
                Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
            Pageable pageable = PageRequest.of(page, size, sort);
            
            Page<UserResponse> users = userManagementService.getAllUsers(pageable);
            
            Map<String, Object> response = new HashMap<>();
            response.put("users", users.getContent());
            response.put("currentPage", users.getNumber());
            response.put("totalItems", users.getTotalElements());
            response.put("totalPages", users.getTotalPages());
            response.put("pageSize", users.getSize());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    /**
     * Get all users as simple list
     */
    @GetMapping("/list")
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    public ResponseEntity<?> getUsersList() {
        try {
            List<UserResponse> users = userManagementService.getAllUsers();
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    /**
     * Get user by ID
     */
    @GetMapping("/{userId}")
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    public ResponseEntity<?> getUserById(@PathVariable UUID userId) {
        try {
            UserResponse user = userManagementService.getUserById(userId);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    /**
     * Update user information
     */
    @PutMapping("/{userId}")
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    public ResponseEntity<?> updateUser(@PathVariable UUID userId,
                                       @Valid @RequestBody UpdateUserRequest request) {
        try {
            UserResponse user = userManagementService.updateUser(userId, request);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "User updated successfully");
            response.put("user", user);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    /**
     * Toggle user status (enable/disable)
     */
    @PostMapping("/{userId}/toggle-status")
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    public ResponseEntity<?> toggleUserStatus(@PathVariable UUID userId) {
        try {
            UserResponse user = userManagementService.toggleUserStatus(userId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", user.isActive() ? "User enabled successfully" : "User disabled successfully");
            response.put("user", user);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    /**
     * Reset user password (Admin only)
     */
    @PostMapping("/{userId}/reset-password")
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    public ResponseEntity<?> resetUserPassword(@PathVariable UUID userId,
                                              @Valid @RequestBody ResetPasswordRequest request) {
        try {
            request.setUserId(userId);
            userManagementService.resetUserPassword(userId, request);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Password reset successfully");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    /**
     * Unlock user account
     */
    @PostMapping("/{userId}/unlock")
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    public ResponseEntity<?> unlockUserAccount(@PathVariable UUID userId) {
        try {
            UserResponse user = userManagementService.unlockUserAccount(userId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "User account unlocked successfully");
            response.put("user", user);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    /**
     * Get users by role
     */
    @GetMapping("/by-role/{role}")
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    public ResponseEntity<?> getUsersByRole(@PathVariable UserRole role) {
        try {
            List<UserResponse> users = userManagementService.getUsersByRole(role);
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    /**
     * Get locked users
     */
    @GetMapping("/locked")
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    public ResponseEntity<?> getLockedUsers() {
        try {
            List<UserResponse> users = userManagementService.getLockedUsers();
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    /**
     * Get user statistics
     */
    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    public ResponseEntity<?> getUserStats() {
        try {
            Map<String, Object> stats = new HashMap<>();
            stats.put("totalUsers", userManagementService.getAllUsers().size());
            stats.put("activeUsers", userManagementService.getActiveUsersCount());
            stats.put("adminUsers", userManagementService.getUsersByRole(UserRole.ADMINISTRATOR).size());
            stats.put("reviewerUsers", userManagementService.getUsersByRole(UserRole.REVIEWER).size());
            stats.put("regularUsers", userManagementService.getUsersByRole(UserRole.USER).size());
            stats.put("lockedUsers", userManagementService.getLockedUsers().size());
            
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}
