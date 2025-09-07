package com.ipter.controller;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ipter.dto.AuditLogRequest;
import com.ipter.dto.AuditLogResponse;
import com.ipter.dto.BulkAuditLogReviewRequest;
import com.ipter.dto.BulkReviewResponse;
import com.ipter.model.User;
import com.ipter.service.AuditService;
import com.ipter.service.UserManagementService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

/**
 * Controller for audit trail operations - simplified version
 */
@RestController
@RequestMapping("/audit")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AuditController {

    @Autowired
    private AuditService auditService;

    @Autowired
    private UserManagementService userManagementService;

    /**
     * Create an audit log entry (called from frontend)
     */
    @PostMapping("/log")
    public ResponseEntity<?> createAuditLog(@Valid @RequestBody AuditLogRequest request,
                                           Authentication authentication,
                                           HttpServletRequest httpRequest) {
        try {
            User user = userManagementService.findByUsername(authentication.getName());

            // Extract IP address and user agent if not provided
            if (request.getIpAddress() == null || request.getIpAddress().isEmpty()) {
                String ipAddress = getClientIpAddress(httpRequest);
                request.setIpAddress(ipAddress);
            }

            if (request.getUserAgent() == null || request.getUserAgent().isEmpty()) {
                String userAgent = httpRequest.getHeader("User-Agent");
                request.setUserAgent(userAgent);
            }

            AuditLogResponse response = auditService.createAuditLog(request, user);

            Map<String, Object> result = new HashMap<>();
            result.put("message", "Audit log created successfully");
            result.put("auditLog", response);

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Get all audit logs with pagination
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMINISTRATOR') or @userManagementService.canViewAuditTrail(authentication.name)")
    public ResponseEntity<?> getAllAuditLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "timestamp") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        try {
            Sort sort = sortDir.equalsIgnoreCase("desc") ?
                Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
            Pageable pageable = PageRequest.of(page, size, sort);

            Page<AuditLogResponse> auditLogs = auditService.getAllAuditLogs(pageable);

            Map<String, Object> response = new HashMap<>();
            response.put("auditLogs", auditLogs.getContent());
            response.put("currentPage", auditLogs.getNumber());
            response.put("totalItems", auditLogs.getTotalElements());
            response.put("totalPages", auditLogs.getTotalPages());
            response.put("pageSize", auditLogs.getSize());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Get audit logs by date range
     */
    @GetMapping("/date-range")
    @PreAuthorize("hasRole('ADMINISTRATOR') or @userManagementService.canViewAuditTrail(authentication.name)")
    public ResponseEntity<?> getAuditLogsByDateRange(
            @RequestParam String startDate,
            @RequestParam String endDate) {
        try {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss");
            LocalDateTime start = LocalDateTime.parse(startDate, formatter);
            LocalDateTime end = LocalDateTime.parse(endDate, formatter);

            List<AuditLogResponse> auditLogs = auditService.getAuditLogsByDateRange(start, end);
            return ResponseEntity.ok(auditLogs);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Get audit logs by action
     */
    @GetMapping("/action/{action}")
    @PreAuthorize("hasRole('ADMINISTRATOR') or @userManagementService.canViewAuditTrail(authentication.name)")
    public ResponseEntity<?> getAuditLogsByAction(@PathVariable String action) {
        try {
            List<AuditLogResponse> auditLogs = auditService.getAuditLogsByAction(action);
            return ResponseEntity.ok(auditLogs);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Get recent audit logs
     */
    @GetMapping("/recent")
    @PreAuthorize("hasRole('ADMINISTRATOR') or @userManagementService.canViewAuditTrail(authentication.name)")
    public ResponseEntity<?> getRecentAuditLogs(@RequestParam(defaultValue = "24") int hours) {
        try {
            List<AuditLogResponse> auditLogs = auditService.getRecentAuditLogs(hours);
            return ResponseEntity.ok(auditLogs);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Get audit logs for specific entity
     */
    @GetMapping("/entity/{entityId}")
    @PreAuthorize("hasRole('ADMINISTRATOR') or @userManagementService.canViewAuditTrail(authentication.name)")
    public ResponseEntity<?> getAuditLogsForEntity(@PathVariable UUID entityId) {
        try {
            List<AuditLogResponse> auditLogs = auditService.getAuditLogsForEntity(entityId);
            return ResponseEntity.ok(auditLogs);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Get audit statistics
     */
    @GetMapping("/statistics")
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    public ResponseEntity<?> getAuditStatistics() {
        try {
            AuditService.AuditStatistics stats = auditService.getAuditStatistics();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Get all review sessions (synthetic in simplified model)
     */
    @GetMapping("/review-sessions")
    @PreAuthorize("hasRole('ADMINISTRATOR') or @userManagementService.canViewAuditTrail(authentication.name)")
    public ResponseEntity<?> getAllReviewSessions(Authentication authentication) {
        try {
            String username = authentication != null ? authentication.getName() : null;
            List<com.ipter.dto.ReviewSessionResponse> reviewSessions = auditService.getAllReviewSessions(username);
            return ResponseEntity.ok(reviewSessions);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Get pending review logs (treated as recent logs in simplified model)
     */
    @GetMapping("/pending-reviews")
    @PreAuthorize("hasRole('ADMINISTRATOR') or @userManagementService.canViewAuditTrail(authentication.name)")
    public ResponseEntity<?> getPendingReviewLogs() {
        try {
            List<com.ipter.dto.AuditLogReviewResponse> auditLogs = auditService.getPendingReviewLogs();
            Map<String, Object> response = new HashMap<>();
            response.put("auditLogs", auditLogs);
            response.put("count", auditLogs.size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Review an individual audit log
     */
    @PostMapping("/review")
    @PreAuthorize("hasRole('ADMINISTRATOR') or @userManagementService.canViewAuditTrail(authentication.name)")
    public ResponseEntity<?> reviewAuditLog(@Valid @RequestBody com.ipter.dto.AuditLogReviewRequest request,
                                           Authentication authentication) {
        try {
            User reviewer = userManagementService.findByUsername(authentication.getName());
            com.ipter.dto.AuditLogReviewResponse response = auditService.reviewAuditLog(request, reviewer);

            if (response.isSuccess()) {
                return ResponseEntity.ok(response);
            } else {
                Map<String, String> error = new HashMap<>();
                error.put("error", response.getMessage());
                return ResponseEntity.badRequest().body(error);
            }
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Bulk review all pending audit logs
     */
    @PostMapping("/bulk-review")
    @PreAuthorize("hasRole('ADMINISTRATOR') or @userManagementService.canViewAuditTrail(authentication.name)")
    public ResponseEntity<?> bulkReviewPendingLogs(@Valid @RequestBody BulkAuditLogReviewRequest request,
                                                  Authentication authentication) {
        try {
            User reviewer = userManagementService.findByUsername(authentication.getName());
            BulkReviewResponse response = auditService.bulkReviewPendingLogs(request, reviewer);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Get audit logs by review status
     */
    @GetMapping("/review-status/{status}")
    @PreAuthorize("hasRole('ADMINISTRATOR') or @userManagementService.canViewAuditTrail(authentication.name)")
    public ResponseEntity<?> getAuditLogsByReviewStatus(@PathVariable String status,
                                                        @RequestParam(defaultValue = "0") int page,
                                                        @RequestParam(defaultValue = "20") int size) {
        try {
            com.ipter.model.ReviewStatus reviewStatus = com.ipter.model.ReviewStatus.valueOf(status.toUpperCase());

            if (page >= 0 && size > 0) {
                // Return paginated results
                org.springframework.data.domain.Pageable pageable =
                    org.springframework.data.domain.PageRequest.of(page, size);
                org.springframework.data.domain.Page<com.ipter.dto.AuditLogReviewResponse> auditLogs =
                    auditService.getAuditLogsByReviewStatus(reviewStatus, pageable);
                return ResponseEntity.ok(auditLogs);
            } else {
                // Return all results
                List<com.ipter.dto.AuditLogReviewResponse> auditLogs =
                    auditService.getAuditLogsByReviewStatus(reviewStatus);
                Map<String, Object> response = new HashMap<>();
                response.put("auditLogs", auditLogs);
                response.put("count", auditLogs.size());
                return ResponseEntity.ok(response);
            }
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Invalid review status: " + status);
            return ResponseEntity.badRequest().body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Get review statistics
     */
    @GetMapping("/review-statistics")
    @PreAuthorize("hasRole('ADMINISTRATOR') or @userManagementService.canViewAuditTrail(authentication.name)")
    public ResponseEntity<?> getReviewStatistics() {
        try {
            Map<String, Object> stats = new HashMap<>();
            stats.put("pendingCount", auditService.getPendingReviewsCount());
            stats.put("approvedCount", auditService.getCountByReviewStatus(com.ipter.model.ReviewStatus.APPROVED));
            stats.put("rejectedCount", auditService.getCountByReviewStatus(com.ipter.model.ReviewStatus.REJECTED));
            stats.put("flaggedCount", auditService.getCountByReviewStatus(com.ipter.model.ReviewStatus.FLAGGED));
            stats.put("reviewedCount", auditService.getCountByReviewStatus(com.ipter.model.ReviewStatus.REVIEWED));
            stats.put("totalLogs", auditService.getAuditStatistics().getTotalLogs());

            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Extract client IP address from request
     */
    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }

        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }

        return request.getRemoteAddr();
    }
}
