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
import com.ipter.model.ReviewStatus;
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
     * Find audit logs by date range
     */
    @Query("SELECT a FROM AuditLog a WHERE a.timestamp BETWEEN :startDate AND :endDate ORDER BY a.timestamp DESC")
    List<AuditLog> findByTimestampBetween(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    /**
     * Find audit logs by date range with pagination
     */
    @Query("SELECT a FROM AuditLog a WHERE a.timestamp BETWEEN :startDate AND :endDate ORDER BY a.timestamp DESC")
    Page<AuditLog> findByTimestampBetween(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate, Pageable pageable);
    
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
     * Find all audit logs ordered by timestamp (most recent first)
     */
    @Query("SELECT a FROM AuditLog a ORDER BY a.timestamp DESC")
    List<AuditLog> findAllOrderByTimestampDesc();
    
    /**
     * Find all audit logs ordered by timestamp with pagination
     */
    @Query("SELECT a FROM AuditLog a ORDER BY a.timestamp DESC")
    Page<AuditLog> findAllOrderByTimestampDesc(Pageable pageable);
    
    /**
     * Find audit logs by IP address
     */
    List<AuditLog> findByIpAddress(String ipAddress);
    
    /**
     * Count total audit logs
     */
    @Query("SELECT COUNT(a) FROM AuditLog a")
    long countTotalLogs();
    
    /**
     * Find audit logs by multiple actions
     */
    @Query("SELECT a FROM AuditLog a WHERE a.action IN :actions ORDER BY a.timestamp DESC")
    List<AuditLog> findByActionIn(@Param("actions") List<String> actions);
    
    /**
     * Find audit logs by user and date range
     */
    @Query("SELECT a FROM AuditLog a WHERE a.performedBy = :user AND a.timestamp BETWEEN :startDate AND :endDate ORDER BY a.timestamp DESC")
    List<AuditLog> findByUserAndDateRange(@Param("user") User user, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    // Review-related query methods

    /**
     * Find audit logs by review status
     */
    List<AuditLog> findByReviewStatus(ReviewStatus reviewStatus);

    /**
     * Find audit logs by review status with pagination
     */
    Page<AuditLog> findByReviewStatus(ReviewStatus reviewStatus, Pageable pageable);

    /**
     * Find pending audit logs (review status = PENDING)
     */
    @Query("SELECT a FROM AuditLog a WHERE a.reviewStatus = 'PENDING' ORDER BY a.timestamp DESC")
    List<AuditLog> findPendingReviews();

    /**
     * Find pending audit logs with pagination
     */
    @Query("SELECT a FROM AuditLog a WHERE a.reviewStatus = 'PENDING' ORDER BY a.timestamp DESC")
    Page<AuditLog> findPendingReviews(Pageable pageable);

    /**
     * Find audit logs reviewed by a specific user
     */
    List<AuditLog> findByReviewedBy(User reviewedBy);

    /**
     * Find audit logs reviewed by a specific user with pagination
     */
    Page<AuditLog> findByReviewedBy(User reviewedBy, Pageable pageable);

    /**
     * Find audit logs by review status and reviewed by user
     */
    List<AuditLog> findByReviewStatusAndReviewedBy(ReviewStatus reviewStatus, User reviewedBy);

    /**
     * Count audit logs by review status
     */
    long countByReviewStatus(ReviewStatus reviewStatus);

    /**
     * Count pending reviews
     */
    @Query("SELECT COUNT(a) FROM AuditLog a WHERE a.reviewStatus = 'PENDING'")
    long countPendingReviews();

    /**
     * Find audit logs by review date range
     */
    @Query("SELECT a FROM AuditLog a WHERE a.reviewedAt BETWEEN :startDate AND :endDate ORDER BY a.reviewedAt DESC")
    List<AuditLog> findByReviewedAtBetween(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    /**
     * Find audit logs by multiple review statuses
     */
    @Query("SELECT a FROM AuditLog a WHERE a.reviewStatus IN :statuses ORDER BY a.timestamp DESC")
    List<AuditLog> findByReviewStatusIn(@Param("statuses") List<ReviewStatus> statuses);

    /**
     * Find audit logs by IDs for bulk operations
     */
    @Query("SELECT a FROM AuditLog a WHERE a.id IN :ids")
    List<AuditLog> findByIdIn(@Param("ids") List<UUID> ids);
}
