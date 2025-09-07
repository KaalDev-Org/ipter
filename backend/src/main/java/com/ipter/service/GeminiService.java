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
    
    private final ObjectMapper objectMapper;

    public GeminiService(RestTemplate restTemplate, ObjectMapper objectMapper) {
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

            CONFIDENCE CALCULATION - CRITICAL FOR ACCURACY:
            You MUST analyze each container number's visual quality and assign realistic confidence scores based on:

            VISUAL QUALITY FACTORS FOR PDF TEXT:
            1. TEXT CLARITY: Sharp, crisp text = higher confidence, blurry/pixelated = lower confidence
            2. RESOLUTION: High-quality PDF = higher confidence, low-resolution scan = lower confidence
            3. CONTRAST: Clear text against background = higher confidence, poor contrast = lower confidence
            4. COMPLETENESS: Fully visible numbers = higher confidence, partially cut off = lower confidence
            5. FONT QUALITY: Clear fonts = higher confidence, distorted/corrupted fonts = lower confidence
            6. SCAN QUALITY: Clean scans = higher confidence, artifacts/noise = lower confidence
            7. ORIENTATION: Straight text = higher confidence, rotated/skewed = lower confidence

            CONFIDENCE SCORING FOR PDF:
            - 95-99%: Perfect digital text, crystal clear, high resolution
            - 90-94%: Excellent quality with minor imperfections
            - 85-89%: Good quality with some clarity issues
            - 80-84%: Fair quality, readable but with noticeable issues
            - 75-79%: Marginal quality, readable but challenging
            - 70-74%: Poor quality, barely readable
            - 65-69%: Very poor quality, highly uncertain
            - 60-64%: Extremely poor quality, best guess only
            - Below 60%: Do not include unless absolutely necessary

            REALISTIC CONFIDENCE REQUIREMENTS:
            - DO NOT default to high confidence scores (95%+) for all extractions
            - Most PDF scans will have varying quality across different areas
            - Be honest about text quality - lower confidence is better than false accuracy
            - Consider that different parts of the PDF may have different scan quality

            Return a JSON object with an array of items. Each item must include the container number and a realistic confidence percentage based on visual analysis.

            Respond strictly in this JSON format:
            {
              \"items\": [
                { \"number\": \"ABCD1234567\", \"confidence\": \"87%\" },
                { \"number\": \"EFGH2345678\", \"confidence\": \"92%\" },
                { \"number\": \"IJKL3456789\", \"confidence\": \"74%\" }
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
            CRITICAL: You are analyzing an image containing pharmaceutical products or medical containers arranged in a grid pattern. Your PRIMARY task is to accurately detect the grid structure and extract serial numbers from each position.

            GRID DETECTION (HIGHEST PRIORITY):
            1. FIRST: Count the EXACT number of rows and columns in the product grid
            2. Look carefully at the physical arrangement - products may be in 2x3, 3x2, 4x2, 5x3, 6x2, etc.
            3. Count ALL visible product positions, even if some serial numbers are unreadable
            4. The grid structure MUST reflect the actual physical layout you observe
            5. Do NOT limit yourself to small grids - accurately count larger arrangements (up to 8 columns, 6 rows)

            SERIAL NUMBER EXTRACTION:
            1. CAREFULLY examine each product/container in the image - they are DIFFERENT products with DIFFERENT serial numbers
            2. DO NOT repeat the same serial number multiple times - each product has its own unique identifier
            3. Look for serial numbers, lot numbers, batch numbers, or container identifiers on each individual product
            4. Serial numbers may be in various formats: alphanumeric codes, numbers with letters, etc.
            5. If you cannot clearly read a serial number, provide your best estimate and reduce the confidence accordingly
            6. If a serial number is unclear or partially obscured, still attempt to extract it but lower the confidence (e.g., 60-80%)
            7. NEVER make up or duplicate serial numbers - each extracted number must correspond to a visible product
            8. For positions where you cannot extract any serial number, omit that position from the row data

            SYSTEMATIC APPROACH:
            - Count rows from top to bottom (1, 2, 3, 4, 5, 6...)
            - Count columns from left to right (1, 2, 3, 4, 5, 6, 7, 8...)
            - Work systematically through each position
            - Extract serial numbers where possible, skip positions where impossible

            RESPONSE FORMAT:
            You MUST return results in this EXACT JSON format. Adapt the number of rows and positions based on what you actually see.
            CRITICAL: Each position must have its own individual confidence score based on visual analysis:
            {
              "grid_structure": {
                "rows": [ACTUAL_ROW_COUNT],
                "columns": [ACTUAL_COLUMN_COUNT],
                "total_products": [ACTUAL_TOTAL_COUNT]
              },
              "row1": {
                "1": { "number": "ACTUAL_SERIAL_1", "confidence": "87%" },
                "2": { "number": "ACTUAL_SERIAL_2", "confidence": "92%" },
                "3": { "number": "ACTUAL_SERIAL_3", "confidence": "74%" }
              },
              "row2": {
                "1": { "number": "ACTUAL_SERIAL_4", "confidence": "96%" },
                "2": { "number": "ACTUAL_SERIAL_5", "confidence": "68%" },
                "3": { "number": "ACTUAL_SERIAL_6", "confidence": "89%" }
              }
            }

            MANDATORY CONFIDENCE REQUIREMENTS:
            - Each container number MUST have its own individual confidence percentage
            - Confidence scores MUST vary based on actual visual quality assessment
            - DO NOT use the same confidence score for multiple positions
            - DO NOT default to 95% - analyze each position individually
            - Confidence scores should realistically range from 60% to 99%

            CRITICAL REQUIREMENTS:
            - The "grid_structure" field is MANDATORY and must contain the EXACT dimensions you observe
            - Include ALL rows you see, even if some positions have no extractable serial numbers
            - Only include positions in row data where you can extract a serial number
            - Maximum supported: 8 columns, 6 rows (adjust based on actual image)

            CONFIDENCE CALCULATION - CRITICAL FOR ACCURACY:
            You MUST analyze each container number's visual quality and assign realistic confidence scores based on the following detailed criteria:

            VISUAL QUALITY ASSESSMENT FACTORS:
            1. IMAGE RESOLUTION: Higher resolution = higher confidence potential
            2. LIGHTING CONDITIONS: Good lighting = higher confidence, shadows/glare = lower confidence
            3. TEXT CLARITY: Sharp, crisp text = higher confidence, blurry text = lower confidence
            4. OCCLUSION: Fully visible = higher confidence, partially hidden = lower confidence
            5. VIEWING ANGLE: Straight-on view = higher confidence, angled view = lower confidence
            6. CONTRAST: High contrast between text and background = higher confidence
            7. FOCUS: In-focus text = higher confidence, out-of-focus = lower confidence
            8. WEAR/DAMAGE: Clean labels = higher confidence, worn/damaged labels = lower confidence

            CONFIDENCE SCORING GUIDELINES:
            - 95-99%: Perfect conditions - crystal clear, high resolution, excellent lighting, straight angle, sharp focus, high contrast
            - 90-94%: Excellent conditions - very clear text with minor imperfections (slight angle, minor lighting issues)
            - 85-89%: Good conditions - clearly readable with some quality issues (moderate blur, lighting variations)
            - 80-84%: Fair conditions - readable but with noticeable quality issues (some blur, poor lighting, slight occlusion)
            - 75-79%: Marginal conditions - readable but challenging (significant blur, poor contrast, partial occlusion)
            - 70-74%: Poor conditions - barely readable, multiple quality issues present
            - 65-69%: Very poor conditions - highly uncertain reading, severe quality issues
            - 60-64%: Extremely poor conditions - best guess only, very low certainty
            - Below 60%: Do not include unless absolutely necessary

            REALISTIC CONFIDENCE DISTRIBUTION:
            - DO NOT default to 95% for all extractions
            - Most real-world images will have varying quality across different positions
            - Expect confidence scores to range from 60% to 99% based on actual visual conditions
            - Consider that different positions in the same image may have different lighting, focus, or angles
            - Be honest about uncertainty - it's better to report lower confidence than to overstate accuracy

            SPECIFIC CONFIDENCE ASSESSMENT PROCESS:
            For each container number, ask yourself:
            1. How clear and sharp is this specific text?
            2. Are there any shadows, reflections, or glare affecting this area?
            3. Is this text at an angle or straight-on?
            4. Is the entire number visible or partially obscured?
            5. How good is the contrast between the text and background?
            6. Are there any focus issues in this specific area?

            Base your confidence percentage on honest answers to these questions.

            QUALITY CONTROL:
            - Verify the grid structure matches the physical layout exactly
            - Ensure no duplicate serial numbers in your response
            - Double-check that each extracted serial number corresponds to a visible product
            - If unsure about a character, provide your best interpretation

            FINAL CRITICAL REMINDERS:
            1. Focus on ACCURATE GRID DETECTION first, then UNIQUE SERIAL EXTRACTION
            2. The grid structure is more important than extracting every serial number
            3. CONFIDENCE SCORES MUST BE REALISTIC - analyze each position individually
            4. DO NOT use 95% as a default - vary confidence based on actual visual quality
            5. It's better to report honest uncertainty than false high confidence
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
            logger.info("Gemini API response length: {}", jsonResponse.length());
            logger.info("Raw Gemini response: {}", jsonResponse);

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
    @SuppressWarnings("unchecked")
    private ContainerExtractionResultDTO parseGeminiJsonResponse(String jsonResponse) throws JsonProcessingException {
        try {
            Map<String, Object> jsonMap = objectMapper.readValue(jsonResponse, Map.class);
            ContainerExtractionResultDTO result = new ContainerExtractionResultDTO();
            Map<String, ContainerExtractionResultDTO.RowData> rows = new HashMap<>();

            // Extract and store grid structure information
            if (jsonMap.containsKey("grid_structure")) {
                Map<String, Object> gridStructure = (Map<String, Object>) jsonMap.get("grid_structure");
                logger.info("Grid structure detected: rows={}, columns={}, total_products={}",
                    gridStructure.get("rows"), gridStructure.get("columns"), gridStructure.get("total_products"));

                // Store grid structure in result for later use
                result.setGridStructure(gridStructure);
            }

            for (Map.Entry<String, Object> rowEntry : jsonMap.entrySet()) {
                String rowKey = rowEntry.getKey();
                if (rowKey.startsWith("row") && rowEntry.getValue() instanceof Map) {
                    Map<String, Object> rowMap = (Map<String, Object>) rowEntry.getValue();
                    ContainerExtractionResultDTO.RowData rowData = new ContainerExtractionResultDTO.RowData();

                    for (Map.Entry<String, Object> posEntry : rowMap.entrySet()) {
                        String posKey = posEntry.getKey();
                        Object posValue = posEntry.getValue();

                        try {
                            int position = Integer.parseInt(posKey);
                            // Increased from 5 to 8 to support larger grids
                            if (position >= 1 && position <= 8) {
                                String containerNumber = null;
                                String confidence = "75%"; // More realistic default instead of 95%

                                // Handle new format: {"number": "ABC123", "confidence": "87%"}
                                if (posValue instanceof Map) {
                                    Map<String, Object> posMap = (Map<String, Object>) posValue;
                                    Object numberObj = posMap.get("number");
                                    Object confObj = posMap.get("confidence");

                                    if (numberObj != null) {
                                        containerNumber = String.valueOf(numberObj).trim();
                                    }
                                    if (confObj != null) {
                                        confidence = String.valueOf(confObj);
                                    }
                                }
                                // Handle legacy format: direct string value
                                else if (posValue != null) {
                                    String value = String.valueOf(posValue);
                                    if (!value.trim().isEmpty() && !value.equals("null") && !value.equals("N/A")) {
                                        containerNumber = value.trim();
                                        // For legacy format, look for row-level confidence
                                        if (rowMap.containsKey("confidence")) {
                                            confidence = String.valueOf(rowMap.get("confidence"));
                                        }
                                    }
                                }

                                // Only add if we have a valid container number
                                if (containerNumber != null && !containerNumber.isEmpty()) {
                                    rowData.setEntry(position, containerNumber, confidence);
                                    logger.debug("Extracted container: {} at position {} with confidence {}",
                                        containerNumber, position, confidence);
                                }
                            }
                        } catch (NumberFormatException ignored) {
                            // Skip non-numeric keys (like "confidence" at row level)
                        }
                    }

                    // Only add row if it has at least one container
                    boolean hasContainers = false;
                    for (int i = 1; i <= 8; i++) { // Increased from 5 to 8
                        if (rowData.getEntry(i) != null && rowData.getEntry(i).getContainerNumber() != null) {
                            hasContainers = true;
                            break;
                        }
                    }

                    if (hasContainers) {
                        rows.put(rowKey, rowData);
                    }
                }
            }

            result.setRows(rows);
            logger.info("Successfully parsed {} rows from Gemini response", rows.size());
            return result;
        } catch (JsonProcessingException ex) {
            logger.error("Failed to parse Gemini JSON response: {}", ex.getMessage());
            logger.debug("Raw JSON response: {}", jsonResponse);

            // Attempt to salvage truncated/incomplete JSON by extracting valid prefix
            String repaired = tryRepairJsonArrayItems(jsonResponse);
            if (repaired != null) {
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

        // Convert grid structure if available
        if (extractionResult.getGridStructure() != null) {
            Map<String, Object> gridStructure = extractionResult.getGridStructure();
            OCRResultDTO.GridStructureDTO gridDTO = new OCRResultDTO.GridStructureDTO();

            if (gridStructure.get("rows") != null) {
                gridDTO.setRows(Integer.valueOf(gridStructure.get("rows").toString()));
            }
            if (gridStructure.get("columns") != null) {
                gridDTO.setColumns(Integer.valueOf(gridStructure.get("columns").toString()));
            }
            if (gridStructure.get("total_products") != null) {
                gridDTO.setTotalProducts(Integer.valueOf(gridStructure.get("total_products").toString()));
            }

            result.setGridStructure(gridDTO);
        }

        if (extractionResult.getRows() != null) {
            for (Map.Entry<String, ContainerExtractionResultDTO.RowData> rowEntry : extractionResult.getRows().entrySet()) {
                String rowName = rowEntry.getKey();
                ContainerExtractionResultDTO.RowData rowData = rowEntry.getValue();
                extractedText.append("Row ").append(rowName).append(":\n");
                for (int i = 1; i <= 8; i++) { // Updated from 5 to 8
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

