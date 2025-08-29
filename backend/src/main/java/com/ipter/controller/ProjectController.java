package com.ipter.controller;

import com.ipter.dto.CreateProjectRequest;
import com.ipter.dto.ProcessPdfRequest;
import com.ipter.dto.ProcessPdfResponse;
import com.ipter.dto.ProjectResponse;
import com.ipter.model.ProjectStatus;
import com.ipter.service.ProjectService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Controller for project management operations
 */
@RestController
@RequestMapping("/projects")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ProjectController {
    
    private static final Logger logger = LoggerFactory.getLogger(ProjectController.class);
    
    @Autowired
    private ProjectService projectService;
    
    /**
     * Create a new project
     */
    @PostMapping("/create")
    @PreAuthorize("hasRole('ADMINISTRATOR') or hasRole('SUPER_USER') or @userManagementService.canCreateProjects(authentication.name)")
    public ResponseEntity<?> createProject(@Valid @RequestBody CreateProjectRequest request) {
        try {
            ProjectResponse project = projectService.createProject(request);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Project created successfully");
            response.put("project", project);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error creating project: {}", e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    /**
     * Get all projects with pagination
     */
    @GetMapping
    public ResponseEntity<?> getAllProjects(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        try {
            Sort sort = sortDir.equalsIgnoreCase("desc") ? 
                       Sort.by(sortBy).descending() : 
                       Sort.by(sortBy).ascending();
            
            Pageable pageable = PageRequest.of(page, size, sort);
            Page<ProjectResponse> projects = projectService.getAllProjects(pageable);
            
            Map<String, Object> response = new HashMap<>();
            response.put("projects", projects.getContent());
            response.put("currentPage", projects.getNumber());
            response.put("totalItems", projects.getTotalElements());
            response.put("totalPages", projects.getTotalPages());
            response.put("hasNext", projects.hasNext());
            response.put("hasPrevious", projects.hasPrevious());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error fetching projects: {}", e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    /**
     * Get all active projects
     */
    @GetMapping("/active")
    public ResponseEntity<?> getActiveProjects() {
        try {
            List<ProjectResponse> projects = projectService.getActiveProjects();
            
            Map<String, Object> response = new HashMap<>();
            response.put("projects", projects);
            response.put("count", projects.size());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error fetching active projects: {}", e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    /**
     * Get project by ID
     */
    @GetMapping("/{projectId}")
    public ResponseEntity<?> getProjectById(@PathVariable UUID projectId) {
        try {
            ProjectResponse project = projectService.getProjectById(projectId);
            return ResponseEntity.ok(project);
        } catch (Exception e) {
            logger.error("Error fetching project {}: {}", projectId, e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    /**
     * Update project status
     */
    @PutMapping("/{projectId}/status")
    @PreAuthorize("hasRole('ADMINISTRATOR') or hasRole('SUPER_USER')")
    public ResponseEntity<?> updateProjectStatus(
            @PathVariable UUID projectId,
            @RequestParam ProjectStatus status) {
        try {
            ProjectResponse project = projectService.updateProjectStatus(projectId, status);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Project status updated successfully");
            response.put("project", project);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error updating project status {}: {}", projectId, e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    /**
     * Upload and process PDF in a single step (Option A)
     */
    @PostMapping("/{projectId}/upload-and-process-pdf")
    @PreAuthorize("hasRole('ADMINISTRATOR') or hasRole('SUPER_USER')")
    public ResponseEntity<?> uploadAndProcessPdf(
            @PathVariable UUID projectId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(defaultValue = "false") boolean forceReprocess) {
        try {
            ProcessPdfResponse response = projectService.uploadAndProcessPdf(projectId, file, forceReprocess);

            Map<String, Object> result = new HashMap<>();
            result.put("message", "PDF processed successfully");
            result.put("result", response);

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            logger.error("Error uploading/processing PDF for project {}: {}", projectId, e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}
