package com.ipter.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;
import java.util.UUID;

/**
 * DTO for updating serial numbers after user verification
 */
public class SerialNumberUpdateRequest {
    
    @JsonProperty("image_id")
    private UUID imageId;
    
    @JsonProperty("project_id")
    private UUID projectId;
    
    @JsonProperty("updated_serials")
    private List<SerialNumberUpdate> updatedSerials;
    
    // Constructors
    public SerialNumberUpdateRequest() {}
    
    public SerialNumberUpdateRequest(UUID imageId, UUID projectId, List<SerialNumberUpdate> updatedSerials) {
        this.imageId = imageId;
        this.projectId = projectId;
        this.updatedSerials = updatedSerials;
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
    
    public List<SerialNumberUpdate> getUpdatedSerials() {
        return updatedSerials;
    }
    
    public void setUpdatedSerials(List<SerialNumberUpdate> updatedSerials) {
        this.updatedSerials = updatedSerials;
    }
    
    /**
     * Individual serial number update
     */
    public static class SerialNumberUpdate {
        private Integer row;
        private Integer position;
        
        @JsonProperty("serial_number")
        private String serialNumber;
        
        @JsonProperty("is_user_modified")
        private Boolean isUserModified;
        
        private String confidence;
        
        // Constructors
        public SerialNumberUpdate() {}
        
        public SerialNumberUpdate(Integer row, Integer position, String serialNumber, Boolean isUserModified, String confidence) {
            this.row = row;
            this.position = position;
            this.serialNumber = serialNumber;
            this.isUserModified = isUserModified;
            this.confidence = confidence;
        }
        
        // Getters and Setters
        public Integer getRow() {
            return row;
        }
        
        public void setRow(Integer row) {
            this.row = row;
        }
        
        public Integer getPosition() {
            return position;
        }
        
        public void setPosition(Integer position) {
            this.position = position;
        }
        
        public String getSerialNumber() {
            return serialNumber;
        }
        
        public void setSerialNumber(String serialNumber) {
            this.serialNumber = serialNumber;
        }
        
        public Boolean getIsUserModified() {
            return isUserModified;
        }
        
        public void setIsUserModified(Boolean isUserModified) {
            this.isUserModified = isUserModified;
        }
        
        public String getConfidence() {
            return confidence;
        }
        
        public void setConfidence(String confidence) {
            this.confidence = confidence;
        }
    }
}
