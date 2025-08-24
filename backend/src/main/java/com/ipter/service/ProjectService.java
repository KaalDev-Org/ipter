package com.ipter.service;

import com.ipter.dto.CreateProjectRequest;
import com.ipter.dto.ProcessPdfRequest;
import com.ipter.dto.ProcessPdfResponse;
import com.ipter.dto.ProjectResponse;
import com.ipter.model.MasterData;
import com.ipter.model.Project;
import com.ipter.model.ProjectStatus;
import com.ipter.model.User;
import com.ipter.repository.MasterDataRepository;
import com.ipter.repository.ProjectRepository;
import com.ipter.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service for project management operations
 */
@Service
@Transactional
public class ProjectService {
    
    private static final Logger logger = LoggerFactory.getLogger(ProjectService.class);
    
    @Autowired
    private ProjectRepository projectRepository;
    
    @Autowired
    private MasterDataRepository masterDataRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private AuditService auditService;
    
    /**
     * Create a new project
     */
    @PreAuthorize("hasRole('ADMINISTRATOR') or hasRole('SUPER_USER') or @userManagementService.canCreateProjects(authentication.name)")
    public ProjectResponse createProject(CreateProjectRequest request) throws Exception {
        User currentUser = getCurrentUser();
        
        // Check if project name already exists
        Optional<Project> existingProject = projectRepository.findByNameContainingIgnoreCase(request.getName())
                .stream().findFirst();
        if (existingProject.isPresent()) {
            throw new Exception("Project with name '" + request.getName() + "' already exists");
        }
        
        // Create new project
        Project project = new Project();
        project.setName(request.getName());
        project.setDescription(request.getDescription());
        project.setShipper(request.getShipper());
        project.setInvoice(request.getInvoice());
        project.setCompound(request.getCompound());
        project.setQuantity(request.getQuantity());
        project.setExpDate(request.getExpDate());
        project.setShipmentId(request.getShipmentId());
        project.setPackageLot(request.getPackageLot());
        project.setProtocol(request.getProtocol());
        project.setSite(request.getSite());
        project.setInvoiceDate(request.getInvoiceDate());
        project.setRemarks(request.getRemarks());
        project.setCreatedBy(currentUser);
        project.setStatus(ProjectStatus.ACTIVE);
        project.setCreatedAt(LocalDateTime.now());
        project.setUpdatedAt(LocalDateTime.now());
        
        Project savedProject = projectRepository.save(project);
        
        // Log audit event
        auditService.logProjectCreation(savedProject, currentUser);
        
        logger.info("Project created successfully: {} by user: {}", savedProject.getName(), currentUser.getUsername());
        
        return new ProjectResponse(savedProject);
    }
    
    /**
     * Get all projects with pagination
     */
    @Transactional(readOnly = true)
    public Page<ProjectResponse> getAllProjects(Pageable pageable) {
        Page<Project> projects = projectRepository.findAll(pageable);
        return projects.map(ProjectResponse::new);
    }
    
    /**
     * Get all active projects
     */
    @Transactional(readOnly = true)
    public List<ProjectResponse> getActiveProjects() {
        List<Project> projects = projectRepository.findByStatus(ProjectStatus.ACTIVE);
        return projects.stream()
                .map(ProjectResponse::new)
                .collect(Collectors.toList());
    }
    
