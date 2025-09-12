package com.ipter.service;

import com.ipter.dto.ImageProcessingResponse;
import com.ipter.model.Image;
import com.ipter.model.ProcessingStatus;
import com.ipter.model.Project;
import com.ipter.model.User;
import com.ipter.model.UserRole;
import com.ipter.repository.ImageRepository;
import com.ipter.repository.ExtractedDataRepository;
import com.ipter.repository.ProjectRepository;
import com.ipter.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ImageVerificationTest {

    @Mock
    private ImageRepository imageRepository;

    @Mock
    private ExtractedDataRepository extractedDataRepository;

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private ImageService imageService;

    private Image testImage;
    private Project testProject;
    private User testUser;
    private UUID imageId;
    private UUID projectId;

    @BeforeEach
    void setUp() {
        imageId = UUID.randomUUID();
        projectId = UUID.randomUUID();

        testUser = new User();
        testUser.setId(UUID.randomUUID());
        testUser.setUsername("testuser");
        testUser.setRole(UserRole.USER);

        testProject = new Project();
        testProject.setId(projectId);
        testProject.setName("Test Project");
        testProject.setCreatedBy(testUser);

        testImage = new Image();
        testImage.setId(imageId);
        testImage.setOriginalFilename("test-image.jpg");
        testImage.setFilePath("/test/path/test-image.jpg");
        testImage.setContentType("image/jpeg");
        testImage.setFileSize(1024L);
        testImage.setProcessingStatus(ProcessingStatus.COMPLETED);
        testImage.setProject(testProject);
        testImage.setUploadedBy(testUser);
        testImage.setUploadedAt(LocalDateTime.now());
        testImage.setVerified(false); // Initially not verified
    }

    @Test
    void testUpdateVerificationStatus_ShouldSetImageAsVerified() {
        // Given
        when(imageRepository.findById(imageId)).thenReturn(Optional.of(testImage));
        when(imageRepository.save(any(Image.class))).thenReturn(testImage);

        // When
        imageService.updateVerificationStatus(imageId, true);

        // Then
        verify(imageRepository).findById(imageId);
        verify(imageRepository).save(testImage);
        assertTrue(testImage.isVerified());
    }

    @Test
    void testUpdateVerificationStatus_ShouldSetImageAsUnverified() {
        // Given
        testImage.setVerified(true); // Start as verified
        when(imageRepository.findById(imageId)).thenReturn(Optional.of(testImage));
        when(imageRepository.save(any(Image.class))).thenReturn(testImage);

        // When
        imageService.updateVerificationStatus(imageId, false);

        // Then
        verify(imageRepository).findById(imageId);
        verify(imageRepository).save(testImage);
        assertFalse(testImage.isVerified());
    }

    @Test
    void testUpdateVerificationStatus_ShouldThrowExceptionForNonExistentImage() {
        // Given
        when(imageRepository.findById(imageId)).thenReturn(Optional.empty());

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            imageService.updateVerificationStatus(imageId, true);
        });

        assertEquals("Image not found: " + imageId, exception.getMessage());
        verify(imageRepository).findById(imageId);
        verify(imageRepository, never()).save(any(Image.class));
    }

    @Test
    void testGetVerifiedProjectImages_ShouldReturnOnlyVerifiedImages() {
        // Given
        Image verifiedImage = new Image();
        verifiedImage.setId(UUID.randomUUID());
        verifiedImage.setOriginalFilename("verified-image.jpg");
        verifiedImage.setProcessingStatus(ProcessingStatus.COMPLETED);
        verifiedImage.setVerified(true);

        List<Image> verifiedImages = Arrays.asList(verifiedImage);
        when(imageRepository.findByProjectIdAndIsVerified(projectId, true)).thenReturn(verifiedImages);
        when(extractedDataRepository.findByImageId(any(UUID.class))).thenReturn(Arrays.asList());

        // When
        List<ImageProcessingResponse> result = imageService.getVerifiedProjectImages(projectId);

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        assertTrue(result.get(0).isVerified());
        verify(imageRepository).findByProjectIdAndIsVerified(projectId, true);
    }

    @Test
    void testGetImagesByVerificationStatus_ShouldReturnCorrectImages() {
        // Given
        List<Image> unverifiedImages = Arrays.asList(testImage);
        when(imageRepository.findByIsVerified(false)).thenReturn(unverifiedImages);
        when(extractedDataRepository.findByImageId(any(UUID.class))).thenReturn(Arrays.asList());

        // When
        List<ImageProcessingResponse> result = imageService.getImagesByVerificationStatus(false);

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        assertFalse(result.get(0).isVerified());
        verify(imageRepository).findByIsVerified(false);
    }

    @Test
    void testImageProcessingResponse_ShouldIncludeVerificationStatus() {
        // Given
        testImage.setVerified(true);
        List<Image> images = Arrays.asList(testImage);
        when(imageRepository.findByProjectIdOrderByUploadedAtDesc(projectId)).thenReturn(images);

        // When
        List<ImageProcessingResponse> result = imageService.getProjectImages(projectId);

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        assertTrue(result.get(0).isVerified());
    }
}
