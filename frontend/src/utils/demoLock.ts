/**
 * Demo Lock System - Simple and secure frontend demo expiration
 * Easy to configure, tamper-resistant demo protection
 */

// ===== DEMO CONFIGURATION =====
// To change the expiry date, modify these values:
const DEMO_YEAR = 2025;
const DEMO_MONTH = 11; // September (1-12)
const DEMO_DAY = 30;
const GRACE_PERIOD_DAYS = 1;

// Backup timestamp for validation
const DEMO_TIMESTAMP = 1726520940000; // Sep 16, 2025 23:59:00.000

interface DemoStatus {
  isExpired: boolean;
  isInGracePeriod: boolean;
  daysUntilExpiry: number;
  expiryDate: Date;
  currentDate: Date;
  message: string;
  canAccess: boolean;
}

// Get the demo expiry date
const getExpiryDate = (): Date => {
  try {
    // Primary calculation
    const expiryDate = new Date(DEMO_YEAR, DEMO_MONTH - 1, DEMO_DAY, 23, 59, 59, 999);

    // Validation: ensure the date is reasonable
    if (expiryDate.getFullYear() === DEMO_YEAR &&
        expiryDate.getMonth() === DEMO_MONTH - 1 &&
        expiryDate.getDate() === DEMO_DAY) {
      return expiryDate;
    }

    // Fallback: use timestamp
    return new Date(DEMO_TIMESTAMP);

  } catch (error) {
    console.error('Demo date calculation failed:', error);
    // Hard-coded fail-safe
    return new Date(2026, 9, 31, 23, 59, 59, 999);
  }
};

// Calculate demo status
const getDemoStatus = (): DemoStatus => {
  try {
    const currentDate = new Date();
    const expiryDate = getExpiryDate();
    const timeDiff = expiryDate.getTime() - currentDate.getTime();
    const daysUntilExpiry = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

    const isExpired = currentDate > expiryDate;
    const isInGracePeriod = !isExpired && daysUntilExpiry <= GRACE_PERIOD_DAYS;

    let message: string;
    if (isExpired) {
      const daysExpired = Math.ceil((currentDate.getTime() - expiryDate.getTime()) / (1000 * 60 * 60 * 24));
      message = `Demo expired ${daysExpired} day${daysExpired !== 1 ? 's' : ''} ago`;
    } else if (isInGracePeriod) {
      message = `Demo expires in ${daysUntilExpiry} day${daysUntilExpiry !== 1 ? 's' : ''} (grace period)`;
    } else {
      message = `Demo expires in ${daysUntilExpiry} day${daysUntilExpiry !== 1 ? 's' : ''}`;
    }

    return {
      isExpired,
      isInGracePeriod,
      daysUntilExpiry,
      expiryDate,
      currentDate,
      message,
      canAccess: !isExpired
    };
  } catch (error) {
    console.error('Demo status calculation failed:', error);
    // Fail-safe: consider demo expired on any error
    return {
      isExpired: true,
      isInGracePeriod: false,
      daysUntilExpiry: -1,
      expiryDate: getExpiryDate(),
      currentDate: new Date(),
      message: 'Demo access verification failed',
      canAccess: false
    };
  }
};

// Check if access is allowed
const isAccessAllowed = (): boolean => {
  try {
    const status = getDemoStatus();
    return status.canAccess;
  } catch (error) {
    console.error('Demo access check failed:', error);
    // Fail-safe: deny access on any error
    return false;
  }
};

// Simple tamper detection
const performBasicChecks = (): void => {
  try {
    // Check if date seems reasonable
    const currentYear = new Date().getFullYear();
    if (currentYear < 2024 || currentYear > 2030) {
      console.warn('Suspicious system date detected');
    }

    // Basic environment check
    if (typeof window === 'undefined') {
      console.warn('Invalid environment detected');
    }
  } catch (error) {
    console.warn('Basic security checks failed:', error);
  }
};

// Initialize basic checks
performBasicChecks();

// Demo lock object with simple interface
export const demoLock = {
  getDemoStatus,
  isAccessAllowed,
  getExpiryDate
};

// Export types
export type { DemoStatus };

// Utility functions for convenience
export const isDemoExpired = (): boolean => {
  try {
    return getDemoStatus().isExpired;
  } catch {
    return true; // Fail-safe
  }
};

export const isDemoInGracePeriod = (): boolean => {
  try {
    return getDemoStatus().isInGracePeriod;
  } catch {
    return false; // Fail-safe
  }
};

export const getDemoExpiryDate = (): Date => {
  try {
    return getExpiryDate();
  } catch {
    return new Date(2026, 9, 31, 23, 59, 59, 999); // Fail-safe
  }
};

export const canAccessDemo = (): boolean => {
  try {
    return isAccessAllowed();
  } catch {
    return false; // Fail-safe
  }
};
