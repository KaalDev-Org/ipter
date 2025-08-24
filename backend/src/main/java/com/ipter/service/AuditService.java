package com.ipter.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.ipter.model.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ipter.dto.AuditLogReviewRequest;
import com.ipter.dto.AuditLogReviewResponse;
import com.ipter.model.AuditLog;
import com.ipter.model.Project;
import com.ipter.model.ProjectStatus;
import com.ipter.model.User;
import com.ipter.repository.AuditLogRepository;

/**
 * Service for audit trail management
 */
@Service
@Transactional
public class AuditService {
    
    @Autowired
    private AuditLogRepository auditLogRepository;
    
    /**
     * Log an audit event
     */
    public void logEvent(String action, String entityType, UUID entityId, String details, User performedBy) {
        AuditLog auditLog = new AuditLog();
        auditLog.setAction(action);
        auditLog.setEntityType(entityType);
        auditLog.setEntityId(entityId);
        auditLog.setDetails(details);
        auditLog.setPerformedBy(performedBy);
        auditLog.setTimestamp(LocalDateTime.now());
        
        auditLogRepository.save(auditLog);
    }
    
    /**
     * Log an audit event with IP and user agent
     */
    public void logEvent(String action, String entityType, UUID entityId, String details, 
                        User performedBy, String ipAddress, String userAgent) {
        AuditLog auditLog = new AuditLog();
        auditLog.setAction(action);
        auditLog.setEntityType(entityType);
        auditLog.setEntityId(entityId);
        auditLog.setDetails(details);
        auditLog.setPerformedBy(performedBy);
        auditLog.setIpAddress(ipAddress);
        auditLog.setUserAgent(userAgent);
        auditLog.setTimestamp(LocalDateTime.now());
        
        auditLogRepository.save(auditLog);
    }
    
    /**
     * Log user creation
     */
    public void logUserCreation(User createdUser, User performedBy) {
        logEvent("USER_CREATED", "User", createdUser.getId(), 
                "User '" + createdUser.getUsername() + "' created with role " + createdUser.getRole(), 
                performedBy);
    }
    
    /**
     * Log user update
     */
    public void logUserUpdate(User updatedUser, User performedBy, String changes) {
        logEvent("USER_UPDATED", "User", updatedUser.getId(), 
                "User '" + updatedUser.getUsername() + "' updated: " + changes, 
                performedBy);
    }
    
    /**
     * Log user status change
     */
    public void logUserStatusChange(User user, boolean newStatus, User performedBy) {
        String action = newStatus ? "USER_ENABLED" : "USER_DISABLED";
        String details = "User '" + user.getUsername() + "' " + (newStatus ? "enabled" : "disabled");
        logEvent(action, "User", user.getId(), details, performedBy);
    }
    
    /**
     * Log password reset
     */
    public void logPasswordReset(User user, User performedBy) {
        logEvent("PASSWORD_RESET", "User", user.getId(), 
                "Password reset for user '" + user.getUsername() + "'", 
                performedBy);
    }
    
    /**
     * Log password change
     */
    public void logPasswordChange(User user) {
        logEvent("PASSWORD_CHANGED", "User", user.getId(), 
                "Password changed by user '" + user.getUsername() + "'", 
                user);
    }
    
    /**
     * Log user login
     */
    public void logUserLogin(User user, String ipAddress, String userAgent) {
        logEvent("USER_LOGIN", "User", user.getId(), 
                "User '" + user.getUsername() + "' logged in", 
                user, ipAddress, userAgent);
    }
    
    /**
     * Log user logout
     */
    public void logUserLogout(User user, String ipAddress) {
        logEvent("USER_LOGOUT", "User", user.getId(), 
                "User '" + user.getUsername() + "' logged out", 
                user, ipAddress, null);
    }
    
    /**
     * Log failed login attempt
     */
    public void logFailedLogin(String username, String ipAddress, String userAgent) {
        logEvent("LOGIN_FAILED", "User", null, 
                "Failed login attempt for username '" + username + "'", 
                null, ipAddress, userAgent);
    }
    public void logImageUpload(User user, Project project, Image image) {
        logEvent("IMAGE_UPLOADED", "Image", image.getId(),"Image '" + image.getOriginalFilename() + "' uploaded for project '" + project.getName()+"'",
                user);
    }

    /**
     * Get all audit logs with pagination (Admin only)
     */
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    @Transactional(readOnly = true)
    public Page<AuditLog> getAllAuditLogs(Pageable pageable) {
        return auditLogRepository.findAll(pageable);
    }
    
