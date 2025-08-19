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

import com.ipter.model.AuditLog;
import com.ipter.service.AuditService;

/**
 * Controller for audit trail operations
 */
@RestController
@RequestMapping("/audit")
@CrossOrigin(origins = "*", maxAge = 3600)
@PreAuthorize("hasRole('ADMINISTRATOR')")
public class AuditController {
    
    @Autowired
    private AuditService auditService;
    
    /**
     * Get all audit logs with pagination
     */
    @GetMapping
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
}
