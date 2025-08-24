package com.ipter.repository;

import com.ipter.model.ExtractedData;
import com.ipter.model.ExtractionType;
import com.ipter.model.Image;
import com.ipter.model.ValidationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Repository interface for ExtractedData entity
 */
@Repository
public interface ExtractedDataRepository extends JpaRepository<ExtractedData, UUID> {
    
    /**
     * Find extracted data by image
     */
    List<ExtractedData> findByImage(Image image);

    /**
     * Find extracted data by imageId
     */
    List<ExtractedData>findByImageId(UUID imageId);
    /**
     * Find extracted data by container number
     */
    List<ExtractedData> findByContainerNumber(String containerNumber);
    
    /**
     * Find extracted data by container number containing
     */
    @Query("SELECT ed FROM ExtractedData ed WHERE LOWER(ed.containerNumber) LIKE LOWER(CONCAT('%', :containerNumber, '%'))")
    List<ExtractedData> findByContainerNumberContainingIgnoreCase(@Param("containerNumber") String containerNumber);
    
    /**
     * Find extracted data by extraction type
     */
    List<ExtractedData> findByExtractionType(ExtractionType extractionType);
    
    /**
     * Find extracted data by validation status
     */
    List<ExtractedData> findByValidationStatus(ValidationStatus validationStatus);
    
    /**
     * Find extracted data by confidence range
     */
    @Query("SELECT ed FROM ExtractedData ed WHERE ed.confidence >= :minConfidence AND ed.confidence <= :maxConfidence")
    List<ExtractedData> findByConfidenceRange(@Param("minConfidence") Double minConfidence, 
                                             @Param("maxConfidence") Double maxConfidence);
    
    /**
     * Find extracted data extracted after a specific date
     */
    List<ExtractedData> findByExtractedAtAfter(LocalDateTime date);
    
    /**
     * Find extracted data by processing engine
     */
    List<ExtractedData> findByProcessingEngine(String processingEngine);
    
    /**
     * Count extracted data by validation status
     */
    long countByValidationStatus(ValidationStatus validationStatus);
    
    /**
     * Count extracted data by extraction type
     */
    long countByExtractionType(ExtractionType extractionType);
    
    /**
     * Find extracted data with high confidence
     */
    @Query("SELECT ed FROM ExtractedData ed WHERE ed.confidence >= :minConfidence ORDER BY ed.confidence DESC")
    List<ExtractedData> findHighConfidenceData(@Param("minConfidence") Double minConfidence);
    
    /**
     * Find extracted data needing validation
     */
    @Query("SELECT ed FROM ExtractedData ed WHERE ed.validationStatus IN ('PENDING', 'NEEDS_REVIEW') ORDER BY ed.extractedAt ASC")
    List<ExtractedData> findDataNeedingValidation();
    
    /**
     * Find unique container numbers
     */
    @Query("SELECT DISTINCT ed.containerNumber FROM ExtractedData ed WHERE ed.containerNumber IS NOT NULL AND ed.containerNumber != ''")
    List<String> findUniqueContainerNumbers();
    
    /**
     * Find extracted data by text content containing
     */
    @Query("SELECT ed FROM ExtractedData ed WHERE LOWER(ed.extractedText) LIKE LOWER(CONCAT('%', :text, '%'))")
    List<ExtractedData> findByExtractedTextContainingIgnoreCase(@Param("text") String text);
}
