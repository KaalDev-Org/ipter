package com.ipter.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

import com.ipter.model.Project;
import com.ipter.model.ProjectStatus;

/**
 * DTO for project response
 */
public class ProjectResponse {
    
    private UUID id;
    private String name;
    private String description;
    private ProjectStatus status;
    private String createdByUsername;
    private UUID createdById;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Additional fields from wireframes
    private String shipper;
    private String invoice;
    private String compound;
    private Integer quantity;
    private LocalDate expDate;
    private String shipmentId;
    private String packageLot;
    private String protocol;
    private String site;
    private LocalDate invoiceDate;
    private String remarks;
    
    // Processing status fields
    private boolean masterDataProcessed;
    private int masterDataCount;
    private String exampleContainerNumber;
    private int totalImages;
    private int processedImages;
    private int failedImages;
    private double processingProgress;
    private double masterDataProgress;
    
    // Constructors
    public ProjectResponse() {}
    
    public ProjectResponse(Project project) {
        this.id = project.getId();
        this.name = project.getName();
        this.description = project.getDescription();
        this.status = project.getStatus();
        this.createdByUsername = project.getCreatedBy().getUsername();
        this.createdById = project.getCreatedBy().getId();
        this.createdAt = project.getCreatedAt();
        this.updatedAt = project.getUpdatedAt();
        
        this.shipper = project.getShipper();
        this.invoice = project.getInvoice();
        this.compound = project.getCompound();
        this.quantity = project.getQuantity();
        this.expDate = project.getExpDate();
        this.shipmentId = project.getShipmentId();
        this.packageLot = project.getPackageLot();
        this.protocol = project.getProtocol();
        this.site = project.getSite();
        this.invoiceDate = project.getInvoiceDate();
        this.remarks = project.getRemarks();
        
        this.masterDataProcessed = project.isMasterDataProcessed();
        this.masterDataCount = project.getMasterDataCount();
        this.exampleContainerNumber = project.getExampleContainerNumber();
        this.totalImages = project.getTotalImages();
        this.processedImages = project.getProcessedImages();
        this.failedImages = project.getFailedImages();
        this.processingProgress = project.getProcessingProgress();
        this.masterDataProgress = project.getMasterDataProgress();
    }
    
    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public ProjectStatus getStatus() { return status; }
    public void setStatus(ProjectStatus status) { this.status = status; }
    
    public String getCreatedByUsername() { return createdByUsername; }
    public void setCreatedByUsername(String createdByUsername) { this.createdByUsername = createdByUsername; }
    
    public UUID getCreatedById() { return createdById; }
    public void setCreatedById(UUID createdById) { this.createdById = createdById; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    
    public String getShipper() { return shipper; }
    public void setShipper(String shipper) { this.shipper = shipper; }
    
    public String getInvoice() { return invoice; }
    public void setInvoice(String invoice) { this.invoice = invoice; }
    
    public String getCompound() { return compound; }
    public void setCompound(String compound) { this.compound = compound; }
    
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
    
    public LocalDate getExpDate() { return expDate; }
    public void setExpDate(LocalDate expDate) { this.expDate = expDate; }
    
    public String getShipmentId() { return shipmentId; }
    public void setShipmentId(String shipmentId) { this.shipmentId = shipmentId; }
    
    public String getPackageLot() { return packageLot; }
    public void setPackageLot(String packageLot) { this.packageLot = packageLot; }
    
    public String getProtocol() { return protocol; }
    public void setProtocol(String protocol) { this.protocol = protocol; }
    
    public String getSite() { return site; }
    public void setSite(String site) { this.site = site; }
    
    public LocalDate getInvoiceDate() { return invoiceDate; }
    public void setInvoiceDate(LocalDate invoiceDate) { this.invoiceDate = invoiceDate; }
    
    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
    
    public boolean isMasterDataProcessed() { return masterDataProcessed; }
    public void setMasterDataProcessed(boolean masterDataProcessed) { this.masterDataProcessed = masterDataProcessed; }
    
    public int getMasterDataCount() { return masterDataCount; }
    public void setMasterDataCount(int masterDataCount) { this.masterDataCount = masterDataCount; }

    public String getExampleContainerNumber() { return exampleContainerNumber; }
    public void setExampleContainerNumber(String exampleContainerNumber) { this.exampleContainerNumber = exampleContainerNumber; }

    public int getTotalImages() { return totalImages; }
    public void setTotalImages(int totalImages) { this.totalImages = totalImages; }
    
    public int getProcessedImages() { return processedImages; }
    public void setProcessedImages(int processedImages) { this.processedImages = processedImages; }
    
    public int getFailedImages() { return failedImages; }
    public void setFailedImages(int failedImages) { this.failedImages = failedImages; }
    
    public double getProcessingProgress() { return processingProgress; }
    public void setProcessingProgress(double processingProgress) { this.processingProgress = processingProgress; }
    
    public double getMasterDataProgress() { return masterDataProgress; }
    public void setMasterDataProgress(double masterDataProgress) { this.masterDataProgress = masterDataProgress; }
}
