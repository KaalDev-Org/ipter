import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { useToast } from '../components/ui/toast';
import { FolderOpen, Upload, FileText, Calendar, Package, Truck, FileCheck, X, CheckCircle } from 'lucide-react';
import { projectAPI, CreateProjectRequest, authAPI } from '../services/api';

interface ProjectFormData {
  name: string;
  shipper: string;
  invoice: string;
  compound: string;
  quantity: number;
  expDate: string;
  shipmentId: string;
  remarks: string;
  description: string;
  invoiceDate: string;
  packageLot: string;
  protocol: string;
  site: string;
}

const ProjectManagement: React.FC = () => {
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm<ProjectFormData>();

  const onSubmit = async (data: ProjectFormData) => {
    setIsLoading(true);

    try {
      // Prepare the request data
      const projectData: CreateProjectRequest = {
        name: data.name,
        description: data.description,
        shipper: data.shipper,
        invoice: data.invoice,
        compound: data.compound,
        quantity: data.quantity,
        expDate: data.expDate,
        shipmentId: data.shipmentId,
        packageLot: data.packageLot,
        protocol: data.protocol,
        site: data.site,
        invoiceDate: data.invoiceDate,
        remarks: data.remarks,
      };

      // Step 1: Create the project
      const response = await projectAPI.createProject(projectData);
      const projectId = response.project.id;

      // Show success toast with project ID and name
      showToast(
        `Project "${response.project.name}" created successfully! ID: ${response.project.id}`,
        'success',
        7000
      );

      // Step 2: Process PDF if file was uploaded
      if (uploadedFile) {
        try {
          showToast('Processing PDF file...', 'info');

          // First upload the PDF file
          await projectAPI.uploadPdfFile(projectId, uploadedFile);

          // Then process the PDF to extract master data
          const processResult = await projectAPI.processPdfFile(projectId, false);

          if (processResult.result.success) {
            showToast(`PDF processed successfully! Extracted ${processResult.result.extractedCount} master data entries.`, 'success');
          } else {
            showToast(`PDF processing completed with issues: ${processResult.result.message}`, 'error');
          }
        } catch (pdfError: any) {
          console.error('Error processing PDF:', pdfError);
          showToast(`Project created but PDF processing failed: ${pdfError.response?.data?.error || 'Unknown error'}`, 'error');
        }
      }

      // Reset form and uploaded file
      reset();
      setUploadedFile(null);

      console.log('Project created:', response.project);
    } catch (err: any) {
      console.error('Error creating project:', err);
      const errorMessage = err.response?.data?.error || 'Failed to create project. Please try again.';
      showToast(errorMessage, 'error');
    } finally {
      setIsLoading(false);
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

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/pdf') {
        setUploadedFile(file);
      } else {
        showToast('Please upload only PDF files.', 'error');
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === 'application/pdf') {
        setUploadedFile(file);
      } else {
        showToast('Please upload only PDF files.', 'error');
      }
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
  };



  return (
    <div className="min-h-screen bg-z-ivory">
      {/* Header Section - Matching User Management */}
      <div className="bg-z-pale-green shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg bg-white/80">
                <FolderOpen className="w-6 h-6 text-gray-700" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 font-header">Project Management</h1>
                <p className="text-gray-600 font-body">Create and manage pharmaceutical shipment projects</p>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card className="bg-z-light-green shadow-lg border border-gray-200 rounded-xl overflow-hidden">
              <CardHeader className="border-b border-gray-200 p-6 bg-z-pale-green">
                <CardTitle className="text-2xl font-bold text-gray-900 flex items-center space-x-3 font-header">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-white/80">
                    <Package className="w-5 h-5 text-gray-700" />
                  </div>
                  <div>
                    <span>Create New Project</span>
                    <div className="text-sm font-normal text-gray-600 mt-1 font-body">
                      Add a new pharmaceutical shipment project
                    </div>
                  </div>
                </CardTitle>
                <CardDescription className="text-gray-600 mt-3" style={{ fontFamily: 'Verdana, sans-serif' }}>
                  Fill in the project details below to create a new pharmaceutical shipment tracking project.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Project Information Section */}
                  <div className="space-y-6">
                    <div className="border-b border-gray-200 pb-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center" style={{ fontFamily: 'Georgia, serif' }}>
                        <FileText className="w-5 h-5 mr-2 text-gray-600" />
                        Project Information
                      </h3>
                    </div>

                    {/* Compact 4-column grid layout */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm font-medium text-gray-700" style={{ fontFamily: 'Verdana, sans-serif' }}>
                          Project Name *
                        </Label>
                        <Input
                          id="name"
                          placeholder="COVID_Vaccine_Trial_001"
                          {...register('name', { required: 'Project name is required' })}
                          className="h-9 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                        {errors.name && (
                          <p className="text-xs text-red-600 flex items-center space-x-1">
                            <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                            <span>{errors.name.message}</span>
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="shipper" className="text-sm font-medium text-gray-700" style={{ fontFamily: 'Verdana, sans-serif' }}>
                          Shipper *
                        </Label>
                        <Input
                          id="shipper"
                          placeholder="DHL Logistics"
                          {...register('shipper', { required: 'Shipper is required' })}
                          className="h-9 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                        {errors.shipper && (
                          <p className="text-xs text-red-600 flex items-center space-x-1">
                            <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                            <span>{errors.shipper.message}</span>
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="invoice" className="text-sm font-medium text-gray-700">
                          Invoice Number
                        </Label>
                        <Input
                          id="invoice"
                          placeholder="1234 5678 9101"
                          {...register('invoice')}
                          className="h-9"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="compound" className="text-sm font-medium text-gray-700">
                          Compound
                        </Label>
                        <Input
                          id="compound"
                          placeholder="Remdesivir_API"
                          {...register('compound')}
                          className="h-9"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="quantity" className="text-sm font-medium text-gray-700">
                          Quantity
                        </Label>
                        <Input
                          id="quantity"
                          type="number"
                          placeholder="5000"
                          {...register('quantity', {
                            min: { value: 1, message: 'Quantity must be at least 1' }
                          })}
                          className="h-9"
                        />
                        {errors.quantity && (
                          <p className="text-xs text-red-500 flex items-center space-x-1">
                            <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                            <span>{errors.quantity.message}</span>
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="expDate" className="text-sm font-medium text-gray-700">
                          Expiry Date
                        </Label>
                        <Input
                          id="expDate"
                          type="date"
                          {...register('expDate')}
                          className="h-9"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="shipmentId" className="text-sm font-medium text-gray-700">
                          Shipment ID
                        </Label>
                        <Input
                          id="shipmentId"
                          placeholder="SHIP-2025-0012"
                          {...register('shipmentId')}
                          className="h-9"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="packageLot" className="text-sm font-medium text-gray-700">
                          Package Lot
                        </Label>
                        <Input
                          id="packageLot"
                          placeholder="4521"
                          {...register('packageLot')}
                          className="h-9"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="protocol" className="text-sm font-medium text-gray-700">
                          Protocol
                        </Label>
                        <Input
                          id="protocol"
                          placeholder="PROT-XYZ-2025"
                          {...register('protocol')}
                          className="h-9"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="site" className="text-sm font-medium text-gray-700">
                          Site
                        </Label>
                        <Input
                          id="site"
                          placeholder="SG001"
                          {...register('site')}
                          className="h-9"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="invoiceDate" className="text-sm font-medium text-gray-700">
                          Invoice Date
                        </Label>
                        <Input
                          id="invoiceDate"
                          type="date"
                          {...register('invoiceDate')}
                          className="h-9"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                          Description
                        </Label>
                        <Input
                          id="description"
                          placeholder="Project description"
                          {...register('description')}
                          className="h-9"
                        />
                      </div>
                    </div>

                    {/* Remarks - Full width */}
                    <div className="space-y-2">
                      <Label htmlFor="remarks" className="text-sm font-medium text-gray-700">
                        Remarks
                      </Label>
                      <Textarea
                        id="remarks"
                        placeholder="Additional notes or remarks about the project..."
                        {...register('remarks')}
                        className="min-h-[100px]"
                      />
                    </div>

                    {/* Beautiful File Upload Section */}
                    <div className="space-y-4">
                      <div className="border-b pb-4" style={{ borderColor: '#E4F2E7' }}>
                        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                          <Upload className="w-5 h-5 mr-2 text-gray-600" />
                          Shipment Documentation
                        </h3>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-gray-700">
                          Upload Shipment PDF *
                        </Label>

                        {!uploadedFile ? (
                          <div
                            className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 cursor-pointer ${
                              dragActive
                                ? 'border-blue-400 bg-blue-50'
                                : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                            }`}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                            onClick={() => document.getElementById('file-upload')?.click()}
                          >
                            <input
                              id="file-upload"
                              type="file"
                              accept=".pdf"
                              onChange={handleFileChange}
                              className="hidden"
                            />

                            <div className="flex flex-col items-center space-y-4">
                              <div className="w-16 h-16 rounded-full flex items-center justify-center bg-white/80">
                                <Upload className="w-8 h-8 text-gray-700" />
                              </div>

                              <div className="space-y-2">
                                <p className="text-lg font-semibold text-gray-900">
                                  Drop your PDF file here, or <span className="text-blue-600">browse</span>
                                </p>
                                <p className="text-sm text-gray-500">
                                  Supports: PDF files only (Max 10MB)
                                </p>
                              </div>

                              <Button
                                type="button"
                                variant="outline"
                                className="mt-4 border-2"
                                style={{ borderColor: '#D9ECD2', color: '#374151' }}
                              >
                                <FileText className="w-4 h-4 mr-2" />
                                Choose File
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="border-2 rounded-2xl p-6" style={{
                            borderColor: '#D9ECD2',
                            backgroundColor: '#F5FAF2'
                          }}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-red-100">
                                  <FileCheck className="w-6 h-6 text-red-600" />
                                </div>
                                <div>
                                  <p className="font-semibold text-gray-900">{uploadedFile.name}</p>
                                  <p className="text-sm text-gray-500">
                                    {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                                  </p>
                                </div>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={removeFile}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-center pt-6 border-t" style={{ borderColor: '#E4F2E7' }}>
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="px-8 py-3 font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 text-gray-700 hover:text-gray-800 bg-z-light-green border border-z-pale-green"
                      >
                        {isLoading ? (
                          <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                            <span>Creating Project...</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <Package className="w-4 h-4" />
                            <span>Create Project</span>
                          </div>
                        )}
                      </Button>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Project Guidelines Card */}
              <Card className="bg-z-light-green shadow-lg border border-gray-200 rounded-xl">
                <CardHeader className="border-b border-gray-200 p-4 bg-z-pale-green">
                  <CardTitle className="text-lg font-semibold text-gray-900 flex items-center space-x-2" style={{ fontFamily: 'Georgia, serif' }}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/80">
                      <FileText className="w-4 h-4 text-gray-700" />
                    </div>
                    <span>Project Guidelines</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2"></div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm" style={{ fontFamily: 'Verdana, sans-serif' }}>Project Naming</p>
                        <p className="text-xs text-gray-600">Use descriptive names with underscores</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2"></div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm" style={{ fontFamily: 'Verdana, sans-serif' }}>Date Format</p>
                        <p className="text-xs text-gray-600">All dates should be in DD-MM-YYYY format</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2"></div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm" style={{ fontFamily: 'Verdana, sans-serif' }}>PDF Requirements</p>
                        <p className="text-xs text-gray-600">Upload clear, legible shipment documents</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats Card */}
              <Card className="bg-z-light-green shadow-lg border border-gray-200 rounded-xl">
                <CardHeader className="border-b border-gray-200 p-4 bg-z-pale-green">
                  <CardTitle className="text-lg font-semibold text-gray-900 flex items-center space-x-2" style={{ fontFamily: 'Georgia, serif' }}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/80">
                      <Calendar className="w-4 h-4 text-gray-700" />
                    </div>
                    <span>Quick Stats</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm" style={{ fontFamily: 'Verdana, sans-serif' }}>Active Projects</span>
                      <span className="font-semibold text-slate-900">24</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm" style={{ fontFamily: 'Verdana, sans-serif' }}>This Month</span>
                      <span className="font-semibold text-green-600">8</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm" style={{ fontFamily: 'Verdana, sans-serif' }}>Pending Review</span>
                      <span className="font-semibold text-purple-600">3</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectManagement;
