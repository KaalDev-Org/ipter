package com.ipter.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

/**
 * DTO for Google Gemini API response
 * Represents the response structure from Gemini 2.0 Flash model
 */
public class GeminiResponseDTO {
    
    private List<Candidate> candidates;
    
    @JsonProperty("usageMetadata")
    private UsageMetadata usageMetadata;
    
    @JsonProperty("promptFeedback")
    private PromptFeedback promptFeedback;
    
    // Constructors
    public GeminiResponseDTO() {}
    
    // Getters and Setters
    public List<Candidate> getCandidates() {
        return candidates;
    }
    
    public void setCandidates(List<Candidate> candidates) {
        this.candidates = candidates;
    }
    
    public UsageMetadata getUsageMetadata() {
        return usageMetadata;
    }
    
    public void setUsageMetadata(UsageMetadata usageMetadata) {
        this.usageMetadata = usageMetadata;
    }
    
    public PromptFeedback getPromptFeedback() {
        return promptFeedback;
    }
    
    public void setPromptFeedback(PromptFeedback promptFeedback) {
        this.promptFeedback = promptFeedback;
    }
    
    /**
     * Candidate response
     */
    public static class Candidate {
        private Content content;
        
        @JsonProperty("finishReason")
        private String finishReason;
        
        @JsonProperty("safetyRatings")
        private List<SafetyRating> safetyRatings;
        
        public Candidate() {}
        
        public Content getContent() {
            return content;
        }
        
        public void setContent(Content content) {
            this.content = content;
        }
        
        public String getFinishReason() {
            return finishReason;
        }
        
        public void setFinishReason(String finishReason) {
            this.finishReason = finishReason;
        }
        
        public List<SafetyRating> getSafetyRatings() {
            return safetyRatings;
        }
        
        public void setSafetyRatings(List<SafetyRating> safetyRatings) {
            this.safetyRatings = safetyRatings;
        }
    }
    
    /**
     * Content in response
     */
    public static class Content {
        private List<Part> parts;
        private String role;
        
        public Content() {}
        
        public List<Part> getParts() {
            return parts;
        }
        
        public void setParts(List<Part> parts) {
            this.parts = parts;
        }
        
        public String getRole() {
            return role;
        }
        
        public void setRole(String role) {
            this.role = role;
        }
    }
    
    /**
     * Part of content
     */
    public static class Part {
        private String text;
        
        public Part() {}
        
        public String getText() {
            return text;
        }
        
        public void setText(String text) {
            this.text = text;
        }
    }
    
    /**
     * Safety rating
     */
    public static class SafetyRating {
        private String category;
        private String probability;
        private Boolean blocked;
        
        public SafetyRating() {}
        
        public String getCategory() {
            return category;
        }
        
        public void setCategory(String category) {
            this.category = category;
        }
        
        public String getProbability() {
            return probability;
        }
        
        public void setProbability(String probability) {
            this.probability = probability;
        }
        
        public Boolean getBlocked() {
            return blocked;
        }
        
        public void setBlocked(Boolean blocked) {
            this.blocked = blocked;
        }
    }
    
    /**
     * Usage metadata
     */
    public static class UsageMetadata {
        @JsonProperty("promptTokenCount")
        private Integer promptTokenCount;
        
        @JsonProperty("candidatesTokenCount")
        private Integer candidatesTokenCount;
        
        @JsonProperty("totalTokenCount")
        private Integer totalTokenCount;
        
        public UsageMetadata() {}
        
        public Integer getPromptTokenCount() {
            return promptTokenCount;
        }
        
        public void setPromptTokenCount(Integer promptTokenCount) {
            this.promptTokenCount = promptTokenCount;
        }
        
        public Integer getCandidatesTokenCount() {
            return candidatesTokenCount;
        }
        
        public void setCandidatesTokenCount(Integer candidatesTokenCount) {
            this.candidatesTokenCount = candidatesTokenCount;
        }
        
        public Integer getTotalTokenCount() {
            return totalTokenCount;
        }
        
        public void setTotalTokenCount(Integer totalTokenCount) {
            this.totalTokenCount = totalTokenCount;
        }
    }
    
    /**
     * Prompt feedback
     */
    public static class PromptFeedback {
        @JsonProperty("safetyRatings")
        private List<SafetyRating> safetyRatings;
        
        public PromptFeedback() {}
        
        public List<SafetyRating> getSafetyRatings() {
            return safetyRatings;
        }
        
        public void setSafetyRatings(List<SafetyRating> safetyRatings) {
            this.safetyRatings = safetyRatings;
        }
    }
}