    /**
     * Get project by ID
     */
    @Transactional(readOnly = true)
    public ProjectResponse getProjectById(UUID projectId) throws Exception {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new Exception("Project not found with ID: " + projectId));
        return new ProjectResponse(project);
    }
    
    /**
     * Update project status
     */
    @PreAuthorize("hasRole('ADMINISTRATOR') or hasRole('SUPER_USER')")
    public ProjectResponse updateProjectStatus(UUID projectId, ProjectStatus status) throws Exception {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new Exception("Project not found with ID: " + projectId));
        
        ProjectStatus oldStatus = project.getStatus();
        project.setStatus(status);
        project.setUpdatedAt(LocalDateTime.now());
        
        Project savedProject = projectRepository.save(project);
        
        // Log audit event
        auditService.logProjectStatusChange(savedProject, oldStatus, status, getCurrentUser());
        
        logger.info("Project status updated: {} from {} to {} by user: {}", 
                   savedProject.getName(), oldStatus, status, getCurrentUser().getUsername());
        
        return new ProjectResponse(savedProject);
    }
    
    /**
     * Upload and process PDF file for master data extraction
     */
    @PreAuthorize("hasRole('ADMINISTRATOR') or hasRole('SUPER_USER')")
    public ProjectResponse uploadPdfFile(UUID projectId, MultipartFile file) throws Exception {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new Exception("Project not found with ID: " + projectId));
        
        if (file.isEmpty()) {
            throw new Exception("PDF file is required");
        }
        
        if (!file.getContentType().equals("application/pdf")) {
            throw new Exception("Only PDF files are allowed");
        }
        
        // Save file to uploads directory
        String uploadDir = "./uploads/pdfs/";
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }
        
        String fileName = projectId + "_" + System.currentTimeMillis() + "_" + file.getOriginalFilename();
        Path filePath = uploadPath.resolve(fileName);
        Files.copy(file.getInputStream(), filePath);
        
        // Update project with PDF file path
        project.setPdfFilePath(filePath.toString());
        project.setUpdatedAt(LocalDateTime.now());
        
        Project savedProject = projectRepository.save(project);
        
        // Log audit event
        auditService.logPdfUpload(savedProject, fileName, getCurrentUser());
        
        logger.info("PDF file uploaded for project: {} by user: {}", 
                   savedProject.getName(), getCurrentUser().getUsername());
        
        return new ProjectResponse(savedProject);
    }
    
    /**
     * Process PDF file to extract master data (dummy implementation for now)
     */
    @PreAuthorize("hasRole('ADMINISTRATOR') or hasRole('SUPER_USER')")
    public ProcessPdfResponse processPdfFile(ProcessPdfRequest request) throws Exception {
        long startTime = System.currentTimeMillis();
        
        Project project = projectRepository.findById(request.getProjectId())
                .orElseThrow(() -> new Exception("Project not found with ID: " + request.getProjectId()));
        
        if (project.isMasterDataProcessed() && !request.isForceReprocess()) {
            throw new Exception("Master data already processed for this project. Use forceReprocess=true to reprocess.");
        }
        
        // For now, create dummy master data for testing
        List<String> dummyContainerNumbers = generateDummyContainerNumbers();
        
        // Clear existing master data if reprocessing
        if (request.isForceReprocess()) {
            masterDataRepository.deleteByProject(project);
            project.getMasterData().clear();
        }
        
        // Create master data entries
        List<MasterData> masterDataList = new ArrayList<>();
        for (String containerNumber : dummyContainerNumbers) {
            MasterData masterData = new MasterData(project, containerNumber);
            masterData.setConfidenceScore(0.95); // Dummy confidence score
            masterData.setLineNumber(masterDataList.size() + 1);
            masterData.setPageNumber(1);
            masterData.setRawText("Container: " + containerNumber);
            masterDataList.add(masterData);
        }
        
        // Save master data
        masterDataRepository.saveAll(masterDataList);
        
        // Update project
        project.setMasterDataProcessed(true);
        project.setMasterDataCount(masterDataList.size());
        project.setUpdatedAt(LocalDateTime.now());
        projectRepository.save(project);
        
        // Log audit event
        auditService.logMasterDataProcessing(project, masterDataList.size(), getCurrentUser());
        
        long processingTime = System.currentTimeMillis() - startTime;
        
        ProcessPdfResponse response = new ProcessPdfResponse(
            project.getId(), 
            project.getName(), 
            true, 
            "Master data extracted successfully"
        );
        response.setExtractedCount(masterDataList.size());
        response.setExtractedContainerNumbers(dummyContainerNumbers);
        response.setProcessingTimeMs(processingTime);
        
        logger.info("PDF processed for project: {} - extracted {} container numbers in {}ms", 
                   project.getName(), masterDataList.size(), processingTime);
        
        return response;
    }
    
    /**
     * Generate dummy container numbers for testing
     */
    private List<String> generateDummyContainerNumbers() {
        return Arrays.asList(
            "999-99-9999", "999-99-9998", "999-99-9997", "999-99-9996", "999-99-9995",
            "999-99-9994", "999-99-9993", "999-99-9992", "999-99-9991", "999-99-9990",
            "999-99-9989", "999-99-9988", "999-99-9987", "999-99-9986", "999-99-9985"
        );
    }
    
    /**
     * Get current authenticated user
     */
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Current user not found"));
    }
}
