package com.ipter.dto;

import java.time.LocalDateTime;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.ipter.model.User;
import com.ipter.model.UserRole;

/**
 * DTO for user response data
 */
public class UserResponse {
    
    private UUID id;
    private String username;
    private String loginId;
    private String email;
    private UserRole role;
    private String organization;
    private String designation;
    private String address;
    @JsonProperty("isActive")
    private boolean isActive;
    private boolean canViewAuditTrail;
    private boolean canCreateProjects;
    private boolean canViewReports;
    private LocalDateTime lastLogin;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private int failedLoginAttempts;
    private boolean mustChangePassword;
    
    // Constructors
    public UserResponse() {}
    
    public UserResponse(User user) {
        this.id = user.getId();
        this.username = user.getUsername();
        this.loginId = user.getLoginId();
        this.email = user.getEmail();
        this.role = user.getRole();
        this.organization = user.getOrganization();
        this.designation = user.getDesignation();
        this.address = user.getAddress();
        this.isActive = user.isActive();
        this.canViewAuditTrail = user.isCanViewAuditTrail();
        this.canCreateProjects = user.isCanCreateProjects();
        this.canViewReports = user.isCanViewReports();
        this.lastLogin = user.getLastLogin();
        this.createdAt = user.getCreatedAt();
        this.updatedAt = user.getUpdatedAt();
        this.failedLoginAttempts = user.getFailedLoginAttempts();
        this.mustChangePassword = user.isMustChangePassword();
    }
    
    // Getters and Setters
    public UUID getId() {
        return id;
    }
    
    public void setId(UUID id) {
        this.id = id;
    }
    
    public String getUsername() {
        return username;
    }
    
    public void setUsername(String username) {
        this.username = username;
    }

    public String getLoginId() {
        return loginId;
    }

    public void setLoginId(String loginId) {
        this.loginId = loginId;
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
    
    public String getOrganization() {
        return organization;
    }
    
    public void setOrganization(String organization) {
        this.organization = organization;
    }
    
    public String getDesignation() {
        return designation;
    }
    
    public void setDesignation(String designation) {
        this.designation = designation;
    }
    
    public String getAddress() {
        return address;
    }
    
    public void setAddress(String address) {
        this.address = address;
    }
    
    public boolean isActive() {
        return isActive;
    }
    
    public void setActive(boolean active) {
        isActive = active;
    }
    
    public boolean isCanViewAuditTrail() {
        return canViewAuditTrail;
    }
    
    public void setCanViewAuditTrail(boolean canViewAuditTrail) {
        this.canViewAuditTrail = canViewAuditTrail;
    }
    
    public boolean isCanCreateProjects() {
        return canCreateProjects;
    }
    
    public void setCanCreateProjects(boolean canCreateProjects) {
        this.canCreateProjects = canCreateProjects;
    }
    
    public boolean isCanViewReports() {
        return canViewReports;
    }
    
    public void setCanViewReports(boolean canViewReports) {
        this.canViewReports = canViewReports;
    }
    
    public LocalDateTime getLastLogin() {
        return lastLogin;
    }
    
    public void setLastLogin(LocalDateTime lastLogin) {
        this.lastLogin = lastLogin;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    public int getFailedLoginAttempts() {
        return failedLoginAttempts;
    }
    
    public void setFailedLoginAttempts(int failedLoginAttempts) {
        this.failedLoginAttempts = failedLoginAttempts;
    }

    public boolean isMustChangePassword() {
        return mustChangePassword;
    }

    public void setMustChangePassword(boolean mustChangePassword) {
        this.mustChangePassword = mustChangePassword;
    }
}
