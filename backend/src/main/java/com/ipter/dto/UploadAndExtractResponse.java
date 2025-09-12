package com.ipter.dto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
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

    // New grid-based response structure
    private GridStructure gridStructure;
    private Map<String, Map<String, ContainerPosition>> rowData;

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

    // New getters and setters for grid structure
    public GridStructure getGridStructure() { return gridStructure; }
    public void setGridStructure(GridStructure gridStructure) { this.gridStructure = gridStructure; }
    public Map<String, Map<String, ContainerPosition>> getRowData() { return rowData; }
    public void setRowData(Map<String, Map<String, ContainerPosition>> rowData) { this.rowData = rowData; }

    /**
     * Grid Structure for the response
     */
    public static class GridStructure {
        private int rows;
        private int columns;
        private int totalProducts;

        public GridStructure() {}

        public GridStructure(int rows, int columns, int totalProducts) {
            this.rows = rows;
            this.columns = columns;
            this.totalProducts = totalProducts;
        }

        public int getRows() { return rows; }
        public void setRows(int rows) { this.rows = rows; }
        public int getColumns() { return columns; }
        public void setColumns(int columns) { this.columns = columns; }
        public int getTotalProducts() { return totalProducts; }
        public void setTotalProducts(int totalProducts) { this.totalProducts = totalProducts; }
    }

    /**
     * Container Position for individual grid positions
     */
    public static class ContainerPosition {
        private String number;
        private String confidence;

        public ContainerPosition() {}

        public ContainerPosition(String number, String confidence) {
            this.number = number;
            this.confidence = confidence;
        }

        public String getNumber() { return number; }
        public void setNumber(String number) { this.number = number; }
        public String getConfidence() { return confidence; }
        public void setConfidence(String confidence) { this.confidence = confidence; }
    }
}
