package com.ipter.model;

/**
 * Project status enumeration
 */
public enum ProjectStatus {
    /**
     * Project is active and can accept new images
     */
    ACTIVE,
    
    /**
     * Project is completed
     */
    COMPLETED,
    
    /**
     * Project is archived
     */
    ARCHIVED,
    
    /**
     * Project is deleted (soft delete)
     */
    DELETED
}
