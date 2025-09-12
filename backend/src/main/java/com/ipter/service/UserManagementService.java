package com.ipter.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ipter.dto.CreateUserRequest;
import com.ipter.dto.ResetPasswordRequest;
import com.ipter.dto.UpdateUserRequest;
import com.ipter.dto.UserResponse;
import com.ipter.model.User;
import com.ipter.model.UserRole;
import com.ipter.repository.UserRepository;

/**
 * Service for user management operations (Admin only)
 */
@Service
@Transactional
public class UserManagementService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private SessionManagementService sessionManagementService;



    /**
     * Get current authenticated user
     */
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof User) {
            return (User) authentication.getPrincipal();
        }
        return null;
    }

    /**
     * Create a new user (Admin only)
     */
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    public UserResponse createUser(CreateUserRequest request) throws Exception {
        // Check if user already exists
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new Exception("Username already exists");
        }

        if (userRepository.existsByLoginId(request.getLoginId())) {
            throw new Exception("Login ID already exists");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new Exception("Email already exists");
        }

        // Create new user
        User user = new User();
        user.setUsername(request.getUsername());
        user.setLoginId(request.getLoginId());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole() != null ? request.getRole() : UserRole.USER);
        user.setOrganization(request.getOrganization());
        user.setDesignation(request.getDesignation());
        user.setAddress(request.getAddress());
        user.setActive(true);
        user.setCanViewAuditTrail(request.isCanViewAuditTrail());
        user.setCanCreateProjects(request.isCanCreateProjects());
        user.setCanViewReports(request.isCanViewReports());
        user.setMustChangePassword(request.isMustChangePassword());
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());

        User savedUser = userRepository.save(user);

        // Audit logging will be handled by frontend

        return new UserResponse(savedUser);
    }

    /**
     * Get all users with pagination
     */
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    @Transactional(readOnly = true)
    public Page<UserResponse> getAllUsers(Pageable pageable) {
        Page<User> users = userRepository.findAll(pageable);
        return users.map(UserResponse::new);
    }

    /**
     * Get all users as list
     */
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers() {
        List<User> users = userRepository.findAll();
        return users.stream()
                .map(UserResponse::new)
                .collect(Collectors.toList());
    }

    /**
     * Get user by ID
     */
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    @Transactional(readOnly = true)
    public UserResponse getUserById(UUID userId) throws Exception {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new Exception("User not found"));
        return new UserResponse(user);
    }

    /**
     * Update user information
     */
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    public UserResponse updateUser(UUID userId, UpdateUserRequest request) throws Exception {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new Exception("User not found"));

        // Update fields if provided
        if (request.getEmail() != null) {
            // Check if email is already taken by another user
            Optional<User> existingUser = userRepository.findByEmail(request.getEmail());
            if (existingUser.isPresent() && !existingUser.get().getId().equals(userId)) {
                throw new Exception("Email already exists");
            }
            user.setEmail(request.getEmail());
        }

        if (request.getRole() != null) {
            user.setRole(request.getRole());
        }

        if (request.getOrganization() != null) {
            user.setOrganization(request.getOrganization());
        }

        if (request.getDesignation() != null) {
            user.setDesignation(request.getDesignation());
        }

        if (request.getAddress() != null) {
            user.setAddress(request.getAddress());
        }

        if (request.getCanViewAuditTrail() != null) {
            user.setCanViewAuditTrail(request.getCanViewAuditTrail());
        }

        if (request.getCanCreateProjects() != null) {
            user.setCanCreateProjects(request.getCanCreateProjects());
        }

        if (request.getCanViewReports() != null) {
            user.setCanViewReports(request.getCanViewReports());
        }

        if (request.getIsActive() != null) {
            user.setActive(request.getIsActive());
            // Force logout if deactivating user
            if (!request.getIsActive()) {
                sessionManagementService.invalidateSession(userId.toString());
            }
        }

        user.setUpdatedAt(LocalDateTime.now());
        User savedUser = userRepository.save(user);

        // Audit logging will be handled by frontend

        return new UserResponse(savedUser);
    }

    /**
     * Enable/Disable user
     */
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    public UserResponse toggleUserStatus(UUID userId) throws Exception {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new Exception("User not found"));

        user.setActive(!user.isActive());
        user.setUpdatedAt(LocalDateTime.now());

        // Force logout if deactivating
        if (!user.isActive()) {
            sessionManagementService.invalidateSession(userId.toString());
        }

        User savedUser = userRepository.save(user);

        // Audit logging will be handled by frontend

        return new UserResponse(savedUser);
    }

    /**
     * Reset user password (Admin only)
     */
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    public void resetUserPassword(UUID userId, ResetPasswordRequest request) throws Exception {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new Exception("User not found"));

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setMustChangePassword(request.isForcePasswordChange());
        user.setFailedLoginAttempts(0); // Reset failed attempts
        user.setUpdatedAt(LocalDateTime.now());

        userRepository.save(user);

        // Audit logging will be handled by frontend

        // Force logout to require new login with new password
        sessionManagementService.invalidateSession(userId.toString());
    }

    /**
     * Unlock user account (reset failed login attempts)
     */
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    public UserResponse unlockUserAccount(UUID userId) throws Exception {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new Exception("User not found"));

        user.setFailedLoginAttempts(0);
        user.setUpdatedAt(LocalDateTime.now());

        User savedUser = userRepository.save(user);
        return new UserResponse(savedUser);
    }

    /**
     * Get users by role
     */
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    @Transactional(readOnly = true)
    public List<UserResponse> getUsersByRole(UserRole role) {
        List<User> users = userRepository.findByRole(role);
        return users.stream()
                .map(UserResponse::new)
                .collect(Collectors.toList());
    }

    /**
     * Get active users count
     */
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    @Transactional(readOnly = true)
    public long getActiveUsersCount() {
        return userRepository.findByIsActiveTrue().size();
    }

    /**
     * Get users with failed login attempts
     */
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    @Transactional(readOnly = true)
    public List<UserResponse> getLockedUsers() {
        List<User> users = userRepository.findByFailedLoginAttemptsGreaterThan(4);
        return users.stream()
                .map(UserResponse::new)
                .collect(Collectors.toList());
    }

    /**
     * Find user by username (for internal use)
     */
    @Transactional(readOnly = true)
    public User findByUsername(String username) throws Exception {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new Exception("User not found with username: " + username));
    }

    /**
     * Check if user can create projects
     */
    public boolean canCreateProjects(String username) {
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty()) {
            return false;
        }

        User user = userOpt.get();
        return user.isActive() && user.isCanCreateProjects();
    }

    /**
     * Check if user can view audit trail
     */
    public boolean canViewAuditTrail(String username) {
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty()) {
            return false;
        }

        User user = userOpt.get();
        return user.isActive() && user.isCanViewAuditTrail();
    }

    /**
     * Check if user can view reports
     */
    public boolean canViewReports(String username) {
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty()) {
            return false;
        }

        User user = userOpt.get();
        return user.isActive() && user.isCanViewReports();
    }
}
