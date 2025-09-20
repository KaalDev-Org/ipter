import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import {
  CheckCircle,
  Loader2,
  Package,
  Scan,
  AlertCircle,
  AlertTriangle,
  Eye,
  ChevronLeft,
  ChevronRight,
  Grid3X3,
  RefreshCw
} from 'lucide-react';
import { projectAPI, GeminiExtractionResponse, SerialNumberUpdate, SerialNumberUpdateRequest } from '../services/api';
import { useToast } from './ui/toast';
import ContainerGridVisualization from './ContainerGridVisualization';

interface UploadedImage {
  file: File;
  preview: string;
  id: string;
}

interface ProcessedImageResult {
  id: string;
  file: File;
  preview: string;
  extractionResult?: GeminiExtractionResponse;
  status: 'pending' | 'processing' | 'completed' | 'error';
  error?: string;
}

interface ProcessStep {
  id: string;
  label: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  message?: string;
  duration?: number;
}

interface ImageProcessingResult {
  success: boolean;
  message: string;
  processedImages: ProcessedImageResult[];
  totalContainers: number;
  processingTimeMs?: number;
  errors?: string[];
}

interface ImageProcessingDialogProps {
  open: boolean;
  onClose: () => void;
  uploadedImages: UploadedImage[];
  projectName: string;
  projectId?: string;
  onComplete?: (result: ImageProcessingResult) => void;
}

interface SerialNumberChanges {
  [imageId: string]: {
    [key: string]: { // key format: "row-position"
      row: number;
      position: number;
      serialNumber: string;
      isUserModified: boolean;
    };
  };
}

type VerificationStep = 'uploading' | 'scanning' | 'extracting' | 'results';

