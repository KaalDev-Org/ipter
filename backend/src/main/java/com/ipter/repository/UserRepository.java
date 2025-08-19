package com.ipter.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.ipter.model.User;
import com.ipter.model.UserRole;

/**
 * Repository interface for User entity
 */
@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    
    /**
     * Find user by username
     */
    Optional<User> findByUsername(String username);
    
    /**
     * Find user by loginId
     */
    Optional<User> findByLoginId(String loginId);

    /**
     * Find user by email
     */
    Optional<User> findByEmail(String email);

    /**
     * Find user by username, loginId, or email
     */
    @Query("SELECT u FROM User u WHERE u.username = :identifier OR u.loginId = :identifier OR u.email = :identifier")
    Optional<User> findByUsernameOrLoginIdOrEmail(@Param("identifier") String identifier);

    /**
     * Find user by username or email (legacy method)
     */
    @Query("SELECT u FROM User u WHERE u.username = :usernameOrEmail OR u.email = :usernameOrEmail")
    Optional<User> findByUsernameOrEmail(@Param("usernameOrEmail") String usernameOrEmail);
    
    /**
     * Check if username exists
     */
    boolean existsByUsername(String username);
    
    /**
     * Check if loginId exists
     */
    boolean existsByLoginId(String loginId);

    /**
     * Check if email exists
     */
    boolean existsByEmail(String email);
    
    /**
     * Find all active users
     */
    List<User> findByIsActiveTrue();
    
    /**
     * Find users by role
     */
    List<User> findByRole(UserRole role);
    
    /**
     * Count users by role
     */
    long countByRole(UserRole role);
    
    /**
     * Find users created after a specific date
     */
    List<User> findByCreatedAtAfter(LocalDateTime date);
    
    /**
     * Find users with failed login attempts greater than specified count
     */
    List<User> findByFailedLoginAttemptsGreaterThan(int attempts);
    
    /**
     * Find users who logged in recently
     */
    @Query("SELECT u FROM User u WHERE u.lastLogin >= :since")
    List<User> findRecentlyActiveUsers(@Param("since") LocalDateTime since);
    
    /**
     * Find users by role and active status
     */
    List<User> findByRoleAndIsActive(UserRole role, boolean isActive);
}
