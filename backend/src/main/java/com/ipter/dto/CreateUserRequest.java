package com.ipter.dto;

import com.ipter.model.UserRole;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * DTO for creating a new user (Admin only)
 */
public class CreateUserRequest {
    
    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
    private String username;

    @NotBlank(message = "Login ID is required")
    @Size(min = 3, max = 50, message = "Login ID must be between 3 and 50 characters")
    private String loginId;

    @Email(message = "Email should be valid")
    @NotBlank(message = "Email is required")
    private String email;
    
    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;
    
    private UserRole role = UserRole.USER;
    
    @Size(max = 100, message = "Organization name cannot exceed 100 characters")
    private String organization;
    
    @Size(max = 100, message = "Designation cannot exceed 100 characters")
    private String designation;
    
    @Size(max = 500, message = "Address cannot exceed 500 characters")
    private String address;
    
    // Permission flags
    private boolean canViewAuditTrail = false;
    private boolean canCreateProjects = false;
    private boolean canViewReports = false;
    
    // Force password change on first login
    private boolean mustChangePassword = false;
    
    // Constructors
    public CreateUserRequest() {}
    
    public CreateUserRequest(String username, String loginId, String email, String password, UserRole role) {
        this.username = username;
        this.loginId = loginId;
        this.email = email;
        this.password = password;
        this.role = role;
    }
    
    // Getters and Setters
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
    
    public String getPassword() {
        return password;
    }
    
    public void setPassword(String password) {
        this.password = password;
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
    
    public boolean isMustChangePassword() {
        return mustChangePassword;
    }
    
    public void setMustChangePassword(boolean mustChangePassword) {
        this.mustChangePassword = mustChangePassword;
    }
}
