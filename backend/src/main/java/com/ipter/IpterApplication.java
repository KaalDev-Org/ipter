package com.ipter;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Main Spring Boot Application class for IPTER
 * Image Processing Text Extraction and Recognition system
 */
@SpringBootApplication
@EnableAsync
@EnableScheduling
public class IpterApplication {

    public static void main(String[] args) {
        SpringApplication.run(IpterApplication.class, args);
    }

    @EventListener
    public void onApplicationReady(ApplicationReadyEvent event) {
        System.out.println("=================================================");
        System.out.println("IPTER Backend Application Started Successfully!");
        System.out.println("=================================================");
        System.out.println("API Documentation: http://localhost:8080/api");
        System.out.println("H2 Console: http://localhost:8080/api/h2-console");
        System.out.println("=================================================");
    }
}
