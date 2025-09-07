package com.ipter.dto;

import java.time.LocalDateTime;
import java.util.UUID;

import com.ipter.model.AuditLog;
import com.ipter.model.ReviewStatus;

/**
 * DTO representing an audit log entry for review UIs with persistent review state
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

    // Review-related fields (now persisted)
    private ReviewStatus reviewStatus;
    private String reviewedByUsername;
    private LocalDateTime reviewedAt;
    private String reviewComments;
    private boolean success;
    private String message;

    public AuditLogReviewResponse() {}

    public AuditLogReviewResponse(AuditLog log) {
        this.auditLogId = log.getId();
        this.action = log.getAction();
        this.entityType = log.getEntityType();
        this.entityId = log.getEntityId();
        this.details = log.getDetails();
        this.performedByUsername = log.getPerformedBy() != null ? log.getPerformedBy().getUsername() : null;
        this.timestamp = log.getTimestamp();
        this.ipAddress = log.getIpAddress();
        this.userAgent = log.getUserAgent();
        this.reviewStatus = log.getReviewStatus();
        this.reviewedByUsername = log.getReviewedBy() != null ? log.getReviewedBy().getUsername() : null;
        this.reviewedAt = log.getReviewedAt();
        this.reviewComments = log.getReviewComments();
    }

    public AuditLogReviewResponse(boolean success, String message) {
        this.success = success;
        this.message = message;
    }

    // Getters and setters
    public UUID getAuditLogId() { return auditLogId; }
    public void setAuditLogId(UUID auditLogId) { this.auditLogId = auditLogId; }

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }

    public String getEntityType() { return entityType; }
    public void setEntityType(String entityType) { this.entityType = entityType; }

    public UUID getEntityId() { return entityId; }
    public void setEntityId(UUID entityId) { this.entityId = entityId; }

    public String getDetails() { return details; }
    public void setDetails(String details) { this.details = details; }

    public String getPerformedByUsername() { return performedByUsername; }
    public void setPerformedByUsername(String performedByUsername) { this.performedByUsername = performedByUsername; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

    public String getIpAddress() { return ipAddress; }
    public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }

    public String getUserAgent() { return userAgent; }
    public void setUserAgent(String userAgent) { this.userAgent = userAgent; }

    public ReviewStatus getReviewStatus() { return reviewStatus; }
    public void setReviewStatus(ReviewStatus reviewStatus) { this.reviewStatus = reviewStatus; }

    public String getReviewedByUsername() { return reviewedByUsername; }
    public void setReviewedByUsername(String reviewedByUsername) { this.reviewedByUsername = reviewedByUsername; }

    public LocalDateTime getReviewedAt() { return reviewedAt; }
    public void setReviewedAt(LocalDateTime reviewedAt) { this.reviewedAt = reviewedAt; }

    public String getReviewComments() { return reviewComments; }
    public void setReviewComments(String reviewComments) { this.reviewComments = reviewComments; }

    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}