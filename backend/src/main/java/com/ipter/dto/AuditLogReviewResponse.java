package com.ipter.dto;

import com.ipter.model.AuditLog;
import com.ipter.model.ReviewStatus;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO for audit log review response
 */
public class AuditLogReviewResponse {
    
    private UUID auditLogId;
    private String action;
    private String entityType;
    private UUID entityId;
    private String details;
    private String performedByUsername;
    private LocalDateTime timestamp;
    private String ipAddress;
    private String userAgent;
    
    // Review fields
    private ReviewStatus reviewStatus;
    private String reviewedByUsername;
    private LocalDateTime reviewedAt;
    private String reviewComments;
    
    // Constructors
    public AuditLogReviewResponse() {}
    
    public AuditLogReviewResponse(AuditLog auditLog) {
        this.auditLogId = auditLog.getId();
        this.action = auditLog.getAction();
        this.entityType = auditLog.getEntityType();
        this.entityId = auditLog.getEntityId();
        this.details = auditLog.getDetails();
        this.performedByUsername = auditLog.getPerformedBy() != null ? auditLog.getPerformedBy().getUsername() : null;
        this.timestamp = auditLog.getTimestamp();
        this.ipAddress = auditLog.getIpAddress();
        this.userAgent = auditLog.getUserAgent();
        this.reviewStatus = auditLog.getReviewStatus();
        this.reviewedByUsername = auditLog.getReviewedBy() != null ? auditLog.getReviewedBy().getUsername() : null;
        this.reviewedAt = auditLog.getReviewedAt();
        this.reviewComments = auditLog.getReviewComments();
    }
    
    // Getters and Setters
    public UUID getAuditLogId() {
        return auditLogId;
    }
    
    public void setAuditLogId(UUID auditLogId) {
        this.auditLogId = auditLogId;
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
    
    public String getPerformedByUsername() {
        return performedByUsername;
    }
    
    public void setPerformedByUsername(String performedByUsername) {
        this.performedByUsername = performedByUsername;
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
    
    public ReviewStatus getReviewStatus() {
        return reviewStatus;
    }
    
    public void setReviewStatus(ReviewStatus reviewStatus) {
        this.reviewStatus = reviewStatus;
    }
    
    public String getReviewedByUsername() {
        return reviewedByUsername;
    }
    
    public void setReviewedByUsername(String reviewedByUsername) {
        this.reviewedByUsername = reviewedByUsername;
    }
    
    public LocalDateTime getReviewedAt() {
        return reviewedAt;
    }
    
    public void setReviewedAt(LocalDateTime reviewedAt) {
        this.reviewedAt = reviewedAt;
    }
    
    public String getReviewComments() {
        return reviewComments;
    }
    
    public void setReviewComments(String reviewComments) {
        this.reviewComments = reviewComments;
    }
}
