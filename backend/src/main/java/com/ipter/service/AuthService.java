package com.ipter.service;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.ipter.dto.ChangePasswordRequest;
import com.ipter.dto.LoginRequest;
import com.ipter.dto.LoginResponse;
import com.ipter.dto.RegisterRequest;

import com.ipter.model.User;
import com.ipter.model.UserRole;
import com.ipter.repository.UserRepository;
import com.ipter.util.JwtUtil;

/**
 * Authentication service for user login, registration, and token management
 */
@Service
@Transactional
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private SessionManagementService sessionManagementService;

    @Autowired
    private FailedLoginService failedLoginService;



    /**
     * Register a new user
     */
    public User register(RegisterRequest request) throws Exception {
        // Check if user already exists
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new Exception("Username already exists");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new Exception("Email already exists");
        }

        // Create new user
        User user = new User();
        user.setUsername(request.getUsername());
        user.setLoginId(request.getUsername()); // Use username as loginId for registration
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole() != null ? request.getRole() : UserRole.USER);
        user.setActive(true);
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());

        return userRepository.save(user);
    }

    /**
     * Authenticate user and generate JWT token
     */
    @Transactional
    public LoginResponse login(LoginRequest request) throws Exception {
        System.out.println("DEBUG: Login attempt for username: " + request.getUsername());

        // Check concurrent user limit before authentication
        if (!sessionManagementService.canUserLogin()) {
            throw new Exception("Maximum number of concurrent users reached. Please try again later.");
        }

        // First, check if user exists and handle pre-authentication checks
        Optional<User> userOpt = userRepository.findByUsernameOrLoginIdOrEmail(request.getUsername());
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            System.out.println("DEBUG: User found: " + user.getUsername() + ", failed attempts: " + user.getFailedLoginAttempts() + ", active: " + user.isActive());

            // Check if user account is locked due to failed attempts
            if (!user.isAccountNonLocked()) {
                System.out.println("DEBUG: Account is locked, incrementing failed attempts");
                // Increment failed attempts even for locked accounts
                user.setFailedLoginAttempts(user.getFailedLoginAttempts() + 1);
                user.setUpdatedAt(LocalDateTime.now());
                userRepository.save(user);
                throw new BadCredentialsException("Account is locked due to multiple failed login attempts. Please contact an administrator for assistance.");
            }

            // Check if user is inactive/disabled
            if (!user.isActive()) {
                System.out.println("DEBUG: User is inactive, incrementing failed attempts");
                // Increment failed login attempts for inactive users trying to login
                user.setFailedLoginAttempts(user.getFailedLoginAttempts() + 1);
                user.setUpdatedAt(LocalDateTime.now());

                // Check if this increment should lock the account
                if (user.getFailedLoginAttempts() >= 5) {
                    user.setActive(false);
                }

                userRepository.save(user);
                throw new BadCredentialsException("This user account is currently disabled. Please contact an administrator for assistance.");
            }
        } else {
            System.out.println("DEBUG: User not found for username: " + request.getUsername());
        }

        try {
            System.out.println("DEBUG: Attempting authentication for user: " + request.getUsername());
            // Authenticate user
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
            );

            User user = (User) authentication.getPrincipal();
            System.out.println("DEBUG: Authentication successful for user: " + user.getUsername());

            // All user roles (USER, REVIEWER, ADMINISTRATOR) are allowed to login
            // No additional role-based restrictions needed here

            // Reset failed login attempts on successful login
            user.setFailedLoginAttempts(0);
            user.setLastLogin(LocalDateTime.now());
            userRepository.save(user);

            // Generate JWT token
            String token = jwtUtil.generateToken(user);

            // Create user session
            sessionManagementService.createSession(user.getId().toString(), user.getUsername());

            // Calculate token expiration time
            long expiresIn = jwtUtil.getTokenRemainingTime(token);

            // Audit logging will be handled by frontend

            return new LoginResponse(token, user.getId(), user.getUsername(),
                                   user.getEmail(), user.getRole(), expiresIn, user.isMustChangePassword());

        } catch (AuthenticationException e) {
            System.out.println("DEBUG: Authentication failed for user: " + request.getUsername() + ", exception: " + e.getClass().getSimpleName() + " - " + e.getMessage());

            // Handle failed authentication (wrong password) in a separate transaction
            if (userOpt.isPresent()) {
                // Use separate transaction to ensure failed login attempts are persisted
                int newFailedAttempts = failedLoginService.handleFailedLoginAttempt(request.getUsername());

                // Check if account is now locked after the failed attempt
                if (newFailedAttempts >= 5) {
                    System.out.println("DEBUG: Account locked due to too many failed attempts: " + newFailedAttempts);
                    throw new BadCredentialsException("Account has been locked due to too many failed login attempts. Please contact an administrator.");
                }
            } else {
                System.out.println("DEBUG: User not found in catch block for username: " + request.getUsername());
            }

            throw new BadCredentialsException("Invalid username or password");
        }
    }



    /**
     * Get current user from JWT token
     */
    @Transactional(readOnly = true)
    public User getCurrentUser(String token) {
        String username = jwtUtil.extractUsername(token);
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    /**
     * Logout user and invalidate session
     */
    public void logout(String token) {
        try {
            String userId = jwtUtil.extractUserId(token);
            sessionManagementService.invalidateSession(userId);
        } catch (Exception e) {
            // Log error but don't throw exception for logout
            System.err.println("Error during logout: " + e.getMessage());
        }
    }

    /**
     * Refresh JWT token
     */
    public LoginResponse refreshToken(String token) throws Exception {
        if (!jwtUtil.validateToken(token)) {
            throw new Exception("Invalid token");
        }

        String username = jwtUtil.extractUsername(token);
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new Exception("User not found"));

        if (!user.isActive()) {
            throw new Exception("User account is deactivated");
        }

        // Generate new token
        String newToken = jwtUtil.generateToken(user);
        long expiresIn = jwtUtil.getTokenRemainingTime(newToken);

        return new LoginResponse(newToken, user.getId(), user.getUsername(),
                               user.getEmail(), user.getRole(), expiresIn);
    }

    /**
     * Validate token and return user info
     */
    @Transactional(readOnly = true)
    public User validateToken(String token) throws Exception {
        if (!jwtUtil.validateToken(token)) {
            throw new Exception("Invalid or expired token");
        }

        String username = jwtUtil.extractUsername(token);
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new Exception("User not found"));

        if (!user.isActive()) {
            throw new Exception("User account is deactivated");
        }

        return user;
    }

    /**
     * Change user password
     */
    @Transactional
    public void changePassword(String token, ChangePasswordRequest request) throws Exception {
        // Validate passwords match
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new Exception("New password and confirmation do not match");
        }

        // Get current user
        User user = getCurrentUser(token);

        // Verify current password
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new Exception("Current password is incorrect");
        }

        // Update password
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setMustChangePassword(false); // Clear force change flag
        user.setUpdatedAt(LocalDateTime.now());

        userRepository.save(user);

        // Audit logging will be handled by frontend
    }
}
