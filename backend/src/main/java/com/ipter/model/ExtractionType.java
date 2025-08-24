package com.ipter.model;

/**
 * Type of text extraction method used
 */
public enum ExtractionType {
    /**
     * Optical Character Recognition
     */
    OCR,
    
    /**
     * Manual text entry
     */
    MANUAL,
    
    /**
     * Barcode/QR code scanning
     */
    BARCODE,
    
    /**
     * Machine learning based extraction
     */
    ML_EXTRACTION,

    CONTAINER_NUMBER
}
