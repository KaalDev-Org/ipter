package com.ipter.dto;

import com.ipter.model.UserRole;

import java.util.UUID;

/**
 * Login response DTO
 */
public class LoginResponse {
    
    private String token;
    private String tokenType = "Bearer";
    private UUID userId;
    private String username;
    private String email;
    private UserRole role;
    private long expiresIn;
    private boolean mustChangePassword;
    
    // Constructors
    public LoginResponse() {}
    
    public LoginResponse(String token, UUID userId, String username, String email, UserRole role) {
        this.token = token;
        this.userId = userId;
        this.username = username;
        this.email = email;
        this.role = role;
    }

    public LoginResponse(String token, UUID userId, String username, String email, UserRole role, long expiresIn) {
        this.token = token;
        this.userId = userId;
        this.username = username;
        this.email = email;
        this.role = role;
        this.expiresIn = expiresIn;
    }

    public LoginResponse(String token, UUID userId, String username, String email, UserRole role, long expiresIn, boolean mustChangePassword) {
        this.token = token;
        this.userId = userId;
        this.username = username;
        this.email = email;
        this.role = role;
        this.expiresIn = expiresIn;
        this.mustChangePassword = mustChangePassword;
    }
    
    // Getters and Setters
    public String getToken() {
        return token;
    }
    
    public void setToken(String token) {
        this.token = token;
    }
    
    public String getTokenType() {
        return tokenType;
    }
    
    public void setTokenType(String tokenType) {
        this.tokenType = tokenType;
    }
    
    public UUID getUserId() {
        return userId;
    }
    
    public void setUserId(UUID userId) {
        this.userId = userId;
    }
    
    public String getUsername() {
        return username;
    }
    
    public void setUsername(String username) {
        this.username = username;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public UserRole getRole() {
        return role;
    }
    
    public void setRole(UserRole role) {
        this.role = role;
    }
    
    public long getExpiresIn() {
        return expiresIn;
    }
    
    public void setExpiresIn(long expiresIn) {
        this.expiresIn = expiresIn;
    }

    public boolean isMustChangePassword() {
        return mustChangePassword;
    }

    public void setMustChangePassword(boolean mustChangePassword) {
        this.mustChangePassword = mustChangePassword;
    }
}
