package com.ipter.repository;

import com.ipter.model.ReviewSession;
import com.ipter.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Repository interface for ReviewSession entity
 */
@Repository
public interface ReviewSessionRepository extends JpaRepository<ReviewSession, UUID> {
    
    /**
     * Find review sessions by reviewer
     */
    List<ReviewSession> findByReviewer(User reviewer);
    
    /**
     * Find review sessions ordered by review date (most recent first)
     */
    @Query("SELECT rs FROM ReviewSession rs ORDER BY rs.reviewedAt DESC")
    List<ReviewSession> findAllOrderByReviewedAtDesc();
    
    /**
     * Find review sessions by date range
     */
    @Query("SELECT rs FROM ReviewSession rs WHERE rs.reviewedAt BETWEEN :startDate AND :endDate ORDER BY rs.reviewedAt DESC")
    List<ReviewSession> findByReviewedAtBetween(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    /**
     * Find recent review sessions (within specified hours)
     */
    @Query("SELECT rs FROM ReviewSession rs WHERE rs.reviewedAt >= :since ORDER BY rs.reviewedAt DESC")
    List<ReviewSession> findRecentSessions(@Param("since") LocalDateTime since);
    
    /**
     * Count review sessions by reviewer
     */
    long countByReviewer(User reviewer);
    
    /**
     * Find review sessions with their audit logs count
     */
    @Query("SELECT rs FROM ReviewSession rs WHERE rs.reviewedLogsCount > 0 ORDER BY rs.reviewedAt DESC")
    List<ReviewSession> findSessionsWithLogs();
}
