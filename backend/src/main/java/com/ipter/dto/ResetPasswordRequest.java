package com.ipter.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.UUID;

/**
 * DTO for admin password reset requests
 */
public class ResetPasswordRequest {
    
    private UUID userId;
    
    @NotBlank(message = "New password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String newPassword;
    
    private boolean forcePasswordChange = true;
    
    // Constructors
    public ResetPasswordRequest() {}
    
    public ResetPasswordRequest(UUID userId, String newPassword) {
        this.userId = userId;
        this.newPassword = newPassword;
    }
    
    // Getters and Setters
    public UUID getUserId() {
        return userId;
    }
    
    public void setUserId(UUID userId) {
        this.userId = userId;
    }
    
    public String getNewPassword() {
        return newPassword;
    }
    
    public void setNewPassword(String newPassword) {
        this.newPassword = newPassword;
    }
    
    public boolean isForcePasswordChange() {
        return forcePasswordChange;
    }
    
    public void setForcePasswordChange(boolean forcePasswordChange) {
        this.forcePasswordChange = forcePasswordChange;
    }
}
