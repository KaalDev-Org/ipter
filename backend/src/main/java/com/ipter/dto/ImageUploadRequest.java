package com.ipter.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

/**
 * Request DTO for image upload
 */
public class ImageUploadRequest {
    
    @NotNull(message = "Project ID is required")
    private UUID projectId;
    
    @Size(max = 1000, message = "Description cannot exceed 1000 characters")
    private String description;
    
    private boolean processImmediately = true;
    
    // Constructors
    public ImageUploadRequest() {}
    
    public ImageUploadRequest(UUID projectId, String description, boolean processImmediately) {
        this.projectId = projectId;
        this.description = description;
        this.processImmediately = processImmediately;
    }
    
    // Getters and Setters
    public UUID getProjectId() {
        return projectId;
    }
    
    public void setProjectId(UUID projectId) {
        this.projectId = projectId;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public boolean isProcessImmediately() {
        return processImmediately;
    }
    
    public void setProcessImmediately(boolean processImmediately) {
        this.processImmediately = processImmediately;
    }
}
