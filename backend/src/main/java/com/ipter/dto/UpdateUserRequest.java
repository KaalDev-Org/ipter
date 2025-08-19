package com.ipter.dto;

import com.ipter.model.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

/**
 * DTO for updating user information
 */
public class UpdateUserRequest {
    
    @Email(message = "Email should be valid")
    private String email;
    
    private UserRole role;
    
    @Size(max = 100, message = "Organization name cannot exceed 100 characters")
    private String organization;
    
    @Size(max = 100, message = "Designation cannot exceed 100 characters")
    private String designation;
    
    @Size(max = 500, message = "Address cannot exceed 500 characters")
    private String address;
    
    // Permission flags
    private Boolean canViewAuditTrail;
    private Boolean canCreateProjects;
    private Boolean canViewReports;
    
    // Status flag
    private Boolean isActive;
    
    // Constructors
    public UpdateUserRequest() {}
    
    // Getters and Setters
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
    
    public Boolean getCanViewAuditTrail() {
        return canViewAuditTrail;
    }
    
    public void setCanViewAuditTrail(Boolean canViewAuditTrail) {
        this.canViewAuditTrail = canViewAuditTrail;
    }
    
    public Boolean getCanCreateProjects() {
        return canCreateProjects;
    }
    
    public void setCanCreateProjects(Boolean canCreateProjects) {
        this.canCreateProjects = canCreateProjects;
    }
    
    public Boolean getCanViewReports() {
        return canViewReports;
    }
    
    public void setCanViewReports(Boolean canViewReports) {
        this.canViewReports = canViewReports;
    }
    
    public Boolean getIsActive() {
        return isActive;
    }
    
    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }
}
