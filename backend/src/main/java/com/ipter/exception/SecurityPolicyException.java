package com.ipter.exception;

/**
 * Custom exception for security policy violations (e.g., non-admin access)
 * This is different from authentication failures (wrong password)
 */
public class SecurityPolicyException extends RuntimeException {

    public SecurityPolicyException(String message) {
        super(message);
    }

    public SecurityPolicyException(String message, Throwable cause) {
        super(message, cause);
    }
}
