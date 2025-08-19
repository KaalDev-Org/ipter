package com.ipter.dto;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

/**
 * DTO for processing PDF files to extract master data
 */
public class ProcessPdfRequest {
    
    @NotNull(message = "Project ID is required")
    private UUID projectId;
    
    private String pdfFilePath; // Optional - if not provided, will use project's PDF file
    
    private boolean forceReprocess = false; // Whether to reprocess even if already processed
    
    // Constructors
    public ProcessPdfRequest() {}
    
    public ProcessPdfRequest(UUID projectId) {
        this.projectId = projectId;
    }
    
    public ProcessPdfRequest(UUID projectId, String pdfFilePath) {
        this.projectId = projectId;
        this.pdfFilePath = pdfFilePath;
    }
    
    // Getters and Setters
    public UUID getProjectId() { return projectId; }
    public void setProjectId(UUID projectId) { this.projectId = projectId; }
    
    public String getPdfFilePath() { return pdfFilePath; }
    public void setPdfFilePath(String pdfFilePath) { this.pdfFilePath = pdfFilePath; }
    
    public boolean isForceReprocess() { return forceReprocess; }
    public void setForceReprocess(boolean forceReprocess) { this.forceReprocess = forceReprocess; }
}
