package com.ipter.repository;

import com.ipter.model.Project;
import com.ipter.model.ProjectStatus;
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
 * Repository interface for Project entity
 */
@Repository
public interface ProjectRepository extends JpaRepository<Project, UUID> {
    
    /**
     * Find projects by created user
     */
    List<Project> findByCreatedBy(User createdBy);
    
    /**
     * Find projects by created user with pagination
     */
    Page<Project> findByCreatedBy(User createdBy, Pageable pageable);
    
    /**
     * Find projects by status
     */
    List<Project> findByStatus(ProjectStatus status);
    
    /**
     * Find projects by status with pagination
     */
    Page<Project> findByStatus(ProjectStatus status, Pageable pageable);
    
    /**
     * Find projects by created user and status
     */
    List<Project> findByCreatedByAndStatus(User createdBy, ProjectStatus status);
    
    /**
     * Find projects by created user and status with pagination
     */
    Page<Project> findByCreatedByAndStatus(User createdBy, ProjectStatus status, Pageable pageable);
    
    /**
     * Find projects by name containing (case insensitive)
     */
    @Query("SELECT p FROM Project p WHERE LOWER(p.name) LIKE LOWER(CONCAT('%', :name, '%'))")
    List<Project> findByNameContainingIgnoreCase(@Param("name") String name);
    
    /**
     * Find projects created after a specific date
     */
    List<Project> findByCreatedAtAfter(LocalDateTime date);
    
    /**
     * Find projects updated after a specific date
     */
    List<Project> findByUpdatedAtAfter(LocalDateTime date);
    
    /**
     * Count projects by status
     */
    long countByStatus(ProjectStatus status);
    
    /**
     * Count projects by created user
     */
    long countByCreatedBy(User createdBy);
    
    /**
     * Count projects by created user and status
     */
    long countByCreatedByAndStatus(User createdBy, ProjectStatus status);
    
    /**
     * Find projects with processing statistics
     */
    @Query("SELECT p FROM Project p WHERE p.totalImages > 0")
    List<Project> findProjectsWithImages();
    
    /**
     * Find projects by processing completion percentage
     */
    @Query("SELECT p FROM Project p WHERE p.totalImages > 0 AND " +
           "(CAST(p.processedImages AS double) / CAST(p.totalImages AS double)) >= :minPercentage")
    List<Project> findProjectsByCompletionPercentage(@Param("minPercentage") double minPercentage);
}
