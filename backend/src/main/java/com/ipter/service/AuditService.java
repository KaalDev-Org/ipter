package com.ipter.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ipter.model.AuditLog;
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
}
