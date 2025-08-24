package com.ipter.dto;

import com.ipter.model.ProcessingStatus;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Response DTO for image upload
 */
public class ImageUploadResponse {
    
    private UUID imageId;
    private String originalFilename;
    private String contentType;
    private Long fileSize;
    private ProcessingStatus processingStatus;
    private UUID projectId;
    private LocalDateTime uploadedAt;
    private String message;
    
    // Constructors
    public ImageUploadResponse() {}
    
    public ImageUploadResponse(UUID imageId, String originalFilename, String contentType, 
                              Long fileSize, ProcessingStatus processingStatus, 
                              UUID projectId, LocalDateTime uploadedAt, String message) {
        this.imageId = imageId;
        this.originalFilename = originalFilename;
        this.contentType = contentType;
        this.fileSize = fileSize;
        this.processingStatus = processingStatus;
        this.projectId = projectId;
        this.uploadedAt = uploadedAt;
        this.message = message;
    }
    
    // Getters and Setters
    public UUID getImageId() {
        return imageId;
    }
    
    public void setImageId(UUID imageId) {
        this.imageId = imageId;
    }
    
    public String getOriginalFilename() {
        return originalFilename;
    }
    
    public void setOriginalFilename(String originalFilename) {
        this.originalFilename = originalFilename;
    }
    
    public String getContentType() {
        return contentType;
    }
    
    public void setContentType(String contentType) {
        this.contentType = contentType;
    }
    
    public Long getFileSize() {
        return fileSize;
    }
    
    public void setFileSize(Long fileSize) {
        this.fileSize = fileSize;
    }
    
    public ProcessingStatus getProcessingStatus() {
        return processingStatus;
    }
    
    public void setProcessingStatus(ProcessingStatus processingStatus) {
        this.processingStatus = processingStatus;
    }
    
    public UUID getProjectId() {
        return projectId;
    }
    
    public void setProjectId(UUID projectId) {
        this.projectId = projectId;
    }
    
    public LocalDateTime getUploadedAt() {
        return uploadedAt;
    }
    
    public void setUploadedAt(LocalDateTime uploadedAt) {
        this.uploadedAt = uploadedAt;
    }
    
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
}
