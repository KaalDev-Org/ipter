package com.ipter.service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.codec.binary.Base64;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ipter.dto.ContainerExtractionResultDTO;
import com.ipter.dto.GeminiRequestDTO;
import com.ipter.dto.GeminiResponseDTO;
import com.ipter.dto.OCRResultDTO;
import com.ipter.util.ImageProcessingUtil;

/**
 * Service for integrating with Google Gemini API
 * Handles container number extraction from images using Gemini 2.0 Flash model
 */
@Service
public class GeminiService {
    
    private static final Logger logger = LoggerFactory.getLogger(GeminiService.class);
    
    @Value("${gemini.api.key}")
    private String apiKey;
    
    @Value("${gemini.api.url:https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent}")
    private String apiUrl;
    
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public GeminiService(RestTemplate restTemplate, ObjectMapper objectMapper) {
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
    }

    /**
     * Extract container numbers from image using Gemini API
     */
    public OCRResultDTO extractContainerNumbers(byte[] imageBytes, String filename, String mimeType) {
        try {
            logger.info("Starting container extraction for image: {}", filename);

            // Validate and normalize MIME type
            String geminiMimeType = ImageProcessingUtil.getGeminiCompatibleMimeType(mimeType);

            // Encode image to base64
            String base64Image = Base64.encodeBase64String(imageBytes);

            // Create Gemini request
            GeminiRequestDTO request = createGeminiImageRequest(base64Image, geminiMimeType);

            // Call Gemini API
            GeminiResponseDTO response = callGeminiAPI(request);

            // Process response and extract container numbers
            return processGeminiResponse(response, filename);

        } catch (Exception e) {
            logger.error("Error extracting container numbers from {}: {}", filename, e.getMessage());
            return createErrorResult(filename, "Container extraction failed: " + e.getMessage());
        }
    }

    /**
     * Extract container numbers directly from a PDF using Gemini API
     */
    public OCRResultDTO extractContainerNumbersFromPdf(byte[] pdfBytes, String filename) {
        try {
            logger.info("Starting container extraction for PDF: {}", filename);

            // Create Gemini request for PDF (uses file upload when possible)
            GeminiRequestDTO request = createGeminiPdfRequest(pdfBytes);

            // Call Gemini API
            GeminiResponseDTO response = callGeminiAPI(request);

            // Process response and extract container numbers
            return processGeminiPdfResponse(response, filename);

        } catch (Exception e) {
            logger.error("Error extracting container numbers from PDF {}: {}", filename, e.getMessage());
            return createErrorResult(filename, "PDF extraction failed: " + e.getMessage());
        }
    }
    
    /**
     * Create Gemini API request for image content
     */
    private GeminiRequestDTO createGeminiImageRequest(String base64Image, String mimeType) {
        String prompt = createContainerExtractionPrompt();

        GeminiRequestDTO.Part textPart = new GeminiRequestDTO.Part(prompt);
        GeminiRequestDTO.InlineData inlineData = new GeminiRequestDTO.InlineData(mimeType, base64Image);
        GeminiRequestDTO.Part imagePart = new GeminiRequestDTO.Part(inlineData);

        GeminiRequestDTO.ContentPart content = new GeminiRequestDTO.ContentPart(
            Arrays.asList(textPart, imagePart)
        );

        GeminiRequestDTO request = new GeminiRequestDTO(Arrays.asList(content));

        GeminiRequestDTO.GenerationConfig config = new GeminiRequestDTO.GenerationConfig();
        config.setTemperature(0.1);
        config.setMaxOutputTokens(2048);
        config.setResponseMimeType("application/json");
        request.setGenerationConfig(config);

        request.setSafetySettings(createSafetySettings());
        return request;
    }

