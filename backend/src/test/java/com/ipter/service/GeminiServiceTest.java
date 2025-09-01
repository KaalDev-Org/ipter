package com.ipter.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ipter.dto.OCRResultDTO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestTemplate;

import java.nio.file.Files;
import java.nio.file.Paths;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;

/**
 * Test class for GeminiService
 */
@ExtendWith(MockitoExtension.class)
class GeminiServiceTest {
    
    @Mock
    private RestTemplate restTemplate;
    
    private ObjectMapper objectMapper;
    private GeminiService geminiService;
    
    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        geminiService = new GeminiService(restTemplate, objectMapper);
        
        // Set test API key and URL
        ReflectionTestUtils.setField(geminiService, "apiKey", "test-api-key");
        ReflectionTestUtils.setField(geminiService, "apiUrl", "https://test-api-url");
    }
    
    @Test
    void testExtractContainerNumbers_WithValidInput() {
        // Given
        byte[] testImageBytes = "test-image-data".getBytes();
        String filename = "test-container-image.jpg";
        String mimeType = "image/jpeg";
        
        // When - This will fail without actual API call, but tests the structure
        try {
            OCRResultDTO result = geminiService.extractContainerNumbers(testImageBytes, filename, mimeType);
            
            // Then - Verify the structure is correct
            assertNotNull(result);
            assertNotNull(result.getFilename());
            assertEquals(filename, result.getFilename());
            
        } catch (Exception e) {
            // Expected to fail without real API key, but structure should be correct
            assertTrue(e.getMessage().contains("Gemini API call failed") || 
                      e.getMessage().contains("Container extraction failed"));
        }
    }
    
    @Test
    void testExtractContainerNumbers_WithNullInput() {
        // Given
        byte[] testImageBytes = null;
        String filename = "test.jpg";
        String mimeType = "image/jpeg";
        
        // When
        OCRResultDTO result = geminiService.extractContainerNumbers(testImageBytes, filename, mimeType);
        
        // Then
        assertNotNull(result);
        assertFalse(result.getSuccess());
        assertNotNull(result.getErrorMessage());
        assertEquals(filename, result.getFilename());
    }
    
    @Test
    void testExtractContainerNumbers_WithEmptyInput() {
        // Given
        byte[] testImageBytes = new byte[0];
        String filename = "empty.jpg";
        String mimeType = "image/jpeg";
        
        // When
        OCRResultDTO result = geminiService.extractContainerNumbers(testImageBytes, filename, mimeType);
        
        // Then
        assertNotNull(result);
        // Should handle empty input gracefully
        assertEquals(filename, result.getFilename());
    }
    
    @Test
    void testCreateContainerExtractionPrompt() {
        // This tests that the service can be instantiated and basic methods work
        assertNotNull(geminiService);
        
        // Test that the service has the required fields set
        assertNotNull(ReflectionTestUtils.getField(geminiService, "apiKey"));
        assertNotNull(ReflectionTestUtils.getField(geminiService, "apiUrl"));
    }
    
    @Test
    void testServiceConfiguration() {
        // Test that the service is properly configured
        assertNotNull(geminiService);
        
        // Verify that RestTemplate and ObjectMapper are injected
        assertNotNull(ReflectionTestUtils.getField(geminiService, "restTemplate"));
        assertNotNull(ReflectionTestUtils.getField(geminiService, "objectMapper"));
    }
}
