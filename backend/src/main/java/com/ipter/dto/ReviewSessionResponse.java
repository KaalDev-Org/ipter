package com.ipter.dto;

import com.ipter.model.ReviewSession;
import com.ipter.model.User;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO for ReviewSession response
 */
public class ReviewSessionResponse {
    
    private UUID id;
    private ReviewerInfo reviewer;
    private LocalDateTime reviewedAt;
    private String reviewComments;
    private int reviewedLogsCount;
    
    // Nested class for reviewer information
    public static class ReviewerInfo {
        private UUID id;
        private String username;
        private String email;
        
        public ReviewerInfo() {}
        
        public ReviewerInfo(User user) {
            this.id = user.getId();
            this.username = user.getUsername();
            this.email = user.getEmail();
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
    public ReviewSessionResponse() {}
    
    public ReviewSessionResponse(ReviewSession session) {
        this.id = session.getId();
        this.reviewer = new ReviewerInfo(session.getReviewer());
        this.reviewedAt = session.getReviewedAt();
        this.reviewComments = session.getReviewComments();
        this.reviewedLogsCount = session.getReviewedLogsCount();
    }
    
    // Getters and Setters
    public UUID getId() {
        return id;
    }
    
    public void setId(UUID id) {
        this.id = id;
    }
    
    public ReviewerInfo getReviewer() {
        return reviewer;
    }
    
    public void setReviewer(ReviewerInfo reviewer) {
        this.reviewer = reviewer;
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
    
    public int getReviewedLogsCount() {
        return reviewedLogsCount;
    }
    
    public void setReviewedLogsCount(int reviewedLogsCount) {
        this.reviewedLogsCount = reviewedLogsCount;
    }
}
