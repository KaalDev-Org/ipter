package com.ipter.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.ipter.model.AuditLog;
import com.ipter.model.User;

/**
 * Repository interface for AuditLog entity
 */
@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, UUID> {
    
    /**
     * Find audit logs by performed user
     */
    List<AuditLog> findByPerformedBy(User performedBy);
    
    /**
     * Find audit logs by performed user with pagination
     */
    Page<AuditLog> findByPerformedBy(User performedBy, Pageable pageable);
    
    /**
     * Find audit logs by action
     */
    List<AuditLog> findByAction(String action);
    
    /**
     * Find audit logs by entity type
     */
    List<AuditLog> findByEntityType(String entityType);
    
    /**
     * Find audit logs by entity ID
     */
    List<AuditLog> findByEntityId(UUID entityId);
    
    /**
     * Find audit logs within date range
     */
    @Query("SELECT a FROM AuditLog a WHERE a.timestamp BETWEEN :startDate AND :endDate ORDER BY a.timestamp DESC")
    List<AuditLog> findByTimestampBetween(@Param("startDate") LocalDateTime startDate, 
                                         @Param("endDate") LocalDateTime endDate);
    
    /**
     * Find audit logs within date range with pagination
     */
    @Query("SELECT a FROM AuditLog a WHERE a.timestamp BETWEEN :startDate AND :endDate ORDER BY a.timestamp DESC")
    Page<AuditLog> findByTimestampBetween(@Param("startDate") LocalDateTime startDate, 
                                         @Param("endDate") LocalDateTime endDate, 
                                         Pageable pageable);
    
    /**
     * Find recent audit logs
     */
    @Query("SELECT a FROM AuditLog a WHERE a.timestamp >= :since ORDER BY a.timestamp DESC")
    List<AuditLog> findRecentLogs(@Param("since") LocalDateTime since);
    
    /**
     * Find audit logs by user and action
     */
    List<AuditLog> findByPerformedByAndAction(User performedBy, String action);
    
    /**
     * Find audit logs by entity type and action
     */
    List<AuditLog> findByEntityTypeAndAction(String entityType, String action);
    
    /**
     * Count audit logs by user
     */
    long countByPerformedBy(User performedBy);
    
    /**
     * Count audit logs by action
     */
    long countByAction(String action);

    /**
     * Find audit logs by review status
     */
    List<AuditLog> findByReviewStatus(com.ipter.model.ReviewStatus reviewStatus);

    /**
     * Find audit logs by review status with pagination
     */
    Page<AuditLog> findByReviewStatus(com.ipter.model.ReviewStatus reviewStatus, Pageable pageable);

    /**
     * Find audit logs by reviewed by user
     */
    List<AuditLog> findByReviewedBy(User reviewedBy);

    /**
     * Count audit logs by review status
     */
    long countByReviewStatus(com.ipter.model.ReviewStatus reviewStatus);

    /**
     * Find pending review logs (PENDING status)
     */
    @Query("SELECT a FROM AuditLog a WHERE a.reviewStatus = 'PENDING' ORDER BY a.timestamp DESC")
    List<AuditLog> findPendingReviewLogs();

    /**
     * Find flagged audit logs (FLAGGED status)
     */
    @Query("SELECT a FROM AuditLog a WHERE a.reviewStatus = 'FLAGGED' ORDER BY a.timestamp DESC")
    List<AuditLog> findFlaggedLogs();

    /**
     * Find reviewed logs by date range
     */
    @Query("SELECT a FROM AuditLog a WHERE a.reviewStatus != 'PENDING' AND a.reviewedAt BETWEEN :startDate AND :endDate ORDER BY a.reviewedAt DESC")
    List<AuditLog> findReviewedLogsByDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
}
