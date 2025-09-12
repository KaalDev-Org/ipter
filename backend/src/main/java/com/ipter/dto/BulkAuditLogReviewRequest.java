package com.ipter.dto;

import java.util.List;
import java.util.UUID;

import com.ipter.model.ReviewStatus;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * DTO for bulk review request of audit logs
 */
public class BulkAuditLogReviewRequest {

    // Optional list of specific audit log IDs to review
    // If null or empty, all pending logs will be reviewed
    private List<UUID> auditLogIds;

    @NotNull(message = "Review status is required")
    private ReviewStatus reviewStatus;

    @Size(max = 2000, message = "Review comments cannot exceed 2000 characters")
    private String reviewComments;

    // Constructors
    public BulkAuditLogReviewRequest() {}

    public BulkAuditLogReviewRequest(ReviewStatus reviewStatus, String reviewComments) {
        this.reviewStatus = reviewStatus;
        this.reviewComments = reviewComments;
    }

    public BulkAuditLogReviewRequest(List<UUID> auditLogIds, ReviewStatus reviewStatus, String reviewComments) {
        this.auditLogIds = auditLogIds;
        this.reviewStatus = reviewStatus;
        this.reviewComments = reviewComments;
    }

    // Getters and Setters
    public List<UUID> getAuditLogIds() {
        return auditLogIds;
    }

    public void setAuditLogIds(List<UUID> auditLogIds) {
        this.auditLogIds = auditLogIds;
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
        return "BulkAuditLogReviewRequest{" +
                "auditLogIds=" + auditLogIds +
                ", reviewStatus=" + reviewStatus +
                ", reviewComments='" + reviewComments + '\'' +
                '}';
    }
}
