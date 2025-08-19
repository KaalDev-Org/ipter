package com.ipter.service;

import com.ipter.dto.CreateUserRequest;
import com.ipter.dto.UserResponse;
import com.ipter.model.User;
import com.ipter.model.UserRole;
import com.ipter.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserManagementServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private SessionManagementService sessionManagementService;

    @Mock
    private AuditService auditService;

    @InjectMocks
    private UserManagementService userManagementService;

    private CreateUserRequest createUserRequest;
    private User mockUser;

    @BeforeEach
    void setUp() {
        createUserRequest = new CreateUserRequest();
        createUserRequest.setUsername("testuser");
        createUserRequest.setEmail("test@example.com");
        createUserRequest.setPassword("password123");
        createUserRequest.setRole(UserRole.USER);
        createUserRequest.setOrganization("Test Org");
        createUserRequest.setDesignation("Test Role");
        createUserRequest.setAddress("Test Address");

        mockUser = new User();
        mockUser.setId(UUID.randomUUID());
        mockUser.setUsername("testuser");
        mockUser.setEmail("test@example.com");
        mockUser.setPassword("encodedPassword");
        mockUser.setRole(UserRole.USER);
        mockUser.setOrganization("Test Org");
        mockUser.setDesignation("Test Role");
        mockUser.setAddress("Test Address");
        mockUser.setActive(true);
    }

    @Test
    void testCreateUser_Success() throws Exception {
        // Arrange
        when(userRepository.existsByUsername(anyString())).thenReturn(false);
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(mockUser);

        // Act
        UserResponse result = userManagementService.createUser(createUserRequest);

        // Assert
        assertNotNull(result);
        assertEquals("testuser", result.getUsername());
        assertEquals("test@example.com", result.getEmail());
        assertEquals(UserRole.USER, result.getRole());
        assertEquals("Test Org", result.getOrganization());
        assertEquals("Test Role", result.getDesignation());
        assertEquals("Test Address", result.getAddress());
        assertTrue(result.isActive());

        verify(userRepository).existsByUsername("testuser");
        verify(userRepository).existsByEmail("test@example.com");
        verify(passwordEncoder).encode("password123");
        verify(userRepository).save(any(User.class));
        verify(auditService).logUserCreation(any(User.class), any());
    }

    @Test
    void testCreateUser_UsernameExists() {
        // Arrange
        when(userRepository.existsByUsername(anyString())).thenReturn(true);

        // Act & Assert
        Exception exception = assertThrows(Exception.class, () -> {
            userManagementService.createUser(createUserRequest);
        });

        assertEquals("Username already exists", exception.getMessage());
        verify(userRepository).existsByUsername("testuser");
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void testCreateUser_EmailExists() {
        // Arrange
        when(userRepository.existsByUsername(anyString())).thenReturn(false);
        when(userRepository.existsByEmail(anyString())).thenReturn(true);

        // Act & Assert
        Exception exception = assertThrows(Exception.class, () -> {
            userManagementService.createUser(createUserRequest);
        });

        assertEquals("Email already exists", exception.getMessage());
        verify(userRepository).existsByUsername("testuser");
        verify(userRepository).existsByEmail("test@example.com");
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void testGetUserById_Success() throws Exception {
        // Arrange
        UUID userId = UUID.randomUUID();
        when(userRepository.findById(userId)).thenReturn(Optional.of(mockUser));

        // Act
        UserResponse result = userManagementService.getUserById(userId);

        // Assert
        assertNotNull(result);
        assertEquals("testuser", result.getUsername());
        assertEquals("test@example.com", result.getEmail());
        verify(userRepository).findById(userId);
    }

    @Test
    void testGetUserById_NotFound() {
        // Arrange
        UUID userId = UUID.randomUUID();
        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        // Act & Assert
        Exception exception = assertThrows(Exception.class, () -> {
            userManagementService.getUserById(userId);
        });

        assertEquals("User not found", exception.getMessage());
        verify(userRepository).findById(userId);
    }

    @Test
    void testToggleUserStatus_Success() throws Exception {
        // Arrange
        UUID userId = UUID.randomUUID();
        mockUser.setActive(true);
        when(userRepository.findById(userId)).thenReturn(Optional.of(mockUser));
        when(userRepository.save(any(User.class))).thenReturn(mockUser);

        // Act
        UserResponse result = userManagementService.toggleUserStatus(userId);

        // Assert
        assertNotNull(result);
        assertFalse(result.isActive()); // Should be toggled to false
        verify(userRepository).findById(userId);
        verify(userRepository).save(any(User.class));
        verify(sessionManagementService).invalidateSession(userId.toString());
        verify(auditService).logUserStatusChange(any(User.class), eq(false), any());
    }
}
