package com.ipter.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO for serial number update response
 */
public class SerialNumberUpdateResponse {
    
    @JsonProperty("image_id")
    private UUID imageId;
    
    @JsonProperty("project_id")
    private UUID projectId;
    
    @JsonProperty("updated_count")
    private Integer updatedCount;
    
    @JsonProperty("updated_at")
    private LocalDateTime updatedAt;
    
    private String message;
    private Boolean success;
    
    // Constructors
    public SerialNumberUpdateResponse() {}
    
    public SerialNumberUpdateResponse(UUID imageId, UUID projectId, Integer updatedCount, String message, Boolean success) {
        this.imageId = imageId;
        this.projectId = projectId;
        this.updatedCount = updatedCount;
        this.message = message;
        this.success = success;
        this.updatedAt = LocalDateTime.now();
    }
    
    // Getters and Setters
    public UUID getImageId() {
        return imageId;
    }
    
    public void setImageId(UUID imageId) {
        this.imageId = imageId;
    }
    
    public UUID getProjectId() {
        return projectId;
    }
    
    public void setProjectId(UUID projectId) {
        this.projectId = projectId;
    }
    
    public Integer getUpdatedCount() {
        return updatedCount;
    }
    
    public void setUpdatedCount(Integer updatedCount) {
        this.updatedCount = updatedCount;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
    
    public Boolean getSuccess() {
        return success;
    }
    
    public void setSuccess(Boolean success) {
        this.success = success;
    }
}