    /**
     * Create Gemini API request for PDF content
     */
    private GeminiRequestDTO createGeminiPdfRequest(byte[] pdfBytes) {
        String prompt = createPdfExtractionPrompt();

        GeminiRequestDTO.Part textPart = new GeminiRequestDTO.Part(prompt);

        // Encode PDF to base64 (fallback inline)
        String base64Pdf = Base64.encodeBase64String(pdfBytes);
        GeminiRequestDTO.InlineData inlineData = new GeminiRequestDTO.InlineData("application/pdf", base64Pdf);
        GeminiRequestDTO.Part pdfPart = new GeminiRequestDTO.Part(inlineData);

        GeminiRequestDTO.ContentPart content = new GeminiRequestDTO.ContentPart(
            Arrays.asList(textPart, pdfPart)
        );

        GeminiRequestDTO request = new GeminiRequestDTO(Arrays.asList(content));

        GeminiRequestDTO.GenerationConfig config = new GeminiRequestDTO.GenerationConfig();
        config.setTemperature(0.1);
        config.setMaxOutputTokens(8192);
        config.setResponseMimeType("application/json");
        request.setGenerationConfig(config);

        request.setSafetySettings(createSafetySettings());
        return request;
    }

    /**
     * Prompt specialized for PDF container extraction as a flat list
     */
    private String createPdfExtractionPrompt() {
        return """
            Analyze this PDF document and extract all container numbers/serial numbers/medication numbers found in the content.
            Container numbers/serial numbers/medication numbers typically will be 6-8 digits numbers only.

            Return a JSON object with an array of items. Each item must include the container number and a confidence percentage string.

            Respond strictly in this JSON format:
            {
              \"items\": [
                { \"number\": \"ABCD1234567\", \"confidence\": \"98%\" },
                { \"number\": \"EFGH2345678\", \"confidence\": \"92%\" }
              ]
            }

            If none are found, return: { \"items\": [] }

            Do not include any additional commentary, keys, or explanations.
        """;
    }
    
    /**
     * Create the prompt for container number extraction
     */
    private String createContainerExtractionPrompt() {
        return """
            Analyze this image and extract all container numbers/serial numbers visible in the image.
            Container numbers typically follow the ISO 6346 standard format: 4 letters followed by 7 digits (e.g., ABCD1234567).
            
            Please organize the extracted container numbers in a structured format with rows and columns.
            For each container number found, provide a confidence level as a percentage.
            
            Return the results in the following JSON format:
            {
              "row1": {
                "1": "container_number_1", "confidence": "100%",
                "2": "container_number_2", "confidence": "95%",
                "3": "container_number_3", "confidence": "90%",
                "4": "container_number_4", "confidence": "85%",
                "5": "container_number_5", "confidence": "80%"
              },
              "row2": {
                "1": "container_number_6", "confidence": "100%",
                "2": "container_number_7", "confidence": "95%",
                "3": "container_number_8", "confidence": "90%",
                "4": "container_number_9", "confidence": "85%",
                "5": "container_number_10", "confidence": "80%"
              },
              "row3": {
                "1": "container_number_11", "confidence": "100%",
                "2": "container_number_12", "confidence": "95%",
                "3": "container_number_13", "confidence": "90%",
                "4": "container_number_14", "confidence": "85%",
                "5": "container_number_15", "confidence": "80%"
              }
            }
            
            If fewer container numbers are found, only include the rows and positions that have actual container numbers.
            If no container numbers are found, return an empty object: {}
            
            Focus on accuracy and only include text that clearly appears to be container numbers.
            """;
    }
    
    /**
     * Create safety settings for Gemini API
     */
    private List<GeminiRequestDTO.SafetySetting> createSafetySettings() {
        return Arrays.asList(
            new GeminiRequestDTO.SafetySetting("HARM_CATEGORY_HARASSMENT", "BLOCK_MEDIUM_AND_ABOVE"),
            new GeminiRequestDTO.SafetySetting("HARM_CATEGORY_HATE_SPEECH", "BLOCK_MEDIUM_AND_ABOVE"),
            new GeminiRequestDTO.SafetySetting("HARM_CATEGORY_SEXUALLY_EXPLICIT", "BLOCK_MEDIUM_AND_ABOVE"),
            new GeminiRequestDTO.SafetySetting("HARM_CATEGORY_DANGEROUS_CONTENT", "BLOCK_MEDIUM_AND_ABOVE")
        );
    }
    
