package com.ipter.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.ClientHttpRequestFactory;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

/**
 * Configuration for AI Service integration
 * Configures HTTP clients for communication with Python AI services
 */
@Configuration
public class AIServiceConfig {
    
    @Value("${ai.service.url:http://localhost:8001}")
    private String aiServiceUrl;
    
    @Value("${ai.service.timeout:30000}")
    private int timeoutMs;
    
    @Value("${ai.service.connection.timeout:10000}")
    private int connectionTimeoutMs;
    
    @Value("${ai.service.read.timeout:30000}")
    private int readTimeoutMs;
    
    /**
     * RestTemplate bean for synchronous HTTP calls to AI service
     */
    @Bean("aiServiceRestTemplate")
    public RestTemplate aiServiceRestTemplate() {
        RestTemplate restTemplate = new RestTemplate();
        
        // Configure timeouts
        ClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        ((SimpleClientHttpRequestFactory) factory).setConnectTimeout(connectionTimeoutMs);
        ((SimpleClientHttpRequestFactory) factory).setReadTimeout(readTimeoutMs);
        
        restTemplate.setRequestFactory(factory);
        
        return restTemplate;
    }
    
    /**
     * WebClient bean for reactive HTTP calls to AI service
     */
    @Bean("aiServiceWebClient")
    public WebClient aiServiceWebClient() {
        return WebClient.builder()
                .baseUrl(aiServiceUrl)
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .defaultHeader(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE)
                .codecs(configurer -> configurer.defaultCodecs().maxInMemorySize(10 * 1024 * 1024)) // 10MB
                .build();
    }
    
    /**
     * WebClient specifically configured for multipart file uploads
     */
    @Bean("aiServiceFileUploadWebClient")
    public WebClient aiServiceFileUploadWebClient() {
        return WebClient.builder()
                .baseUrl(aiServiceUrl)
                .codecs(configurer -> configurer.defaultCodecs().maxInMemorySize(50 * 1024 * 1024)) // 50MB for images
                .build();
    }
    
    // Getters for configuration values
    public String getAiServiceUrl() {
        return aiServiceUrl;
    }
    
    public int getTimeoutMs() {
        return timeoutMs;
    }
    
    public int getConnectionTimeoutMs() {
        return connectionTimeoutMs;
    }
    
    public int getReadTimeoutMs() {
        return readTimeoutMs;
    }
}
