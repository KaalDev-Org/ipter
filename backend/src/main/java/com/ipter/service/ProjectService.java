package com.ipter.service;

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
    private GeminiService geminiService;

    /**
     * Create a new project
     */
    @PreAuthorize("hasRole('ADMINISTRATOR') or @userManagementService.canCreateProjects(authentication.name)")
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

        // Audit logging will be handled by frontend

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
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    public ProjectResponse updateProjectStatus(UUID projectId, ProjectStatus status) throws Exception {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new Exception("Project not found with ID: " + projectId));

        ProjectStatus oldStatus = project.getStatus();
        project.setStatus(status);
        project.setUpdatedAt(LocalDateTime.now());

        Project savedProject = projectRepository.save(project);

        // Audit logging will be handled by frontend

        logger.info("Project status updated: {} from {} to {} by user: {}",
                   savedProject.getName(), oldStatus, status, getCurrentUser().getUsername());

        return new ProjectResponse(savedProject);
    }

    /**
     * Update an existing project
     */
    @PreAuthorize("hasRole('ADMINISTRATOR') or @userManagementService.canCreateProjects(authentication.name)")
    public ProjectResponse updateProject(UUID projectId, CreateProjectRequest request) throws Exception {
        User currentUser = getCurrentUser();

        // Find the existing project
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new Exception("Project not found with ID: " + projectId));

        // Check if another project with the same name exists (excluding current project)
        Optional<Project> existingProject = projectRepository.findByNameContainingIgnoreCase(request.getName())
                .stream()
                .filter(p -> !p.getId().equals(projectId))
                .findFirst();
        if (existingProject.isPresent()) {
            throw new Exception("Project with name '" + request.getName() + "' already exists");
        }

        // Update project fields
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
        project.setUpdatedAt(LocalDateTime.now());

        // Save the updated project
        Project savedProject = projectRepository.save(project);

        // Audit logging will be handled by frontend

        return new ProjectResponse(savedProject);
    }

    /**
     * Upload and immediately process a PDF for master data extraction
     */
    @PreAuthorize("hasRole('ADMINISTRATOR') or @userManagementService.canCreateProjects(authentication.name)")
    public ProcessPdfResponse uploadAndProcessPdf(UUID projectId, MultipartFile file, boolean forceReprocess) throws Exception {
        return uploadAndProcessPdf(projectId, file, forceReprocess, null);
    }

    /**
     * Upload and immediately process a PDF for master data extraction with optional example number
     */
    @PreAuthorize("hasRole('ADMINISTRATOR') or @userManagementService.canCreateProjects(authentication.name)")
    public ProcessPdfResponse uploadAndProcessPdf(UUID projectId, MultipartFile file, boolean forceReprocess, String exampleNumber) throws Exception {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new Exception("Project not found with ID: " + projectId));

        if (file.isEmpty()) {
            throw new Exception("PDF file is required");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.equalsIgnoreCase("application/pdf")) {
            throw new Exception("Only PDF files are allowed");
        }

        // Save file to uploads directory
        String uploadDir = "./uploads/pdfs/";
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        String fileName = project.getName() + "_" + System.currentTimeMillis() + "_" + file.getOriginalFilename();
        Path filePath = uploadPath.resolve(fileName);
        Files.copy(file.getInputStream(), filePath);

        // Update project with PDF file path
        project.setPdfFilePath(filePath.toString());
        project.setUpdatedAt(LocalDateTime.now());
        projectRepository.save(project);

        // Audit logging will be handled by frontend

        // Immediate processing with example number
        ProcessPdfRequest request = new ProcessPdfRequest(projectId);
        request.setForceReprocess(forceReprocess);
        request.setPdfFilePath(filePath.toString());
        return processPdfFile(request, exampleNumber);
    }

    /**
     * Process PDF file to extract master data using Gemini API
     */
    @PreAuthorize("hasRole('ADMINISTRATOR') or @userManagementService.canCreateProjects(authentication.name)")
    public ProcessPdfResponse processPdfFile(ProcessPdfRequest request) throws Exception {
        return processPdfFile(request, null);
    }

    /**
     * Process PDF file to extract master data using Gemini API with optional example number
     */
    @PreAuthorize("hasRole('ADMINISTRATOR') or @userManagementService.canCreateProjects(authentication.name)")
    public ProcessPdfResponse processPdfFile(ProcessPdfRequest request, String exampleNumber) throws Exception {
        long startTime = System.currentTimeMillis();

        Project project = projectRepository.findById(request.getProjectId())
                .orElseThrow(() -> new Exception("Project not found with ID: " + request.getProjectId()));

        if (project.isMasterDataProcessed() && !request.isForceReprocess()) {
            throw new Exception("Master data already processed for this project. Use forceReprocess=true to reprocess.");
        }

        // Determine PDF file path
        String pdfPath = request.getPdfFilePath() != null && !request.getPdfFilePath().isBlank()
                ? request.getPdfFilePath()
                : project.getPdfFilePath();
        if (pdfPath == null || pdfPath.isBlank()) {
            throw new Exception("No PDF file is associated with this project. Please upload a PDF first.");
        }
        Path pdfFilePath = Paths.get(pdfPath);
        if (!Files.exists(pdfFilePath)) {
            throw new Exception("PDF file not found at path: " + pdfPath);
        }

        // Clear existing master data if reprocessing
        if (request.isForceReprocess()) {
            masterDataRepository.deleteByProject(project);
            project.getMasterData().clear();
        }

        List<MasterData> masterDataList = new ArrayList<>();
        List<String> extractedNumbers = new ArrayList<>();
        List<String> errors = new ArrayList<>();

        // Determine the example number to use - either from parameter or from project
        String effectiveExampleNumber = exampleNumber;
        if (effectiveExampleNumber == null || effectiveExampleNumber.trim().isEmpty()) {
            effectiveExampleNumber = project.getExampleContainerNumber();
        }

        // Read entire PDF and send directly to Gemini with example number
        byte[] pdfBytes = Files.readAllBytes(pdfFilePath);
        com.ipter.dto.OCRResultDTO ocr = geminiService.extractContainerNumbersFromPdf(pdfBytes, pdfFilePath.getFileName().toString(), effectiveExampleNumber);

        int lineCounter = 0;
        if (Boolean.TRUE.equals(ocr.getSuccess()) && ocr.getContainerNumbers() != null) {
            for (com.ipter.dto.OCRResultDTO.ContainerNumberDTO c : ocr.getContainerNumbers()) {
                String normalized = com.ipter.util.ImageProcessingUtil.normalizeContainerNumber(c.getNumber());
                if (normalized == null || normalized.isBlank()) continue;
                boolean seen = extractedNumbers.stream().anyMatch(n -> n.equalsIgnoreCase(normalized));
                if (!seen) {
                    extractedNumbers.add(normalized);

                    MasterData md = new MasterData(project, normalized);
                    md.setConfidenceScore(c.getConfidence());
                    md.setLineNumber(++lineCounter);
                    md.setPageNumber(null);
                    // Truncate raw text to fit database column (10000 chars max)
                    String rawText = ocr.getExtractedText();
                    if (rawText != null && rawText.length() > 9900) {
                        rawText = rawText.substring(0, 9900) + "... [truncated]";
                    }
                    md.setRawText(rawText);
                    masterDataList.add(md);
                }
            }
        } else if (ocr.getErrorMessage() != null) {
            errors.add(ocr.getErrorMessage());
        }

        // Persist master data
        if (!masterDataList.isEmpty()) {
            masterDataRepository.saveAll(masterDataList);
        }

        // Update project state
        project.setMasterDataProcessed(true);
        project.setMasterDataCount(masterDataList.size());
        project.setUpdatedAt(LocalDateTime.now());
        projectRepository.save(project);

        // Audit logging will be handled by frontend

        long processingTime = System.currentTimeMillis() - startTime;

        ProcessPdfResponse response = new ProcessPdfResponse(
                project.getId(), project.getName(), true,
                errors.isEmpty() ? "Master data extracted successfully" : "Processed with warnings");
        response.setExtractedCount(masterDataList.size());
        response.setExtractedContainerNumbers(extractedNumbers);
        response.setErrors(errors.isEmpty() ? null : errors);
        response.setProcessingTimeMs(processingTime);

        logger.info("PDF processed for project: {} - extracted {} container numbers in {}ms", project.getName(),
                masterDataList.size(), processingTime);

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
