package com.ipter.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * DTO for creating audit log entries from frontend
 */
public class AuditLogRequest {
    
    @NotBlank(message = "Action is required")
    @Size(max = 200, message = "Action cannot exceed 200 characters")
    private String action;
    
    @Size(max = 100, message = "Entity type cannot exceed 100 characters")
    private String entityType;
    
    private String entityId;
    
    @Size(max = 2000, message = "Details cannot exceed 2000 characters")
    private String details;
    
    @Size(max = 45, message = "IP address cannot exceed 45 characters")
    private String ipAddress;
    
    @Size(max = 500, message = "User agent cannot exceed 500 characters")
    private String userAgent;
    
    // Constructors
    public AuditLogRequest() {}
    
    public AuditLogRequest(String action, String entityType, String entityId, String details) {
        this.action = action;
        this.entityType = entityType;
        this.entityId = entityId;
        this.details = details;
    }
    
    // Getters and Setters
    public String getAction() {
        return action;
    }
    
    public void setAction(String action) {
        this.action = action;
    }
    
    public String getEntityType() {
        return entityType;
    }
    
    public void setEntityType(String entityType) {
        this.entityType = entityType;
    }
    
    public String getEntityId() {
        return entityId;
    }

    public void setEntityId(String entityId) {
        this.entityId = entityId;
    }
    
    public String getDetails() {
        return details;
    }
    
    public void setDetails(String details) {
        this.details = details;
    }
    
    public String getIpAddress() {
        return ipAddress;
    }
    
    public void setIpAddress(String ipAddress) {
        this.ipAddress = ipAddress;
    }
    
    public String getUserAgent() {
        return userAgent;
    }
    
    public void setUserAgent(String userAgent) {
        this.userAgent = userAgent;
    }
    
    @Override
    public String toString() {
        return "AuditLogRequest{" +
                "action='" + action + '\'' +
                ", entityType='" + entityType + '\'' +
                ", entityId=" + entityId +
                ", details='" + details + '\'' +
                ", ipAddress='" + ipAddress + '\'' +
                ", userAgent='" + userAgent + '\'' +
                '}';
    }
}
