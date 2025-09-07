package com.ipter.controller;

import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import org.mockito.Mock;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ipter.dto.ImageUploadResponse;
import com.ipter.dto.OCRResultDTO;
import com.ipter.dto.ProjectResponse;
import com.ipter.service.GeminiService;
import com.ipter.service.ImageService;
import com.ipter.service.ProjectService;

/**
 * Test class for ImageController with example number functionality
 */
@ExtendWith(MockitoExtension.class)
class ImageControllerTest {

    @Mock
    private ImageService imageService;

    @Mock
    private GeminiService geminiService;

    @Mock
    private ProjectService projectService;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;
    private ImageController imageController;

    @BeforeEach
    void setUp() {
        imageController = new ImageController();
        objectMapper = new ObjectMapper();
        
        // Inject mocked services using reflection
        org.springframework.test.util.ReflectionTestUtils.setField(imageController, "imageService", imageService);
        org.springframework.test.util.ReflectionTestUtils.setField(imageController, "geminiService", geminiService);
        org.springframework.test.util.ReflectionTestUtils.setField(imageController, "projectService", projectService);
        
        mockMvc = MockMvcBuilders.standaloneSetup(imageController).build();
    }

    @Test
    void testUploadAndExtract_WithExampleNumber() throws Exception {
        // Given
        UUID projectId = UUID.randomUUID();
        String exampleNumber = "ABC123456";
        MockMultipartFile file = new MockMultipartFile(
            "file", 
            "test-image.jpg", 
            "image/jpeg", 
            "test-image-content".getBytes()
        );

        // Mock responses
        ImageUploadResponse uploadResponse = new ImageUploadResponse();
        uploadResponse.setImageId(UUID.randomUUID());
        uploadResponse.setProjectId(projectId);
        uploadResponse.setOriginalFilename("test-image.jpg");
        uploadResponse.setUploadedAt(java.time.LocalDateTime.now());

        ProjectResponse projectResponse = new ProjectResponse();
        projectResponse.setId(projectId);
        projectResponse.setExampleContainerNumber("DEF789012");

        OCRResultDTO ocrResult = new OCRResultDTO();
        ocrResult.setSuccess(true);
        ocrResult.setFilename("test-image.jpg");
        ocrResult.setExtractedText("Container numbers found");
        ocrResult.setConfidence(0.95);

        when(imageService.uploadImage(any(), any())).thenReturn(uploadResponse);
        when(projectService.getProjectById(projectId)).thenReturn(projectResponse);
        when(geminiService.extractContainerNumbers(any(byte[].class), anyString(), anyString(), anyString()))
            .thenReturn(ocrResult);

        // When & Then
        mockMvc.perform(multipart("/images/upload-and-extract")
                .file(file)
                .param("projectId", projectId.toString())
                .param("exampleNumber", exampleNumber)
                .param("description", "Test upload with example number"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.message").value("Image uploaded and processed successfully"))
                .andExpect(jsonPath("$.data.success").value(true))
                .andExpect(jsonPath("$.data.imageName").value("test-image.jpg"));
    }

    @Test
    void testUploadAndExtract_WithoutExampleNumber_UsesProjectExample() throws Exception {
        // Given
        UUID projectId = UUID.randomUUID();
        MockMultipartFile file = new MockMultipartFile(
            "file", 
            "test-image.jpg", 
            "image/jpeg", 
            "test-image-content".getBytes()
        );

        // Mock responses
        ImageUploadResponse uploadResponse = new ImageUploadResponse();
        uploadResponse.setImageId(UUID.randomUUID());
        uploadResponse.setProjectId(projectId);
        uploadResponse.setOriginalFilename("test-image.jpg");
        uploadResponse.setUploadedAt(java.time.LocalDateTime.now());

        ProjectResponse projectResponse = new ProjectResponse();
        projectResponse.setId(projectId);
        projectResponse.setExampleContainerNumber("PROJECT123456");

        OCRResultDTO ocrResult = new OCRResultDTO();
        ocrResult.setSuccess(true);
        ocrResult.setFilename("test-image.jpg");
        ocrResult.setExtractedText("Container numbers found");
        ocrResult.setConfidence(0.90);

        when(imageService.uploadImage(any(), any())).thenReturn(uploadResponse);
        when(projectService.getProjectById(projectId)).thenReturn(projectResponse);
        when(geminiService.extractContainerNumbers(any(byte[].class), anyString(), anyString(), eq("PROJECT123456")))
            .thenReturn(ocrResult);

        // When & Then
        mockMvc.perform(multipart("/images/upload-and-extract")
                .file(file)
                .param("projectId", projectId.toString())
                .param("description", "Test upload without example number"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.message").value("Image uploaded and processed successfully"))
                .andExpect(jsonPath("$.data.success").value(true))
                .andExpect(jsonPath("$.data.imageName").value("test-image.jpg"));
    }

    @Test
    void testUploadAndExtract_WithEmptyExampleNumber_UsesProjectExample() throws Exception {
        // Given
        UUID projectId = UUID.randomUUID();
        MockMultipartFile file = new MockMultipartFile(
            "file", 
            "test-image.jpg", 
            "image/jpeg", 
            "test-image-content".getBytes()
        );

        // Mock responses
        ImageUploadResponse uploadResponse = new ImageUploadResponse();
        uploadResponse.setImageId(UUID.randomUUID());
        uploadResponse.setProjectId(projectId);
        uploadResponse.setOriginalFilename("test-image.jpg");
        uploadResponse.setUploadedAt(java.time.LocalDateTime.now());

        ProjectResponse projectResponse = new ProjectResponse();
        projectResponse.setId(projectId);
        projectResponse.setExampleContainerNumber("FALLBACK789");

        OCRResultDTO ocrResult = new OCRResultDTO();
        ocrResult.setSuccess(true);
        ocrResult.setFilename("test-image.jpg");
        ocrResult.setExtractedText("Container numbers found");
        ocrResult.setConfidence(0.88);

        when(imageService.uploadImage(any(), any())).thenReturn(uploadResponse);
        when(projectService.getProjectById(projectId)).thenReturn(projectResponse);
        when(geminiService.extractContainerNumbers(any(byte[].class), anyString(), anyString(), eq("FALLBACK789")))
            .thenReturn(ocrResult);

        // When & Then
        mockMvc.perform(multipart("/images/upload-and-extract")
                .file(file)
                .param("projectId", projectId.toString())
                .param("exampleNumber", "")
                .param("description", "Test upload with empty example number"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.message").value("Image uploaded and processed successfully"))
                .andExpect(jsonPath("$.data.success").value(true))
                .andExpect(jsonPath("$.data.imageName").value("test-image.jpg"));
    }

    @Test
    void testUploadAndExtract_ProjectServiceException_HandledGracefully() throws Exception {
        // Given
        UUID projectId = UUID.randomUUID();
        String exampleNumber = "TEST123";
        MockMultipartFile file = new MockMultipartFile(
            "file", 
            "test-image.jpg", 
            "image/jpeg", 
            "test-image-content".getBytes()
        );

        // Mock responses
        ImageUploadResponse uploadResponse = new ImageUploadResponse();
        uploadResponse.setImageId(UUID.randomUUID());
        uploadResponse.setProjectId(projectId);
        uploadResponse.setOriginalFilename("test-image.jpg");
        uploadResponse.setUploadedAt(java.time.LocalDateTime.now());

        OCRResultDTO ocrResult = new OCRResultDTO();
        ocrResult.setSuccess(true);
        ocrResult.setFilename("test-image.jpg");
        ocrResult.setExtractedText("Container numbers found");
        ocrResult.setConfidence(0.85);

        when(imageService.uploadImage(any(), any())).thenReturn(uploadResponse);
        when(projectService.getProjectById(projectId)).thenThrow(new RuntimeException("Project not found"));
        when(geminiService.extractContainerNumbers(any(byte[].class), anyString(), anyString(), eq(exampleNumber)))
            .thenReturn(ocrResult);

        // When & Then - Should still work with provided example number
        mockMvc.perform(multipart("/images/upload-and-extract")
                .file(file)
                .param("projectId", projectId.toString())
                .param("exampleNumber", exampleNumber)
                .param("description", "Test upload with project service exception"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.message").value("Image uploaded and processed successfully"))
                .andExpect(jsonPath("$.data.success").value(true))
                .andExpect(jsonPath("$.data.imageName").value("test-image.jpg"));
    }
}
