package com.ipter.service;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.ipter.dto.ImageDataViewDTO;
import com.ipter.dto.ProjectDataViewDTO;
import com.ipter.model.ExtractedData;
import com.ipter.model.Image;
import com.ipter.model.MasterData;
import com.ipter.model.Project;
import com.ipter.repository.ExtractedDataRepository;
import com.ipter.repository.ImageRepository;
import com.ipter.repository.MasterDataRepository;
import com.ipter.repository.ProjectRepository;

/**
 * Service for handling data view operations - comparing extracted data with master data
 */
@Service
public class DataViewService {
    
    private static final Logger logger = LoggerFactory.getLogger(DataViewService.class);
    
    @Autowired
    private ProjectRepository projectRepository;
    
    @Autowired
    private ImageRepository imageRepository;
    
    @Autowired
    private ExtractedDataRepository extractedDataRepository;
    
    @Autowired
    private MasterDataRepository masterDataRepository;
    
    /**
     * Get image data view - compare single image extracted data with master data
     */
    public ImageDataViewDTO getImageDataView(UUID imageId) {
        logger.info("Getting image data view for image: {}", imageId);
        
        Optional<Image> imageOpt = imageRepository.findById(imageId);
        if (imageOpt.isEmpty()) {
            throw new RuntimeException("Image not found: " + imageId);
        }
        
        Image image = imageOpt.get();
        Project project = image.getProject();
        
        // Get master data for the project
        List<MasterData> masterDataList = masterDataRepository.findByProject(project);
        List<String> masterContainers = masterDataList.stream()
            .map(MasterData::getContainerNumber)
            .collect(Collectors.toList());
        
        // Get extracted data for the image
        List<ExtractedData> extractedDataList = extractedDataRepository.findByImageId(imageId);
        List<ImageDataViewDTO.ExtractedContainerDTO> extractedContainers = extractedDataList.stream()
            .filter(ed -> ed.getContainerNumber() != null && !ed.getContainerNumber().trim().isEmpty())
            .map(ed -> {
                String containerNumber = ed.getContainerNumber().trim();
                boolean isMatched = masterContainers.contains(containerNumber);
                return new ImageDataViewDTO.ExtractedContainerDTO(
                    containerNumber, ed.getConfidence(), isMatched);
            })
            .collect(Collectors.toList());
        
        return new ImageDataViewDTO(
            image.getId(),
            image.getOriginalFilename(),
            image.getUploadedAt(),
            masterContainers,
            extractedContainers
        );
    }
    
    /**
     * Get project data view - compare all images in project with master data
     */
    public ProjectDataViewDTO getProjectDataView(UUID projectId) {
        logger.info("Getting project data view for project: {}", projectId);
        
        Optional<Project> projectOpt = projectRepository.findById(projectId);
        if (projectOpt.isEmpty()) {
            throw new RuntimeException("Project not found: " + projectId);
        }
        
        Project project = projectOpt.get();
        
        // Get master data for the project
        List<MasterData> masterDataList = masterDataRepository.findByProject(project);
        List<String> masterContainers = masterDataList.stream()
            .map(MasterData::getContainerNumber)
            .collect(Collectors.toList());
        
        // Get all images in the project
        List<Image> images = imageRepository.findByProject(project);
        
        // Get extracted data for all images in the project
        List<ExtractedData> allExtractedData = extractedDataRepository.findByProjectId(projectId);
        Map<UUID, List<ExtractedData>> extractedDataByImage = allExtractedData.stream()
            .collect(Collectors.groupingBy(ed -> ed.getImage().getId()));
        
        // Build image summaries
        List<ProjectDataViewDTO.ImageDataSummaryDTO> imageSummaries = images.stream()
            .map(image -> {
                List<ExtractedData> imageExtractedData = extractedDataByImage.getOrDefault(image.getId(), new ArrayList<>());
                
                List<String> extractedContainers = imageExtractedData.stream()
                    .filter(ed -> ed.getContainerNumber() != null && !ed.getContainerNumber().trim().isEmpty())
                    .map(ed -> ed.getContainerNumber().trim())
                    .collect(Collectors.toList());
                
                Map<String, Double> containerConfidences = imageExtractedData.stream()
                    .filter(ed -> ed.getContainerNumber() != null && !ed.getContainerNumber().trim().isEmpty())
                    .collect(Collectors.toMap(
                        ed -> ed.getContainerNumber().trim(),
                        ExtractedData::getConfidence,
                        (existing, replacement) -> Math.max(existing, replacement) // Keep highest confidence
                    ));
                
                return new ProjectDataViewDTO.ImageDataSummaryDTO(
                    image.getId(),
                    image.getOriginalFilename(),
                    image.getUploadedAt(),
                    extractedContainers,
                    containerConfidences
                );
            })
            .collect(Collectors.toList());
        
        // Calculate project summary statistics
        ProjectDataViewDTO.ProjectSummaryDTO summary = calculateProjectSummary(masterContainers, allExtractedData);
        
        return new ProjectDataViewDTO(
            project.getId(),
            project.getName(),
            project.getCreatedAt(),
            masterContainers,
            imageSummaries,
            summary
        );
    }
    
    /**
     * Calculate project summary statistics
     */
    private ProjectDataViewDTO.ProjectSummaryDTO calculateProjectSummary(List<String> masterContainers, List<ExtractedData> allExtractedData) {
        Set<String> masterSet = new HashSet<>(masterContainers);
        
        List<String> extractedContainers = allExtractedData.stream()
            .filter(ed -> ed.getContainerNumber() != null && !ed.getContainerNumber().trim().isEmpty())
            .map(ed -> ed.getContainerNumber().trim())
            .collect(Collectors.toList());
        
        Set<String> extractedSet = new HashSet<>(extractedContainers);
        
        // Calculate matches
        Set<String> matched = new HashSet<>(extractedSet);
        matched.retainAll(masterSet);
        
        // Calculate unmatched (extracted but not in master)
        Set<String> unmatched = new HashSet<>(extractedSet);
        unmatched.removeAll(masterSet);
        
        // Calculate duplicates (extracted multiple times)
        Map<String, Long> containerCounts = extractedContainers.stream()
            .collect(Collectors.groupingBy(c -> c, Collectors.counting()));
        int duplicates = (int) containerCounts.values().stream()
            .mapToLong(count -> Math.max(0, count - 1))
            .sum();
        
        return new ProjectDataViewDTO.ProjectSummaryDTO(
            masterContainers.size(),
            extractedContainers.size(),
            matched.size(),
            unmatched.size(),
            duplicates
        );
    }
}
