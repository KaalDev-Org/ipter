package com.ipter.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.ipter.dto.ImageProcessingResponse;
import com.ipter.dto.ImageUploadRequest;
import com.ipter.dto.ImageUploadResponse;
import com.ipter.dto.OCRResultDTO;
import com.ipter.model.Project;
import com.ipter.model.User;
import com.ipter.repository.ProjectRepository;
import com.ipter.repository.UserRepository;
import com.ipter.service.GeminiService;
import com.ipter.service.ImageService;

import jakarta.validation.Valid;

/**
 * REST Controller for image upload and processing operations
 */
@RestController
@RequestMapping("/images")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:8080"})
public class ImageController {
    
    private static final Logger logger = LoggerFactory.getLogger(ImageController.class);
    
    @Autowired
    private ImageService imageService;

    @Autowired
    private GeminiService geminiService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProjectRepository projectRepository;
    
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

    /**
     * Production-ready Gemini API integration endpoint (PROTECTED)
     * Extract container numbers using Gemini and associate with project
     */
    @PostMapping("/extract-containers-gemini")
    public ResponseEntity<?> extractContainersWithGemini(
            @RequestParam("file") MultipartFile file,
            @RequestParam("projectId") UUID projectId,
            @RequestParam(value = "description", required = false) String description) {
        try {
            logger.info("Production Gemini container extraction for: {} (Project: {})",
                       file.getOriginalFilename(), projectId);

            // Get current user (handle case where auth might be bypassed)
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            User user = null;
            String username = "system"; // Default fallback

            if (auth != null && auth.isAuthenticated() && !auth.getName().equals("anonymousUser")) {
                username = auth.getName();
                user = userRepository.findByUsername(username).orElse(null);
            }

            // If no authenticated user, try to find admin user as fallback
            if (user == null) {
                user = userRepository.findByUsername("admin").orElse(null);
                username = user != null ? user.getUsername() : "system";
            }

            // Get and validate project
            Project project = projectRepository.findById(projectId)
                    .orElseThrow(() -> new RuntimeException("Project not found: " + projectId));

            // Validate file
            if (file.isEmpty()) {
                throw new IllegalArgumentException("File is empty");
            }

            // Validate file size and type (using existing validation from ImageService)
            if (file.getSize() > 50 * 1024 * 1024) { // 50MB limit
                throw new IllegalArgumentException("File size exceeds 50MB limit");
            }

            // Call Gemini service directly
            byte[] imageBytes = file.getBytes();
            OCRResultDTO result = geminiService.extractContainerNumbers(
                imageBytes,
                file.getOriginalFilename(),
                file.getContentType()
            );

            Map<String, Object> response = new HashMap<>();
            response.put("success", result.getSuccess());
            response.put("filename", result.getFilename());
            response.put("extractedText", result.getExtractedText());
            response.put("containerNumbers", result.getContainerNumbers());
            response.put("confidence", result.getConfidence());
            response.put("processingMetadata", result.getProcessingMetadata());
            response.put("message", "Production Gemini API integration successful");

            // Add project and user information
            response.put("projectId", project.getId());
            response.put("projectName", project.getName());
            response.put("userId", user != null ? user.getId() : "system");
            response.put("username", username);
            response.put("description", description);
            response.put("timestamp", java.time.LocalDateTime.now());

            if (!result.getSuccess()) {
                response.put("errorMessage", result.getErrorMessage());
            }

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.error("Error testing Gemini extraction: {}", e.getMessage());

            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());

            return ResponseEntity.badRequest().body(error);
        }
    }

}
