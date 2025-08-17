package com.ipter.model;

/**
 * Validation status for extracted data
 */
public enum ValidationStatus {
    /**
     * Validation pending
     */
    PENDING,
    
    /**
     * Data validated and approved
     */
    APPROVED,
    
    /**
     * Data rejected during validation
     */
    REJECTED,
    
    /**
     * Data requires manual review
     */
    NEEDS_REVIEW
}
