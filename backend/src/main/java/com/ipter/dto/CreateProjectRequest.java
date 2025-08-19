package com.ipter.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;

/**
 * DTO for creating a new project
 */
public class CreateProjectRequest {
    
    @NotBlank(message = "Project name is required")
    @Size(min = 1, max = 100, message = "Project name must be between 1 and 100 characters")
    private String name;
    
    @Size(max = 500, message = "Description cannot exceed 500 characters")
    private String description;
    
    @Size(max = 100, message = "Shipper name cannot exceed 100 characters")
    private String shipper;
    
    @Size(max = 50, message = "Invoice number cannot exceed 50 characters")
    private String invoice;
    
    @Size(max = 100, message = "Compound name cannot exceed 100 characters")
    private String compound;
    
    private Integer quantity;
    
    @DateTimeFormat(pattern = "yyyy-MM-dd")
    private LocalDate expDate;
    
    @Size(max = 50, message = "Shipment ID cannot exceed 50 characters")
    private String shipmentId;
    
    @Size(max = 50, message = "Package lot cannot exceed 50 characters")
    private String packageLot;
    
    @Size(max = 100, message = "Protocol cannot exceed 100 characters")
    private String protocol;
    
    @Size(max = 100, message = "Site cannot exceed 100 characters")
    private String site;
    
    @DateTimeFormat(pattern = "yyyy-MM-dd")
    private LocalDate invoiceDate;
    
    @Size(max = 1000, message = "Remarks cannot exceed 1000 characters")
    private String remarks;
    
    // Constructors
    public CreateProjectRequest() {}
    
    // Getters and Setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
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
}
