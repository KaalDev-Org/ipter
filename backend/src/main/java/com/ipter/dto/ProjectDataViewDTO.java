package com.ipter.dto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * DTO for Project Data View - showing all images in project with comparison to master data
 */
public class ProjectDataViewDTO {
    
    private UUID projectId;
    private String projectName;
    private LocalDateTime createdAt;
    private List<String> masterData;
    private List<ImageDataSummaryDTO> images;
    private ProjectSummaryDTO summary;
    
    public ProjectDataViewDTO() {}
    
    public ProjectDataViewDTO(UUID projectId, String projectName, LocalDateTime createdAt,
                             List<String> masterData, List<ImageDataSummaryDTO> images,
                             ProjectSummaryDTO summary) {
        this.projectId = projectId;
        this.projectName = projectName;
        this.createdAt = createdAt;
        this.masterData = masterData;
        this.images = images;
        this.summary = summary;
    }
    
    // Getters and Setters
    public UUID getProjectId() { return projectId; }
    public void setProjectId(UUID projectId) { this.projectId = projectId; }
    
    public String getProjectName() { return projectName; }
    public void setProjectName(String projectName) { this.projectName = projectName; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public List<String> getMasterData() { return masterData; }
    public void setMasterData(List<String> masterData) { this.masterData = masterData; }
    
    public List<ImageDataSummaryDTO> getImages() { return images; }
    public void setImages(List<ImageDataSummaryDTO> images) { this.images = images; }
    
    public ProjectSummaryDTO getSummary() { return summary; }
    public void setSummary(ProjectSummaryDTO summary) { this.summary = summary; }
    
    /**
     * DTO for individual image data summary in project view
     */
    public static class ImageDataSummaryDTO {
        private UUID imageId;
        private String imageName;
        private String imageUrl;
        private LocalDateTime uploadedAt;
        private List<String> extractedContainers;
        private Map<String, Double> containerConfidences; // container -> confidence

        public ImageDataSummaryDTO() {}

        public ImageDataSummaryDTO(UUID imageId, String imageName, String imageUrl, LocalDateTime uploadedAt,
                                  List<String> extractedContainers, Map<String, Double> containerConfidences) {
            this.imageId = imageId;
            this.imageName = imageName;
            this.imageUrl = imageUrl;
            this.uploadedAt = uploadedAt;
            this.extractedContainers = extractedContainers;
            this.containerConfidences = containerConfidences;
        }
        
        public UUID getImageId() { return imageId; }
        public void setImageId(UUID imageId) { this.imageId = imageId; }
        
        public String getImageName() { return imageName; }
        public void setImageName(String imageName) { this.imageName = imageName; }

        public String getImageUrl() { return imageUrl; }
        public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

        public LocalDateTime getUploadedAt() { return uploadedAt; }
        public void setUploadedAt(LocalDateTime uploadedAt) { this.uploadedAt = uploadedAt; }
        
        public List<String> getExtractedContainers() { return extractedContainers; }
        public void setExtractedContainers(List<String> extractedContainers) { this.extractedContainers = extractedContainers; }
        
        public Map<String, Double> getContainerConfidences() { return containerConfidences; }
        public void setContainerConfidences(Map<String, Double> containerConfidences) { this.containerConfidences = containerConfidences; }
    }
    
    /**
     * DTO for project summary statistics
     */
    public static class ProjectSummaryDTO {
        private int totalMasterSerialNos;
        private int totalExtractedSerialNos;
        private int matchedSerialNos;
        private int unmatchedSerialNos;
        private int duplicateSerialNos;
        
        public ProjectSummaryDTO() {}
        
        public ProjectSummaryDTO(int totalMasterSerialNos, int totalExtractedSerialNos,
                                int matchedSerialNos, int unmatchedSerialNos, int duplicateSerialNos) {
            this.totalMasterSerialNos = totalMasterSerialNos;
            this.totalExtractedSerialNos = totalExtractedSerialNos;
            this.matchedSerialNos = matchedSerialNos;
            this.unmatchedSerialNos = unmatchedSerialNos;
            this.duplicateSerialNos = duplicateSerialNos;
        }
        
        public int getTotalMasterSerialNos() { return totalMasterSerialNos; }
        public void setTotalMasterSerialNos(int totalMasterSerialNos) { this.totalMasterSerialNos = totalMasterSerialNos; }
        
        public int getTotalExtractedSerialNos() { return totalExtractedSerialNos; }
        public void setTotalExtractedSerialNos(int totalExtractedSerialNos) { this.totalExtractedSerialNos = totalExtractedSerialNos; }
        
        public int getMatchedSerialNos() { return matchedSerialNos; }
        public void setMatchedSerialNos(int matchedSerialNos) { this.matchedSerialNos = matchedSerialNos; }
        
        public int getUnmatchedSerialNos() { return unmatchedSerialNos; }
        public void setUnmatchedSerialNos(int unmatchedSerialNos) { this.unmatchedSerialNos = unmatchedSerialNos; }
        
        public int getDuplicateSerialNos() { return duplicateSerialNos; }
        public void setDuplicateSerialNos(int duplicateSerialNos) { this.duplicateSerialNos = duplicateSerialNos; }
    }
}
