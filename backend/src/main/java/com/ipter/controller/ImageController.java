package com.ipter.controller;

import com.ipter.dto.ImageProcessingResponse;
import com.ipter.dto.ImageUploadRequest;
import com.ipter.dto.ImageUploadResponse;
import com.ipter.service.ImageService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * REST Controller for image upload and processing operations
 */
@RestController
@RequestMapping("/api/images")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:8080"})
public class ImageController {
    
    private static final Logger logger = LoggerFactory.getLogger(ImageController.class);
    
    @Autowired
    private ImageService imageService;
    
    /**
     * Upload an image for processing
     */
    @PostMapping("/upload")
    @PreAuthorize("hasRole('USER') or hasRole('SUPER_USER') or hasRole('ADMINISTRATOR')")
    public ResponseEntity<?> uploadImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam("projectId") UUID projectId,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "processImmediately", defaultValue = "true") boolean processImmediately) {
        
        try {
            logger.info("Uploading image: {} for project: {}", file.getOriginalFilename(), projectId);
            
            // Create request object
            ImageUploadRequest request = new ImageUploadRequest(projectId, description, processImmediately);
            
            // Upload image
            ImageUploadResponse response = imageService.uploadImage(file, request);
            
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("message", "Image uploaded successfully");
            result.put("data", response);
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            logger.error("Error uploading image: {}", e.getMessage());
            
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    /**
     * Upload image with request body (alternative endpoint)
     */
    @PostMapping("/upload-with-request")
    @PreAuthorize("hasRole('USER') or hasRole('SUPER_USER') or hasRole('ADMINISTRATOR')")
    public ResponseEntity<?> uploadImageWithRequest(
            @RequestParam("file") MultipartFile file,
            @Valid @RequestBody ImageUploadRequest request) {
        
        try {
            logger.info("Uploading image with request: {} for project: {}", 
                       file.getOriginalFilename(), request.getProjectId());
            
            ImageUploadResponse response = imageService.uploadImage(file, request);
            
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("message", "Image uploaded successfully");
            result.put("data", response);
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            logger.error("Error uploading image with request: {}", e.getMessage());
            
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    /**
     * Process an uploaded image
     */
    @PostMapping("/{imageId}/process")
    @PreAuthorize("hasRole('USER') or hasRole('SUPER_USER') or hasRole('ADMINISTRATOR')")
    public ResponseEntity<?> processImage(@PathVariable UUID imageId) {
        try {
            logger.info("Processing image: {}", imageId);
            
            ImageProcessingResponse response = imageService.processImage(imageId);
            
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("message", "Image processed successfully");
            result.put("data", response);
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            logger.error("Error processing image {}: {}", imageId, e.getMessage());
            
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    /**
     * Get image processing status
     */
    @GetMapping("/{imageId}/status")
    @PreAuthorize("hasRole('USER') or hasRole('SUPER_USER') or hasRole('ADMINISTRATOR')")
    public ResponseEntity<?> getImageStatus(@PathVariable UUID imageId) {
        try {
            ImageProcessingResponse response = imageService.getImageStatus(imageId);
            
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("data", response);
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            logger.error("Error getting image status {}: {}", imageId, e.getMessage());
            
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    /**
     * Get all images for a project
     */
    @GetMapping("/project/{projectId}")
    @PreAuthorize("hasRole('USER') or hasRole('SUPER_USER') or hasRole('ADMINISTRATOR')")
    public ResponseEntity<?> getProjectImages(@PathVariable UUID projectId) {
        try {
            List<ImageProcessingResponse> images = imageService.getProjectImages(projectId);
            
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("data", images);
            result.put("count", images.size());
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            logger.error("Error getting project images {}: {}", projectId, e.getMessage());
            
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    /**
     * Reprocess an image (for failed or cancelled images)
     */
    @PostMapping("/{imageId}/reprocess")
    @PreAuthorize("hasRole('SUPER_USER') or hasRole('ADMINISTRATOR')")
    public ResponseEntity<?> reprocessImage(@PathVariable UUID imageId) {
        try {
            logger.info("Reprocessing image: {}", imageId);
            
            ImageProcessingResponse response = imageService.processImage(imageId);
            
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("message", "Image reprocessed successfully");
            result.put("data", response);
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            logger.error("Error reprocessing image {}: {}", imageId, e.getMessage());
            
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    /**
     * Get processing statistics for a project
     */
    @GetMapping("/project/{projectId}/stats")
    @PreAuthorize("hasRole('USER') or hasRole('SUPER_USER') or hasRole('ADMINISTRATOR')")
    public ResponseEntity<?> getProjectImageStats(@PathVariable UUID projectId) {
        try {
            List<ImageProcessingResponse> images = imageService.getProjectImages(projectId);
            
            // Calculate statistics
            long totalImages = images.size();
            long completedImages = images.stream()
                .filter(img -> img.getProcessingStatus().name().equals("COMPLETED"))
                .count();
            long failedImages = images.stream()
                .filter(img -> img.getProcessingStatus().name().equals("FAILED"))
                .count();
            long pendingImages = images.stream()
                .filter(img -> img.getProcessingStatus().name().equals("PENDING") || 
                              img.getProcessingStatus().name().equals("PROCESSING"))
                .count();
            
            int totalContainerNumbers = images.stream()
                .filter(img -> img.getContainerNumbersFound() != null)
                .mapToInt(ImageProcessingResponse::getContainerNumbersFound)
                .sum();
            
            Map<String, Object> stats = new HashMap<>();
            stats.put("totalImages", totalImages);
            stats.put("completedImages", completedImages);
            stats.put("failedImages", failedImages);
            stats.put("pendingImages", pendingImages);
            stats.put("totalContainerNumbers", totalContainerNumbers);
            stats.put("successRate", totalImages > 0 ? (double) completedImages / totalImages * 100 : 0);
            
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("data", stats);
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            logger.error("Error getting project image stats {}: {}", projectId, e.getMessage());
            
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            
            return ResponseEntity.badRequest().body(error);
        }
    }
}
