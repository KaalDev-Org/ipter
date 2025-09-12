package com.ipter.repository;

import com.ipter.model.Image;
import com.ipter.model.ProcessingStatus;
import com.ipter.model.Project;
import com.ipter.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Repository interface for Image entity
 */
@Repository
public interface ImageRepository extends JpaRepository<Image, UUID> {
    
    /**
     * Find images by project
     */
    List<Image> findByProject(Project project);

    List<Image> findByProjectIdOrderByUploadedAtDesc(UUID projectId);
    
    /**
     * Find images by project with pagination
     */
    Page<Image> findByProject(Project project, Pageable pageable);
    
    /**
     * Find images by processing status
     */
    List<Image> findByProcessingStatus(ProcessingStatus status);
    
    /**
     * Find images by processing status with pagination
     */
    Page<Image> findByProcessingStatus(ProcessingStatus status, Pageable pageable);
    
    /**
     * Find images by project and processing status
     */
    List<Image> findByProjectAndProcessingStatus(Project project, ProcessingStatus status);
    
    /**
     * Find images by uploaded user
     */
    List<Image> findByUploadedBy(User uploadedBy);
    
    /**
     * Find images by uploaded user with pagination
     */
    Page<Image> findByUploadedBy(User uploadedBy, Pageable pageable);
    
    /**
     * Find images uploaded after a specific date
     */
    List<Image> findByUploadedAtAfter(LocalDateTime date);
    
    /**
     * Find images processed after a specific date
     */
    List<Image> findByProcessedAtAfter(LocalDateTime date);
    
    /**
     * Count images by project
     */
    long countByProject(Project project);
    
    /**
     * Count images by project and processing status
     */
    long countByProjectAndProcessingStatus(Project project, ProcessingStatus status);
    
    /**
     * Count images by processing status
     */
    long countByProcessingStatus(ProcessingStatus status);
    
    /**
     * Find images by original filename containing
     */
    @Query("SELECT i FROM Image i WHERE LOWER(i.originalFilename) LIKE LOWER(CONCAT('%', :filename, '%'))")
    List<Image> findByOriginalFilenameContainingIgnoreCase(@Param("filename") String filename);
    
    /**
     * Find images with container numbers found
     */
    @Query("SELECT i FROM Image i WHERE i.containerNumbersFound > 0")
    List<Image> findImagesWithContainerNumbers();
    
    /**
     * Find images by confidence range
     */
    @Query("SELECT i FROM Image i WHERE i.confidence >= :minConfidence AND i.confidence <= :maxConfidence")
    List<Image> findByConfidenceRange(@Param("minConfidence") Double minConfidence, 
                                     @Param("maxConfidence") Double maxConfidence);
    
    /**
     * Find pending images for processing
     */
    @Query("SELECT i FROM Image i WHERE i.processingStatus = 'PENDING' ORDER BY i.uploadedAt ASC")
    List<Image> findPendingImagesForProcessing();
    
    /**
     * Find failed images that can be retried
     */
    @Query("SELECT i FROM Image i WHERE i.processingStatus = 'FAILED' AND i.uploadedAt >= :since")
    List<Image> findFailedImagesForRetry(@Param("since") LocalDateTime since);

    /**
     * Find images by verification status
     */
    List<Image> findByIsVerified(boolean isVerified);

    /**
     * Find verified images by project
     */
    List<Image> findByProjectAndIsVerified(Project project, boolean isVerified);

    /**
     * Find verified images by project ID
     */
    List<Image> findByProjectIdAndIsVerified(UUID projectId, boolean isVerified);

    /**
     * Count verified images by project
     */
    @Query("SELECT COUNT(i) FROM Image i WHERE i.project.id = :projectId AND i.isVerified = :isVerified")
    long countByProjectIdAndIsVerified(@Param("projectId") UUID projectId, @Param("isVerified") boolean isVerified);

    /**
     * Find verified images with pagination
     */
    Page<Image> findByIsVerified(boolean isVerified, Pageable pageable);

    /**
     * Find verified images by project with pagination
     */
    Page<Image> findByProjectAndIsVerified(Project project, boolean isVerified, Pageable pageable);
}
