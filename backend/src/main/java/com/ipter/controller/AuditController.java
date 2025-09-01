package com.ipter.controller;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.security.core.Authentication;
import jakarta.validation.Valid;

import com.ipter.dto.AuditLogReviewRequest;
import com.ipter.dto.AuditLogReviewResponse;
import com.ipter.dto.BulkAuditLogReviewRequest;
import com.ipter.dto.BulkReviewResponse;
import com.ipter.dto.ReviewSessionResponse;
import com.ipter.model.AuditLog;
import com.ipter.model.ReviewStatus;
import com.ipter.model.User;
import com.ipter.service.AuditService;
import com.ipter.service.UserManagementService;

/**
 * Controller for audit trail operations
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
            
            Page<AuditLog> auditLogs = auditService.getAllAuditLogs(pageable);
            
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
    public ResponseEntity<?> getAuditLogsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        try {
            List<AuditLog> auditLogs = auditService.getAuditLogsByDateRange(startDate, endDate);
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
    public ResponseEntity<?> getAuditLogsByAction(@PathVariable String action) {
        try {
            List<AuditLog> auditLogs = auditService.getAuditLogsByAction(action);
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
    public ResponseEntity<?> getRecentAuditLogs(@RequestParam(defaultValue = "24") int hours) {
        try {
            List<AuditLog> auditLogs = auditService.getRecentAuditLogs(hours);
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
    public ResponseEntity<?> getAuditLogsForEntity(@PathVariable UUID entityId) {
        try {
            List<AuditLog> auditLogs = auditService.getAuditLogsForEntity(entityId);
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

    // ===== AUDIT LOG REVIEW ENDPOINTS =====

    /**
     * Review an audit log
     */
    @PostMapping("/review")
    @PreAuthorize("hasRole('ADMINISTRATOR') or @userManagementService.canViewAuditTrail(authentication.name)")
    public ResponseEntity<?> reviewAuditLog(@Valid @RequestBody AuditLogReviewRequest request,
                                           Authentication authentication) {
        try {
            User reviewer = userManagementService.findByUsername(authentication.getName());
            AuditLogReviewResponse response = auditService.reviewAuditLog(request, reviewer);

            Map<String, Object> result = new HashMap<>();
            result.put("message", "Audit log reviewed successfully");
            result.put("auditLog", response);

            return ResponseEntity.ok(result);
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
    public ResponseEntity<?> getAuditLogsByReviewStatus(@PathVariable ReviewStatus status,
                                                       @RequestParam(defaultValue = "0") int page,
                                                       @RequestParam(defaultValue = "20") int size) {
        try {
            if (page >= 0 && size > 0) {
                // Paginated response
                Pageable pageable = PageRequest.of(page, size);
                Page<AuditLogReviewResponse> auditLogs = auditService.getAuditLogsByReviewStatus(status, pageable);

                Map<String, Object> response = new HashMap<>();
                response.put("auditLogs", auditLogs.getContent());
                response.put("currentPage", auditLogs.getNumber());
                response.put("totalItems", auditLogs.getTotalElements());
                response.put("totalPages", auditLogs.getTotalPages());
                response.put("pageSize", auditLogs.getSize());

                return ResponseEntity.ok(response);
            } else {
                // Non-paginated response
                List<AuditLogReviewResponse> auditLogs = auditService.getAuditLogsByReviewStatus(status);
                return ResponseEntity.ok(auditLogs);
            }
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Get pending review logs
     */
    @GetMapping("/pending-reviews")
    @PreAuthorize("hasRole('ADMINISTRATOR') or @userManagementService.canViewAuditTrail(authentication.name)")
    public ResponseEntity<?> getPendingReviewLogs() {
        try {
            List<AuditLogReviewResponse> auditLogs = auditService.getPendingReviewLogs();

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
     * Get flagged audit logs
     */
    @GetMapping("/flagged")
    public ResponseEntity<?> getFlaggedLogs() {
        try {
            List<AuditLogReviewResponse> auditLogs = auditService.getFlaggedLogs();

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
     * Get reviewed logs by date range
     */
    @GetMapping("/reviewed-logs")
    public ResponseEntity<?> getReviewedLogsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        try {
            List<AuditLogReviewResponse> auditLogs = auditService.getReviewedLogsByDateRange(startDate, endDate);

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
     * Get review statistics
     */
    @GetMapping("/review-statistics")
    public ResponseEntity<?> getReviewStatistics() {
        try {
            AuditService.ReviewStatistics stats = auditService.getReviewStatistics();
            return ResponseEntity.ok(stats);
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
     * Get all review sessions
     */
    @GetMapping("/review-sessions")
    @PreAuthorize("hasRole('ADMINISTRATOR') or @userManagementService.canViewAuditTrail(authentication.name)")
    public ResponseEntity<?> getAllReviewSessions() {
        try {
            List<ReviewSessionResponse> reviewSessions = auditService.getAllReviewSessions();
            return ResponseEntity.ok(reviewSessions);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Get audit logs by review session
     */
    @GetMapping("/review-session/{reviewSessionId}/logs")
    @PreAuthorize("hasRole('ADMINISTRATOR') or @userManagementService.canViewAuditTrail(authentication.name)")
    public ResponseEntity<?> getAuditLogsByReviewSession(@PathVariable UUID reviewSessionId) {
        try {
            List<AuditLogReviewResponse> auditLogs = auditService.getAuditLogsByReviewSession(reviewSessionId);

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
}
