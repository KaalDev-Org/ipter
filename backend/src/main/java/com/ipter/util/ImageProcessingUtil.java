package com.ipter.util;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.regex.Pattern;

/**
 * Utility class for image processing and validation
 */
public class ImageProcessingUtil {
    
    private static final Logger logger = LoggerFactory.getLogger(ImageProcessingUtil.class);
    
    // Supported image MIME types
    public static final List<String> SUPPORTED_MIME_TYPES = Arrays.asList(
        "image/jpeg",
        "image/jpg", 
        "image/png",
        "image/tiff",
        "image/bmp",
        "image/webp"
    );
    
    // Container number patterns (ISO 6346 standard)
    private static final Pattern CONTAINER_PATTERN_STRICT = Pattern.compile(
        "^[A-Z]{4}[0-9]{7}$", Pattern.CASE_INSENSITIVE
    );
    
    private static final Pattern CONTAINER_PATTERN_FLEXIBLE = Pattern.compile(
        "\\b[A-Z]{3,4}[UJZ]?[0-9]{6,7}\\b", Pattern.CASE_INSENSITIVE
    );
    
    /**
     * Validate if the MIME type is supported for image processing
     */
    public static boolean isSupportedImageType(String mimeType) {
        if (mimeType == null) {
            return false;
        }
        return SUPPORTED_MIME_TYPES.contains(mimeType.toLowerCase());
    }
    
    /**
     * Get image dimensions from byte array
     */
    public static ImageDimensions getImageDimensions(byte[] imageBytes) {
        try {
            BufferedImage image = ImageIO.read(new ByteArrayInputStream(imageBytes));
            if (image != null) {
                return new ImageDimensions(image.getWidth(), image.getHeight());
            }
        } catch (IOException e) {
            logger.warn("Failed to read image dimensions: {}", e.getMessage());
        }
        return null;
    }
    
    /**
     * Validate container number format (strict ISO 6346)
     */
    public static boolean isValidContainerNumberStrict(String containerNumber) {
        if (containerNumber == null || containerNumber.trim().isEmpty()) {
            return false;
        }
        
        String cleanNumber = containerNumber.trim().toUpperCase();
        return CONTAINER_PATTERN_STRICT.matcher(cleanNumber).matches();
    }
    
    /**
     * Validate container number format (flexible matching)
     */
    public static boolean isValidContainerNumberFlexible(String containerNumber) {
        if (containerNumber == null || containerNumber.trim().isEmpty()) {
            return false;
        }
        
        String cleanNumber = containerNumber.trim().toUpperCase();
        return CONTAINER_PATTERN_FLEXIBLE.matcher(cleanNumber).matches();
    }
    
    /**
     * Clean and normalize container number
     */
    public static String normalizeContainerNumber(String containerNumber) {
        if (containerNumber == null) {
            return null;
        }
        
        // Remove whitespace and convert to uppercase
        String cleaned = containerNumber.trim().toUpperCase();
        
        // Remove common separators
        cleaned = cleaned.replaceAll("[\\s\\-_]", "");
        
        return cleaned;
    }
    
    /**
     * Calculate confidence score based on container number format
     */
    public static double calculateContainerNumberConfidence(String containerNumber) {
        if (containerNumber == null || containerNumber.trim().isEmpty()) {
            return 0.0;
        }
        
        String normalized = normalizeContainerNumber(containerNumber);
        
        // Strict ISO 6346 format gets highest confidence
        if (isValidContainerNumberStrict(normalized)) {
            return 95.0;
        }
        
        // Flexible format gets medium confidence
        if (isValidContainerNumberFlexible(normalized)) {
            return 75.0;
        }
        
        // Check if it looks like a container number (4 letters + digits)
        if (normalized.matches("^[A-Z]{4}[0-9]+$")) {
            return 50.0;
        }
        
        // Check if it has some container-like characteristics
        if (normalized.matches("^[A-Z]{3,4}[0-9]{6,8}$")) {
            return 30.0;
        }
        
        return 10.0; // Very low confidence for anything else
    }
    
    /**
     * Validate image file size
     */
    public static boolean isValidImageSize(long fileSizeBytes, long maxSizeBytes) {
        return fileSizeBytes > 0 && fileSizeBytes <= maxSizeBytes;
    }
    
    /**
     * Get appropriate MIME type for Gemini API based on file content type
     */
    public static String getGeminiCompatibleMimeType(String originalMimeType) {
        if (originalMimeType == null) {
            return "image/jpeg"; // Default fallback
        }
        
        String lowerType = originalMimeType.toLowerCase();
        
        // Map to Gemini-supported types
        switch (lowerType) {
            case "image/jpg":
                return "image/jpeg";
            case "image/jpeg":
            case "image/png":
            case "image/webp":
                return lowerType;
            case "image/tiff":
            case "image/bmp":
                // These might need conversion, but for now return as-is
                return lowerType;
            default:
                logger.warn("Unknown MIME type {}, defaulting to image/jpeg", originalMimeType);
                return "image/jpeg";
        }
    }
    
    /**
     * Image dimensions data class
     */
    public static class ImageDimensions {
        private final int width;
        private final int height;
        
        public ImageDimensions(int width, int height) {
            this.width = width;
            this.height = height;
        }
        
        public int getWidth() {
            return width;
        }
        
        public int getHeight() {
            return height;
        }
        
        public long getPixelCount() {
            return (long) width * height;
        }
        
        public double getAspectRatio() {
            return height == 0 ? 0 : (double) width / height;
        }
        
        @Override
        public String toString() {
            return String.format("%dx%d", width, height);
        }
    }
}
