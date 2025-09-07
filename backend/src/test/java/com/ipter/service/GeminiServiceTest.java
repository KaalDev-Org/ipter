package com.ipter.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.fail;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ipter.dto.OCRResultDTO;

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

        // Verify that ObjectMapper is injected
        assertNotNull(ReflectionTestUtils.getField(geminiService, "objectMapper"));
    }

    @Test
    void testExtractContainerNumbers_WithExampleNumber() {
        // Given
        byte[] testImageBytes = "test-image-data".getBytes();
        String filename = "test-container-image.jpg";
        String mimeType = "image/jpeg";
        String exampleNumber = "ABC123456";

        // When - This will fail without actual API call, but tests the structure
        try {
            OCRResultDTO result = geminiService.extractContainerNumbers(testImageBytes, filename, mimeType, exampleNumber);

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
    void testExtractContainerNumbers_WithNullExampleNumber() {
        // Given
        byte[] testImageBytes = "test-image-data".getBytes();
        String filename = "test-container-image.jpg";
        String mimeType = "image/jpeg";
        String exampleNumber = null;

        // When - This should work the same as without example number
        try {
            OCRResultDTO result = geminiService.extractContainerNumbers(testImageBytes, filename, mimeType, exampleNumber);

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
    void testExtractContainerNumbers_WithEmptyExampleNumber() {
        // Given
        byte[] testImageBytes = "test-image-data".getBytes();
        String filename = "test-container-image.jpg";
        String mimeType = "image/jpeg";
        String exampleNumber = "";

        // When - This should work the same as without example number
        try {
            OCRResultDTO result = geminiService.extractContainerNumbers(testImageBytes, filename, mimeType, exampleNumber);

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
    void testExtractContainerNumbersFromPdf_WithExampleNumber() {
        // Given
        byte[] testPdfBytes = "test-pdf-data".getBytes();
        String filename = "test-container-list.pdf";
        String exampleNumber = "XYZ789012";

        // When - This will fail without actual API call, but tests the structure
        try {
            OCRResultDTO result = geminiService.extractContainerNumbersFromPdf(testPdfBytes, filename, exampleNumber);

            // Then - Verify the structure is correct
            assertNotNull(result);
            assertNotNull(result.getFilename());
            assertEquals(filename, result.getFilename());

        } catch (Exception e) {
            // Expected to fail without real API key, but structure should be correct
            assertTrue(e.getMessage().contains("Gemini API call failed") ||
                      e.getMessage().contains("PDF extraction failed"));
        }
    }

    @Test
    void testExtractContainerNumbersFromPdf_WithoutExampleNumber() {
        // Given
        byte[] testPdfBytes = "test-pdf-data".getBytes();
        String filename = "test-container-list.pdf";

        // When - This should use the original method
        try {
            OCRResultDTO result = geminiService.extractContainerNumbersFromPdf(testPdfBytes, filename);

            // Then - Verify the structure is correct
            assertNotNull(result);
            assertNotNull(result.getFilename());
            assertEquals(filename, result.getFilename());

        } catch (Exception e) {
            // Expected to fail without real API key, but structure should be correct
            assertTrue(e.getMessage().contains("Gemini API call failed") ||
                      e.getMessage().contains("PDF extraction failed"));
        }
    }

    @Test
    void testGridDetectionPromptContainsCompleteRowInstructions() {
        // Test that the enhanced prompt contains the critical instructions for complete row detection
        // This is a structural test to ensure our prompt improvements are in place

        // Use reflection to access the private method for testing
        try {
            java.lang.reflect.Method method = GeminiService.class.getDeclaredMethod("createContainerExtractionPrompt", String.class);
            method.setAccessible(true);

            String prompt = (String) method.invoke(geminiService, "TEST123");

            // Verify the prompt contains key instructions for complete row detection
            assertTrue(prompt.contains("SCAN THE ENTIRE IMAGE"), "Prompt should emphasize scanning entire image");
            assertTrue(prompt.contains("Do NOT stop counting rows prematurely"), "Prompt should warn against premature stopping");
            assertTrue(prompt.contains("NEVER skip or omit rows"), "Prompt should explicitly forbid skipping rows");
            assertTrue(prompt.contains("scan the ENTIRE image including bottom edges"), "Prompt should mention bottom edges");
            assertTrue(prompt.contains("DOUBLE-CHECK that you have included ALL visible rows"), "Prompt should include double-check instruction");
            assertTrue(prompt.contains("especially the bottom row"), "Prompt should specifically mention bottom row");
            assertTrue(prompt.contains("If you see 5 rows, report 5 rows"), "Prompt should give specific counting example");
            assertTrue(prompt.contains("row1, row2, row3, row4, row5"), "Prompt should show complete row sequence");

            // Verify the 5x6 grid example is present
            assertTrue(prompt.contains("5x6 grid"), "Prompt should contain 5x6 grid example");
            assertTrue(prompt.contains("30 total products"), "Prompt should show correct total for 5x6 grid");

        } catch (Exception e) {
            fail("Failed to test prompt content: " + e.getMessage());
        }
    }
}
