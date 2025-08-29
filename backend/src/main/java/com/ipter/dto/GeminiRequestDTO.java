package com.ipter.dto;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * DTO for Google Gemini API request
 * Represents the request structure for Gemini 2.0 Flash model
 */
public class GeminiRequestDTO {
    
    private List<ContentPart> contents;
    
    @JsonProperty("generationConfig")
    private GenerationConfig generationConfig;
    
    @JsonProperty("safetySettings")
    private List<SafetySetting> safetySettings;
    
    // Constructors
    public GeminiRequestDTO() {}
    
    public GeminiRequestDTO(List<ContentPart> contents) {
        this.contents = contents;
    }
    
    // Getters and Setters
    public List<ContentPart> getContents() {
        return contents;
    }
    
    public void setContents(List<ContentPart> contents) {
        this.contents = contents;
    }
    
    public GenerationConfig getGenerationConfig() {
        return generationConfig;
    }
    
    public void setGenerationConfig(GenerationConfig generationConfig) {
        this.generationConfig = generationConfig;
    }
    
    public List<SafetySetting> getSafetySettings() {
        return safetySettings;
    }
    
    public void setSafetySettings(List<SafetySetting> safetySettings) {
        this.safetySettings = safetySettings;
    }
    
    /**
     * Content part for Gemini request
     */
    public static class ContentPart {
        private List<Part> parts;
        
        public ContentPart() {}
        
        public ContentPart(List<Part> parts) {
            this.parts = parts;
        }
        
        public List<Part> getParts() {
            return parts;
        }
        
        public void setParts(List<Part> parts) {
            this.parts = parts;
        }
    }

    /**
     * Part of content (text, inline data, or file data)
     */
    public static class Part {
        private String text;

        @JsonProperty("inlineData")
        private InlineData inlineData;

        @JsonProperty("fileData")
        private FileData fileData;

        public Part() {}

        public Part(String text) {
            this.text = text;
        }

        public Part(InlineData inlineData) {
            this.inlineData = inlineData;
        }

        public Part(FileData fileData) {
            this.fileData = fileData;
        }

        public String getText() {
            return text;
        }

        public void setText(String text) {
            this.text = text;
        }

        public InlineData getInlineData() {
            return inlineData;
        }

        public void setInlineData(InlineData inlineData) {
            this.inlineData = inlineData;
        }

        public FileData getFileData() {
            return fileData;
        }

        public void setFileData(FileData fileData) {
            this.fileData = fileData;
        }
    }

    /**
     * Inline data for images
     */
    public static class InlineData {
        @JsonProperty("mimeType")
        private String mimeType;

        private String data;

        public InlineData() {}

        public InlineData(String mimeType, String data) {
            this.mimeType = mimeType;
            this.data = data;
        }

        public String getMimeType() {
            return mimeType;
        }

        public void setMimeType(String mimeType) {
            this.mimeType = mimeType;
        }

        public String getData() {
            return data;
        }

        public void setData(String data) {
            this.data = data;
        }
    }

    /**
     * File data reference (for uploaded files in Gemini API)
     */
    public static class FileData {
        @JsonProperty("fileUri")
        private String fileUri;

        @JsonProperty("mimeType")
        private String mimeType;

        public FileData() {}

        public FileData(String fileUri, String mimeType) {
            this.fileUri = fileUri;
            this.mimeType = mimeType;
        }

        public String getFileUri() {
            return fileUri;
        }

        public void setFileUri(String fileUri) {
            this.fileUri = fileUri;
        }

        public String getMimeType() {
            return mimeType;
        }

        public void setMimeType(String mimeType) {
            this.mimeType = mimeType;
        }
    }

    /**
     * Generation configuration
     */
    public static class GenerationConfig {
        private Double temperature;
        
        @JsonProperty("topK")
        private Integer topK;
        
        @JsonProperty("topP")
        private Double topP;
        
        @JsonProperty("maxOutputTokens")
        private Integer maxOutputTokens;
        
        @JsonProperty("responseMimeType")
        private String responseMimeType;
        
        public GenerationConfig() {}
        
        public Double getTemperature() {
            return temperature;
        }
        
        public void setTemperature(Double temperature) {
            this.temperature = temperature;
        }
        
        public Integer getTopK() {
            return topK;
        }
        
        public void setTopK(Integer topK) {
            this.topK = topK;
        }
        
        public Double getTopP() {
            return topP;
        }
        
        public void setTopP(Double topP) {
            this.topP = topP;
        }
        
        public Integer getMaxOutputTokens() {
            return maxOutputTokens;
        }
        
        public void setMaxOutputTokens(Integer maxOutputTokens) {
            this.maxOutputTokens = maxOutputTokens;
        }
        
        public String getResponseMimeType() {
            return responseMimeType;
        }
        
        public void setResponseMimeType(String responseMimeType) {
            this.responseMimeType = responseMimeType;
        }
    }
    
    /**
     * Safety settings
     */
    public static class SafetySetting {
        private String category;
        private String threshold;
        
        public SafetySetting() {}
        
        public SafetySetting(String category, String threshold) {
            this.category = category;
            this.threshold = threshold;
        }
        
        public String getCategory() {
            return category;
        }
        
        public void setCategory(String category) {
            this.category = category;
        }
        
        public String getThreshold() {
            return threshold;
        }
        
        public void setThreshold(String threshold) {
            this.threshold = threshold;
        }
    }
}
