package com.ipter.service;

import com.ipter.config.AIServiceConfig;
import com.ipter.dto.*;
import com.ipter.model.*;
import com.ipter.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service for handling image upload, processing, and OCR operations
 */
@Service
@Transactional
public class ImageService {
    
    private static final Logger logger = LoggerFactory.getLogger(ImageService.class);
    
    @Autowired
    private ImageRepository imageRepository;
    
    @Autowired
    private ProjectRepository projectRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private ExtractedDataRepository extractedDataRepository;
    
    @Autowired
    private AuditService auditService;

    @Autowired
    @Qualifier("aiServiceRestTemplate")
    private RestTemplate restTemplate;

    @Autowired
    private AIServiceConfig aiServiceConfig;

    @Autowired
    private GeminiService geminiService;
    
    private static final String UPLOAD_DIR = "uploads/images";
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    private static final String[] ALLOWED_CONTENT_TYPES = {
        "image/jpeg", "image/jpg", "image/png", "image/tiff", "image/bmp"
    };
    
    /**
     * Upload and optionally process an image
     */
    public ImageUploadResponse uploadImage(MultipartFile file, ImageUploadRequest request) 
            throws Exception {
        
        // Validate file
        validateImageFile(file);
        
        // Get current user
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
        
        // Get project
        Project project = projectRepository.findById(request.getProjectId())
                .orElseThrow(() -> new RuntimeException("Project not found: " + request.getProjectId()));
        
        // Create upload directory if it doesn't exist
        Path uploadPath = Paths.get(UPLOAD_DIR);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }
        
        // Generate unique filename
        String originalFilename = file.getOriginalFilename();
        String fileExtension = getFileExtension(originalFilename);
        String uniqueFilename = UUID.randomUUID().toString() + "_" + originalFilename;
        Path filePath = uploadPath.resolve(uniqueFilename);
        
