package com.ipter.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ipter.dto.AuditLogRequest;
import com.ipter.dto.AuditLogResponse;
import com.ipter.dto.AuditLogReviewRequest;
import com.ipter.dto.AuditLogReviewResponse;
import com.ipter.dto.BulkAuditLogReviewRequest;
import com.ipter.dto.BulkReviewResponse;
import com.ipter.dto.ReviewSessionResponse;
import com.ipter.model.AuditLog;
import com.ipter.model.ReviewStatus;
import com.ipter.model.User;
import com.ipter.repository.AuditLogRepository;


/**
 * Service for audit trail management - simplified version
 * Handles audit logs created from frontend
 */
@Service
@Transactional
public class AuditService {

    @Autowired
    private AuditLogRepository auditLogRepository;

    /**
     * Create an audit log entry (called from frontend)
     */
    public AuditLogResponse createAuditLog(AuditLogRequest request, User performedBy) {
        AuditLog auditLog = new AuditLog();
        auditLog.setAction(request.getAction());
        auditLog.setEntityType(request.getEntityType());
        auditLog.setEntityId(request.getEntityId());
        auditLog.setDetails(request.getDetails());
        auditLog.setPerformedBy(performedBy);
        auditLog.setIpAddress(request.getIpAddress());
        auditLog.setUserAgent(request.getUserAgent());
        auditLog.setTimestamp(LocalDateTime.now());

        AuditLog savedLog = auditLogRepository.save(auditLog);
        return new AuditLogResponse(savedLog);
    }

    /**
     * Get all audit logs with pagination (Admin only)
     */
    @PreAuthorize("hasRole('ADMINISTRATOR') or @userManagementService.canViewAuditTrail(authentication.name)")
    @Transactional(readOnly = true)
    public Page<AuditLogResponse> getAllAuditLogs(Pageable pageable) {
        Page<AuditLog> auditLogs = auditLogRepository.findAllOrderByTimestampDesc(pageable);
        return auditLogs.map(AuditLogResponse::new);
    }

    /**
     * Get audit logs by user (Admin only)
     */
    @PreAuthorize("hasRole('ADMINISTRATOR') or @userManagementService.canViewAuditTrail(authentication.name)")
    @Transactional(readOnly = true)
    public List<AuditLogResponse> getAuditLogsByUser(User user) {
        List<AuditLog> auditLogs = auditLogRepository.findByPerformedBy(user);
        return auditLogs.stream()
                .map(AuditLogResponse::new)
                .collect(Collectors.toList());
    }

