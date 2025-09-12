import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Upload, Image as ImageIcon, CheckCircle, XCircle, AlertCircle, Search, FileText, Lightbulb, X, Plus } from 'lucide-react';
import { projectAPI, ProjectResponse } from '../services/api';
import { useToast } from '../components/ui/toast';
import ImageProcessingDialog from '../components/ImageProcessingDialog';
import { AuditLogger } from '../utils/auditLogger';
import { useAuth } from '../contexts/AuthContext';

interface UploadImageFormData {
  projectId: string;
  image: FileList;
}

interface VerificationResult {
  success: boolean;
  message: string;
  matchedSerials: string[];
  unmatchedSerials: string[];
  confidence: number;
}

interface UploadedImage {
  file: File;
  preview: string;
  id: string;
}

const UploadImage: React.FC = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<ProjectResponse[]>([]);
  const [selectedProject, setSelectedProject] = useState<ProjectResponse | null>(null);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [showVerificationDialog, setShowVerificationDialog] = useState(false);
  const { showToast } = useToast();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors }
  } = useForm<UploadImageFormData>();

  const watchedProjectId = watch('projectId');

  useEffect(() => {
    fetchActiveProjects();

    // Log page view
    if (user?.username) {
      AuditLogger.logPageView(user.username, 'Upload Image', document.referrer || 'Direct').catch(console.warn);
    }
  }, [user?.username]);

  useEffect(() => {
    if (watchedProjectId) {
      const project = projects.find(p => p.id === watchedProjectId);
      setSelectedProject(project || null);
    }
  }, [watchedProjectId, projects]);

  const fetchActiveProjects = async () => {
    try {
      const response = await projectAPI.getActiveProjects();
      setProjects(response.projects);
    } catch (error) {
      console.error('Error fetching projects:', error);
      showToast('Failed to load projects', 'error');
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files) {
      const files = Array.from(e.dataTransfer.files);
      const imageFiles = files.filter(file => file.type.startsWith('image/'));

      if (imageFiles.length > 0) {
        handleImageFiles(imageFiles);
      } else {
        showToast('Please upload only image files.', 'error');
      }
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const imageFiles = files.filter(file => file.type.startsWith('image/'));

      if (imageFiles.length > 0) {
        // Log image upload
        if (user?.username && selectedProject) {
          const imageNames = imageFiles.map(f => f.name);
          await AuditLogger.logImageUpload(selectedProject.name, selectedProject.id, imageNames, user.username);
          await AuditLogger.logButtonClick(user.username, 'Upload Images', 'Upload Image', `${imageFiles.length} files`);
        }

        handleImageFiles(imageFiles);
      } else {
        showToast('Please upload only image files.', 'error');
      }
    }
  };

  const handleImageFiles = (files: File[]) => {
    setVerificationResult(null);

    const newImages: UploadedImage[] = files.map(file => {
      const id = Math.random().toString(36).substr(2, 9);
      const preview = URL.createObjectURL(file);
      return { file, preview, id };
    });

    setUploadedImages(prev => [...prev, ...newImages]);
  };

  const removeImage = async (imageId: string) => {
    setUploadedImages(prev => {
      const imageToRemove = prev.find(img => img.id === imageId);
      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.preview);

        // Log image removal
        if (user?.username && selectedProject) {
          AuditLogger.logButtonClick(user.username, 'Remove Image', 'Upload Image', `File: ${imageToRemove.file.name}`).catch(console.warn);
        }
      }
      return prev.filter(img => img.id !== imageId);
    });
  };



  // Mock verification function - replace with actual API call
  const verifyImage = async (projectId: string, imageFile: File): Promise<VerificationResult> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock verification result
    const mockResults = [
      {
        success: true,
        message: 'All serial numbers verified successfully',
        matchedSerials: ['SN001234', 'SN001235', 'SN001236'],
        unmatchedSerials: [],
        confidence: 95.5
      },
      {
        success: false,
        message: 'Some serial numbers could not be verified',
        matchedSerials: ['SN001234', 'SN001235'],
        unmatchedSerials: ['SN999999'],
        confidence: 78.2
      },
      {
        success: true,
        message: 'Partial verification completed',
        matchedSerials: ['SN001234'],
        unmatchedSerials: ['SN001237'],
        confidence: 85.0
      }
    ];
    
    return mockResults[Math.floor(Math.random() * mockResults.length)];
  };

  const onSubmit = async (data: UploadImageFormData) => {
    if (uploadedImages.length === 0) {
      showToast('Please upload at least one image', 'error');
      return;
    }

    if (!selectedProject) {
      showToast('Please select a project', 'error');
      return;
    }

    // Log form submission
    if (user?.username) {
      await AuditLogger.logFormSubmission(user.username, 'Image Upload Form', 'Upload Image', {
        projectName: selectedProject.name,
        imageCount: uploadedImages.length
      });
      await AuditLogger.logDialogAction(user.username, 'Image Verification Dialog', 'opened', `Project: ${selectedProject.name}`);
    }

    // Open verification dialog
    setShowVerificationDialog(true);
  };



  return (
    <div className="min-h-screen bg-z-ivory">
      {/* Header Section */}
      <div className="bg-z-pale-green shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg bg-white/80">
              <Upload className="w-6 h-6 text-gray-700" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 font-georgia">Upload Image</h1>
              <p className="text-gray-600 font-verdana">Upload and verify product images against project master lists</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="space-y-8">
          {/* Upload Form */}
          <div>
            <Card className="bg-z-light-green shadow-lg border border-gray-200 rounded-xl overflow-hidden">
              <CardHeader className="border-b border-gray-200 p-6 bg-z-pale-green">
                <CardTitle className="text-xl font-bold text-gray-900 flex items-center space-x-3" style={{ fontFamily: 'Georgia, serif' }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/80">
                    <ImageIcon className="w-4 h-4 text-gray-700" />
                  </div>
                  <span>Image Verification</span>
                </CardTitle>
                <p className="text-sm text-gray-600 mt-2" style={{ fontFamily: 'Verdana, sans-serif' }}>
                  Upload an image to verify against project master lists
                </p>
              </CardHeader>
              <CardContent className="p-8">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                  {/* Project Selection */}
                  <div className="space-y-3">
                    <Label htmlFor="projectId" className="text-base font-semibold text-gray-900 flex items-center space-x-2">
                      <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-xs font-bold text-blue-600">1</span>
                      </div>
                      <span>Select Project</span>
                      <span className="text-red-500">*</span>
                    </Label>
                    <Select onValueChange={(value) => setValue('projectId', value)}>
                      <SelectTrigger className="h-12 border-2 rounded-xl transition-all duration-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 bg-white shadow-sm hover:shadow-md">
                        <SelectValue placeholder="Choose a project to verify against" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-0 shadow-xl">
                        {projects.map((project) => (
                          <SelectItem key={project.id} value={project.id} className="rounded-lg py-3">
                            <div className="flex items-center space-x-3">
                              <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                              <span>{project.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.projectId && (
                      <p className="text-sm text-red-500 flex items-center space-x-2">
                        <AlertCircle className="w-4 h-4" />
                        <span>Please select a project</span>
                      </p>
                    )}
                  </div>

                  {/* Image Upload */}
                  <div className="space-y-3">
                    <Label className="text-base font-semibold text-gray-900 flex items-center space-x-2">
                      <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                        <span className="text-xs font-bold text-green-600">2</span>
                      </div>
                      <span>Upload Image</span>
                      <span className="text-red-500">*</span>
                    </Label>
                    <div
                      className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
                        dragActive
                          ? 'border-teal-400 bg-teal-50 scale-105'
                          : uploadedImages.length > 0
                          ? 'border-green-400 bg-green-50'
                          : 'border-gray-300 hover:border-teal-400 hover:bg-teal-50/50'
                      }`}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                    >
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      {uploadedImages.length === 0 ? (
                        <div className="space-y-4">
                          <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto">
                            <Upload className="w-8 h-8 text-teal-600" />
                          </div>
                          <div>
                            <p className="text-lg font-semibold text-gray-900 mb-1">
                              Drop your images here
                            </p>
                            <p className="text-sm text-gray-600 mb-2">
                              or click to browse from your device
                            </p>
                            <div className="inline-flex items-center px-4 py-2 bg-teal-100 text-teal-700 rounded-lg text-sm font-medium">
                              <ImageIcon className="w-4 h-4 mr-2" />
                              Multiple JPG, PNG, GIF up to 10MB each
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                            <CheckCircle className="w-8 h-8 text-green-600" />
                          </div>
                          <div>
                            <p className="text-lg font-semibold text-gray-900 mb-1">
                              {uploadedImages.length} image{uploadedImages.length > 1 ? 's' : ''} ready
                            </p>
                            <p className="text-sm text-gray-600 mb-3">
                              Total: {(uploadedImages.reduce((acc, img) => acc + img.file.size, 0) / 1024 / 1024).toFixed(2)} MB
                            </p>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setUploadedImages([])}
                              className="border-red-200 text-red-600 hover:bg-red-50 mr-2"
                            >
                              <X className="w-4 h-4 mr-1" />
                              Clear All
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => (document.querySelector('input[type="file"]') as HTMLInputElement)?.click()}
                              className="border-teal-200 text-teal-600 hover:bg-teal-50"
                            >
                              <Plus className="w-4 h-4 mr-1" />
                              Add More
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Uploaded Images Preview */}
                  {uploadedImages.length > 0 && (
                    <div className="space-y-3">
                      <Label className="text-base font-semibold text-gray-900 flex items-center space-x-2">
                        <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center">
                          <span className="text-xs font-bold text-purple-600">3</span>
                        </div>
                        <span>Uploaded Images ({uploadedImages.length})</span>
                      </Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {uploadedImages.map((image) => (
                          <div key={image.id} className="relative group">
                            <img
                              src={image.preview}
                              alt={image.file.name}
                              className="w-full h-24 object-cover rounded-lg border border-gray-200"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(image.id)}
                              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                            >
                              <X className="w-3 h-3" />
                            </button>
                            <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 rounded-b-lg truncate">
                              {image.file.name}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="pt-4 flex justify-center">
                    <Button
                      type="submit"
                      disabled={uploadedImages.length === 0 || !watchedProjectId || isVerifying}
                      className="h-12 px-8 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl disabled:opacity-50"
                    >
                      {isVerifying ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                          Verifying Images...
                        </>
                      ) : (
                        <>
                          <Search className="w-5 h-5 mr-3" />
                          Start Verification ({uploadedImages.length} image{uploadedImages.length > 1 ? 's' : ''})
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Results now handled by dialog */}
        </div>
      </div>

      {/* Processing Dialog */}
      <ImageProcessingDialog
        open={showVerificationDialog}
        onClose={() => setShowVerificationDialog(false)}
        uploadedImages={uploadedImages}
        projectName={selectedProject?.name || ''}
        projectId={selectedProject?.id}
        onComplete={(result) => {
          console.log('Processing completed:', result);
          showToast('Image verification completed successfully!', 'success');
        }}
      />
    </div>
  );
};

export default UploadImage;