        try {
            // Save file to disk
            Files.copy(file.getInputStream(), filePath);
            
            // Create image entity
            Image image = new Image(
                originalFilename,
                filePath.toString(),
                file.getContentType(),
                file.getSize(),
                project,
                user
            );
            
            // Set additional metadata
            image.setProcessingStatus(ProcessingStatus.PENDING);
            
            // Save to database
            image = imageRepository.save(image);
            
            // Log audit event
            auditService.logImageUpload(user, project, image);
            
            logger.info("Image uploaded successfully: {} (ID: {})", originalFilename, image.getId());
            
            // Process immediately if requested
            if (request.isProcessImmediately()) {
                processImageAsync(image.getId());
            }
            
            return new ImageUploadResponse(
                image.getId(),
                image.getOriginalFilename(),
                image.getContentType(),
                image.getFileSize(),
                image.getProcessingStatus(),
                project.getId(),
                image.getUploadedAt(),
                "Image uploaded successfully"
            );
            
        } catch (IOException e) {
            logger.error("Failed to save image file: {}", e.getMessage());
            throw new RuntimeException("Failed to save image file", e);
        }
    }
    
    /**
     * Process an image using AI service
     */
    public ImageProcessingResponse processImage(UUID imageId) throws Exception {
        Image image = imageRepository.findById(imageId)
                .orElseThrow(() -> new RuntimeException("Image not found: " + imageId));
        
        // Update status to processing
        image.setProcessingStatus(ProcessingStatus.PROCESSING);
        imageRepository.save(image);
        
        try {
            // Read image file
            Path imagePath = Paths.get(image.getFilePath());
            byte[] imageBytes = Files.readAllBytes(imagePath);
            
            // Call Gemini AI service
            OCRResultDTO ocrResult = callGeminiService(imageBytes, image.getOriginalFilename(), image.getContentType());
            
            // Process results
            if (ocrResult.getSuccess()) {
                // Save extracted data
                saveExtractedData(image, ocrResult);
                
                // Update image metadata
                updateImageWithResults(image, ocrResult);
                
                image.setProcessingStatus(ProcessingStatus.COMPLETED);
                image.setProcessedAt(LocalDateTime.now());
                
                logger.info("Image processed successfully: {} (ID: {})", 
                           image.getOriginalFilename(), image.getId());
                
            } else {
                image.setProcessingStatus(ProcessingStatus.FAILED);
                image.setErrorMessage(ocrResult.getErrorMessage());
                logger.error("Image processing failed: {} - {}", 
                           image.getOriginalFilename(), ocrResult.getErrorMessage());
            }
            
            image = imageRepository.save(image);
            
            // Create response
            ImageProcessingResponse response = new ImageProcessingResponse(
                image.getId(),
                image.getOriginalFilename(),
                image.getProcessingStatus()
            );
            
            if (ocrResult.getSuccess()) {
                response.setExtractedText(ocrResult.getExtractedText());
                response.setContainerNumbers(
                    ocrResult.getContainerNumbers().stream()
                        .map(OCRResultDTO.ContainerNumberDTO::getNumber)
                        .collect(Collectors.toList())
                );
                response.setConfidence(ocrResult.getConfidence());
                response.setContainerNumbersFound(ocrResult.getContainerNumbers().size());
                response.setProcessedAt(image.getProcessedAt());
                
                // Add processing metadata
                if (ocrResult.getProcessingMetadata() != null) {
                    response.setProcessingMetadata(new ImageProcessingResponse.ProcessingMetadata(
                        ocrResult.getProcessingMetadata().getProcessingTime(),
                        ocrResult.getProcessingMetadata().getEngine(),
                        ocrResult.getProcessingMetadata().getEngineVersion(),
                        ocrResult.getProcessingMetadata().getPreprocessingApplied()
                    ));
                }
            } else {
                response.setErrorMessage(image.getErrorMessage());
            }
            
            return response;
            
        } catch (Exception e) {
            logger.error("Error processing image {}: {}", imageId, e.getMessage());
            
            image.setProcessingStatus(ProcessingStatus.FAILED);
            image.setErrorMessage("Processing error: " + e.getMessage());
            imageRepository.save(image);
            
            throw new RuntimeException("Image processing failed", e);
        }
    }
    
    /**
     * Process image asynchronously
     */
    public void processImageAsync(UUID imageId) {
        // In a real application, this would use @Async or a message queue
        // For now, we'll process synchronously but log it as async
        try {
            logger.info("Starting async processing for image: {}", imageId);
            processImage(imageId);
        } catch (Exception e) {
            logger.error("Async image processing failed for {}: {}", imageId, e.getMessage());
        }
    }
    
    /**
     * Get image processing status
     */
    public ImageProcessingResponse getImageStatus(UUID imageId) {
        Image image = imageRepository.findById(imageId)
                .orElseThrow(() -> new RuntimeException("Image not found: " + imageId));
        
        ImageProcessingResponse response = new ImageProcessingResponse(
            image.getId(),
            image.getOriginalFilename(),
            image.getProcessingStatus()
        );
        
        if (image.getProcessingStatus() == ProcessingStatus.COMPLETED) {
            // Get extracted data
            List<ExtractedData> extractedDataList = extractedDataRepository.findByImageId(imageId);
            
            if (!extractedDataList.isEmpty()) {
                response.setExtractedText(
                    extractedDataList.stream()
                        .map(ExtractedData::getExtractedText)
                        .collect(Collectors.joining("\n"))
                );
                
                response.setContainerNumbers(
                    extractedDataList.stream()
                        .map(ExtractedData::getContainerNumber)
                        .filter(num -> num != null && !num.isEmpty())
                        .collect(Collectors.toList())
                );
                
                response.setConfidence(image.getConfidence());
                response.setContainerNumbersFound(image.getContainerNumbersFound());
            }
            
            response.setProcessedAt(image.getProcessedAt());
        } else if (image.getProcessingStatus() == ProcessingStatus.FAILED) {
            response.setErrorMessage(image.getErrorMessage());
        }
        
        return response;
    }
    
    /**
     * Get images for a project
     */
    public List<ImageProcessingResponse> getProjectImages(UUID projectId) {
        List<Image> images = imageRepository.findByProjectIdOrderByUploadedAtDesc(projectId);
        
        return images.stream()
                .map(image -> {
                    ImageProcessingResponse response = new ImageProcessingResponse(
                        image.getId(),
                        image.getOriginalFilename(),
                        image.getProcessingStatus()
                    );
                    
                    if (image.getProcessingStatus() == ProcessingStatus.COMPLETED) {
                        response.setConfidence(image.getConfidence());
                        response.setContainerNumbersFound(image.getContainerNumbersFound());
                        response.setProcessedAt(image.getProcessedAt());
                    } else if (image.getProcessingStatus() == ProcessingStatus.FAILED) {
                        response.setErrorMessage(image.getErrorMessage());
                    }
                    
                    return response;
                })
                .collect(Collectors.toList());
    }

    /**
     * Call Gemini AI service for container number extraction
     */
    private OCRResultDTO callGeminiService(byte[] imageBytes, String filename, String contentType) throws Exception {
        try {
            logger.info("Calling Gemini service for container extraction: {}", filename);
            return geminiService.extractContainerNumbers(imageBytes, filename, contentType);
        } catch (Exception e) {
            logger.error("Failed to call Gemini service: {}", e.getMessage());
            throw new RuntimeException("Gemini service call failed", e);
        }
    }

    /**
     * Call AI service for OCR processing (Legacy - kept for fallback)
     */
    private OCRResultDTO callAIService(byte[] imageBytes, String filename) throws Exception {
        try {
            // Prepare multipart request
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("file", new ByteArrayResource(imageBytes) {
                @Override
                public String getFilename() {
                    return filename;
                }
            });

            HttpEntity<MultiValueMap<String, Object>> requestEntity =
                new HttpEntity<>(body, headers);

            // Call Python AI service
            String url = aiServiceConfig.getAiServiceUrl() + "/ocr/extract-containers";
            ResponseEntity<OCRResultDTO> response = restTemplate.postForEntity(
                url, requestEntity, OCRResultDTO.class
            );

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return response.getBody();
            } else {
                throw new RuntimeException("AI service returned error: " + response.getStatusCode());
            }

        } catch (Exception e) {
            logger.error("Failed to call AI service: {}", e.getMessage());
            throw new RuntimeException("AI service call failed", e);
        }
    }

    /**
     * Save extracted data to database
     */
    private void saveExtractedData(Image image, OCRResultDTO ocrResult) {
        // Save full extracted text
        if (ocrResult.getExtractedText() != null && !ocrResult.getExtractedText().isEmpty()) {
            ExtractedData textData = new ExtractedData(
                image,
                ocrResult.getExtractedText(),
                null, // No specific container number for full text
                ocrResult.getConfidence(),
                ExtractionType.OCR
            );

            if (ocrResult.getProcessingMetadata() != null) {
                textData.setProcessingEngine(ocrResult.getProcessingMetadata().getEngine());
                textData.setProcessingVersion(ocrResult.getProcessingMetadata().getEngineVersion());
            }

            extractedDataRepository.save(textData);
        }

        // Save individual container numbers
        if (ocrResult.getContainerNumbers() != null) {
            for (OCRResultDTO.ContainerNumberDTO containerNum : ocrResult.getContainerNumbers()) {
                ExtractedData containerData = new ExtractedData(
                    image,
                    containerNum.getNumber(), // Use container number as extracted text
                    containerNum.getNumber(),
                    containerNum.getConfidence(),
                    ExtractionType.CONTAINER_NUMBER
                );

                // Set bounding box if available
                if (containerNum.getBoundingBox() != null) {
                    OCRResultDTO.BoundingBoxDTO bbox = containerNum.getBoundingBox();
                    containerData.setBoundingBoxX(bbox.getX());
                    containerData.setBoundingBoxY(bbox.getY());
                    containerData.setBoundingBoxWidth(bbox.getWidth());
                    containerData.setBoundingBoxHeight(bbox.getHeight());
                }

                if (ocrResult.getProcessingMetadata() != null) {
                    containerData.setProcessingEngine(ocrResult.getProcessingMetadata().getEngine());
                    containerData.setProcessingVersion(ocrResult.getProcessingMetadata().getEngineVersion());
                }

                extractedDataRepository.save(containerData);
            }
        }
    }

    /**
     * Update image with OCR results
     */
    private void updateImageWithResults(Image image, OCRResultDTO ocrResult) {
        image.setConfidence(ocrResult.getConfidence());

        if (ocrResult.getContainerNumbers() != null) {
            image.setContainerNumbersFound(ocrResult.getContainerNumbers().size());
        }

        // Update image metadata if available
        if (ocrResult.getImageMetadata() != null) {
            OCRResultDTO.ImageMetadataDTO metadata = ocrResult.getImageMetadata();
            image.setWidth(metadata.getWidth());
            image.setHeight(metadata.getHeight());
            image.setColorSpace(metadata.getColorSpace());
        }
    }

    /**
     * Validate uploaded image file
     */
    private void validateImageFile(MultipartFile file) throws Exception {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("File size exceeds maximum limit of " +
                                             (MAX_FILE_SIZE / 1024 / 1024) + "MB");
        }

        String contentType = file.getContentType();
        if (contentType == null) {
            throw new IllegalArgumentException("File content type is unknown");
        }

        boolean isValidType = false;
        for (String allowedType : ALLOWED_CONTENT_TYPES) {
            if (allowedType.equals(contentType.toLowerCase())) {
                isValidType = true;
                break;
            }
        }

        if (!isValidType) {
            throw new IllegalArgumentException("File type not supported: " + contentType +
                                             ". Supported types: " + String.join(", ", ALLOWED_CONTENT_TYPES));
        }
    }

    /**
     * Get file extension from filename
     */
    private String getFileExtension(String filename) {
        if (filename == null || filename.isEmpty()) {
            return "";
        }

        int lastDotIndex = filename.lastIndexOf('.');
        if (lastDotIndex == -1) {
            return "";
        }

        return filename.substring(lastDotIndex);
    }
}
