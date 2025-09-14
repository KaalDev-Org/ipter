package com.ipter.controller;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
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

import com.ipter.dto.ImageProcessingResponse;
import com.ipter.dto.ImageUploadRequest;
import com.ipter.dto.ImageUploadResponse;
import com.ipter.dto.OCRResultDTO;
import com.ipter.dto.ProjectResponse;
import com.ipter.dto.SerialNumberUpdateRequest;
import com.ipter.dto.SerialNumberUpdateResponse;
import com.ipter.service.GeminiService;
import com.ipter.service.ImageService;
import com.ipter.service.ProjectService;

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
    private ProjectService projectService;

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

            // Determine the example number to use - from project or from master data
            String effectiveExampleNumber = null;
            try {
                ProjectResponse project = projectService.getProjectById(projectId);
                effectiveExampleNumber = project.getExampleContainerNumber();

                // If no example number in project, get 3 random examples from master data
                if (effectiveExampleNumber == null || effectiveExampleNumber.trim().isEmpty()) {
                    List<String> masterDataExamples = imageService.getRandomMasterDataExamples(projectId, 3);
                    if (!masterDataExamples.isEmpty()) {
                        effectiveExampleNumber = String.join(", ", masterDataExamples);
                        logger.info("Using master data examples for project {}: {}", projectId, effectiveExampleNumber);
                    }
                }
            } catch (Exception e) {
                logger.warn("Could not retrieve project example number or master data: {}", e.getMessage());
            }

            // Load image entity and process inline with example number
            byte[] imageBytes = file.getBytes();
            OCRResultDTO ocr = geminiService.extractContainerNumbers(imageBytes, file.getOriginalFilename(), file.getContentType(), effectiveExampleNumber);

            // Save extracted data and update image metadata
            if (ocr.getSuccess()) {
                imageService.saveExtractedDataInline(uploadResp.getImageId(), ocr);
            }

            // Create the grid-based response structure
            Map<String, Object> gridResponse = createGridResponse(ocr, uploadResp);

            return ResponseEntity.ok(gridResponse);

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
    @PreAuthorize("hasRole('ADMINISTRATOR') or hasRole('REVIEWER') or hasRole('USER')")
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

    /**
     * Create grid-based response structure matching the expected frontend format
     */
    private Map<String, Object> createGridResponse(OCRResultDTO ocr, ImageUploadResponse uploadResp) {
        Map<String, Object> response = new HashMap<>();

        // Add metadata from upload response
        response.put("imageId", uploadResp.getImageId());
        response.put("projectId", uploadResp.getProjectId());
        response.put("imageName", uploadResp.getOriginalFilename());
        response.put("uploadedAt", uploadResp.getUploadedAt());
        response.put("success", ocr.getSuccess());

        // Calculate total containers and average confidence from OCR results
        int totalContainers = 0;
        double totalConfidence = 0.0;
        int confidenceCount = 0;

        if (ocr.getContainerNumbers() != null) {
            totalContainers = ocr.getContainerNumbers().size();
            for (OCRResultDTO.ContainerNumberDTO container : ocr.getContainerNumbers()) {
                if (container.getConfidence() != null) {
                    totalConfidence += container.getConfidence();
                    confidenceCount++;
                }
            }
        }

        double averageConfidence = confidenceCount > 0 ? totalConfidence / confidenceCount : 0.0;

        // Use actual grid structure from OCR results if available, otherwise use defaults
        Map<String, Object> gridStructure = new HashMap<>();
        int rows = 3;
        int columns = 5;

        if (ocr.getGridStructure() != null) {
            if (ocr.getGridStructure().getRows() != null) {
                rows = ocr.getGridStructure().getRows();
            }
            if (ocr.getGridStructure().getColumns() != null) {
                columns = ocr.getGridStructure().getColumns();
            }
            // Use actual total containers from OCR results
            gridStructure.put("total_products", totalContainers);
        } else {
            // Fallback to calculated total containers
            gridStructure.put("total_products", totalContainers);
        }

        gridStructure.put("rows", rows);
        gridStructure.put("columns", columns);
        response.put("grid_structure", gridStructure);

        // Add calculated fields
        response.put("totalContainers", totalContainers);
        response.put("averageConfidence", averageConfidence);

        // Create row data structure using actual OCR results
        createRowDataFromOCR(response, ocr, rows, columns);

        return response;
    }

    /**
     * Create row data structure from OCR results
     */
    private void createRowDataFromOCR(Map<String, Object> response, OCRResultDTO ocr, int rows, int columns) {
        // Create a map to track which containers we've used
        List<OCRResultDTO.ContainerNumberDTO> availableContainers = new ArrayList<>();
        if (ocr.getContainerNumbers() != null) {
            availableContainers.addAll(ocr.getContainerNumbers());
        }

        int containerIndex = 0;

        // Create row data structure
        for (int row = 1; row <= rows; row++) {
            Map<String, Object> rowData = new HashMap<>();

            for (int col = 1; col <= columns; col++) {
                Map<String, Object> position = new HashMap<>();

                // Use actual container data if available
                if (containerIndex < availableContainers.size()) {
                    OCRResultDTO.ContainerNumberDTO container = availableContainers.get(containerIndex);
                    position.put("number", container.getNumber());
                    position.put("confidence", formatConfidence(container.getConfidence()));
                    containerIndex++;
                } else {
                    // If we run out of actual containers, create empty positions
                    // This maintains the grid structure even if not all positions have containers
                    position.put("number", "");
                    position.put("confidence", "0%");
                }

                rowData.put(String.valueOf(col), position);
            }

            response.put("row" + row, rowData);
        }
    }

    /**
     * Format confidence as percentage string
     */
    private String formatConfidence(Double confidence) {
        if (confidence == null) {
            return "unsure";
        }
        // If confidence is already a percentage (0-100), use as is
        if (confidence > 1.0) {
            return Math.round(confidence) + "%";
        }
        // If confidence is a decimal (0-1), convert to percentage
        return Math.round(confidence * 100) + "%";
    }

}
