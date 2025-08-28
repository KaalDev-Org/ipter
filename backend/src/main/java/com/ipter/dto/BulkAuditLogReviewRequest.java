package com.ipter.dto;

import com.ipter.model.ReviewStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * DTO for bulk audit log review request
 */
public class BulkAuditLogReviewRequest {
    
    @NotNull(message = "Review status is required")
    private ReviewStatus reviewStatus;
    
    @Size(max = 1000, message = "Review comments cannot exceed 1000 characters")
    private String reviewComments;
    
    // Constructors
    public BulkAuditLogReviewRequest() {}
    
    public BulkAuditLogReviewRequest(ReviewStatus reviewStatus, String reviewComments) {
        this.reviewStatus = reviewStatus;
        this.reviewComments = reviewComments;
    }
    
    // Getters and Setters
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
