package com.ipter.dto;

import com.ipter.model.ReviewStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

/**
 * DTO for audit log review request
 */
public class AuditLogReviewRequest {
    
    @NotNull(message = "Audit log ID is required")
    private UUID auditLogId;
    
    @NotNull(message = "Review status is required")
    private ReviewStatus reviewStatus;
    
    @Size(max = 1000, message = "Review comments cannot exceed 1000 characters")
    private String reviewComments;
    
    // Constructors
    public AuditLogReviewRequest() {}
    
    public AuditLogReviewRequest(UUID auditLogId, ReviewStatus reviewStatus, String reviewComments) {
        this.auditLogId = auditLogId;
        this.reviewStatus = reviewStatus;
        this.reviewComments = reviewComments;
    }
    
    // Getters and Setters
    public UUID getAuditLogId() {
        return auditLogId;
    }
    
    public void setAuditLogId(UUID auditLogId) {
        this.auditLogId = auditLogId;
    }
    
    public ReviewStatus getReviewStatus() {
        return reviewStatus;
    }
    
    public void setReviewStatus(ReviewStatus reviewStatus) {
        this.reviewStatus = reviewStatus;
    }
    
    public String getReviewComments() {
        return reviewComments;
    }
    
    public void setReviewComments(String reviewComments) {
        this.reviewComments = reviewComments;
    }
}
