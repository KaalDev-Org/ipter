package com.ipter.dto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public class UploadAndExtractResponse {
    private UUID imageId;
    private UUID projectId;
    private String imageName;
    private LocalDateTime uploadedAt;
    private boolean success;
    private String message;
    private String extractedText;
    private List<OCRResultDTO.ContainerNumberDTO> containerNumbers;
    private Double confidence;

    public UUID getImageId() { return imageId; }
    public void setImageId(UUID imageId) { this.imageId = imageId; }
    public UUID getProjectId() { return projectId; }
    public void setProjectId(UUID projectId) { this.projectId = projectId; }
    public String getImageName() { return imageName; }
    public void setImageName(String imageName) { this.imageName = imageName; }
    public LocalDateTime getUploadedAt() { return uploadedAt; }
    public void setUploadedAt(LocalDateTime uploadedAt) { this.uploadedAt = uploadedAt; }
    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public String getExtractedText() { return extractedText; }
    public void setExtractedText(String extractedText) { this.extractedText = extractedText; }
    public List<OCRResultDTO.ContainerNumberDTO> getContainerNumbers() { return containerNumbers; }
    public void setContainerNumbers(List<OCRResultDTO.ContainerNumberDTO> containerNumbers) { this.containerNumbers = containerNumbers; }
    public Double getConfidence() { return confidence; }
    public void setConfidence(Double confidence) { this.confidence = confidence; }
}
