package com.ipter.dto;

import com.ipter.model.AuditLog;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO for audit log response
 */
public class AuditLogResponse {
    
    private UUID id;
    private String action;
    private String entityType;
    private UUID entityId;
    private String details;
    private UserInfo performedBy;
    private LocalDateTime timestamp;
    private String ipAddress;
    private String userAgent;
    
    // Nested class for user information
    public static class UserInfo {
        private UUID id;
        private String username;
        private String email;
        
        public UserInfo() {}
        
        public UserInfo(UUID id, String username, String email) {
            this.id = id;
            this.username = username;
            this.email = email;
        }
        
        // Getters and Setters
        public UUID getId() { return id; }
        public void setId(UUID id) { this.id = id; }
        
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
    }
    
    // Constructors
    public AuditLogResponse() {}
    
    public AuditLogResponse(AuditLog auditLog) {
        this.id = auditLog.getId();
        this.action = auditLog.getAction();
        this.entityType = auditLog.getEntityType();
        this.entityId = auditLog.getEntityId();
        this.details = auditLog.getDetails();
        this.timestamp = auditLog.getTimestamp();
        this.ipAddress = auditLog.getIpAddress();
        this.userAgent = auditLog.getUserAgent();
        
        if (auditLog.getPerformedBy() != null) {
            this.performedBy = new UserInfo(
                auditLog.getPerformedBy().getId(),
                auditLog.getPerformedBy().getUsername(),
                auditLog.getPerformedBy().getEmail()
            );
        }
    }
    
    // Getters and Setters
    public UUID getId() {
        return id;
    }
    
    public void setId(UUID id) {
        this.id = id;
    }
    
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
    
    public UUID getEntityId() {
        return entityId;
    }
    
    public void setEntityId(UUID entityId) {
        this.entityId = entityId;
    }
    
    public String getDetails() {
        return details;
    }
    
    public void setDetails(String details) {
        this.details = details;
    }
    
    public UserInfo getPerformedBy() {
        return performedBy;
    }
    
    public void setPerformedBy(UserInfo performedBy) {
        this.performedBy = performedBy;
    }
    
    public LocalDateTime getTimestamp() {
        return timestamp;
    }
    
    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
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
}
