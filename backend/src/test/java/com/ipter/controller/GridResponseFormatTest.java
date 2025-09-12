package com.ipter.controller;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.isNull;
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

import com.ipter.dto.ImageUploadResponse;
import com.ipter.dto.OCRResultDTO;
import com.ipter.service.GeminiService;
import com.ipter.service.ImageService;
import com.ipter.service.ProjectService;

/**
 * Test to verify the exact grid response format for upload-and-extract endpoint
 */
@ExtendWith(MockitoExtension.class)
class GridResponseFormatTest {

    @Mock
    private ImageService imageService;

    @Mock
    private GeminiService geminiService;

    @Mock
    private ProjectService projectService;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        ImageController imageController = new ImageController();

        // Inject mocked services using reflection
        org.springframework.test.util.ReflectionTestUtils.setField(imageController, "imageService", imageService);
        org.springframework.test.util.ReflectionTestUtils.setField(imageController, "geminiService", geminiService);
        org.springframework.test.util.ReflectionTestUtils.setField(imageController, "projectService", projectService);

        mockMvc = MockMvcBuilders.standaloneSetup(imageController).build();
    }

    @Test
    void testUploadAndExtract_ReturnsExactGridFormat() throws Exception {
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

        // Create OCR result with container numbers
        OCRResultDTO ocrResult = new OCRResultDTO();
        ocrResult.setSuccess(true);
        ocrResult.setFilename("test-image.jpg");
        ocrResult.setExtractedText("Container numbers found");
        ocrResult.setConfidence(0.95);
        
        List<OCRResultDTO.ContainerNumberDTO> containerNumbers = new ArrayList<>();
        OCRResultDTO.ContainerNumberDTO container = new OCRResultDTO.ContainerNumberDTO();
        container.setNumber("BGB-43395, 200 mg");
        container.setConfidence(95.0);
        containerNumbers.add(container);
        ocrResult.setContainerNumbers(containerNumbers);

        when(imageService.uploadImage(any(), any())).thenReturn(uploadResponse);
        when(projectService.getProjectById(projectId)).thenThrow(new RuntimeException("Project not found"));
        when(geminiService.extractContainerNumbers(any(byte[].class), anyString(), anyString(), isNull()))
            .thenReturn(ocrResult);

        // When & Then - Verify exact grid structure
        mockMvc.perform(multipart("/images/upload-and-extract")
                .file(file)
                .param("projectId", projectId.toString())
                .param("description", "Test grid format"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))

                // Verify metadata
                .andExpect(jsonPath("$.imageId").exists())
                .andExpect(jsonPath("$.projectId").value(projectId.toString()))
                .andExpect(jsonPath("$.imageName").value("test-image.jpg"))
                .andExpect(jsonPath("$.success").value(true))

                // Verify grid_structure
                .andExpect(jsonPath("$.grid_structure.rows").value(3))
                .andExpect(jsonPath("$.grid_structure.columns").value(5))
                .andExpect(jsonPath("$.grid_structure.total_products").value(15))
                
                // Verify row1 structure
                .andExpect(jsonPath("$.row1.1.number").value("BGB-43395, 200 mg"))
                .andExpect(jsonPath("$.row1.1.confidence").value("95%"))
                .andExpect(jsonPath("$.row1.2.number").value("BGB-43395, 200 mg"))
                .andExpect(jsonPath("$.row1.2.confidence").value("95%"))
                .andExpect(jsonPath("$.row1.3.number").value("BGB-43395, 200 mg"))
                .andExpect(jsonPath("$.row1.3.confidence").value("95%"))
                .andExpect(jsonPath("$.row1.4.number").value("BGB-43395, 200 mg"))
                .andExpect(jsonPath("$.row1.4.confidence").value("95%"))
                .andExpect(jsonPath("$.row1.5.number").value("BGB-43395, 200 mg"))
                .andExpect(jsonPath("$.row1.5.confidence").value("95%"))
                
                // Verify row2 structure
                .andExpect(jsonPath("$.row2.1.number").value("BGB-43395, 200 mg"))
                .andExpect(jsonPath("$.row2.1.confidence").value("95%"))
                .andExpect(jsonPath("$.row2.5.number").value("BGB-43395, 200 mg"))
                .andExpect(jsonPath("$.row2.5.confidence").value("95%"))
                
                // Verify row3 structure
                .andExpect(jsonPath("$.row3.1.number").value("BGB-43395, 200 mg"))
                .andExpect(jsonPath("$.row3.1.confidence").value("95%"))
                .andExpect(jsonPath("$.row3.5.number").value("BGB-43395, 200 mg"))
                .andExpect(jsonPath("$.row3.5.confidence").value("95%"));
    }

    @Test
    void testUploadAndExtract_WithNoContainerNumbers_UsesFallback() throws Exception {
        // Given
        UUID projectId = UUID.randomUUID();
        MockMultipartFile file = new MockMultipartFile(
            "file", 
            "empty-image.jpg", 
            "image/jpeg", 
            "empty-image-content".getBytes()
        );

        // Mock responses
        ImageUploadResponse uploadResponse = new ImageUploadResponse();
        uploadResponse.setImageId(UUID.randomUUID());
        uploadResponse.setProjectId(projectId);
        uploadResponse.setOriginalFilename("empty-image.jpg");
        uploadResponse.setUploadedAt(java.time.LocalDateTime.now());

        // Create OCR result with no container numbers
        OCRResultDTO ocrResult = new OCRResultDTO();
        ocrResult.setSuccess(false);
        ocrResult.setFilename("empty-image.jpg");
        ocrResult.setExtractedText("");
        ocrResult.setConfidence(0.0);
        ocrResult.setContainerNumbers(new ArrayList<>()); // Empty list

        when(imageService.uploadImage(any(), any())).thenReturn(uploadResponse);
        when(projectService.getProjectById(projectId)).thenThrow(new RuntimeException("Project not found"));
        when(geminiService.extractContainerNumbers(any(byte[].class), anyString(), anyString(), isNull()))
            .thenReturn(ocrResult);

        // When & Then - Should use fallback values
        mockMvc.perform(multipart("/images/upload-and-extract")
                .file(file)
                .param("projectId", projectId.toString())
                .param("description", "Test fallback values"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                
                // Verify grid_structure
                .andExpect(jsonPath("$.grid_structure.rows").value(3))
                .andExpect(jsonPath("$.grid_structure.columns").value(5))
                .andExpect(jsonPath("$.grid_structure.total_products").value(15))
                
                // Verify fallback values are used
                .andExpect(jsonPath("$.row1.1.number").value("BGB-43395, 200 mg"))
                .andExpect(jsonPath("$.row1.1.confidence").value("95%"))
                .andExpect(jsonPath("$.row2.3.number").value("BGB-43395, 200 mg"))
                .andExpect(jsonPath("$.row2.3.confidence").value("95%"))
                .andExpect(jsonPath("$.row3.5.number").value("BGB-43395, 200 mg"))
                .andExpect(jsonPath("$.row3.5.confidence").value("95%"));
    }
}
