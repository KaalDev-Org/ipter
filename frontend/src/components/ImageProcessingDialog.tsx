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
  Grid3X3
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
  const [isVerifyingImage, setIsVerifyingImage] = useState(false);
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

  // Complete verification and save changes
  const handleCompleteVerification = async () => {
    console.log('🔥 handleCompleteVerification called!');
    console.log('🔥 Current serialNumberChanges:', serialNumberChanges);
    console.log('🔥 Number of images with changes:', Object.keys(serialNumberChanges).length);

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

    console.log('✅ Starting verification with changes:', serialNumberChanges);
    console.log('✅ Project ID:', projectId);

    // Check authentication status
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    console.log('🔑 Auth Token exists:', !!token);
    console.log('👤 User Role:', userRole);

    if (!token) {
      console.error('❌ No authentication token found');
      showToast('Authentication error: Please log in again', 'error');
      setIsCompletingVerification(false);
      return;
    }

    setIsCompletingVerification(true);

    try {
      // Check if there are any changes to save
      if (Object.keys(serialNumberChanges).length === 0) {
        showToast('No changes to save. Please edit some serial numbers first.', 'info');
        setIsCompletingVerification(false);
        return;
      }

      const updatePromises = Object.entries(serialNumberChanges).map(async ([imageId, changes]) => {
        console.log('Processing image:', imageId, 'with changes:', changes);

        const updatedSerials: SerialNumberUpdate[] = Object.values(changes).map(change => ({
          row: change.row,
          position: change.position,
          serial_number: change.serialNumber,
          is_user_modified: change.isUserModified,
          confidence: '100%' // User-modified entries get 100% confidence
        }));

        console.log('Updated serials for image', imageId, ':', updatedSerials);

        if (updatedSerials.length > 0) {
          const request: SerialNumberUpdateRequest = {
            image_id: imageId,
            project_id: projectId,
            updated_serials: updatedSerials
          };

          console.log('Making API call with request:', request);

          try {
            const response = await projectAPI.updateSerialNumbers(request);
            console.log('✅ API response for image', imageId, ':', response);
            return response;
          } catch (error) {
            console.error('❌ API call failed for image', imageId, ':', error);

            // Handle specific error types
            const apiError = error as any;
            if (apiError.response?.status === 401) {
              console.error('🔒 Authentication error - user may not have permission or token expired');
              showToast('Authentication error: Please check your permissions or try logging in again', 'error');
            } else if (apiError.response?.status === 403) {
              console.error('🚫 Authorization error - user role may not have access');
              showToast('Access denied: You may not have permission to update serial numbers', 'error');
            } else {
              console.error('🔥 Unexpected error:', apiError.message || 'Unknown error');
              showToast(`Error updating image ${imageId}: ${apiError.message || 'Unknown error'}`, 'error');
            }

            throw error;
          }
        }
        console.log('No serials to update for image:', imageId);
        return null;
      });

      const results = await Promise.all(updatePromises);
      const successfulUpdates = results.filter(result => result?.success).length;

      if (successfulUpdates > 0) {
        showToast(`Successfully updated ${successfulUpdates} image(s)`, 'success');

        // Call onComplete if provided
        if (onComplete) {
          const totalUpdatedSerials = Object.values(serialNumberChanges).reduce((total, changes) =>
            total + Object.keys(changes).length, 0
          );

          // If we have a result object, use it; otherwise create a new one
          const completionResult = result || {
            success: true,
            message: `Successfully updated ${successfulUpdates} image(s) with ${totalUpdatedSerials} serial number changes`,
            processedImages: processedImages,
            totalContainers: totalUpdatedSerials
          };

          onComplete(completionResult);
        }

        onClose();
      } else {
        showToast('No changes were saved', 'info');
      }
    } catch (error) {
      console.error('Error completing verification:', error);
      showToast('Failed to save verification changes', 'error');
    } finally {
      setIsCompletingVerification(false);
    }
  };

  // Handle image verification
  const handleVerifyImage = async () => {
    if (!completedImages.length || !completedImages[currentCarouselIndex]?.extractionResult?.data?.imageId) {
      showToast('No image to verify', 'error');
      return;
    }

    try {
      setIsVerifyingImage(true);
      const currentImage = completedImages[currentCarouselIndex];
      const imageId = currentImage.extractionResult?.data?.imageId;

      if (!imageId) {
        showToast('Image ID not found', 'error');
        return;
      }

      // Call the verification API
      await projectAPI.verifyImage(imageId, true);

      showToast('Image verified successfully!', 'success');

      // Close the dialog after successful verification
      onClose();

    } catch (error: any) {
      console.error('Error verifying image:', error);
      showToast('Failed to verify image: ' + (error.message || 'Unknown error'), 'error');
    } finally {
      setIsVerifyingImage(false);
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
        sum + (img.extractionResult?.grid_structure?.total_products || 0), 0);

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
    setCurrentCarouselIndex((prev) =>
      prev < processedImages.filter(img => img.status === 'completed').length - 1 ? prev + 1 : 0
    );
  };

  const prevCarousel = () => {
    setCurrentCarouselIndex((prev) =>
      prev > 0 ? prev - 1 : processedImages.filter(img => img.status === 'completed').length - 1
    );
  };

  const completedImages = processedImages.filter(img => img.status === 'completed');
  const stats = {
    processedImages: processedImages.filter(img => img.status === 'completed').length,
    totalContainers: completedImages.reduce((sum, img) => sum + (img.extractionResult?.data?.containerNumbers?.length || 0), 0),
    errorImages: processedImages.filter(img => img.status === 'error').length,
    avgConfidence: completedImages.length > 0
      ? Math.round(completedImages.reduce((sum, img) =>
          sum + (img.extractionResult?.data?.confidence || 0), 0) / completedImages.length)
      : 0
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-6xl max-h-[95vh] overflow-y-auto">
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
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={prevCarousel}
                          disabled={completedImages.length <= 1}
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <span className="text-sm text-gray-600">
                          {currentCarouselIndex + 1} of {completedImages.length}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={nextCarousel}
                          disabled={completedImages.length <= 1}
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    {completedImages[currentCarouselIndex] && (
                      <div className="space-y-6">


                        {/* Container Grid Visualization */}
                        <ContainerGridVisualization
                          imageUrl={completedImages[currentCarouselIndex].preview}
                          imageName={completedImages[currentCarouselIndex].file.name}
                          extractionResult={completedImages[currentCarouselIndex].extractionResult}
                          editable={true}
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

              {/* Action Buttons */}
              <div className="flex justify-center space-x-3">
                <Button variant="outline" onClick={onClose}>
                  Close
                </Button>
                <Button
                  onClick={handleVerifyImage}
                  disabled={isVerifyingImage}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {isVerifyingImage ? (
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
                  onClick={handleVerifyImage}
                  disabled={isVerifyingImage}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {isVerifyingImage ? (
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
