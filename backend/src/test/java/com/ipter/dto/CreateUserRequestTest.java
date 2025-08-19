package com.ipter.dto;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

/**
 * Test class to verify CreateUserRequest compilation
 */
public class CreateUserRequestTest {
    
    @Test
    public void testCreateUserRequestGetters() {
        CreateUserRequest request = new CreateUserRequest();
        request.setUsername("Test User");
        request.setLoginId("test01");
        request.setEmail("test@example.com");
        request.setPassword("password123");
        
        // Test that getLoginId() method exists and works
        assertEquals("test01", request.getLoginId());
        assertEquals("Test User", request.getUsername());
        assertEquals("test@example.com", request.getEmail());
        assertEquals("password123", request.getPassword());
    }
}
