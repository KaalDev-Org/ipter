package com.ipter.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Service for managing user sessions and concurrent user limits
 */
@Service
public class SessionManagementService {
    
    @Value("${user.max-concurrent-users:5}")
    private int maxConcurrentUsers;
    
    @Value("${user.session-timeout:3600000}")
    private long sessionTimeoutMs;
    
    private final Map<String, UserSession> activeSessions = new ConcurrentHashMap<>();
    
    /**
     * Check if a new user can login (within concurrent user limit)
     */
    public boolean canUserLogin() {
        cleanupExpiredSessions();
        return activeSessions.size() < maxConcurrentUsers;
    }
    
    /**
     * Create a new user session
     */
    public String createSession(String userId, String username) {
        if (!canUserLogin()) {
            throw new RuntimeException("Maximum " + maxConcurrentUsers + " concurrent users allowed");
        }
        
        // Remove any existing session for this user
        invalidateSession(userId);
        
        String sessionId = UUID.randomUUID().toString();
        UserSession session = new UserSession(sessionId, userId, username, LocalDateTime.now());
        activeSessions.put(sessionId, session);
        
        return sessionId;
    }
    
    /**
     * Invalidate a user session
     */
    public void invalidateSession(String userId) {
        activeSessions.entrySet().removeIf(entry -> entry.getValue().getUserId().equals(userId));
    }
    
    /**
     * Invalidate session by session ID
     */
    public void invalidateSessionById(String sessionId) {
        activeSessions.remove(sessionId);
    }
    
    /**
     * Get current active user count
     */
    public int getActiveUserCount() {
        cleanupExpiredSessions();
        return activeSessions.size();
    }
    
    /**
     * Get maximum allowed concurrent users
     */
    public int getMaxConcurrentUsers() {
        return maxConcurrentUsers;
    }
    
    /**
     * Get available user slots
     */
    public int getAvailableSlots() {
        return maxConcurrentUsers - getActiveUserCount();
    }
    
    /**
     * Check if a session is valid
     */
    public boolean isSessionValid(String sessionId) {
        UserSession session = activeSessions.get(sessionId);
        if (session == null) {
            return false;
        }
        
        if (isSessionExpired(session)) {
            activeSessions.remove(sessionId);
            return false;
        }
        
        return true;
    }
    
    /**
     * Get session information
     */
    public UserSession getSession(String sessionId) {
        return activeSessions.get(sessionId);
    }
    
    /**
     * Get all active sessions (for admin purposes)
     */
    public Map<String, UserSession> getAllActiveSessions() {
        cleanupExpiredSessions();
        return new ConcurrentHashMap<>(activeSessions);
    }
    
    /**
     * Force logout a user by session ID
     */
    public boolean forceLogout(String sessionId) {
        return activeSessions.remove(sessionId) != null;
    }
    
    /**
     * Force logout a user by user ID
     */
    public boolean forceLogoutByUserId(String userId) {
        boolean removed = false;
        activeSessions.entrySet().removeIf(entry -> {
            if (entry.getValue().getUserId().equals(userId)) {
                return true;
            }
            return false;
        });
        return removed;
    }
    
    /**
     * Clean up expired sessions
     */
    private void cleanupExpiredSessions() {
        activeSessions.entrySet().removeIf(entry -> isSessionExpired(entry.getValue()));
    }
    
    /**
     * Check if a session is expired
     */
    private boolean isSessionExpired(UserSession session) {
        LocalDateTime expiryTime = session.getCreatedAt().plusNanos(sessionTimeoutMs * 1_000_000);
        return LocalDateTime.now().isAfter(expiryTime);
    }
    
    /**
     * Update session activity (extend session)
     */
    public void updateSessionActivity(String sessionId) {
        UserSession session = activeSessions.get(sessionId);
        if (session != null) {
            session.setLastActivity(LocalDateTime.now());
        }
    }
    
    /**
     * Inner class representing a user session
     */
    public static class UserSession {
        private String sessionId;
        private String userId;
        private String username;
        private LocalDateTime createdAt;
        private LocalDateTime lastActivity;
        
        public UserSession(String sessionId, String userId, String username, LocalDateTime createdAt) {
            this.sessionId = sessionId;
            this.userId = userId;
            this.username = username;
            this.createdAt = createdAt;
            this.lastActivity = createdAt;
        }
        
        // Getters and Setters
        public String getSessionId() { return sessionId; }
        public void setSessionId(String sessionId) { this.sessionId = sessionId; }
        
        public String getUserId() { return userId; }
        public void setUserId(String userId) { this.userId = userId; }
        
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        
        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
        
        public LocalDateTime getLastActivity() { return lastActivity; }
        public void setLastActivity(LocalDateTime lastActivity) { this.lastActivity = lastActivity; }
    }
}
