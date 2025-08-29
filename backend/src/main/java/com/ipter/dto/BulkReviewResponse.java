package com.ipter.dto;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO for bulk review response
 */
public class BulkReviewResponse {
    
    private UUID reviewSessionId;
    private int reviewedCount;
    private LocalDateTime reviewedAt;
    private String message;
    
    // Constructors
    public BulkReviewResponse() {}
    
    public BulkReviewResponse(UUID reviewSessionId, int reviewedCount, LocalDateTime reviewedAt) {
        this.reviewSessionId = reviewSessionId;
        this.reviewedCount = reviewedCount;
        this.reviewedAt = reviewedAt;
        this.message = "Successfully reviewed " + reviewedCount + " audit logs";
    }
    
    // Getters and Setters
    public UUID getReviewSessionId() {
        return reviewSessionId;
    }
    
    public void setReviewSessionId(UUID reviewSessionId) {
        this.reviewSessionId = reviewSessionId;
    }
    
    public int getReviewedCount() {
        return reviewedCount;
    }
    
    public void setReviewedCount(int reviewedCount) {
        this.reviewedCount = reviewedCount;
    }
    
    public LocalDateTime getReviewedAt() {
        return reviewedAt;
    }
    
    public void setReviewedAt(LocalDateTime reviewedAt) {
        this.reviewedAt = reviewedAt;
    }
    
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
}
