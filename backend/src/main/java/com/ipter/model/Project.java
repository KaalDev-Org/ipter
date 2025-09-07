package com.ipter.model;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Project entity representing image processing projects
 */
@Entity
@Table(name = "projects")
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @NotBlank(message = "Project name is required")
    @Size(min = 1, max = 100, message = "Project name must be between 1 and 100 characters")
    @Column(nullable = false)
    private String name;

    @Size(max = 500, message = "Description cannot exceed 500 characters")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProjectStatus status = ProjectStatus.ACTIVE;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Image> images = new ArrayList<>();

    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<MasterData> masterData = new ArrayList<>();

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    // Additional fields from wireframes
    @Size(max = 100, message = "Shipper name cannot exceed 100 characters")
    private String shipper;

    @Size(max = 50, message = "Invoice number cannot exceed 50 characters")
    private String invoice;

    @Size(max = 100, message = "Compound name cannot exceed 100 characters")
    private String compound;

    private Integer quantity;

    @Column(name = "exp_date")
    private LocalDate expDate;

    @Size(max = 50, message = "Shipment ID cannot exceed 50 characters")
    @Column(name = "shipment_id")
    private String shipmentId;

    @Size(max = 50, message = "Package lot cannot exceed 50 characters")
    @Column(name = "package_lot")
    private String packageLot;

    @Size(max = 100, message = "Protocol cannot exceed 100 characters")
    private String protocol;

    @Size(max = 100, message = "Site cannot exceed 100 characters")
    private String site;

    @Column(name = "invoice_dt")
    private LocalDate invoiceDate;

    @Size(max = 1000, message = "Remarks cannot exceed 1000 characters")
    private String remarks;

    // PDF file path for master data
    @Size(max = 500, message = "PDF file path cannot exceed 500 characters")
    @Column(name = "pdf_file_path")
    private String pdfFilePath;

    // Master data processing status
    @Column(name = "master_data_processed")
    private boolean masterDataProcessed = false;

    @Column(name = "master_data_count")
    private int masterDataCount = 0;

    // Example container number to help improve Gemini extraction accuracy
    @Size(max = 50, message = "Example container number cannot exceed 50 characters")
    @Column(name = "example_container_number")
    private String exampleContainerNumber;

    // Statistics fields
    private int totalImages = 0;
    private int processedImages = 0;
    private int failedImages = 0;
    
    // Constructors
    public Project() {}
    
    public Project(String name, String description, User createdBy) {
        this.name = name;
        this.description = description;
        this.createdBy = createdBy;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
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
    
    public User getCreatedBy() { return createdBy; }
    public void setCreatedBy(User createdBy) { this.createdBy = createdBy; }
    
    public List<Image> getImages() { return images; }
    public void setImages(List<Image> images) { this.images = images; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    
    public int getTotalImages() { return totalImages; }
    public void setTotalImages(int totalImages) { this.totalImages = totalImages; }
    
    public int getProcessedImages() { return processedImages; }
    public void setProcessedImages(int processedImages) { this.processedImages = processedImages; }
    
    public int getFailedImages() { return failedImages; }
    public void setFailedImages(int failedImages) { this.failedImages = failedImages; }

    public List<MasterData> getMasterData() { return masterData; }
    public void setMasterData(List<MasterData> masterData) { this.masterData = masterData; }

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

    public String getPdfFilePath() { return pdfFilePath; }
    public void setPdfFilePath(String pdfFilePath) { this.pdfFilePath = pdfFilePath; }

    public boolean isMasterDataProcessed() { return masterDataProcessed; }
    public void setMasterDataProcessed(boolean masterDataProcessed) { this.masterDataProcessed = masterDataProcessed; }

    public int getMasterDataCount() { return masterDataCount; }
    public void setMasterDataCount(int masterDataCount) { this.masterDataCount = masterDataCount; }

    public String getExampleContainerNumber() { return exampleContainerNumber; }
    public void setExampleContainerNumber(String exampleContainerNumber) { this.exampleContainerNumber = exampleContainerNumber; }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // Helper methods
    public void addImage(Image image) {
        images.add(image);
        image.setProject(this);
        this.totalImages = images.size();
    }

    public void removeImage(Image image) {
        images.remove(image);
        image.setProject(null);
        this.totalImages = images.size();
    }

    public void addMasterData(MasterData data) {
        masterData.add(data);
        data.setProject(this);
        this.masterDataCount = masterData.size();
    }

    public void removeMasterData(MasterData data) {
        masterData.remove(data);
        data.setProject(null);
        this.masterDataCount = masterData.size();
    }

    public double getProcessingProgress() {
        if (totalImages == 0) return 0.0;
        return (double) processedImages / totalImages * 100.0;
    }

    public double getMasterDataProgress() {
        if (masterDataCount == 0) return 0.0;
        long matchedCount = masterData.stream().mapToLong(md -> md.isMatched() ? 1 : 0).sum();
        return (double) matchedCount / masterDataCount * 100.0;
    }
}
