package com.ipter.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ipter.dto.ProcessPdfResponse;
import com.ipter.service.DataViewService;
import com.ipter.service.ProjectService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.Arrays;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Test class for ProjectController with example number functionality
 */
@ExtendWith(MockitoExtension.class)
class ProjectControllerTest {

    @Mock
    private ProjectService projectService;

    @Mock
    private DataViewService dataViewService;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;
    private ProjectController projectController;

    @BeforeEach
    void setUp() {
        projectController = new ProjectController();
        objectMapper = new ObjectMapper();
        
        // Inject mocked services using reflection
        org.springframework.test.util.ReflectionTestUtils.setField(projectController, "projectService", projectService);
        org.springframework.test.util.ReflectionTestUtils.setField(projectController, "dataViewService", dataViewService);
        
        mockMvc = MockMvcBuilders.standaloneSetup(projectController).build();
    }

    @Test
    void testUploadAndProcessPdf_WithExampleNumber() throws Exception {
        // Given
        UUID projectId = UUID.randomUUID();
        String exampleNumber = "PDF123456";
        MockMultipartFile file = new MockMultipartFile(
            "file", 
            "test-document.pdf", 
            "application/pdf", 
            "test-pdf-content".getBytes()
        );

        // Mock response
        ProcessPdfResponse pdfResponse = new ProcessPdfResponse();
        pdfResponse.setProjectId(projectId);
        pdfResponse.setProjectName("Test Project");
        pdfResponse.setSuccess(true);
        pdfResponse.setMessage("PDF processed successfully");
        pdfResponse.setExtractedCount(15);
        pdfResponse.setExtractedContainerNumbers(Arrays.asList(
            "PDF123456", "PDF123457", "PDF123458", "PDF123459", "PDF123460"
        ));
        pdfResponse.setProcessingTimeMs(2500L);

        when(projectService.uploadAndProcessPdf(eq(projectId), any(), eq(false), eq(exampleNumber)))
            .thenReturn(pdfResponse);

        // When & Then
        mockMvc.perform(multipart("/projects/{projectId}/upload-and-process-pdf", projectId)
                .file(file)
                .param("forceReprocess", "false")
                .param("exampleNumber", exampleNumber))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.message").value("PDF processed successfully"))
                .andExpect(jsonPath("$.result.success").value(true))
                .andExpect(jsonPath("$.result.extractedCount").value(15))
                .andExpect(jsonPath("$.result.projectName").value("Test Project"));
    }

