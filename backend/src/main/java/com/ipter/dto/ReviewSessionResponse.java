package com.ipter.dto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import com.ipter.model.ReviewStatus;

/**
 * DTO for review sessions representing actual review activities.
 * Groups reviewed audit logs by reviewer and review date to show
 * real review sessions with persistent data and detailed log information.
 */
public class ReviewSessionResponse {

    private UUID id;
    private ReviewerInfo reviewer;
    private LocalDateTime reviewedAt;
    private String reviewComments;
    private int reviewedLogsCount;
    private List<ReviewedLogInfo> reviewedLogs;

    public static class ReviewerInfo {
        private String username;
        public ReviewerInfo() {}
        public ReviewerInfo(String username) { this.username = username; }
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
    }

    public static class ReviewedLogInfo {
        private UUID logId;
        private String action;
        private String details;
        private String entityType;
        private LocalDateTime timestamp;
        private ReviewStatus reviewStatus;

        public ReviewedLogInfo() {}

        public ReviewedLogInfo(UUID logId, String action, String details, String entityType,
                              LocalDateTime timestamp, ReviewStatus reviewStatus) {
            this.logId = logId;
            this.action = action;
            this.details = details;
            this.entityType = entityType;
            this.timestamp = timestamp;
            this.reviewStatus = reviewStatus;
        }

        // Getters and Setters
        public UUID getLogId() { return logId; }
        public void setLogId(UUID logId) { this.logId = logId; }

        public String getAction() { return action; }
        public void setAction(String action) { this.action = action; }

        public String getDetails() { return details; }
        public void setDetails(String details) { this.details = details; }

        public String getEntityType() { return entityType; }
        public void setEntityType(String entityType) { this.entityType = entityType; }

        public LocalDateTime getTimestamp() { return timestamp; }
        public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

        public ReviewStatus getReviewStatus() { return reviewStatus; }
        public void setReviewStatus(ReviewStatus reviewStatus) { this.reviewStatus = reviewStatus; }
    }

    public ReviewSessionResponse() {}

    public ReviewSessionResponse(UUID id, String reviewerUsername, LocalDateTime reviewedAt,
                               String reviewComments, int reviewedLogsCount, List<ReviewedLogInfo> reviewedLogs) {
        this.id = id;
        this.reviewer = new ReviewerInfo(reviewerUsername);
        this.reviewedAt = reviewedAt;
        this.reviewComments = reviewComments;
        this.reviewedLogsCount = reviewedLogsCount;
        this.reviewedLogs = reviewedLogs;
    }

    // Keep the old constructor for backward compatibility
    public ReviewSessionResponse(UUID id, String reviewerUsername, LocalDateTime reviewedAt, String reviewComments, int reviewedLogsCount) {
        this(id, reviewerUsername, reviewedAt, reviewComments, reviewedLogsCount, null);
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public ReviewerInfo getReviewer() { return reviewer; }
    public void setReviewer(ReviewerInfo reviewer) { this.reviewer = reviewer; }
    public LocalDateTime getReviewedAt() { return reviewedAt; }
    public void setReviewedAt(LocalDateTime reviewedAt) { this.reviewedAt = reviewedAt; }
    public String getReviewComments() { return reviewComments; }
    public void setReviewComments(String reviewComments) { this.reviewComments = reviewComments; }
    public int getReviewedLogsCount() { return reviewedLogsCount; }
    public void setReviewedLogsCount(int reviewedLogsCount) { this.reviewedLogsCount = reviewedLogsCount; }

    public List<ReviewedLogInfo> getReviewedLogs() { return reviewedLogs; }
    public void setReviewedLogs(List<ReviewedLogInfo> reviewedLogs) { this.reviewedLogs = reviewedLogs; }
}