    /**
     * Get audit logs by date range (Admin only)
     */
    @PreAuthorize("hasRole('ADMINISTRATOR') or @userManagementService.canViewAuditTrail(authentication.name)")
    @Transactional(readOnly = true)
    public List<AuditLogResponse> getAuditLogsByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        List<AuditLog> auditLogs = auditLogRepository.findByTimestampBetween(startDate, endDate);
        return auditLogs.stream()
                .map(AuditLogResponse::new)
                .collect(Collectors.toList());
    }

    /**
     * Get audit logs by action (Admin only)
     */
    @PreAuthorize("hasRole('ADMINISTRATOR') or @userManagementService.canViewAuditTrail(authentication.name)")
    @Transactional(readOnly = true)
    public List<AuditLogResponse> getAuditLogsByAction(String action) {
        List<AuditLog> auditLogs = auditLogRepository.findByAction(action);
        return auditLogs.stream()
                .map(AuditLogResponse::new)
                .collect(Collectors.toList());
    }

    /**
     * Get recent audit logs (Admin only)
     */
    @PreAuthorize("hasRole('ADMINISTRATOR') or @userManagementService.canViewAuditTrail(authentication.name)")
    @Transactional(readOnly = true)
    public List<AuditLogResponse> getRecentAuditLogs(int hours) {
        LocalDateTime since = LocalDateTime.now().minusHours(hours);
        List<AuditLog> auditLogs = auditLogRepository.findRecentLogs(since);
        return auditLogs.stream()
                .map(AuditLogResponse::new)
                .collect(Collectors.toList());
    }

    /**
     * Get audit logs for specific entity (Admin only)
     */
    @PreAuthorize("hasRole('ADMINISTRATOR') or @userManagementService.canViewAuditTrail(authentication.name)")
    @Transactional(readOnly = true)
    public List<AuditLogResponse> getAuditLogsForEntity(java.util.UUID entityId) {
        List<AuditLog> auditLogs = auditLogRepository.findByEntityId(entityId);
        return auditLogs.stream()
                .map(AuditLogResponse::new)
                .collect(Collectors.toList());
    }

    /**
     * Get audit statistics (Admin only)
     */
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    @Transactional(readOnly = true)
    public AuditStatistics getAuditStatistics() {
        long totalLogs = auditLogRepository.count();
        long userLogins = auditLogRepository.countByAction("USER_LOGIN");
        long userLogouts = auditLogRepository.countByAction("USER_LOGOUT");
        long projectCreations = auditLogRepository.countByAction("PROJECT_CREATED");
        long imageUploads = auditLogRepository.countByAction("IMAGE_UPLOADED");

        return new AuditStatistics(totalLogs, userLogins, userLogouts, projectCreations, imageUploads);
    }

    /**
     * Inner class for audit statistics
     */
    public static class AuditStatistics {
        private long totalLogs;
        private long userLogins;
        private long userLogouts;
        private long projectCreations;
        private long imageUploads;

        public AuditStatistics(long totalLogs, long userLogins, long userLogouts, long projectCreations, long imageUploads) {
            this.totalLogs = totalLogs;
            this.userLogins = userLogins;
            this.userLogouts = userLogouts;
            this.projectCreations = projectCreations;
            this.imageUploads = imageUploads;
        }

        // Getters
        public long getTotalLogs() { return totalLogs; }
        public long getUserLogins() { return userLogins; }
        public long getUserLogouts() { return userLogouts; }
        public long getProjectCreations() { return projectCreations; }
        public long getImageUploads() { return imageUploads; }
        }


    // --- Review methods with persistent state ---

    /**
     * Review an individual audit log
     */
    @PreAuthorize("hasRole('ADMINISTRATOR') or @userManagementService.canViewAuditTrail(authentication.name)")
    @Transactional
    public AuditLogReviewResponse reviewAuditLog(AuditLogReviewRequest request, User reviewer) {
        try {
            AuditLog auditLog = auditLogRepository.findById(request.getLogId())
                    .orElseThrow(() -> new RuntimeException("Audit log not found with ID: " + request.getLogId()));

            // Update review fields
            auditLog.setReviewStatus(request.getReviewStatus());
            auditLog.setReviewedBy(reviewer);
            auditLog.setReviewedAt(LocalDateTime.now());
            auditLog.setReviewComments(request.getReviewComments());

            // Save the updated audit log
            AuditLog savedLog = auditLogRepository.save(auditLog);

            // Return the updated audit log as response
            AuditLogReviewResponse response = new AuditLogReviewResponse(savedLog);
            response.setSuccess(true);
            response.setMessage("Audit log reviewed successfully");

            return response;
        } catch (Exception e) {
            return new AuditLogReviewResponse(false, "Failed to review audit log: " + e.getMessage());
        }
    }

    @PreAuthorize("hasRole('ADMINISTRATOR') or @userManagementService.canViewAuditTrail(authentication.name)")
    @Transactional(readOnly = true)
    public List<AuditLogReviewResponse> getPendingReviewLogs() {
        // Now returns actual pending logs from database
        List<AuditLog> logs = auditLogRepository.findPendingReviews();
        return logs.stream()
                .map(AuditLogReviewResponse::new)
                .collect(Collectors.toList());
    }

    @PreAuthorize("hasRole('ADMINISTRATOR') or @userManagementService.canViewAuditTrail(authentication.name)")
    @Transactional(readOnly = true)
    public List<ReviewSessionResponse> getAllReviewSessions(String currentReviewerUsername) {
        // Get actual review sessions based on reviewed logs grouped by reviewer and review date
        List<ReviewSessionResponse> sessions = new java.util.ArrayList<>();

        // Get all logs that have been reviewed (not PENDING)
        List<AuditLog> reviewedLogs = auditLogRepository.findByReviewStatusIn(
            List.of(ReviewStatus.APPROVED, ReviewStatus.REJECTED, ReviewStatus.FLAGGED, ReviewStatus.REVIEWED)
        );

        // Group by reviewer and review date (day)
        Map<String, Map<LocalDateTime, List<AuditLog>>> groupedSessions = reviewedLogs.stream()
            .filter(log -> log.getReviewedBy() != null && log.getReviewedAt() != null)
            .collect(Collectors.groupingBy(
                log -> log.getReviewedBy().getUsername(),
                Collectors.groupingBy(
                    log -> log.getReviewedAt().toLocalDate().atStartOfDay()
                )
            ));

        // Create review session responses
        for (Map.Entry<String, Map<LocalDateTime, List<AuditLog>>> reviewerEntry : groupedSessions.entrySet()) {
            String reviewerUsername = reviewerEntry.getKey();

            for (Map.Entry<LocalDateTime, List<AuditLog>> sessionEntry : reviewerEntry.getValue().entrySet()) {
                LocalDateTime sessionDate = sessionEntry.getKey();
                List<AuditLog> sessionLogs = sessionEntry.getValue();

                // Find the latest review time for this session
                LocalDateTime latestReviewTime = sessionLogs.stream()
                    .map(AuditLog::getReviewedAt)
                    .max(LocalDateTime::compareTo)
                    .orElse(sessionDate);

                // Create session summary
                Map<ReviewStatus, Long> statusCounts = sessionLogs.stream()
                    .collect(Collectors.groupingBy(AuditLog::getReviewStatus, Collectors.counting()));

                String sessionComments = String.format(
                    "Reviewed %d logs: %d approved, %d rejected, %d flagged, %d reviewed",
                    sessionLogs.size(),
                    statusCounts.getOrDefault(ReviewStatus.APPROVED, 0L),
                    statusCounts.getOrDefault(ReviewStatus.REJECTED, 0L),
                    statusCounts.getOrDefault(ReviewStatus.FLAGGED, 0L),
                    statusCounts.getOrDefault(ReviewStatus.REVIEWED, 0L)
                );

                // Create detailed log info for each reviewed log
                List<ReviewSessionResponse.ReviewedLogInfo> reviewedLogInfos = sessionLogs.stream()
                    .map(log -> new ReviewSessionResponse.ReviewedLogInfo(
                        log.getId(),
                        log.getAction(),
                        log.getDetails(),
                        log.getEntityType(),
                        log.getTimestamp(),
                        log.getReviewStatus()
                    ))
                    .collect(Collectors.toList());

                ReviewSessionResponse session = new ReviewSessionResponse(
                    java.util.UUID.randomUUID(), // Generate session ID
                    reviewerUsername,
                    latestReviewTime,
                    sessionComments,
                    sessionLogs.size(),
                    reviewedLogInfos
                );

                sessions.add(session);
            }
        }

        // Sort by review date (most recent first)
        sessions.sort((s1, s2) -> s2.getReviewedAt().compareTo(s1.getReviewedAt()));

        return sessions;
    }

    /**
     * Bulk review logs with actual database persistence
     */
    @PreAuthorize("hasRole('ADMINISTRATOR') or @userManagementService.canViewAuditTrail(authentication.name)")
    @Transactional
    public BulkReviewResponse bulkReviewPendingLogs(BulkAuditLogReviewRequest request, User reviewer) {
        try {
            List<AuditLog> logsToReview;

            // If specific log IDs are provided, review those; otherwise review all pending logs
            if (request.getAuditLogIds() != null && !request.getAuditLogIds().isEmpty()) {
                logsToReview = auditLogRepository.findByIdIn(request.getAuditLogIds());
            } else {
                logsToReview = auditLogRepository.findPendingReviews();
            }

            LocalDateTime reviewedAt = LocalDateTime.now();
            int reviewedCount = 0;

            // Update each log with review information
            for (AuditLog log : logsToReview) {
                log.setReviewStatus(request.getReviewStatus());
                log.setReviewedBy(reviewer);
                log.setReviewedAt(reviewedAt);
                log.setReviewComments(request.getReviewComments());
                auditLogRepository.save(log);
                reviewedCount++;
            }

            // Generate a review session ID for tracking
            java.util.UUID reviewSessionId = java.util.UUID.randomUUID();

            String message = String.format("Bulk review completed by %s. Status: %s. %d logs processed.",
                    reviewer.getUsername(),
                    request.getReviewStatus(),
                    reviewedCount);

            return new BulkReviewResponse(reviewSessionId, reviewedCount, reviewedAt, message);
        } catch (Exception e) {
            throw new RuntimeException("Failed to perform bulk review: " + e.getMessage(), e);
        }
    }

    /**
     * Get audit logs by review status
     */
    @PreAuthorize("hasRole('ADMINISTRATOR') or @userManagementService.canViewAuditTrail(authentication.name)")
    @Transactional(readOnly = true)
    public List<AuditLogReviewResponse> getAuditLogsByReviewStatus(ReviewStatus reviewStatus) {
        List<AuditLog> logs = auditLogRepository.findByReviewStatus(reviewStatus);
        return logs.stream()
                .map(AuditLogReviewResponse::new)
                .collect(Collectors.toList());
    }

    /**
     * Get audit logs by review status with pagination
     */
    @PreAuthorize("hasRole('ADMINISTRATOR') or @userManagementService.canViewAuditTrail(authentication.name)")
    @Transactional(readOnly = true)
    public Page<AuditLogReviewResponse> getAuditLogsByReviewStatus(ReviewStatus reviewStatus, Pageable pageable) {
        Page<AuditLog> logs = auditLogRepository.findByReviewStatus(reviewStatus, pageable);
        return logs.map(AuditLogReviewResponse::new);
    }

    /**
     * Get count of logs by review status
     */
    @PreAuthorize("hasRole('ADMINISTRATOR') or @userManagementService.canViewAuditTrail(authentication.name)")
    @Transactional(readOnly = true)
    public long getCountByReviewStatus(ReviewStatus reviewStatus) {
        return auditLogRepository.countByReviewStatus(reviewStatus);
    }

    /**
     * Get count of pending reviews
     */
    @PreAuthorize("hasRole('ADMINISTRATOR') or @userManagementService.canViewAuditTrail(authentication.name)")
    @Transactional(readOnly = true)
    public long getPendingReviewsCount() {
        return auditLogRepository.countPendingReviews();
    }
}
