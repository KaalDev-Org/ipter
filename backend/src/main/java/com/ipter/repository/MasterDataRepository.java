package com.ipter.repository;

import com.ipter.model.MasterData;
import com.ipter.model.Project;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository interface for MasterData entity
 */
@Repository
public interface MasterDataRepository extends JpaRepository<MasterData, UUID> {
    
    /**
     * Find master data by project
     */
    List<MasterData> findByProject(Project project);
    
    /**
     * Find master data by project with pagination
     */
    Page<MasterData> findByProject(Project project, Pageable pageable);
    
    /**
     * Find master data by project and container number
     */
    Optional<MasterData> findByProjectAndContainerNumber(Project project, String containerNumber);
    
    /**
     * Find master data by container number (case insensitive)
     */
    @Query("SELECT md FROM MasterData md WHERE LOWER(md.containerNumber) = LOWER(:containerNumber)")
    List<MasterData> findByContainerNumberIgnoreCase(@Param("containerNumber") String containerNumber);
    
    /**
     * Find master data by project and container number (case insensitive)
     */
    @Query("SELECT md FROM MasterData md WHERE md.project = :project AND LOWER(md.containerNumber) = LOWER(:containerNumber)")
    Optional<MasterData> findByProjectAndContainerNumberIgnoreCase(@Param("project") Project project, 
                                                                   @Param("containerNumber") String containerNumber);
    
    /**
     * Find validated master data by project
     */
    List<MasterData> findByProjectAndIsValidated(Project project, boolean isValidated);
    
    /**
     * Find matched master data by project
     */
    List<MasterData> findByProjectAndIsMatched(Project project, boolean isMatched);
    
    /**
     * Count master data by project
     */
    long countByProject(Project project);
    
    /**
     * Count validated master data by project
     */
    long countByProjectAndIsValidated(Project project, boolean isValidated);
    
    /**
     * Count matched master data by project
     */
    long countByProjectAndIsMatched(Project project, boolean isMatched);
    
    /**
     * Find master data with multiple matches
     */
    @Query("SELECT md FROM MasterData md WHERE md.project = :project AND md.matchCount > 1")
    List<MasterData> findDuplicateMatches(@Param("project") Project project);
    
    /**
     * Find unmatched master data by project
     */
    @Query("SELECT md FROM MasterData md WHERE md.project = :project AND md.isMatched = false")
    List<MasterData> findUnmatchedByProject(@Param("project") Project project);
    
    /**
     * Delete all master data by project
     */
    void deleteByProject(Project project);
    
    /**
     * Check if container number exists in project
     */
    boolean existsByProjectAndContainerNumber(Project project, String containerNumber);
    
    /**
     * Check if container number exists in project (case insensitive)
     */
    @Query("SELECT COUNT(md) > 0 FROM MasterData md WHERE md.project = :project AND LOWER(md.containerNumber) = LOWER(:containerNumber)")
    boolean existsByProjectAndContainerNumberIgnoreCase(@Param("project") Project project, 
                                                        @Param("containerNumber") String containerNumber);
}