    /**
     * Call Gemini API using WebClient to better handle large JSON responses
     */
    private GeminiResponseDTO callGeminiAPI(GeminiRequestDTO request) throws Exception {
        try {
            String url = apiUrl + "?key=" + apiKey;

            org.springframework.web.reactive.function.client.WebClient webClient =
                org.springframework.web.reactive.function.client.WebClient.builder()
                    .codecs(cfg -> cfg.defaultCodecs().maxInMemorySize(100 * 1024 * 1024)) // 100MB
                    .build();

            return webClient.post()
                .uri(url)
                .header("x-goog-api-key", apiKey)
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON)
                .bodyValue(request)
                .retrieve()
                .onStatus(status -> !status.is2xxSuccessful(), resp -> resp.bodyToMono(String.class)
                    .map(body -> new RuntimeException("Gemini API returned error: " + resp.statusCode() + " - " + body)))
                .bodyToMono(GeminiResponseDTO.class)
                .block();
        } catch (Exception e) {
            logger.error("Failed to call Gemini API: {}", e.getMessage());
            throw new RuntimeException("Gemini API call failed", e);
        }
    }
    
    /**
     * Process Gemini response and convert to OCRResultDTO
     */
    private OCRResultDTO processGeminiResponse(GeminiResponseDTO response, String filename) {
        try {
            if (response.getCandidates() == null || response.getCandidates().isEmpty()) {
                return createErrorResult(filename, "No response candidates from Gemini API");
            }
            
            GeminiResponseDTO.Candidate candidate = response.getCandidates().get(0);
            if (candidate.getContent() == null || candidate.getContent().getParts() == null || 
                candidate.getContent().getParts().isEmpty()) {
                return createErrorResult(filename, "No content in Gemini API response");
            }
            
            StringBuilder sb = new StringBuilder();
            if (candidate.getContent() != null && candidate.getContent().getParts() != null) {
                for (GeminiResponseDTO.Part part : candidate.getContent().getParts()) {
                    String t = part.getText();
                    if (t != null) sb.append(t);
                }
            }
            String jsonResponse = sb.toString();
            logger.debug("Gemini API response length: {}", jsonResponse.length());

            // Parse the structured JSON response
            ContainerExtractionResultDTO extractionResult = parseContainerExtractionResult(jsonResponse);
            
            // Convert to OCRResultDTO
            return convertToOCRResult(extractionResult, filename, response);
            
        } catch (Exception e) {
            logger.error("Error processing Gemini response: {}", e.getMessage());
            return createErrorResult(filename, "Failed to process Gemini response: " + e.getMessage());
        }
    }

    /**
     * Parse container extraction result from JSON (image flow - rows/columns)
     */
    private ContainerExtractionResultDTO parseContainerExtractionResult(String jsonResponse) throws JsonProcessingException {
        String cleanJson = jsonResponse.trim();
        if (cleanJson.startsWith("```json")) cleanJson = cleanJson.substring(7);
        if (cleanJson.endsWith("```")) cleanJson = cleanJson.substring(0, cleanJson.length() - 3);
        cleanJson = cleanJson.trim();
        return parseGeminiJsonResponse(cleanJson);
    }

    /**
     * Parse Gemini's JSON response (rows/columns structure for images)
     */
    private ContainerExtractionResultDTO parseGeminiJsonResponse(String jsonResponse) throws JsonProcessingException {
        try {
            Map<String, Object> jsonMap = objectMapper.readValue(jsonResponse, Map.class);
            ContainerExtractionResultDTO result = new ContainerExtractionResultDTO();
            Map<String, ContainerExtractionResultDTO.RowData> rows = new HashMap<>();
            for (Map.Entry<String, Object> rowEntry : jsonMap.entrySet()) {
                String rowKey = rowEntry.getKey();
                if (rowKey.startsWith("row") && rowEntry.getValue() instanceof Map) {
                    Map<String, Object> rowMap = (Map<String, Object>) rowEntry.getValue();
                    ContainerExtractionResultDTO.RowData rowData = new ContainerExtractionResultDTO.RowData();
                    String currentConfidence = "95%"; // default
                    for (Map.Entry<String, Object> posEntry : rowMap.entrySet()) {
                        String posKey = posEntry.getKey();
                        String value = String.valueOf(posEntry.getValue());
                        if (posKey.equals("confidence")) {
                            currentConfidence = value;
                        } else {
                            try {
                                int position = Integer.parseInt(posKey);
                                if (position >= 1 && position <= 5) {
                                    rowData.setEntry(position, value, currentConfidence);
                                }
                            } catch (NumberFormatException ignored) {}
                        }
                    }
                    rows.put(rowKey, rowData);
                }
            }
            result.setRows(rows);
            logger.info("Successfully parsed {} rows from Gemini response", rows.size());
            return result;
        } catch (JsonProcessingException ex) {
            // Attempt to salvage truncated/incomplete JSON by extracting valid prefix
            String repaired = tryRepairJsonArrayItems(jsonResponse);
            if (repaired != null) {
                Map<String, Object> jsonMap = objectMapper.readValue(repaired, Map.class);
                ContainerExtractionResultDTO result = new ContainerExtractionResultDTO();
                result.setRows(new HashMap<>()); // no rows for image repair path
                logger.warn("Repaired Gemini JSON for image flow; items ignored. Length={}.", repaired.length());
                return result;
            }
            throw ex;
        }
    }

    // Attempt to salvage truncated/incomplete JSON by extracting the longest valid JSON object prefix
    private String tryRepairJsonArrayItems(String json) {
        // Simple heuristic: find last occurrence of '}' followed by ']' to close items, else null
        try {
            int itemsIdx = json.indexOf("\"items\"");
            if (itemsIdx < 0) return null;
            int lastBrace = json.lastIndexOf('}');
            int lastBracket = json.lastIndexOf(']');
            if (lastBracket < 0 || lastBrace < 0) return null;
            int end = Math.max(lastBrace, lastBracket);
            String candidate = json.substring(0, end + 1);
            // Ensure it ends with valid object: if ends with ']', add closing '}' for the outer object
            if (candidate.endsWith("]")) {
                candidate = candidate + "}";
            }
            // Basic sanity check by parsing
            objectMapper.readTree(candidate);
            return candidate;
        } catch (Exception ex) {
            logger.warn("Failed to repair Gemini JSON: {}", ex.getMessage());
            return null;
        }
    }

    /**
     * Process PDF response (flat items list) and convert to OCRResultDTO
     */
    private OCRResultDTO processGeminiPdfResponse(GeminiResponseDTO response, String filename) throws JsonProcessingException {
        if (response.getCandidates() == null || response.getCandidates().isEmpty()) {
            return createErrorResult(filename, "No response candidates from Gemini API");
        }
        GeminiResponseDTO.Candidate candidate = response.getCandidates().get(0);
        if (candidate.getContent() == null || candidate.getContent().getParts() == null || candidate.getContent().getParts().isEmpty()) {
            return createErrorResult(filename, "No content in Gemini API response");
        }

        // Concatenate all parts text to build the full JSON
        StringBuilder sb = new StringBuilder();
        for (GeminiResponseDTO.Part part : candidate.getContent().getParts()) {
            String t = part.getText();
            if (t != null) sb.append(t);
        }
        String jsonResponse = sb.toString();
        logger.info("Full Gemini response length: {} chars", jsonResponse.length());

        String cleanJson = jsonResponse.trim();
        if (cleanJson.startsWith("```json")) cleanJson = cleanJson.substring(7);
        if (cleanJson.endsWith("```")) cleanJson = cleanJson.substring(0, cleanJson.length() - 3);
        cleanJson = cleanJson.trim();

        Map<String, Object> map = null;
        List<Map<String, Object>> items = new ArrayList<>();
        try {
            map = objectMapper.readValue(cleanJson, Map.class);
            items = (List<Map<String, Object>>) map.getOrDefault("items", new ArrayList<>());
            logger.info("Successfully parsed JSON with {} items", items.size());
        } catch (JsonProcessingException ex) {
            logger.warn("JSON parse failed: {}", ex.getMessage());
            String repaired = tryRepairJsonArrayItems(cleanJson);
            if (repaired != null) {
                map = objectMapper.readValue(repaired, Map.class);
                items = (List<Map<String, Object>>) map.getOrDefault("items", new ArrayList<>());
                logger.info("Repaired JSON with {} items", items.size());
            } else {
                // Fallback: items-only extraction from raw text
                logger.warn("Repair failed, trying items-only extraction");
                items = extractItemsFromText(cleanJson);
            }
        }

        OCRResultDTO result = new OCRResultDTO();
        result.setFilename(filename);
        result.setSuccess(true);

        List<OCRResultDTO.ContainerNumberDTO> containerNumbers = new ArrayList<>();
        double totalConfidence = 0.0;
        int count = 0;
        StringBuilder text = new StringBuilder();

        for (Map<String, Object> item : items) {
            Object numObj = item.get("number");
            Object confObj = item.get("confidence");
            if (numObj == null) continue;
            String number = numObj.toString();
            String confStr = confObj != null ? confObj.toString() : "";
            double conf = parseConfidence(confStr);

            OCRResultDTO.ContainerNumberDTO dto = new OCRResultDTO.ContainerNumberDTO();
            dto.setNumber(number);
            dto.setConfidence(conf);
            dto.setValidationStatus(validateContainerNumber(number) ? "VALID" : "INVALID");
            containerNumbers.add(dto);

            if (text.length() > 0) text.append("\n");
            text.append(number).append(confStr.isEmpty() ? "" : " (" + confStr + ")");

            totalConfidence += conf;
            count++;
        }

        result.setContainerNumbers(containerNumbers);
        result.setExtractedText(text.toString());
        result.setConfidence(count > 0 ? totalConfidence / count : 0.0);

        OCRResultDTO.ProcessingMetadataDTO metadata = new OCRResultDTO.ProcessingMetadataDTO();
        metadata.setEngine("Google Gemini 2.0 Flash");
        metadata.setEngineVersion("2.0");
        metadata.setTimestamp(java.time.LocalDateTime.now());
        if (response.getUsageMetadata() != null) {
            int totalTokens = response.getUsageMetadata().getTotalTokenCount();
            metadata.setProcessingTime(totalTokens * 0.001);
        }
        result.setProcessingMetadata(metadata);
        return result;
    }

    // Fallback extractor: pull {"number":"...","confidence":"..."} pairs from raw text
    private List<Map<String, Object>> extractItemsFromText(String text) {
        List<Map<String, Object>> items = new ArrayList<>();
        logger.info("Attempting items-only extraction from text length: {}", text.length());

        // Very permissive pattern to catch pairs even across newlines/spaces
        java.util.regex.Pattern p = java.util.regex.Pattern.compile("\\{\\s*\"number\"\\s*:\\s*\"([^\"]+)\"\\s*,\\s*\"confidence\"\\s*:\\s*\"([^\"]+)\"\\s*\\}");
        java.util.regex.Matcher m = p.matcher(text.replace("\n", " "));

        int matchCount = 0;
        while (m.find()) {
            String number = m.group(1);
            String confidence = m.group(2);
            java.util.HashMap<String, Object> map = new java.util.HashMap<>();
            map.put("number", number);
            map.put("confidence", confidence);
            items.add(map);
            matchCount++;
        }

        logger.info("Items-only extraction found {} matches", matchCount);
        return items;
    }

    /**
     * Convert ContainerExtractionResultDTO (image rows/columns) to OCRResultDTO
     */
    private OCRResultDTO convertToOCRResult(ContainerExtractionResultDTO extractionResult,
                                            String filename, GeminiResponseDTO geminiResponse) {
        OCRResultDTO result = new OCRResultDTO();
        result.setFilename(filename);
        result.setSuccess(true);

        List<OCRResultDTO.ContainerNumberDTO> containerNumbers = new ArrayList<>();
        StringBuilder extractedText = new StringBuilder();
        double totalConfidence = 0.0;
        int containerCount = 0;

        if (extractionResult.getRows() != null) {
            for (Map.Entry<String, ContainerExtractionResultDTO.RowData> rowEntry : extractionResult.getRows().entrySet()) {
                String rowName = rowEntry.getKey();
                ContainerExtractionResultDTO.RowData rowData = rowEntry.getValue();
                extractedText.append("Row ").append(rowName).append(":\n");
                for (int i = 1; i <= 5; i++) {
                    ContainerExtractionResultDTO.ContainerEntry entry = rowData.getEntry(i);
                    if (entry != null && entry.getContainerNumber() != null && !entry.getContainerNumber().isEmpty()) {
                        String containerNumber = entry.getContainerNumber();
                        String confidenceStr = entry.getConfidence();
                        double confidence = parseConfidence(confidenceStr);
                        OCRResultDTO.ContainerNumberDTO containerDTO = new OCRResultDTO.ContainerNumberDTO();
                        containerDTO.setNumber(containerNumber);
                        containerDTO.setConfidence(confidence);
                        containerDTO.setValidationStatus(validateContainerNumber(containerNumber) ? "VALID" : "INVALID");
                        containerNumbers.add(containerDTO);
                        extractedText.append("  Position ").append(i).append(": ").append(containerNumber)
                                .append(" (").append(confidenceStr).append(")\n");
                        totalConfidence += confidence;
                        containerCount++;
                    }
                }
                extractedText.append("\n");
            }
        }

        result.setContainerNumbers(containerNumbers);
        result.setExtractedText(extractedText.toString());
        result.setConfidence(containerCount > 0 ? totalConfidence / containerCount : 0.0);

        OCRResultDTO.ProcessingMetadataDTO metadata = new OCRResultDTO.ProcessingMetadataDTO();
        metadata.setEngine("Google Gemini 2.0 Flash");
        metadata.setEngineVersion("2.0");
        metadata.setTimestamp(java.time.LocalDateTime.now());
        if (geminiResponse.getUsageMetadata() != null) {
            int totalTokens = geminiResponse.getUsageMetadata().getTotalTokenCount();
            metadata.setProcessingTime(totalTokens * 0.001);
        }
        result.setProcessingMetadata(metadata);
        return result;
    }

    /**
     * Parse confidence percentage string to double
     */
    private double parseConfidence(String confidenceStr) {
        if (confidenceStr == null || confidenceStr.isEmpty()) {
            return 0.0;
        }
        try {
            String numStr = confidenceStr.replace("%", "").trim();
            return Double.parseDouble(numStr);
        } catch (NumberFormatException e) {
            logger.warn("Failed to parse confidence: {}", confidenceStr);
            return 0.0;
        }
    }

    private boolean validateContainerNumber(String containerNumber) {
        return ImageProcessingUtil.isValidContainerNumberFlexible(containerNumber);
    }

    private OCRResultDTO createErrorResult(String filename, String errorMessage) {
        OCRResultDTO result = new OCRResultDTO();
        result.setFilename(filename);
        result.setSuccess(false);
        result.setErrorMessage(errorMessage);
        result.setContainerNumbers(new ArrayList<>());
        result.setExtractedText("");
        result.setConfidence(0.0);
        return result;
    }
}

