package com.ipter.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Entity representing a review session for audit logs
 */
@Entity
@Table(name = "review_sessions")
public class ReviewSession {
    
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "reviewer_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "password", "authorities", "auditLogs"})
    private User reviewer;
    
    @Column(nullable = false)
    private LocalDateTime reviewedAt = LocalDateTime.now();
    
    @Size(max = 1000, message = "Review comments cannot exceed 1000 characters")
    private String reviewComments;
    
    @Column(nullable = false)
    private int reviewedLogsCount = 0;
    
    @OneToMany(mappedBy = "reviewSession", fetch = FetchType.LAZY)
    private List<AuditLog> auditLogs;
    
    // Constructors
    public ReviewSession() {}
    
    public ReviewSession(User reviewer, String reviewComments, int reviewedLogsCount) {
        this.reviewer = reviewer;
        this.reviewComments = reviewComments;
        this.reviewedLogsCount = reviewedLogsCount;
        this.reviewedAt = LocalDateTime.now();
    }
    
    // Getters and Setters
    public UUID getId() {
        return id;
    }
    
    public void setId(UUID id) {
        this.id = id;
    }
    
    public User getReviewer() {
        return reviewer;
    }
    
    public void setReviewer(User reviewer) {
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
    
    public List<AuditLog> getAuditLogs() {
        return auditLogs;
    }
    
    public void setAuditLogs(List<AuditLog> auditLogs) {
        this.auditLogs = auditLogs;
    }
    
    @Override
    public String toString() {
        return "ReviewSession{" +
                "id=" + id +
                ", reviewer=" + (reviewer != null ? reviewer.getUsername() : null) +
                ", reviewedAt=" + reviewedAt +
                ", reviewComments='" + reviewComments + '\'' +
                ", reviewedLogsCount=" + reviewedLogsCount +
                '}';
    }
}
