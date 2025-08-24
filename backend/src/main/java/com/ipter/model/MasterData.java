package com.ipter.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * MasterData entity representing container numbers extracted from PDF files
 */
@Entity
@Table(name = "master_data")
public class MasterData {
    
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;
    
    @NotBlank(message = "Container number is required")
    @Size(max = 100, message = "Container number cannot exceed 100 characters")
    @Column(name = "container_number", nullable = false)
    private String containerNumber;
    
    @Column(name = "line_number")
    private Integer lineNumber; // Line number in the PDF where this was found
    
    @Column(name = "page_number")
    private Integer pageNumber; // Page number in the PDF where this was found
    
    @Column(name = "confidence_score")
    private Double confidenceScore; // Confidence score from PDF extraction
    
    @Column(name = "raw_text")
    private String rawText; // Raw text from PDF before processing
    
    @Column(name = "is_validated")
    private boolean isValidated = false; // Whether this entry has been manually validated
    
    @Column(name = "validation_notes")
    private String validationNotes;
    
    @Column(name = "is_matched")
    private boolean isMatched = false; // Whether this has been matched with image data
    
    @Column(name = "match_count")
    private int matchCount = 0; // How many times this has been matched
    
    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @Column(nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();
    
    // Constructors
    public MasterData() {}
    
    public MasterData(Project project, String containerNumber) {
        this.project = project;
        this.containerNumber = containerNumber;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
    
    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    
    public Project getProject() { return project; }
    public void setProject(Project project) { this.project = project; }
    
    public String getContainerNumber() { return containerNumber; }
    public void setContainerNumber(String containerNumber) { this.containerNumber = containerNumber; }
    
    public Integer getLineNumber() { return lineNumber; }
    public void setLineNumber(Integer lineNumber) { this.lineNumber = lineNumber; }
    
    public Integer getPageNumber() { return pageNumber; }
    public void setPageNumber(Integer pageNumber) { this.pageNumber = pageNumber; }
    
    public Double getConfidenceScore() { return confidenceScore; }
    public void setConfidenceScore(Double confidenceScore) { this.confidenceScore = confidenceScore; }
    
    public String getRawText() { return rawText; }
    public void setRawText(String rawText) { this.rawText = rawText; }
    
    public boolean isValidated() { return isValidated; }
    public void setValidated(boolean validated) { isValidated = validated; }
    
    public String getValidationNotes() { return validationNotes; }
    public void setValidationNotes(String validationNotes) { this.validationNotes = validationNotes; }
    
    public boolean isMatched() { return isMatched; }
    public void setMatched(boolean matched) { isMatched = matched; }
    
    public int getMatchCount() { return matchCount; }
    public void setMatchCount(int matchCount) { this.matchCount = matchCount; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    
    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
    
    // Helper methods
    public void incrementMatchCount() {
        this.matchCount++;
        this.isMatched = true;
    }
}
