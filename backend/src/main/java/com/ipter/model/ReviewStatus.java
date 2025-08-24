package com.ipter.model;

/**
 * Enum for audit log review status
 */
public enum ReviewStatus {
    PENDING("Pending Review"),
    REVIEWED("Reviewed"),
    FLAGGED("Flagged for Attention"),
    APPROVED("Approved"),
    REJECTED("Rejected");
    
    private final String displayName;
    
    ReviewStatus(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    @Override
    public String toString() {
        return displayName;
    }
}
