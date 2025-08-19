package com.ipter.dto;

import java.util.List;
import java.util.UUID;

/**
 * DTO for PDF processing response
 */
public class ProcessPdfResponse {
    
    private UUID projectId;
    private String projectName;
    private boolean success;
    private String message;
    private int extractedCount;
    private List<String> extractedContainerNumbers;
    private List<String> errors;
    private long processingTimeMs;
    
    // Constructors
    public ProcessPdfResponse() {}
    
    public ProcessPdfResponse(UUID projectId, String projectName, boolean success, String message) {
        this.projectId = projectId;
        this.projectName = projectName;
        this.success = success;
        this.message = message;
    }
    
    // Getters and Setters
    public UUID getProjectId() { return projectId; }
    public void setProjectId(UUID projectId) { this.projectId = projectId; }
    
    public String getProjectName() { return projectName; }
    public void setProjectName(String projectName) { this.projectName = projectName; }
    
    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }
    
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    
    public int getExtractedCount() { return extractedCount; }
    public void setExtractedCount(int extractedCount) { this.extractedCount = extractedCount; }
    
    public List<String> getExtractedContainerNumbers() { return extractedContainerNumbers; }
    public void setExtractedContainerNumbers(List<String> extractedContainerNumbers) { 
        this.extractedContainerNumbers = extractedContainerNumbers; 
    }
    
    public List<String> getErrors() { return errors; }
    public void setErrors(List<String> errors) { this.errors = errors; }
    
    public long getProcessingTimeMs() { return processingTimeMs; }
    public void setProcessingTimeMs(long processingTimeMs) { this.processingTimeMs = processingTimeMs; }
}
