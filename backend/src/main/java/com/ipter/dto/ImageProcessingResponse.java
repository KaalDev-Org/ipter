package com.ipter.dto;

import com.ipter.model.ProcessingStatus;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Response DTO for image processing results
 */
public class ImageProcessingResponse {
    
    private UUID imageId;
    private String originalFilename;
    private ProcessingStatus processingStatus;
    private String extractedText;
    private List<String> containerNumbers;
    private Double confidence;
    private Integer containerNumbersFound;
    private LocalDateTime processedAt;
    private String errorMessage;
    private ProcessingMetadata processingMetadata;
    
    // Constructors
    public ImageProcessingResponse() {}
    
    public ImageProcessingResponse(UUID imageId, String originalFilename, 
                                  ProcessingStatus processingStatus) {
        this.imageId = imageId;
        this.originalFilename = originalFilename;
        this.processingStatus = processingStatus;
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
    
    public ProcessingStatus getProcessingStatus() {
        return processingStatus;
    }
    
    public void setProcessingStatus(ProcessingStatus processingStatus) {
        this.processingStatus = processingStatus;
    }
    
    public String getExtractedText() {
        return extractedText;
    }
    
    public void setExtractedText(String extractedText) {
        this.extractedText = extractedText;
    }
    
    public List<String> getContainerNumbers() {
        return containerNumbers;
    }
    
    public void setContainerNumbers(List<String> containerNumbers) {
        this.containerNumbers = containerNumbers;
    }
    
    public Double getConfidence() {
        return confidence;
    }
    
    public void setConfidence(Double confidence) {
        this.confidence = confidence;
    }
    
    public Integer getContainerNumbersFound() {
        return containerNumbersFound;
    }
    
    public void setContainerNumbersFound(Integer containerNumbersFound) {
        this.containerNumbersFound = containerNumbersFound;
    }
    
    public LocalDateTime getProcessedAt() {
        return processedAt;
    }
    
    public void setProcessedAt(LocalDateTime processedAt) {
        this.processedAt = processedAt;
    }
    
    public String getErrorMessage() {
        return errorMessage;
    }
    
    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }
    
    public ProcessingMetadata getProcessingMetadata() {
        return processingMetadata;
    }
    
    public void setProcessingMetadata(ProcessingMetadata processingMetadata) {
        this.processingMetadata = processingMetadata;
    }
    
    /**
     * Processing metadata inner class
     */
    public static class ProcessingMetadata {
        private Double processingTime;
        private String engine;
        private String engineVersion;
        private List<String> preprocessingApplied;
        
        // Constructors
        public ProcessingMetadata() {}
        
        public ProcessingMetadata(Double processingTime, String engine, 
                                String engineVersion, List<String> preprocessingApplied) {
            this.processingTime = processingTime;
            this.engine = engine;
            this.engineVersion = engineVersion;
            this.preprocessingApplied = preprocessingApplied;
        }
        
        // Getters and Setters
        public Double getProcessingTime() {
            return processingTime;
        }
        
        public void setProcessingTime(Double processingTime) {
            this.processingTime = processingTime;
        }
        
        public String getEngine() {
            return engine;
        }
        
        public void setEngine(String engine) {
            this.engine = engine;
        }
        
        public String getEngineVersion() {
            return engineVersion;
        }
        
        public void setEngineVersion(String engineVersion) {
            this.engineVersion = engineVersion;
        }
        
        public List<String> getPreprocessingApplied() {
            return preprocessingApplied;
        }
        
        public void setPreprocessingApplied(List<String> preprocessingApplied) {
            this.preprocessingApplied = preprocessingApplied;
        }
    }
}