    /**
     * Get audit logs by user (Admin only)
     */
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    @Transactional(readOnly = true)
    public List<AuditLog> getAuditLogsByUser(User user) {
        return auditLogRepository.findByPerformedBy(user);
    }
    
    /**
     * Get audit logs by date range (Admin only)
     */
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    @Transactional(readOnly = true)
    public List<AuditLog> getAuditLogsByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return auditLogRepository.findByTimestampBetween(startDate, endDate);
    }
    
    /**
     * Get audit logs by action (Admin only)
     */
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    @Transactional(readOnly = true)
    public List<AuditLog> getAuditLogsByAction(String action) {
        return auditLogRepository.findByAction(action);
    }

    /**
     * Get recent audit logs (Admin only)
     */
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    @Transactional(readOnly = true)
    public List<AuditLog> getRecentAuditLogs(int hours) {
        LocalDateTime since = LocalDateTime.now().minusHours(hours);
        return auditLogRepository.findRecentLogs(since);
    }

    /**
     * Get audit logs for specific entity (Admin only)
     */
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    @Transactional(readOnly = true)
    public List<AuditLog> getAuditLogsForEntity(UUID entityId) {
        return auditLogRepository.findByEntityId(entityId);
    }

    /**
     * Get audit statistics (Admin only)
     */
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    @Transactional(readOnly = true)
    public AuditStatistics getAuditStatistics() {
        long totalLogs = auditLogRepository.count();
        long userCreations = auditLogRepository.countByAction("USER_CREATED");
        long userUpdates = auditLogRepository.countByAction("USER_UPDATED");
        long loginAttempts = auditLogRepository.countByAction("USER_LOGIN");
        long failedLogins = auditLogRepository.countByAction("LOGIN_FAILED");
        
        return new AuditStatistics(totalLogs, userCreations, userUpdates, loginAttempts, failedLogins);
    }

    // Project-related audit methods

    /**
     * Log project creation
     */
    public void logProjectCreation(Project project, User performedBy) {
        logEvent("PROJECT_CREATED", "Project", project.getId(),
                "Project '" + project.getName() + "' created",
                performedBy);
    }

    /**
     * Log project status change
     */
    public void logProjectStatusChange(Project project, ProjectStatus oldStatus, ProjectStatus newStatus, User performedBy) {
        logEvent("PROJECT_STATUS_CHANGED", "Project", project.getId(),
                "Project '" + project.getName() + "' status changed from " + oldStatus + " to " + newStatus,
                performedBy);
    }

    /**
     * Log PDF upload
     */
    public void logPdfUpload(Project project, String fileName, User performedBy) {
        logEvent("PDF_UPLOADED", "Project", project.getId(),
                "PDF file '" + fileName + "' uploaded for project '" + project.getName() + "'",
                performedBy);
    }

    /**
     * Log master data processing
     */
    public void logMasterDataProcessing(Project project, int extractedCount, User performedBy) {
        logEvent("MASTER_DATA_PROCESSED", "Project", project.getId(),
                "Master data processed for project '" + project.getName() + "' - extracted " + extractedCount + " container numbers",
                performedBy);
    }

    /**
     * Inner class for audit statistics
     */
    public static class AuditStatistics {
        private final long totalLogs;
        private final long userCreations;
        private final long userUpdates;
        private final long loginAttempts;
        private final long failedLogins;
        
        public AuditStatistics(long totalLogs, long userCreations, long userUpdates, 
                              long loginAttempts, long failedLogins) {
            this.totalLogs = totalLogs;
            this.userCreations = userCreations;
            this.userUpdates = userUpdates;
            this.loginAttempts = loginAttempts;
            this.failedLogins = failedLogins;
        }
        
        // Getters
        public long getTotalLogs() { return totalLogs; }
        public long getUserCreations() { return userCreations; }
        public long getUserUpdates() { return userUpdates; }
        public long getLoginAttempts() { return loginAttempts; }
        public long getFailedLogins() { return failedLogins; }
    }

    // ===== AUDIT LOG REVIEW METHODS =====

    /**
     * Review an audit log (Admin only)
     */
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    @Transactional
    public AuditLogReviewResponse reviewAuditLog(AuditLogReviewRequest request, User reviewer) {
        Optional<AuditLog> auditLogOpt = auditLogRepository.findById(request.getAuditLogId());
        if (auditLogOpt.isEmpty()) {
            throw new RuntimeException("Audit log not found with ID: " + request.getAuditLogId());
        }

        AuditLog auditLog = auditLogOpt.get();
        auditLog.setReviewStatus(request.getReviewStatus());
        auditLog.setReviewedBy(reviewer);
        auditLog.setReviewedAt(LocalDateTime.now());
        auditLog.setReviewComments(request.getReviewComments());

        auditLogRepository.save(auditLog);

        // Log the review action itself
        logEvent("AUDIT_LOG_REVIEWED", "AuditLog", auditLog.getId(),
                "Audit log reviewed with status: " + request.getReviewStatus(), reviewer);

        return new AuditLogReviewResponse(auditLog);
    }

    /**
     * Get audit logs by review status (Admin only)
     */
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    @Transactional(readOnly = true)
    public List<AuditLogReviewResponse> getAuditLogsByReviewStatus(ReviewStatus reviewStatus) {
        List<AuditLog> auditLogs = auditLogRepository.findByReviewStatus(reviewStatus);
        return auditLogs.stream()
                .map(AuditLogReviewResponse::new)
                .toList();
    }

    /**
     * Get audit logs by review status with pagination (Admin only)
     */
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    @Transactional(readOnly = true)
    public Page<AuditLogReviewResponse> getAuditLogsByReviewStatus(ReviewStatus reviewStatus, Pageable pageable) {
        Page<AuditLog> auditLogs = auditLogRepository.findByReviewStatus(reviewStatus, pageable);
        return auditLogs.map(AuditLogReviewResponse::new);
    }

    /**
     * Get pending review logs (Admin only)
     */
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    @Transactional(readOnly = true)
    public List<AuditLogReviewResponse> getPendingReviewLogs() {
        List<AuditLog> auditLogs = auditLogRepository.findPendingReviewLogs();
        return auditLogs.stream()
                .map(AuditLogReviewResponse::new)
                .toList();
    }

    /**
     * Get flagged audit logs (Admin only)
     */
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    @Transactional(readOnly = true)
    public List<AuditLogReviewResponse> getFlaggedLogs() {
        List<AuditLog> auditLogs = auditLogRepository.findFlaggedLogs();
        return auditLogs.stream()
                .map(AuditLogReviewResponse::new)
                .toList();
    }

    /**
     * Get reviewed logs by date range (Admin only)
     */
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    @Transactional(readOnly = true)
    public List<AuditLogReviewResponse> getReviewedLogsByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        List<AuditLog> auditLogs = auditLogRepository.findReviewedLogsByDateRange(startDate, endDate);
        return auditLogs.stream()
                .map(AuditLogReviewResponse::new)
                .toList();
    }

    /**
     * Get audit logs reviewed by specific user (Admin only)
     */
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    @Transactional(readOnly = true)
    public List<AuditLogReviewResponse> getAuditLogsReviewedBy(User reviewer) {
        List<AuditLog> auditLogs = auditLogRepository.findByReviewedBy(reviewer);
        return auditLogs.stream()
                .map(AuditLogReviewResponse::new)
                .toList();
    }

    /**
     * Get review statistics (Admin only)
     */
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    @Transactional(readOnly = true)
    public ReviewStatistics getReviewStatistics() {
        long totalLogs = auditLogRepository.count();
        long pendingReviews = auditLogRepository.countByReviewStatus(ReviewStatus.PENDING);
        long reviewedLogs = auditLogRepository.countByReviewStatus(ReviewStatus.REVIEWED);
        long flaggedLogs = auditLogRepository.countByReviewStatus(ReviewStatus.FLAGGED);
        long approvedLogs = auditLogRepository.countByReviewStatus(ReviewStatus.APPROVED);
        long rejectedLogs = auditLogRepository.countByReviewStatus(ReviewStatus.REJECTED);

        return new ReviewStatistics(totalLogs, pendingReviews, reviewedLogs, flaggedLogs, approvedLogs, rejectedLogs);
    }

    /**
     * Inner class for review statistics
     */
    public static class ReviewStatistics {
        private final long totalLogs;
        private final long pendingReviews;
        private final long reviewedLogs;
        private final long flaggedLogs;
        private final long approvedLogs;
        private final long rejectedLogs;

        public ReviewStatistics(long totalLogs, long pendingReviews, long reviewedLogs,
                               long flaggedLogs, long approvedLogs, long rejectedLogs) {
            this.totalLogs = totalLogs;
            this.pendingReviews = pendingReviews;
            this.reviewedLogs = reviewedLogs;
            this.flaggedLogs = flaggedLogs;
            this.approvedLogs = approvedLogs;
            this.rejectedLogs = rejectedLogs;
        }

        // Getters
        public long getTotalLogs() { return totalLogs; }
        public long getPendingReviews() { return pendingReviews; }
        public long getReviewedLogs() { return reviewedLogs; }
        public long getFlaggedLogs() { return flaggedLogs; }
        public long getApprovedLogs() { return approvedLogs; }
        public long getRejectedLogs() { return rejectedLogs; }
    }
}
