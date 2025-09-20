/**
 * Demo Configuration
 * Centralized configuration for demo expiration and settings
 *
 * EASY CONFIGURATION: To change the demo expiry date, modify the values below.
 * The system will automatically use these values across the application.
 */

// ===== DEMO EXPIRY CONFIGURATION =====
// Change these values to modify the demo expiration date
export const DEMO_CONFIG = {
  // Demo expiry date: October 31, 2026
  EXPIRY_YEAR: 2025,
  EXPIRY_MONTH: 11, // September (1-12)
  EXPIRY_DAY: 30,
  
  // Grace period settings
  GRACE_PERIOD_DAYS: 7,
  WARNING_THRESHOLD_DAYS: 30,
  
  // Demo information
  APPLICATION_NAME: 'IPTER - Image Processing and Text Extraction for Retail',
  VERSION: 'Demo Version 1.0',
  VENDOR: 'Zuellig Pharma',
  
  // Contact information
  CONTACT: {
    COMPANY: 'Zuellig Pharma',
    WEBSITE: 'https://www.zuelligpharma.com',
    EMAIL: 'info@zuelligpharma.com'
  },
  
  // Features available in demo
  FEATURES: [
    'PDF Master Data Processing',
    'Image Container Detection',
    'Serial Number Extraction',
    'Data Verification',
    'Audit Trail',
    'User Management',
    'Project Management'
  ],
  
  // Demo limitations
  LIMITATIONS: [
    'Demo expires on October 31, 2026',
    'For evaluation purposes only',
    'Contact Zuellig Pharma for full license'
  ],
  
  // Security settings
  SECURITY: {
    ENABLE_TAMPER_PROTECTION: true,
    ENABLE_DEV_TOOLS_DETECTION: true,
    ENABLE_CONSOLE_PROTECTION: true,
    ENABLE_WATERMARK: true,
    CHECK_INTERVAL_MS: 60000, // 1 minute
  }
} as const;

// Utility functions
export const getDemoExpiryDate = (): Date => {
  return new Date(
    DEMO_CONFIG.EXPIRY_YEAR,
    DEMO_CONFIG.EXPIRY_MONTH - 1, // JavaScript months are 0-based
    DEMO_CONFIG.EXPIRY_DAY,
    23, 59, 59, 999 // End of day
  );
};

export const getDaysUntilExpiry = (): number => {
  const now = new Date();
  const expiryDate = getDemoExpiryDate();
  const timeDiff = expiryDate.getTime() - now.getTime();
  return Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
};

export const isDemoExpired = (): boolean => {
  return getDaysUntilExpiry() < 0;
};

export const isInGracePeriod = (): boolean => {
  const daysUntilExpiry = getDaysUntilExpiry();
  return !isDemoExpired() && daysUntilExpiry <= DEMO_CONFIG.GRACE_PERIOD_DAYS;
};

export const shouldShowWarning = (): boolean => {
  const daysUntilExpiry = getDaysUntilExpiry();
  return !isDemoExpired() && daysUntilExpiry <= DEMO_CONFIG.WARNING_THRESHOLD_DAYS;
};

// Export type for TypeScript
export type DemoConfig = typeof DEMO_CONFIG;
