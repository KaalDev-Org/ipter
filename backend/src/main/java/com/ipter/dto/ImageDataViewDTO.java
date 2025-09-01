package com.ipter.dto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * DTO for Image Data View - comparing single image data with master data
 */
public class ImageDataViewDTO {
    
    private UUID imageId;
    private String imageName;
    private LocalDateTime uploadedAt;
    private List<String> masterData;
    private List<ExtractedContainerDTO> extractedData;
    
    public ImageDataViewDTO() {}
    
    public ImageDataViewDTO(UUID imageId, String imageName, LocalDateTime uploadedAt,
                           List<String> masterData, List<ExtractedContainerDTO> extractedData) {
        this.imageId = imageId;
        this.imageName = imageName;
        this.uploadedAt = uploadedAt;
        this.masterData = masterData;
        this.extractedData = extractedData;
    }
    
    // Getters and Setters
    public UUID getImageId() { return imageId; }
    public void setImageId(UUID imageId) { this.imageId = imageId; }
    
    public String getImageName() { return imageName; }
    public void setImageName(String imageName) { this.imageName = imageName; }
    
    public LocalDateTime getUploadedAt() { return uploadedAt; }
    public void setUploadedAt(LocalDateTime uploadedAt) { this.uploadedAt = uploadedAt; }
    
    public List<String> getMasterData() { return masterData; }
    public void setMasterData(List<String> masterData) { this.masterData = masterData; }
    
    public List<ExtractedContainerDTO> getExtractedData() { return extractedData; }
    public void setExtractedData(List<ExtractedContainerDTO> extractedData) { this.extractedData = extractedData; }
    
    /**
     * DTO for extracted container data
     */
    public static class ExtractedContainerDTO {
        private String containerNumber;
        private Double confidence;
        private boolean isMatched; // Whether it matches master data
        
        public ExtractedContainerDTO() {}
        
        public ExtractedContainerDTO(String containerNumber, Double confidence, boolean isMatched) {
            this.containerNumber = containerNumber;
            this.confidence = confidence;
            this.isMatched = isMatched;
        }
        
        public String getContainerNumber() { return containerNumber; }
        public void setContainerNumber(String containerNumber) { this.containerNumber = containerNumber; }
        
        public Double getConfidence() { return confidence; }
        public void setConfidence(Double confidence) { this.confidence = confidence; }
        
        public boolean isMatched() { return isMatched; }
        public void setMatched(boolean matched) { isMatched = matched; }
    }
}
