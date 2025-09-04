package com.ipter.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ipter.dto.AuditLogRequest;
import com.ipter.dto.AuditLogResponse;
import com.ipter.model.AuditLog;
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
}
