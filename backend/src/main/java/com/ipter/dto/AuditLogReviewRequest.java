package com.ipter.dto;

import java.util.UUID;

import com.ipter.model.ReviewStatus;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * DTO for individual audit log review request
 */
public class AuditLogReviewRequest {
    
    @NotNull(message = "Log ID is required")
    private UUID logId;
    
    @NotNull(message = "Review status is required")
    private ReviewStatus reviewStatus;
    
    @Size(max = 2000, message = "Review comments cannot exceed 2000 characters")
    private String reviewComments;
    
    // Constructors
    public AuditLogReviewRequest() {}
    
    public AuditLogReviewRequest(UUID logId, ReviewStatus reviewStatus, String reviewComments) {
        this.logId = logId;
        this.reviewStatus = reviewStatus;
        this.reviewComments = reviewComments;
    }
    
    // Getters and Setters
    public UUID getLogId() {
        return logId;
    }
    
    public void setLogId(UUID logId) {
        this.logId = logId;
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
    
    @Override
    public String toString() {
        return "AuditLogReviewRequest{" +
                "logId=" + logId +
                ", reviewStatus=" + reviewStatus +
                ", reviewComments='" + reviewComments + '\'' +
                '}';
    }
}
