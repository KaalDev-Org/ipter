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
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

import com.ipter.dto.ImageProcessingResponse;
import com.ipter.dto.ImageUploadRequest;
import com.ipter.dto.ImageUploadResponse;
import com.ipter.dto.OCRResultDTO;
import com.ipter.dto.SerialNumberUpdateRequest;
import com.ipter.dto.SerialNumberUpdateResponse;
import com.ipter.dto.UploadAndExtractResponse;
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

    /**
     * Upload an image for processing
     */
    @PostMapping("/upload")
    @PreAuthorize("false") // disabled legacy endpoint
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
    @PreAuthorize("false") // disabled legacy endpoint
    public ResponseEntity<?> uploadImageWithRequest(
            @RequestParam("file") MultipartFile file,
            @Valid @RequestBody ImageUploadRequest request) {
        Map<String, Object> error = new HashMap<>();
        error.put("success", false);
        error.put("error", "Endpoint deprecated. Use /images/upload-and-extract instead.");
        return ResponseEntity.status(410).body(error);
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
    @PreAuthorize("hasRole('ADMINISTRATOR')")
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
     * Single production endpoint: Upload image and extract container IDs via Gemini
     * - Saves image metadata
     * - Runs Gemini extraction immediately
     * - Saves extracted data
     * - Returns unified response
     */
    @PostMapping("/upload-and-extract")
    @PreAuthorize("hasRole('USER') or hasRole('REVIEWER') or hasRole('ADMINISTRATOR')")
    public ResponseEntity<?> uploadAndExtract(
            @RequestParam("file") MultipartFile file,
            @RequestParam("projectId") UUID projectId,
            @RequestParam(value = "description", required = false) String description) {
        try {
            logger.info("Upload-and-extract for: {} (Project: {})", file.getOriginalFilename(), projectId);

            // Reuse upload image logic but force immediate processing disabled (we'll do inline)
            ImageUploadRequest uploadRequest = new ImageUploadRequest(projectId, description, false);
            ImageUploadResponse uploadResp = imageService.uploadImage(file, uploadRequest);

            // Load image entity and process inline
            byte[] imageBytes = file.getBytes();
            OCRResultDTO ocr = geminiService.extractContainerNumbers(imageBytes, file.getOriginalFilename(), file.getContentType());

            // Save extracted data and update image metadata
            if (ocr.getSuccess()) {
                imageService.saveExtractedDataInline(uploadResp.getImageId(), ocr);
            }

            UploadAndExtractResponse response = new UploadAndExtractResponse();
            response.setImageId(uploadResp.getImageId());
            response.setProjectId(uploadResp.getProjectId());
            response.setImageName(uploadResp.getOriginalFilename());
            response.setUploadedAt(uploadResp.getUploadedAt());
            response.setSuccess(ocr.getSuccess());
            response.setMessage(ocr.getSuccess() ? "Extraction successful" : ("Extraction failed: " + ocr.getErrorMessage()));
            response.setExtractedText(ocr.getExtractedText());
            response.setContainerNumbers(ocr.getContainerNumbers());
            response.setConfidence(ocr.getConfidence());

            Map<String, Object> result = new HashMap<>();
            result.put("message", "Image uploaded and processed successfully");
            result.put("data", response);

            return ResponseEntity.ok(result);

        } catch (Exception e) {
            logger.error("Error in upload-and-extract: {}", e.getMessage());
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Update serial numbers after user verification
     */
    @PostMapping("/update-serial-numbers")
    // Temporarily removed @PreAuthorize to test authentication issue
    // @PreAuthorize("hasRole('USER') or hasRole('REVIEWER') or hasRole('ADMINISTRATOR')")
    public ResponseEntity<SerialNumberUpdateResponse> updateSerialNumbers(
            @RequestBody SerialNumberUpdateRequest request) {
        try {
            logger.info("Updating serial numbers for image: {} (Project: {})",
                       request.getImageId(), request.getProjectId());

            // Delegate to image service for processing
            SerialNumberUpdateResponse response = imageService.updateSerialNumbers(request);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.error("Error updating serial numbers: {}", e.getMessage());
            SerialNumberUpdateResponse errorResponse = new SerialNumberUpdateResponse(
                request.getImageId(),
                request.getProjectId(),
                0,
                "Failed to update serial numbers: " + e.getMessage(),
                false
            );
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    /**
     * Serve/view an uploaded image
     */
    @GetMapping("/{imageId}/view")
    @PreAuthorize("hasRole('USER') or hasRole('REVIEWER') or hasRole('ADMINISTRATOR')")
    public ResponseEntity<Resource> viewImage(@PathVariable UUID imageId) {
        try {
            logger.info("Serving image: {}", imageId);

            // Get image from service
            Resource imageResource = imageService.getImageResource(imageId);

            // Determine content type
            String contentType = imageService.getImageContentType(imageId);
            if (contentType == null) {
                contentType = "application/octet-stream";
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline")
                    .body(imageResource);

        } catch (Exception e) {
            logger.error("Error serving image {}: {}", imageId, e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Update image verification status
     */
    @PutMapping("/{imageId}/verify")
    @PreAuthorize("hasRole('ADMINISTRATOR') or hasRole('REVIEWER')")
    public ResponseEntity<?> updateImageVerificationStatus(
            @PathVariable UUID imageId,
            @RequestParam boolean isVerified) {
        try {
            logger.info("Updating verification status for image: {} to {}", imageId, isVerified);

            imageService.updateVerificationStatus(imageId, isVerified);

            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("message", "Image verification status updated successfully");
            result.put("imageId", imageId);
            result.put("isVerified", isVerified);

            return ResponseEntity.ok(result);

        } catch (Exception e) {
            logger.error("Error updating verification status for image {}: {}", imageId, e.getMessage());

            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());

            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Get verified images for a project
     */
    @GetMapping("/project/{projectId}/verified")
    @PreAuthorize("hasRole('USER') or hasRole('REVIEWER') or hasRole('ADMINISTRATOR')")
    public ResponseEntity<?> getVerifiedProjectImages(@PathVariable UUID projectId) {
        try {
            List<ImageProcessingResponse> images = imageService.getVerifiedProjectImages(projectId);

            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("data", images);
            result.put("count", images.size());

            return ResponseEntity.ok(result);

        } catch (Exception e) {
            logger.error("Error getting verified project images {}: {}", projectId, e.getMessage());

            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());

            return ResponseEntity.badRequest().body(error);
        }
    }

}
