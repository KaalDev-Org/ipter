package com.ipter.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * ExtractedData entity representing OCR results from image processing
 */
@Entity
@Table(name = "extracted_data")
public class ExtractedData {
    
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "image_id", nullable = false)
    private Image image;
    
    @Column(columnDefinition = "TEXT")
    private String extractedText;
    
    @Column
    private String containerNumber;
    
    @NotNull
    @Column(nullable = false)
    private Double confidence = 0.0;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ExtractionType extractionType = ExtractionType.OCR;
    
    // Bounding box coordinates for the extracted text
    private Integer boundingBoxX;
    private Integer boundingBoxY;
    private Integer boundingBoxWidth;
    private Integer boundingBoxHeight;
    
    @Column(nullable = false)
    private LocalDateTime extractedAt = LocalDateTime.now();
    
    @Column
    private String processingEngine; // e.g., "Tesseract", "PaddleOCR"
    
    @Column
    private String processingVersion;
    
    // Validation status
    @Enumerated(EnumType.STRING)
    private ValidationStatus validationStatus = ValidationStatus.PENDING;
    
    @Column
    private String validationNotes;
    
    // Constructors
    public ExtractedData() {}
    
    public ExtractedData(Image image, String extractedText, String containerNumber, 
                        Double confidence, ExtractionType extractionType) {
        this.image = image;
        this.extractedText = extractedText;
        this.containerNumber = containerNumber;
        this.confidence = confidence;
        this.extractionType = extractionType;
        this.extractedAt = LocalDateTime.now();
    }
    
    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    
    public Image getImage() { return image; }
    public void setImage(Image image) { this.image = image; }
    
    public String getExtractedText() { return extractedText; }
    public void setExtractedText(String extractedText) { this.extractedText = extractedText; }
    
    public String getContainerNumber() { return containerNumber; }
    public void setContainerNumber(String containerNumber) { this.containerNumber = containerNumber; }
    
    public Double getConfidence() { return confidence; }
    public void setConfidence(Double confidence) { this.confidence = confidence; }
    
    public ExtractionType getExtractionType() { return extractionType; }
    public void setExtractionType(ExtractionType extractionType) { this.extractionType = extractionType; }
    
    public Integer getBoundingBoxX() { return boundingBoxX; }
    public void setBoundingBoxX(Integer boundingBoxX) { this.boundingBoxX = boundingBoxX; }
    
    public Integer getBoundingBoxY() { return boundingBoxY; }
    public void setBoundingBoxY(Integer boundingBoxY) { this.boundingBoxY = boundingBoxY; }
    
    public Integer getBoundingBoxWidth() { return boundingBoxWidth; }
    public void setBoundingBoxWidth(Integer boundingBoxWidth) { this.boundingBoxWidth = boundingBoxWidth; }
    
    public Integer getBoundingBoxHeight() { return boundingBoxHeight; }
    public void setBoundingBoxHeight(Integer boundingBoxHeight) { this.boundingBoxHeight = boundingBoxHeight; }
    
    public LocalDateTime getExtractedAt() { return extractedAt; }
    public void setExtractedAt(LocalDateTime extractedAt) { this.extractedAt = extractedAt; }
    
    public String getProcessingEngine() { return processingEngine; }
    public void setProcessingEngine(String processingEngine) { this.processingEngine = processingEngine; }
    
    public String getProcessingVersion() { return processingVersion; }
    public void setProcessingVersion(String processingVersion) { this.processingVersion = processingVersion; }
    
    public ValidationStatus getValidationStatus() { return validationStatus; }
    public void setValidationStatus(ValidationStatus validationStatus) { this.validationStatus = validationStatus; }
    
    public String getValidationNotes() { return validationNotes; }
    public void setValidationNotes(String validationNotes) { this.validationNotes = validationNotes; }
}
