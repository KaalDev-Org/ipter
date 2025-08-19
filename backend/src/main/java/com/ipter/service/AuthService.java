package com.ipter.service;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
    private AuditService auditService;
    
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
    public LoginResponse login(LoginRequest request) throws Exception {
        try {
            // Check concurrent user limit before authentication
            if (!sessionManagementService.canUserLogin()) {
                throw new Exception("Maximum number of concurrent users reached. Please try again later.");
            }
            
            // Authenticate user
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
            );
            
            User user = (User) authentication.getPrincipal();
            
            // Check if user account is locked
            if (!user.isAccountNonLocked()) {
                throw new Exception("Account is locked due to multiple failed login attempts");
            }
            
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

            // Log successful login
            auditService.logUserLogin(user, null, null);

            return new LoginResponse(token, user.getId(), user.getUsername(),
                                   user.getEmail(), user.getRole(), expiresIn, user.isMustChangePassword());
            
        } catch (AuthenticationException e) {
            // Increment failed login attempts
            Optional<User> userOpt = userRepository.findByUsernameOrLoginIdOrEmail(request.getUsername());
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                user.setFailedLoginAttempts(user.getFailedLoginAttempts() + 1);
                userRepository.save(user);
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

        // Log password change
        auditService.logPasswordChange(user);
    }
}