const ImageProcessingDialog: React.FC<ImageProcessingDialogProps> = ({
  open,
  onClose,
  uploadedImages,
  projectName,
  projectId,
  onComplete
}) => {
  const [steps, setSteps] = useState<ProcessStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [processedImages, setProcessedImages] = useState<ProcessedImageResult[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [scanningAnimation, setScanningAnimation] = useState(false);
  const [processingMessages, setProcessingMessages] = useState<string[]>([]);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [currentCarouselIndex, setCurrentCarouselIndex] = useState(0);
  const [result, setResult] = useState<ImageProcessingResult | null>(null);
  const [serialNumberChanges, setSerialNumberChanges] = useState<SerialNumberChanges>({});
  const [isCompletingVerification, setIsCompletingVerification] = useState(false);
  const [retryingImages, setRetryingImages] = useState<Set<string>>(new Set());
  const [retriedButNotViewed, setRetriedButNotViewed] = useState<Set<string>>(new Set());
  const [retriedImageIndices, setRetriedImageIndices] = useState<Set<number>>(new Set());
  const { showToast } = useToast();
  const hasExecutedRef = useRef(false);

  // Handle serial number changes from editable grid
  const handleSerialNumberChange = (imageId: string, row: number, position: number, value: string) => {
    console.log('Serial number changed:', { imageId, row, position, value });
    const key = `${row}-${position}`;
    setSerialNumberChanges(prev => {
      const updated = {
        ...prev,
        [imageId]: {
          ...prev[imageId],
          [key]: {
            row,
            position,
            serialNumber: value,
            isUserModified: true
          }
        }
      };
      console.log('Updated serialNumberChanges:', updated);
      return updated;
    });
  };

  // Complete verification for current image only
  const handleCompleteVerification = async () => {
    console.log('🔥 handleCompleteVerification called for current image!');

    // Prevent multiple simultaneous calls
    if (isCompletingVerification) {
      console.log('⚠️ Already completing verification, ignoring duplicate call');
      return;
    }

    if (!projectId) {
      console.log('❌ No project ID available');
      showToast('Error: Project ID not available', 'error');
      return;
    }

    const currentImage = completedImages[currentCarouselIndex];
    if (!currentImage) {
      showToast('Error: No image selected for verification', 'error');
      return;
    }

    const backendImageId = currentImage.extractionResult?.imageId;
    if (!backendImageId) {
      showToast('Error: Image ID not found', 'error');
      return;
    }

    console.log('✅ Starting verification for image:', currentImage.file.name);
    console.log('📊 Backend Image ID:', backendImageId);

    // Check authentication status
    const token = sessionStorage.getItem('token');
    if (!token) {
      console.error('❌ No authentication token found');
      showToast('Authentication error: Please log in again', 'error');
      return;
    }

    setIsCompletingVerification(true);

    try {
      // Get changes for current image only (if any)
      const currentImageChanges = serialNumberChanges[backendImageId] || {};
      console.log('🔄 Processing verification for image:', backendImageId, 'with changes:', currentImageChanges);

      // Process changes for current image only (if any)
      if (Object.keys(currentImageChanges).length > 0) {
        console.log('Processing changes for current image:', backendImageId, 'with changes:', currentImageChanges);

        const updatedSerials: SerialNumberUpdate[] = Object.values(currentImageChanges).map(change => ({
          row: change.row,
          position: change.position,
          serial_number: change.serialNumber,
          is_user_modified: change.isUserModified,
          confidence: '100%' // User-modified entries get 100% confidence
        }));

        console.log('Updated serials for current image:', updatedSerials);

        const request: SerialNumberUpdateRequest = {
          image_id: backendImageId,
          project_id: projectId,
          updated_serials: updatedSerials
        };

        console.log('Making API call with request:', request);

        try {
          const response = await projectAPI.updateSerialNumbers(request);
          console.log('✅ API response for current image:', response);
        } catch (error) {
          console.error('❌ API call failed for current image:', error);
          const apiError = error as any;
          if (apiError.response?.status === 401) {
            showToast('Authentication error: Please check your permissions or try logging in again', 'error');
          } else if (apiError.response?.status === 403) {
            showToast('Access denied: You may not have permission to update serial numbers', 'error');
          } else {
            showToast(`Error updating image: ${apiError.message || 'Unknown error'}`, 'error');
          }
          throw error;
        }
      }

      // Mark image as verified by calling the verification API
      await projectAPI.verifyImage(backendImageId, true);

      // Remove the verified image from the list and clear its changes
      setProcessedImages(prev => prev.filter(img => img.extractionResult?.imageId !== backendImageId));

      setSerialNumberChanges(prev => {
        const updated = { ...prev };
        delete updated[backendImageId];
        return updated;
      });

      // Smooth transition to next image
      const remainingImages = completedImages.filter(img => img.extractionResult?.imageId !== backendImageId);

      if (remainingImages.length > 0) {
        // Adjust carousel index if needed
        if (currentCarouselIndex >= remainingImages.length) {
          setCurrentCarouselIndex(remainingImages.length - 1);
        }
        showToast(`Image "${currentImage.file.name}" verified successfully! ${remainingImages.length} images remaining.`, 'success');
      } else {
        // All images verified - close dialog
        showToast('All images verified successfully!', 'success');
        onClose();
      }

    } catch (error) {
      console.error('Error completing verification:', error);
      showToast('Failed to complete verification', 'error');
    } finally {
      setIsCompletingVerification(false);
    }
  };

  // Handle retry for a specific image
  const handleRetryImage = async (imageIndex: number) => {
    const imageToRetry = completedImages[imageIndex];
    if (!imageToRetry || !projectId) {
      showToast('Error: Cannot retry image processing', 'error');
      return;
    }

    const backendImageId = imageToRetry.extractionResult?.imageId;
    if (!backendImageId) {
      showToast('Error: Image ID not found', 'error');
      return;
    }

    try {
      console.log('🔄 Retrying AI processing for image:', imageToRetry.file.name);

      // Add image to retrying set for visual feedback
      setRetryingImages(prev => new Set(prev).add(backendImageId));

      // Auto-navigate to next image immediately when retry starts (so user can continue working)
      const totalImages = completedImages.length;
      if (totalImages > 1) {
        console.log('Auto-navigating away from retrying image immediately');
        // Navigate to next image, or previous if this is the last image
        const nextIndex = imageIndex < totalImages - 1 ? imageIndex + 1 : imageIndex - 1;
        setCurrentCarouselIndex(nextIndex);
        console.log('Auto-navigated to image index:', nextIndex);
      }

      // Clear any changes for this image
      setSerialNumberChanges(prev => {
        const updated = { ...prev };
        delete updated[backendImageId];
        return updated;
      });

      // Keep the image in completed state but mark it as retrying
      // Don't remove it from the list to maintain smooth UX

      showToast(`Reprocessing "${imageToRetry.file.name}"...`, 'info');

      // Call the API to reprocess this specific image
      const extractionResult = await projectAPI.extractContainersGemini(projectId, imageToRetry.file);

      // Update the processed image with new results
      setProcessedImages(prev =>
        prev.map(img =>
          img.id === imageToRetry.id
            ? {
                ...img,
                status: 'completed',
                extractionResult: extractionResult
              }
            : img
        )
      );

      // Remove from retrying set
      setRetryingImages(prev => {
        const updated = new Set(prev);
        updated.delete(backendImageId);
        return updated;
      });

      // Mark the retried image index as needing attention
      console.log('Retry completed - Retried image index:', imageIndex);
      setRetriedImageIndices(prev => {
        const updated = new Set(prev);
        updated.add(imageIndex);
        console.log('Added to retriedImageIndices:', imageIndex, 'Updated set:', updated);
        return updated;
      });

      showToast(`"${imageToRetry.file.name}" reprocessed successfully! Check the navigation arrows for red dots.`, 'success');

    } catch (error: any) {
      console.error('Error retrying image:', error);

      // Remove from retrying set
      setRetryingImages(prev => {
        const updated = new Set(prev);
        updated.delete(backendImageId);
        return updated;
      });

      showToast('Failed to retry image processing: ' + (error.message || 'Unknown error'), 'error');
    }
  };



  // Processing messages for different steps
  const uploadingMessages = [
    "Uploading images to server...",
    "Validating image formats...",
    "Preparing for analysis...",
    "Initializing AI processing..."
  ];

  const scanningMessages = [
    "Analyzing image structure...",
    "Detecting container layout...",
    "Identifying grid patterns...",
    "Scanning for serial numbers...",
    "Mapping container positions..."
  ];

  const extractingMessages = [
    "Extracting container data...",
    "Processing serial numbers...",
    "Validating extracted information...",
    "Cross-referencing with master data...",
    "Organizing results...",
    "Finalizing extraction process..."
  ];

  useEffect(() => {
    if (open) {
      // Initialize steps
      const initialSteps: ProcessStep[] = [
        {
          id: 'upload-images',
          label: 'Upload Images',
          status: 'pending'
        },
        {
          id: 'scan-containers',
          label: 'Scan Containers',
          status: 'pending'
        },
        {
          id: 'extract-data',
          label: `Extract Data (${uploadedImages.length} images)`,
          status: 'pending'
        }
      ];

      setSteps(initialSteps);
      setCurrentStep(0);
      setResult(null);
      setCurrentMessageIndex(0);
      setScanningAnimation(false);
      setCurrentImageIndex(0);
      setCurrentCarouselIndex(0);
      hasExecutedRef.current = false;

      // Initialize processed images
      const initialProcessedImages: ProcessedImageResult[] = uploadedImages.map(img => ({
        id: img.id,
        file: img.file,
        preview: img.preview,
        status: 'pending'
      }));
      setProcessedImages(initialProcessedImages);
    }
  }, [open, uploadedImages.length]);

  // Execute processing when dialog opens
  useEffect(() => {
    if (open && !hasExecutedRef.current && steps.length > 0) {
      hasExecutedRef.current = true;
      const controller = {
        startStep,
        completeStep,
        errorStep,
        setResult,
        setScanningAnimation,
        processedImages,
        setProcessedImages,
        setCurrentImageIndex
      };

      setTimeout(() => {
        executeImageProcessing(controller);
      }, 0);
    }
  }, [open, steps.length]);

  // Animate processing messages
  useEffect(() => {
    if (steps[currentStep]?.status === 'processing') {
      let messages = uploadingMessages;
      if (currentStep === 1) messages = scanningMessages;
      if (currentStep === 2) messages = extractingMessages;

      setProcessingMessages(messages);

      const interval = setInterval(() => {
        setCurrentMessageIndex((prev) => (prev + 1) % messages.length);
      }, 1500);

      return () => clearInterval(interval);
    }
  }, [currentStep, steps]);

  const updateStep = (stepIndex: number, updates: Partial<ProcessStep>) => {
    setSteps(prev => prev.map((step, index) =>
      index === stepIndex ? { ...step, ...updates } : step
    ));
  };

  const startStep = (stepIndex: number, message?: string) => {
    setCurrentStep(stepIndex);
    updateStep(stepIndex, { status: 'processing', message });
  };

  const completeStep = (stepIndex: number, message?: string, duration?: number) => {
    updateStep(stepIndex, { status: 'completed', message, duration });
  };

  const errorStep = (stepIndex: number, message: string) => {
    updateStep(stepIndex, { status: 'error', message });
  };

  const executeImageProcessing = async (controller: any) => {
    if (!projectId) {
      showToast('Project ID is required for verification', 'error');
      return;
    }

    try {
      // Step 1: Upload Images
      controller.startStep(0, 'Preparing images for processing...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      controller.completeStep(0, 'Images prepared successfully', 1000);

      // Step 2: Scan Containers
      controller.startStep(1, 'Analyzing container layouts...');
      controller.setScanningAnimation(true);
      await new Promise(resolve => setTimeout(resolve, 2000));
      controller.completeStep(1, 'Container layouts detected', 2000);

      // Step 3: Extract Data from each image
      controller.startStep(2, 'Extracting data from images...');
      await processImagesWithGemini(controller);

      controller.setScanningAnimation(false);

      // Calculate final results
      const completedImages = processedImages.filter(img => img.status === 'completed');
      const totalContainers = completedImages.reduce((sum, img) =>
        sum + (img.extractionResult?.totalContainers || 0), 0);

      controller.completeStep(2, `Successfully processed ${completedImages.length} images`, 3000);

      controller.setResult({
        success: true,
        message: 'All images processed successfully',
        processedImages,
        totalContainers,
        processingTimeMs: Date.now()
      });

    } catch (error) {
      console.error('Processing failed:', error);
      controller.errorStep(currentStep, error instanceof Error ? error.message : 'Processing failed');
      showToast('Processing failed. Please try again.', 'error');
      controller.setScanningAnimation(false);
    }
  };

  const processImagesWithGemini = async (controller: any) => {
    const totalImages = uploadedImages.length;

    for (let i = 0; i < totalImages; i++) {
      controller.setCurrentImageIndex(i);
      setCurrentImageIndex(i);
      const image = uploadedImages[i];

      console.log(`Processing image ${i + 1} of ${totalImages}:`, image.file.name);

      // Update status to processing
      setProcessedImages(prev => prev.map(img =>
        img.id === image.id ? { ...img, status: 'processing' } : img
      ));

      // Start scanning animation for current image
      setScanningAnimation(true);

      try {
        // Call Gemini API for container extraction
        console.log('Calling Gemini API for:', image.file.name);
        const extractionResult = await projectAPI.extractContainersGemini(projectId!, image.file);
        console.log('Extraction result for image:', image.file.name, extractionResult);

        // Update with successful result
        setProcessedImages(prev => prev.map(img =>
          img.id === image.id ? {
            ...img,
            status: 'completed',
            extractionResult
          } : img
        ));

        console.log(`Successfully processed image ${i + 1}: ${image.file.name}`);

      } catch (error) {
        console.error(`Failed to process image ${image.file.name}:`, error);

        // Update with error
        setProcessedImages(prev => prev.map(img =>
          img.id === image.id ? {
            ...img,
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error'
          } : img
        ));
      }

      // Stop scanning animation for current image
      setScanningAnimation(false);

      // Small delay between images for better UX
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  const getStepIcon = (step: ProcessStep) => {
    switch (step.status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'processing':
        return <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <div className="w-5 h-5 rounded-full border-2 border-gray-300" />;
    }
  };

  const getStepColor = (step: ProcessStep) => {
    switch (step.status) {
      case 'completed':
        return 'text-green-600';
      case 'processing':
        return 'text-blue-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-400';
    }
  };

  const formatProcessingTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600';
    if (confidence >= 80) return 'text-orange-500';
    return 'text-red-500';
  };

  const nextCarousel = () => {
    const newIndex = currentCarouselIndex < processedImages.filter(img => img.status === 'completed').length - 1 ? currentCarouselIndex + 1 : 0;
    console.log(`Next carousel: ${currentCarouselIndex} -> ${newIndex}`);
    setCurrentCarouselIndex(newIndex);

    // Clear "retried but not viewed" status for the new image being viewed
    if (retriedImageIndices.has(newIndex)) {
      console.log(`Removing red dot for viewed image index: ${newIndex}`);
      setRetriedImageIndices(prevSet => {
        const updated = new Set(prevSet);
        updated.delete(newIndex);
        console.log(`Updated retriedImageIndices after removal:`, updated);
        return updated;
      });
    }
  };

  const prevCarousel = () => {
    const newIndex = currentCarouselIndex > 0 ? currentCarouselIndex - 1 : processedImages.filter(img => img.status === 'completed').length - 1;
    console.log(`Prev carousel: ${currentCarouselIndex} -> ${newIndex}`);
    setCurrentCarouselIndex(newIndex);

    // Clear "retried but not viewed" status for the new image being viewed
    if (retriedImageIndices.has(newIndex)) {
      console.log(`Removing red dot for viewed image index: ${newIndex}`);
      setRetriedImageIndices(prevSet => {
        const updated = new Set(prevSet);
        updated.delete(newIndex);
        console.log(`Updated retriedImageIndices after removal:`, updated);
        return updated;
      });
    }
  };

  const completedImages = processedImages.filter(img => img.status === 'completed');
  const stats = {
    processedImages: processedImages.filter(img => img.status === 'completed').length,
    totalContainers: completedImages.reduce((sum, img) => sum + (img.extractionResult?.totalContainers || 0), 0),
    errorImages: processedImages.filter(img => img.status === 'error').length,
    avgConfidence: completedImages.length > 0
      ? Math.round(completedImages.reduce((sum, img) =>
          sum + (img.extractionResult?.averageConfidence || 0), 0) / completedImages.length)
      : 0
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="sm:max-w-6xl max-h-[95vh] overflow-y-auto"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            <Package className="w-6 h-6 text-blue-600" />
            <span>Processing Project: {projectName}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Steps - Similar to Project Creation Dialog */}
          {!result && (
            <div className="space-y-4">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-start space-x-4">
                  <div className="flex-shrink-0 mt-1">
                    {getStepIcon(step)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`font-medium ${getStepColor(step)}`}>
                      {step.label}
                    </div>
                    {step.status === 'processing' && (
                      <div className="text-sm text-gray-600 mt-1 animate-pulse">
                        {processingMessages[currentMessageIndex]}
                      </div>
                    )}
                    {step.message && step.status !== 'processing' && (
                      <div className="text-sm text-gray-600 mt-1">
                        {step.message}
                      </div>
                    )}
                    {step.duration && (
                      <div className="text-xs text-gray-500 mt-1">
                        Completed in {formatProcessingTime(step.duration)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* All Images Grid with Scanning Animation on Current */}
          {!result && (
            <Card className="bg-white border border-gray-200 rounded-xl">
              <CardHeader className="border-b border-gray-200 bg-blue-50">
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <Grid3X3 className="w-5 h-5 text-blue-600" />
                  <span>Processing Images ({uploadedImages.length} total)</span>
                  {steps[2]?.status === 'processing' && (
                    <span className="text-sm font-normal text-gray-600">
                      - Currently processing: {uploadedImages[currentImageIndex]?.file.name}
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {uploadedImages.map((image, index) => {
                    const processedImage = processedImages.find(p => p.id === image.id);
                    const isCurrentlyProcessing = index === currentImageIndex && steps[2]?.status === 'processing';

                    return (
                      <div key={image.id} className="relative">
                        <div className="relative">
                          <img
                            src={image.preview}
                            alt={image.file.name}
                            className="w-full h-32 object-cover rounded-lg border border-gray-200"
                          />

                          {/* Scanning Animation Overlay - Only on current image */}
                          {isCurrentlyProcessing && scanningAnimation && (
                            <div className="absolute inset-0 rounded-lg overflow-hidden">
                              {/* Scanning line */}
                              <div className="absolute inset-0 bg-blue-500/10">
                                <div className="scanning-line"></div>
                              </div>

                              {/* Scanning grid overlay */}
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400/20 to-transparent animate-pulse">
                                <div className="grid grid-cols-3 grid-rows-2 h-full w-full gap-1 p-2">
                                  {Array.from({ length: 6 }).map((_, i) => (
                                    <div
                                      key={i}
                                      className="border-2 border-blue-400/40 rounded animate-pulse"
                                      style={{
                                        animationDelay: `${i * 0.2}s`,
                                        animationDuration: '2s'
                                      }}
                                    />
                                  ))}
                                </div>
                              </div>

                              {/* Scan icon */}
                              <div className="absolute top-2 right-2">
                                <div className="bg-blue-600 text-white p-1 rounded-full animate-pulse">
                                  <Scan className="w-3 h-3" />
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Status overlay */}
                          <div className="absolute inset-0 rounded-lg flex items-center justify-center">
                            {processedImage?.status === 'processing' && (
                              <div className="absolute inset-0 bg-blue-500/20 rounded-lg flex items-center justify-center">
                                <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                              </div>
                            )}
                            {processedImage?.status === 'completed' && (
                              <div className="absolute top-2 left-2 bg-green-500 text-white rounded-full p-1">
                                <CheckCircle className="w-3 h-3" />
                              </div>
                            )}
                            {processedImage?.status === 'error' && (
                              <div className="absolute top-2 left-2 bg-red-500 text-white rounded-full p-1">
                                <AlertTriangle className="w-3 h-3" />
                              </div>
                            )}
                          </div>
                        </div>

                        <p className="text-xs text-gray-600 mt-2 truncate" title={image.file.name}>
                          {image.file.name}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Results Section */}
          {result && (
            <>
              {/* Summary Statistics */}
              <Card className="bg-white border border-gray-200 rounded-xl">
                <CardHeader className="border-b border-gray-200 bg-green-50">
                  <CardTitle className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span>AI Extraction Complete</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-xl font-bold text-blue-600">{stats.processedImages}</p>
                      <p className="text-xs text-gray-600">Images Processed</p>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg">
                      <p className="text-xl font-bold text-green-600">{stats.totalContainers}</p>
                      <p className="text-xs text-gray-600">Containers Found</p>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <p className="text-xl font-bold text-purple-600">{stats.avgConfidence}%</p>
                      <p className="text-xs text-gray-600">Avg Confidence</p>
                    </div>
                    <div className="bg-red-50 p-3 rounded-lg">
                      <p className="text-xl font-bold text-red-600">{stats.errorImages}</p>
                      <p className="text-xs text-gray-600">Failed Images</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Image Comparison Carousel */}
              {completedImages.length > 0 && (
                <Card className="border-green-200 bg-green-50 rounded-xl">
                  <CardHeader className="border-b border-green-200 bg-green-100">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                        <Eye className="w-5 h-5 text-blue-600" />
                        <span>Image Verification Results</span>
                      </CardTitle>
                      <div className="flex items-center space-x-2">
                        <div className="relative">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={prevCarousel}
                            disabled={completedImages.length <= 1}
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </Button>
                          {/* Dot indicators for images on the left */}
                          {(() => {
                            const hasLeftDot = completedImages.some((img, index) => {
                              if (index >= currentCarouselIndex) return false;
                              const imageId = img.extractionResult?.imageId;
                              if (!imageId) return false;
                              const hasRetrying = retryingImages.has(imageId);
                              const hasRetried = retriedImageIndices.has(index);
                              console.log(`Left dot check - Image ${index} (${imageId}): retrying=${hasRetrying}, retried=${hasRetried}`);
                              return hasRetrying || hasRetried;
                            });
                            console.log(`Left dot visible: ${hasLeftDot}`);
                            return hasLeftDot;
                          })() && (
                            <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${
                              completedImages.some((img, index) =>
                                index < currentCarouselIndex &&
                                img.extractionResult?.imageId &&
                                retryingImages.has(img.extractionResult.imageId)
                              ) ? 'bg-orange-500 animate-pulse' : 'bg-red-500'
                            }`}></div>
                          )}
                        </div>
                        <span className="text-sm text-gray-600">
                          {currentCarouselIndex + 1} of {completedImages.length}
                        </span>
                        <div className="relative">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={nextCarousel}
                            disabled={completedImages.length <= 1}
                          >
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                          {/* Dot indicators for images on the right */}
                          {(() => {
                            const hasRightDot = completedImages.some((img, index) => {
                              if (index <= currentCarouselIndex) return false;
                              const imageId = img.extractionResult?.imageId;
                              if (!imageId) return false;
                              const hasRetrying = retryingImages.has(imageId);
                              const hasRetried = retriedImageIndices.has(index);
                              console.log(`Right dot check - Image ${index} (${imageId}): retrying=${hasRetrying}, retried=${hasRetried}`);
                              return hasRetrying || hasRetried;
                            });
                            console.log(`Right dot visible: ${hasRightDot}`);
                            return hasRightDot;
                          })() && (
                            <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${
                              completedImages.some((img, index) =>
                                index > currentCarouselIndex &&
                                img.extractionResult?.imageId &&
                                retryingImages.has(img.extractionResult.imageId)
                              ) ? 'bg-orange-500 animate-pulse' : 'bg-red-500'
                            }`}></div>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRetryImage(currentCarouselIndex)}
                          disabled={isCompletingVerification || (!!completedImages[currentCarouselIndex]?.extractionResult?.imageId && retryingImages.has(completedImages[currentCarouselIndex]?.extractionResult?.imageId || ''))}
                          className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                        >
                          {completedImages[currentCarouselIndex]?.extractionResult?.imageId && retryingImages.has(completedImages[currentCarouselIndex]?.extractionResult?.imageId || '') ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                              Retrying...
                            </>
                          ) : (
                            <>
                              <RefreshCw className="w-4 h-4 mr-1" />
                              Retry AI
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    {completedImages[currentCarouselIndex] && (
                      <div className="space-y-6 relative">
                        {/* Retry Processing Overlay */}
                        {completedImages[currentCarouselIndex]?.extractionResult?.imageId &&
                         retryingImages.has(completedImages[currentCarouselIndex]?.extractionResult?.imageId || '') && (
                          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
                            <div className="text-center">
                              <Loader2 className="w-8 h-8 animate-spin text-orange-600 mx-auto mb-2" />
                              <p className="text-sm font-medium text-gray-700">AI is reanalyzing this image...</p>
                              <p className="text-xs text-gray-500 mt-1">Please wait while we process the image again</p>
                            </div>
                          </div>
                        )}

                        {/* Container Grid Visualization */}
                        <ContainerGridVisualization
                          imageUrl={completedImages[currentCarouselIndex].preview}
                          imageName={completedImages[currentCarouselIndex].file.name}
                          extractionResult={completedImages[currentCarouselIndex].extractionResult}
                          editable={true}
                          disabled={retryingImages.has(completedImages[currentCarouselIndex].extractionResult?.imageId || '')}
                          onSerialNumberChange={(row, position, value) => {
                            // Use the backend image ID from the extraction result, not the local file ID
                            const backendImageId = completedImages[currentCarouselIndex].extractionResult?.imageId;
                            const localImageId = completedImages[currentCarouselIndex].id;

                            console.log('Backend Image ID:', backendImageId);
                            console.log('Local Image ID:', localImageId);
                            console.log('Using backend image ID for API call');

                            if (backendImageId) {
                              handleSerialNumberChange(backendImageId, row, position, value);
                            } else {
                              console.error('No backend image ID found in extraction result');
                              showToast('Error: Image ID not found. Cannot save changes.', 'error');
                            }
                          }}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Action Buttons - Per Image */}
              <div className="flex justify-center space-x-3">
                <Button variant="outline" onClick={onClose}>
                  Close
                </Button>
                <Button
                  onClick={handleCompleteVerification}
                  disabled={isCompletingVerification}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {isCompletingVerification ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Verify This Image ({currentCarouselIndex + 1}/{completedImages.length})
                    </>
                  )}
                </Button>
              </div>
            </>
          )}

          {/* Cancel Button for Processing */}
          {!result && (
            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={onClose} disabled={steps[currentStep]?.status === 'processing'}>
                Cancel
              </Button>
              {steps[currentStep]?.status === 'completed' && (
                <Button
                  onClick={handleCompleteVerification}
                  disabled={isCompletingVerification}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {isCompletingVerification ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Completing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Complete Verification
                    </>
                  )}
                </Button>
              )}
            </div>
          )}

        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageProcessingDialog;
