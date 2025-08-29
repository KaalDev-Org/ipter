package com.ipter.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.Map;

/**
 * DTO for structured container number extraction results
 * Matches the required JSON format with rows and columns
 */
public class ContainerExtractionResultDTO {
    
    private Map<String, RowData> rows;
    
    // Constructors
    public ContainerExtractionResultDTO() {}
    
    public ContainerExtractionResultDTO(Map<String, RowData> rows) {
        this.rows = rows;
    }
    
    // Getters and Setters
    public Map<String, RowData> getRows() {
        return rows;
    }
    
    public void setRows(Map<String, RowData> rows) {
        this.rows = rows;
    }
    
    // Helper methods to access specific rows
    @JsonProperty("row1")
    public RowData getRow1() {
        return rows != null ? rows.get("row1") : null;
    }
    
    @JsonProperty("row1")
    public void setRow1(RowData row1) {
        if (rows == null) {
            rows = new java.util.HashMap<>();
        }
        rows.put("row1", row1);
    }
    
    @JsonProperty("row2")
    public RowData getRow2() {
        return rows != null ? rows.get("row2") : null;
    }
    
    @JsonProperty("row2")
    public void setRow2(RowData row2) {
        if (rows == null) {
            rows = new java.util.HashMap<>();
        }
        rows.put("row2", row2);
    }
    
    @JsonProperty("row3")
    public RowData getRow3() {
        return rows != null ? rows.get("row3") : null;
    }
    
    @JsonProperty("row3")
    public void setRow3(RowData row3) {
        if (rows == null) {
            rows = new java.util.HashMap<>();
        }
        rows.put("row3", row3);
    }
    
    /**
     * Row data containing container numbers and their confidence levels
     */
    public static class RowData {
        @JsonProperty("1")
        private ContainerEntry entry1;
        
        @JsonProperty("2")
        private ContainerEntry entry2;
        
        @JsonProperty("3")
        private ContainerEntry entry3;
        
        @JsonProperty("4")
        private ContainerEntry entry4;
        
        @JsonProperty("5")
        private ContainerEntry entry5;
        
        // Constructors
        public RowData() {}
        
        // Getters and Setters
        public ContainerEntry getEntry1() {
            return entry1;
        }
        
        public void setEntry1(ContainerEntry entry1) {
            this.entry1 = entry1;
        }
        
        public ContainerEntry getEntry2() {
            return entry2;
        }
        
        public void setEntry2(ContainerEntry entry2) {
            this.entry2 = entry2;
        }
        
        public ContainerEntry getEntry3() {
            return entry3;
        }
        
        public void setEntry3(ContainerEntry entry3) {
            this.entry3 = entry3;
        }
        
        public ContainerEntry getEntry4() {
            return entry4;
        }
        
        public void setEntry4(ContainerEntry entry4) {
            this.entry4 = entry4;
        }
        
        public ContainerEntry getEntry5() {
            return entry5;
        }
        
        public void setEntry5(ContainerEntry entry5) {
            this.entry5 = entry5;
        }
        
        // Helper method to set entry by position
        public void setEntry(int position, String containerNumber, String confidence) {
            ContainerEntry entry = new ContainerEntry(containerNumber, confidence);
            switch (position) {
                case 1: setEntry1(entry); break;
                case 2: setEntry2(entry); break;
                case 3: setEntry3(entry); break;
                case 4: setEntry4(entry); break;
                case 5: setEntry5(entry); break;
                default: throw new IllegalArgumentException("Position must be between 1 and 5");
            }
        }
        
        // Helper method to get entry by position
        public ContainerEntry getEntry(int position) {
            switch (position) {
                case 1: return getEntry1();
                case 2: return getEntry2();
                case 3: return getEntry3();
                case 4: return getEntry4();
                case 5: return getEntry5();
                default: throw new IllegalArgumentException("Position must be between 1 and 5");
            }
        }
    }
    
    /**
     * Container entry with number and confidence
     */
    public static class ContainerEntry {
        private String containerNumber;
        private String confidence;
        
        // Constructors
        public ContainerEntry() {}
        
        public ContainerEntry(String containerNumber, String confidence) {
            this.containerNumber = containerNumber;
            this.confidence = confidence;
        }
        
        // Getters and Setters
        public String getContainerNumber() {
            return containerNumber;
        }
        
        public void setContainerNumber(String containerNumber) {
            this.containerNumber = containerNumber;
        }
        
        public String getConfidence() {
            return confidence;
        }
        
        public void setConfidence(String confidence) {
            this.confidence = confidence;
        }
    }
}
