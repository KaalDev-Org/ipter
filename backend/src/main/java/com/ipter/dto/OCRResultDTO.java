package com.ipter.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO for OCR results from Python AI service
 * Maps to the OCRResult model from Python service
 */
public class OCRResultDTO {
    
    private String filename;
    
    @JsonProperty("extracted_text")
    private String extractedText;
    
    @JsonProperty("container_numbers")
    private List<ContainerNumberDTO> containerNumbers;
    
    private Double confidence;
    
    @JsonProperty("bounding_boxes")
    private List<BoundingBoxDTO> boundingBoxes;
    
    @JsonProperty("image_metadata")
    private ImageMetadataDTO imageMetadata;
    
    @JsonProperty("processing_metadata")
    private ProcessingMetadataDTO processingMetadata;
    
    private Boolean success;
    
    @JsonProperty("error_message")
    private String errorMessage;
    
    // Constructors
    public OCRResultDTO() {}
    
    // Getters and Setters
    public String getFilename() {
        return filename;
    }
    
    public void setFilename(String filename) {
        this.filename = filename;
    }
    
    public String getExtractedText() {
        return extractedText;
    }
    
    public void setExtractedText(String extractedText) {
        this.extractedText = extractedText;
    }
    
    public List<ContainerNumberDTO> getContainerNumbers() {
        return containerNumbers;
    }
    
    public void setContainerNumbers(List<ContainerNumberDTO> containerNumbers) {
        this.containerNumbers = containerNumbers;
    }
    
    public Double getConfidence() {
        return confidence;
    }
    
    public void setConfidence(Double confidence) {
        this.confidence = confidence;
    }
    
    public List<BoundingBoxDTO> getBoundingBoxes() {
        return boundingBoxes;
    }
    
    public void setBoundingBoxes(List<BoundingBoxDTO> boundingBoxes) {
        this.boundingBoxes = boundingBoxes;
    }
    
    public ImageMetadataDTO getImageMetadata() {
        return imageMetadata;
    }
    
    public void setImageMetadata(ImageMetadataDTO imageMetadata) {
        this.imageMetadata = imageMetadata;
    }
    
    public ProcessingMetadataDTO getProcessingMetadata() {
        return processingMetadata;
    }
    
    public void setProcessingMetadata(ProcessingMetadataDTO processingMetadata) {
        this.processingMetadata = processingMetadata;
    }
    
    public Boolean getSuccess() {
        return success;
    }
    
    public void setSuccess(Boolean success) {
        this.success = success;
    }
    
    public String getErrorMessage() {
        return errorMessage;
    }
    
    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }
    
    /**
     * Container Number DTO
     */
    public static class ContainerNumberDTO {
        private String number;
        private Double confidence;
        
        @JsonProperty("bounding_box")
        private BoundingBoxDTO boundingBox;
        
        @JsonProperty("validation_status")
        private String validationStatus;
        
        // Constructors
        public ContainerNumberDTO() {}
        
        // Getters and Setters
        public String getNumber() {
            return number;
        }
        
        public void setNumber(String number) {
            this.number = number;
        }
        
        public Double getConfidence() {
            return confidence;
        }
        
        public void setConfidence(Double confidence) {
            this.confidence = confidence;
        }
        
        public BoundingBoxDTO getBoundingBox() {
            return boundingBox;
        }
        
        public void setBoundingBox(BoundingBoxDTO boundingBox) {
            this.boundingBox = boundingBox;
        }
        
        public String getValidationStatus() {
            return validationStatus;
        }
        
        public void setValidationStatus(String validationStatus) {
            this.validationStatus = validationStatus;
        }
    }
    
    /**
     * Bounding Box DTO
     */
    public static class BoundingBoxDTO {
        private Integer x;
        private Integer y;
        private Integer width;
        private Integer height;
        private Double confidence;
        
        // Constructors
        public BoundingBoxDTO() {}
        
        // Getters and Setters
        public Integer getX() {
            return x;
        }
        
        public void setX(Integer x) {
            this.x = x;
        }
        
        public Integer getY() {
            return y;
        }
        
        public void setY(Integer y) {
            this.y = y;
        }
        
        public Integer getWidth() {
            return width;
        }
        
        public void setWidth(Integer width) {
            this.width = width;
        }
        
        public Integer getHeight() {
            return height;
        }
        
        public void setHeight(Integer height) {
            this.height = height;
        }
        
        public Double getConfidence() {
            return confidence;
        }
        
        public void setConfidence(Double confidence) {
            this.confidence = confidence;
        }
    }
    
    /**
     * Image Metadata DTO
     */
    public static class ImageMetadataDTO {
        private Integer width;
        private Integer height;
        private Integer channels;
        private String format;
        
        @JsonProperty("file_size")
        private Integer fileSize;
        
        @JsonProperty("color_space")
        private String colorSpace;
        
        // Constructors
        public ImageMetadataDTO() {}
        
        // Getters and Setters
        public Integer getWidth() {
            return width;
        }
        
        public void setWidth(Integer width) {
            this.width = width;
        }
        
        public Integer getHeight() {
            return height;
        }
        
        public void setHeight(Integer height) {
            this.height = height;
        }
        
        public Integer getChannels() {
            return channels;
        }
        
        public void setChannels(Integer channels) {
            this.channels = channels;
        }
        
        public String getFormat() {
            return format;
        }
        
        public void setFormat(String format) {
            this.format = format;
        }
        
        public Integer getFileSize() {
            return fileSize;
        }
        
        public void setFileSize(Integer fileSize) {
            this.fileSize = fileSize;
        }
        
        public String getColorSpace() {
            return colorSpace;
        }
        
        public void setColorSpace(String colorSpace) {
            this.colorSpace = colorSpace;
        }
    }
    
    /**
     * Processing Metadata DTO
     */
    public static class ProcessingMetadataDTO {
        @JsonProperty("processing_time")
        private Double processingTime;
        
        private String engine;
        
        @JsonProperty("engine_version")
        private String engineVersion;
        
        @JsonProperty("preprocessing_applied")
        private List<String> preprocessingApplied;
        
        private LocalDateTime timestamp;
        
        // Constructors
        public ProcessingMetadataDTO() {}
        
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
        
        public LocalDateTime getTimestamp() {
            return timestamp;
        }
        
        public void setTimestamp(LocalDateTime timestamp) {
            this.timestamp = timestamp;
        }
    }
}
