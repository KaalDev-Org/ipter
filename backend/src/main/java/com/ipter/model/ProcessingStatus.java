package com.ipter.model;

/**
 * Processing status for images
 */
public enum ProcessingStatus {
    /**
     * Image uploaded but not yet processed
     */
    PENDING,
    
    /**
     * Image is currently being processed
     */
    PROCESSING,
    
    /**
     * Image processing completed successfully
     */
    COMPLETED,
    
    /**
     * Image processing failed
     */
    FAILED,
    
    /**
     * Image processing was cancelled
     */
    CANCELLED
}