    @Test
    void testUploadAndProcessPdf_WithoutExampleNumber() throws Exception {
        // Given
        UUID projectId = UUID.randomUUID();
        MockMultipartFile file = new MockMultipartFile(
            "file", 
            "test-document.pdf", 
            "application/pdf", 
            "test-pdf-content".getBytes()
        );

        // Mock response
        ProcessPdfResponse pdfResponse = new ProcessPdfResponse();
        pdfResponse.setProjectId(projectId);
        pdfResponse.setProjectName("Test Project");
        pdfResponse.setSuccess(true);
        pdfResponse.setMessage("PDF processed successfully");
        pdfResponse.setExtractedCount(12);
        pdfResponse.setExtractedContainerNumbers(Arrays.asList(
            "DEFAULT001", "DEFAULT002", "DEFAULT003", "DEFAULT004"
        ));
        pdfResponse.setProcessingTimeMs(3000L);

        when(projectService.uploadAndProcessPdf(eq(projectId), any(), eq(false), isNull()))
            .thenReturn(pdfResponse);

        // When & Then
        mockMvc.perform(multipart("/projects/{projectId}/upload-and-process-pdf", projectId)
                .file(file)
                .param("forceReprocess", "false"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.message").value("PDF processed successfully"))
                .andExpect(jsonPath("$.result.success").value(true))
                .andExpect(jsonPath("$.result.extractedCount").value(12))
                .andExpect(jsonPath("$.result.projectName").value("Test Project"));
    }

    @Test
    void testUploadAndProcessPdf_WithEmptyExampleNumber() throws Exception {
        // Given
        UUID projectId = UUID.randomUUID();
        MockMultipartFile file = new MockMultipartFile(
            "file", 
            "test-document.pdf", 
            "application/pdf", 
            "test-pdf-content".getBytes()
        );

        // Mock response
        ProcessPdfResponse pdfResponse = new ProcessPdfResponse();
        pdfResponse.setProjectId(projectId);
        pdfResponse.setProjectName("Test Project");
        pdfResponse.setSuccess(true);
        pdfResponse.setMessage("PDF processed successfully");
        pdfResponse.setExtractedCount(8);
        pdfResponse.setExtractedContainerNumbers(Arrays.asList(
            "EMPTY001", "EMPTY002", "EMPTY003"
        ));
        pdfResponse.setProcessingTimeMs(2200L);

        when(projectService.uploadAndProcessPdf(eq(projectId), any(), eq(true), eq("")))
            .thenReturn(pdfResponse);

        // When & Then
        mockMvc.perform(multipart("/projects/{projectId}/upload-and-process-pdf", projectId)
                .file(file)
                .param("forceReprocess", "true")
                .param("exampleNumber", ""))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.message").value("PDF processed successfully"))
                .andExpect(jsonPath("$.result.success").value(true))
                .andExpect(jsonPath("$.result.extractedCount").value(8))
                .andExpect(jsonPath("$.result.projectName").value("Test Project"));
    }

    @Test
    void testUploadAndProcessPdf_ServiceException_ReturnsError() throws Exception {
        // Given
        UUID projectId = UUID.randomUUID();
        String exampleNumber = "ERROR123";
        MockMultipartFile file = new MockMultipartFile(
            "file", 
            "test-document.pdf", 
            "application/pdf", 
            "test-pdf-content".getBytes()
        );

        when(projectService.uploadAndProcessPdf(eq(projectId), any(), eq(false), eq(exampleNumber)))
            .thenThrow(new RuntimeException("PDF processing failed"));

        // When & Then
        mockMvc.perform(multipart("/projects/{projectId}/upload-and-process-pdf", projectId)
                .file(file)
                .param("forceReprocess", "false")
                .param("exampleNumber", exampleNumber))
                .andExpect(status().isBadRequest())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.error").value("PDF processing failed"));
    }

    @Test
    void testUploadAndProcessPdf_WithForceReprocessAndExample() throws Exception {
        // Given
        UUID projectId = UUID.randomUUID();
        String exampleNumber = "FORCE789";
        MockMultipartFile file = new MockMultipartFile(
            "file", 
            "reprocess-document.pdf", 
            "application/pdf", 
            "reprocess-pdf-content".getBytes()
        );

        // Mock response
        ProcessPdfResponse pdfResponse = new ProcessPdfResponse();
        pdfResponse.setProjectId(projectId);
        pdfResponse.setProjectName("Reprocess Test Project");
        pdfResponse.setSuccess(true);
        pdfResponse.setMessage("PDF reprocessed successfully");
        pdfResponse.setExtractedCount(20);
        pdfResponse.setExtractedContainerNumbers(Arrays.asList(
            "FORCE789", "FORCE790", "FORCE791", "FORCE792", "FORCE793"
        ));
        pdfResponse.setProcessingTimeMs(4000L);

        when(projectService.uploadAndProcessPdf(eq(projectId), any(), eq(true), eq(exampleNumber)))
            .thenReturn(pdfResponse);

        // When & Then
        mockMvc.perform(multipart("/projects/{projectId}/upload-and-process-pdf", projectId)
                .file(file)
                .param("forceReprocess", "true")
                .param("exampleNumber", exampleNumber))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.message").value("PDF processed successfully"))
                .andExpect(jsonPath("$.result.success").value(true))
                .andExpect(jsonPath("$.result.extractedCount").value(20))
                .andExpect(jsonPath("$.result.projectName").value("Reprocess Test Project"))
                .andExpect(jsonPath("$.result.message").value("PDF reprocessed successfully"));
    }
}
