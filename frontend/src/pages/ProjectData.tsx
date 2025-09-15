import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { useToast } from '../components/ui/toast';
import {
  Database,
  Eye,
  Package,
  Truck,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  BarChart3,
  RefreshCw,
  Search,
  Image as ImageIcon,
  Hash,
  AlertTriangle,
  Copy,
  XCircle,
  X
} from 'lucide-react';
import { projectAPI, ProjectResponse, ProjectStatus, MasterDataResponse, VerificationStatusResponse, ProjectViewDataResponse } from '../services/api';
import { AuditLogger } from '../utils/auditLogger';
import { useAuth } from '../contexts/AuthContext';

const ProjectData: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [searchParams] = useSearchParams();
  const [activeProjects, setActiveProjects] = useState<ProjectResponse[]>([]);
  const [selectedProject, setSelectedProject] = useState<ProjectResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [verificationData, setVerificationData] = useState<VerificationStatusResponse | null>(null);
  const [isLoadingVerification, setIsLoadingVerification] = useState(false);
  const [projectViewData, setProjectViewData] = useState<ProjectViewDataResponse | null>(null);
  const [isLoadingProjectView, setIsLoadingProjectView] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [selectedStatistic, setSelectedStatistic] = useState<string | null>(null);
  const [verificationFilter, setVerificationFilter] = useState<'all' | 'matched' | 'unmatched' | 'duplicates'>('all');
  const [searchSerial, setSearchSerial] = useState('');

  // Filter and search states for verification matrix
  const [matrixSearchTerm, setMatrixSearchTerm] = useState('');
  const [matrixStatusFilter, setMatrixStatusFilter] = useState<'all' | 'verified' | 'unverified'>('all');

  const loadActiveProjects = useCallback(async () => {
    try {
      setIsLoadingProjects(true);
      const response = await projectAPI.getActiveProjects();
      setActiveProjects(response.projects);
    } catch (error: any) {
      console.error('Error loading active projects:', error);
      showToast('Failed to load active projects', 'error');
    } finally {
      setIsLoadingProjects(false);
    }
  }, [showToast]);

  // Load active projects on component mount and log page view
  useEffect(() => {
    loadActiveProjects();

    // Log page view
    if (user?.username) {
      AuditLogger.logPageView(user.username, 'Project Data', document.referrer || 'Direct').catch(console.warn);
    }
  }, [loadActiveProjects, user?.username]);

  // Auto-select project from URL parameter
  useEffect(() => {
    const projectId = searchParams.get('projectId');
    if (projectId && activeProjects.length > 0) {
      const project = activeProjects.find(p => p.id === projectId);
      if (project) {
        handleProjectSelect(projectId);
      }
    }
  }, [searchParams, activeProjects]);

  const loadProjectDetails = async (projectId: string) => {
    try {
      setIsLoading(true);
      const project = await projectAPI.getProjectById(projectId);
      setSelectedProject(project);
    } catch (error: any) {
      console.error('Error loading project details:', error);
      showToast('Failed to load project details', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const loadVerificationData = async (projectId: string) => {
    try {
      setIsLoadingVerification(true);
      const verification = await projectAPI.getVerificationStatus(projectId);
      setVerificationData(verification);
    } catch (error: any) {
      console.error('Error loading verification data:', error);
      showToast('Failed to load verification data', 'error');
    } finally {
      setIsLoadingVerification(false);
    }
  };

  const loadProjectViewData = async (projectId: string) => {
    try {
      setIsLoadingProjectView(true);
      const response = await projectAPI.getProjectViewData(projectId);
      console.log('Project view data response:', response);
      setProjectViewData(response.data);
    } catch (error: any) {
      console.error('Error loading project view data:', error);
      showToast('Failed to load project view data', 'error');
    } finally {
      setIsLoadingProjectView(false);
    }
  };

  const handleProjectSelect = async (projectId: string) => {
    if (projectId) {
      // Log project selection
      if (user?.username) {
        const project = activeProjects.find(p => p.id === projectId);
        if (project) {
          await AuditLogger.logButtonClick(user.username, 'Select Project', 'Project Data', `Project: ${project.name}`);
        }
      }

      loadProjectDetails(projectId);
      loadVerificationData(projectId);
      loadProjectViewData(projectId);
    } else {
      setSelectedProject(null);
      setVerificationData(null);
      setProjectViewData(null);
    }
  };

  const getStatusBadge = (status: ProjectStatus) => {
    const statusConfig = {
      [ProjectStatus.ACTIVE]: { color: 'bg-green-100 text-green-800 border-green-200', label: 'Active' },
      [ProjectStatus.COMPLETED]: { color: 'bg-blue-100 text-blue-800 border-blue-200', label: 'Completed' },
      [ProjectStatus.ARCHIVED]: { color: 'bg-gray-100 text-gray-800 border-gray-200', label: 'Archived' },
      [ProjectStatus.DELETED]: { color: 'bg-red-100 text-red-800 border-red-200', label: 'Deleted' },
    };

    const config = statusConfig[status] || statusConfig[ProjectStatus.ACTIVE];
    return (
      <Badge className={`${config.color} border font-medium`}>
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-z-ivory">
      {/* Header Section */}
      <div className="bg-z-pale-green shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg bg-white/80">
                <Database className="w-6 h-6 text-gray-700" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Georgia, serif' }}>Project Data</h1>
                <p className="text-gray-600" style={{ fontFamily: 'Verdana, sans-serif' }}>View and analyze pharmaceutical shipment project information</p>
              </div>
            </div>
            <Button
              onClick={loadActiveProjects}
              disabled={isLoadingProjects}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingProjects ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </Button>
          </div>

          {/* Project Selection in Hero Section */}
          <div className="mt-6">
            {/* Project Dropdown */}
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700 whitespace-nowrap" style={{ fontFamily: 'Verdana, sans-serif' }}>
                Active Projects ({activeProjects.length}):
              </label>
              <div className="min-w-[300px]">
                <Select onValueChange={handleProjectSelect} disabled={isLoadingProjects} value={selectedProject?.id || ""}>
                  <SelectTrigger className="h-10 bg-white/80 text-sm w-full">
                    <SelectValue placeholder={isLoadingProjects ? "Loading projects..." : activeProjects.length === 0 ? "No projects available" : "Select a project"} />
                  </SelectTrigger>
                  <SelectContent className="min-w-[300px]">
                    {activeProjects.length === 0 ? (
                      <SelectItem value="no-projects" disabled>
                        <span className="text-gray-500">No active projects found</span>
                      </SelectItem>
                    ) : (
                      activeProjects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          <div className="flex flex-col items-start w-full">
                            <span className="font-medium text-left">{project.name}</span>
                            <span className="text-xs text-gray-500 text-left">
                              Created: {formatDate(project.createdAt)}
                            </span>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="w-full">
            {isLoading ? (
              <Card className="bg-z-light-green shadow-lg border border-gray-200 rounded-xl">
                <CardContent className="p-12 text-center">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-600">Loading project details...</p>
                  </div>
                </CardContent>
              </Card>
            ) : selectedProject ? (
              <div className="space-y-6">
                {/* Project Header */}
                <Card className="bg-z-light-green shadow-lg border border-gray-200 rounded-xl">
                  <CardHeader className="border-b border-gray-200 p-6 bg-z-pale-green">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <CardTitle className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Georgia, serif' }}>
                          {selectedProject.name}
                        </CardTitle>
                        {getStatusBadge(selectedProject.status)}
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Created by</p>
                        <p className="font-semibold text-gray-900">{selectedProject.createdByUsername}</p>
                      </div>
                    </div>
                    {selectedProject.description && (
                      <div className="mt-4">
                        <p className="text-gray-700 leading-relaxed" style={{ fontFamily: 'Verdana, sans-serif' }}>
                          {selectedProject.description}
                        </p>
                      </div>
                    )}
                  </CardHeader>
                </Card>

                {/* Tabbed Content */}
                <Tabs value={activeTab} onValueChange={async (newTab) => {
                  // Log tab switch
                  if (user?.username && selectedProject) {
                    await AuditLogger.logTabSwitch(user.username, activeTab, newTab, 'Project Data');
                  }
                  setActiveTab(newTab);
                }} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-z-pale-green">
                    <TabsTrigger value="details" className="data-[state=active]:bg-white data-[state=active]:text-gray-900">
                      <FileText className="w-4 h-4 mr-2" />
                      Project Details
                    </TabsTrigger>
                    <TabsTrigger value="verification" className="data-[state=active]:bg-white data-[state=active]:text-gray-900">
                      <Search className="w-4 h-4 mr-2" />
                      Data Verification
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="details" className="mt-4">
                    <Card className="bg-z-light-green shadow-lg border border-gray-200 rounded-xl">
                      <CardContent className="p-4 space-y-4">

                    {/* Shipment Details Section */}
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 pb-2 border-b border-gray-100">
                        <div className="p-1 bg-blue-50 rounded-lg">
                          <Truck className="w-4 h-4 text-blue-600" />
                        </div>
                        <h3 className="text-base font-semibold text-slate-900" style={{ fontFamily: 'Georgia, serif' }}>Shipment Details</h3>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div>
                          <p className="text-xs text-gray-500">Shipper</p>
                          <p className="text-sm font-medium">{selectedProject.shipper || 'Not specified'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Shipment ID</p>
                          <p className="text-sm font-medium">{selectedProject.shipmentId || 'Not specified'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Invoice</p>
                          <p className="text-sm font-medium">{selectedProject.invoice || 'Not specified'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Package Lot</p>
                          <p className="text-sm font-medium">{selectedProject.packageLot || 'Not specified'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Product Details Section */}
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 pb-2 border-b border-gray-100">
                        <div className="p-1 bg-green-50 rounded-lg">
                          <Package className="w-4 h-4 text-green-600" />
                        </div>
                        <h3 className="text-base font-semibold text-slate-900" style={{ fontFamily: 'Georgia, serif' }}>Product Details</h3>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div>
                          <p className="text-xs text-gray-500">Compound</p>
                          <p className="text-sm font-medium">{selectedProject.compound || 'Not specified'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Quantity</p>
                          <p className="text-sm font-medium">{selectedProject.quantity || 'Not specified'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Expiry Date</p>
                          <p className="text-sm font-medium">{formatDate(selectedProject.expDate)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Invoice Date</p>
                          <p className="text-sm font-medium">{formatDate(selectedProject.invoiceDate)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Study Information Section */}
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 pb-2 border-b border-gray-100">
                        <div className="p-1 bg-purple-50 rounded-lg">
                          <FileText className="w-4 h-4 text-purple-600" />
                        </div>
                        <h3 className="text-base font-semibold text-slate-900" style={{ fontFamily: 'Georgia, serif' }}>Study Information</h3>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div>
                          <p className="text-xs text-gray-500">Protocol</p>
                          <p className="text-sm font-medium">{selectedProject.protocol || 'Not specified'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Site</p>
                          <p className="text-sm font-medium">{selectedProject.site || 'Not specified'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Example Container Number</p>
                          <p className="text-sm font-medium">
                            {selectedProject.exampleContainerNumber || 'Not provided'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Remarks</p>
                          <p className="text-sm font-medium text-gray-700">
                            {selectedProject.remarks || 'No remarks provided'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Timeline Section */}
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 pb-2 border-b border-gray-100">
                        <div className="p-1 bg-orange-50 rounded-lg">
                          <Clock className="w-4 h-4 text-orange-600" />
                        </div>
                        <h3 className="text-base font-semibold text-slate-900" style={{ fontFamily: 'Georgia, serif' }}>Timeline</h3>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <div>
                            <p className="text-sm font-medium">Created</p>
                            <p className="text-xs text-gray-500">{formatDateTime(selectedProject.createdAt)}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <div>
                            <p className="text-sm font-medium">Last Updated</p>
                            <p className="text-xs text-gray-500">{formatDateTime(selectedProject.updatedAt)}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Processing Status Section */}
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 pb-2 border-b border-gray-100">
                        <div className="p-1 bg-indigo-50 rounded-lg">
                          <BarChart3 className="w-4 h-4 text-indigo-600" />
                        </div>
                        <h3 className="text-base font-semibold text-slate-900" style={{ fontFamily: 'Georgia, serif' }}>Processing Status</h3>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {/* Master Data Status */}
                        <div className="text-center">
                          <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-2 ${
                            selectedProject.masterDataProcessed
                              ? 'bg-green-100 text-green-600'
                              : 'bg-gray-100 text-gray-400'
                          }`}>
                            {selectedProject.masterDataProcessed ? (
                              <CheckCircle className="w-6 h-6" />
                            ) : (
                              <AlertCircle className="w-6 h-6" />
                            )}
                          </div>
                          <h4 className="text-sm font-semibold text-gray-900 mb-1">Master Data</h4>
                          <p className={`text-xs ${
                            selectedProject.masterDataProcessed ? 'text-green-600' : 'text-gray-500'
                          }`}>
                            {selectedProject.masterDataProcessed ? 'Processed' : 'Pending'}
                          </p>
                          <p className="text-xs text-gray-500">
                            Count: {selectedProject.masterDataCount}
                          </p>
                        </div>

                        {/* Images Status */}
                        <div className="text-center">
                          <div className="w-12 h-12 mx-auto rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-2">
                            <FileText className="w-6 h-6" />
                          </div>
                          <h4 className="text-sm font-semibold text-gray-900 mb-1">Images</h4>
                          <p className="text-xs text-blue-600">
                            {selectedProject.processedImages} / {selectedProject.totalImages}
                          </p>
                          <p className="text-xs text-gray-500">
                            Failed: {selectedProject.failedImages}
                          </p>
                        </div>

                        {/* Processing Progress */}
                        <div className="text-center">
                          <div className="w-12 h-12 mx-auto rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mb-2">
                            <BarChart3 className="w-6 h-6" />
                          </div>
                          <h4 className="text-sm font-semibold text-gray-900 mb-1">Processing</h4>
                          <p className="text-xs text-purple-600">
                            {selectedProject.processingProgress.toFixed(1)}%
                          </p>
                          <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                            <div
                              className="bg-purple-600 h-1 rounded-full transition-all duration-300"
                              style={{ width: `${selectedProject.processingProgress}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* Master Data Progress */}
                        <div className="text-center">
                          <div className="w-12 h-12 mx-auto rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mb-2">
                            <Database className="w-6 h-6" />
                          </div>
                          <h4 className="text-sm font-semibold text-gray-900 mb-1">Data Progress</h4>
                          <p className="text-xs text-orange-600">
                            {selectedProject.masterDataProgress.toFixed(1)}%
                          </p>
                          <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                            <div
                              className="bg-orange-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${selectedProject.masterDataProgress}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="verification" className="mt-6">
                    {isLoadingProjectView ? (
                      <Card className="bg-z-light-green shadow-lg border border-gray-200 rounded-xl">
                        <CardContent className="p-12 text-center">
                          <div className="flex flex-col items-center space-y-4">
                            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-gray-600">Loading project data...</p>
                          </div>
                        </CardContent>
                      </Card>
                    ) : projectViewData ? (
                      <div className="space-y-6">
                        {/* Project Data Header */}
                        <div className="bg-z-pale-green p-4 rounded-lg">
                          <div className="flex items-center space-x-2 mb-4">
                            <BarChart3 className="w-5 h-5 text-gray-700" />
                            <h3 className="text-lg font-semibold text-gray-900" style={{ fontFamily: 'Georgia, serif' }}>
                              IPTER - Uploaded Data View
                            </h3>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div className="bg-white p-4 rounded-lg shadow-sm">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                  <Database className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                  <p className="text-2xl font-bold text-gray-900">{projectViewData.masterData?.length || 0}</p>
                                  <p className="text-sm text-gray-600">Master Data</p>
                                </div>
                              </div>
                            </div>
                            <div className="bg-white p-4 rounded-lg shadow-sm">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                  <CheckCircle className="w-5 h-5 text-green-600" />
                                </div>
                                <div>
                                  <p className="text-2xl font-bold text-gray-900">{projectViewData.summary?.matchedSerialNos || 0}</p>
                                  <p className="text-sm text-gray-600">Matched</p>
                                </div>
                              </div>
                            </div>
                            <div className="bg-white p-4 rounded-lg shadow-sm">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                                </div>
                                <div>
                                  <p className="text-2xl font-bold text-gray-900">{projectViewData.summary?.unmatchedSerialNos || 0}</p>
                                  <p className="text-sm text-gray-600">Unmatched</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Modern Verification Dashboard */}
                        {projectViewData.masterData && projectViewData.masterData.length > 0 && (
                          <div className="space-y-6">
                            {/* Compact Image Overview */}
                            <Card className="bg-white shadow-lg border border-gray-200 rounded-xl">
                              <CardHeader className="border-b border-gray-200 bg-z-pale-green">
                                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                                  <ImageIcon className="w-5 h-5 text-gray-700" />
                                  <span>Image Verification Overview</span>
                                  <Badge variant="outline" className="ml-auto">
                                    {projectViewData.images?.length || 0} images
                                  </Badge>
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="p-4">
                                <div className="space-y-3">
                                  {projectViewData.images && projectViewData.images.map((image, index) => {
                                    const matchedCount = image.extractedContainers.filter(serial =>
                                      projectViewData.masterData.includes(serial)
                                    ).length;
                                    const unmatchedCount = image.extractedContainers.filter(serial =>
                                      !projectViewData.masterData.includes(serial)
                                    ).length;
                                    const avgConfidence = Object.values(image.containerConfidences).reduce((a, b) => a + b, 0) / Object.values(image.containerConfidences).length || 0;
                                    const verificationRate = image.extractedContainers.length > 0 ? Math.round((matchedCount / image.extractedContainers.length) * 100) : 0;

                                    return (
                                      <div key={image.imageId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                        {/* Left side - Image info */}
                                        <div className="flex items-center space-x-4">
                                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                            <span className="text-sm font-bold text-blue-600">{index + 1}</span>
                                          </div>
                                          <div>
                                            <h4 className="font-medium text-gray-900 text-sm truncate max-w-48" title={image.imageName}>
                                              {image.imageName.length > 30 ? `${image.imageName.substring(0, 30)}...` : image.imageName}
                                            </h4>
                                            <p className="text-xs text-gray-500">
                                              {new Date(image.uploadedAt).toLocaleDateString()} • {image.extractedContainers.length} containers
                                            </p>
                                          </div>
                                        </div>

                                        {/* Middle - Quick stats */}
                                        <div className="flex items-center space-x-4">
                                          <div className="text-center">
                                            <p className="text-sm font-bold text-green-600">{matchedCount}</p>
                                            <p className="text-xs text-gray-500">Matched</p>
                                          </div>
                                          <div className="text-center">
                                            <p className="text-sm font-bold text-orange-600">{unmatchedCount}</p>
                                            <p className="text-xs text-gray-500">Unmatched</p>
                                          </div>
                                          <Badge className={`text-xs ${
                                            avgConfidence >= 90 ? 'bg-green-100 text-green-800' :
                                            avgConfidence >= 80 ? 'bg-orange-100 text-orange-800' : 'bg-red-100 text-red-800'
                                          }`}>
                                            {Math.round(avgConfidence)}%
                                          </Badge>
                                        </div>

                                        {/* Right side - Action */}
                                        <Dialog>
                                          <DialogTrigger asChild>
                                            <Button variant="outline" size="sm" className="flex items-center space-x-2">
                                              <Eye className="w-4 h-4" />
                                              <span>View Details</span>
                                            </Button>
                                          </DialogTrigger>
                                          <DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden">
                                            <DialogHeader>
                                              <DialogTitle className="flex items-center space-x-2">
                                                <ImageIcon className="w-5 h-5" />
                                                <span>{image.imageName}</span>
                                              </DialogTitle>
                                            </DialogHeader>

                                            <div className="h-[80vh] flex flex-col mt-4">
                                              {/* Main Content Area */}
                                              <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                                                {/* Left: Image Preview */}
                                                <div className="space-y-4">
                                                  <h3 className="text-lg font-semibold text-gray-900">Image Preview</h3>
                                                  <div className="relative bg-gray-100 rounded-lg overflow-hidden h-96">
                                                    {image.imageUrl ? (
                                                      <img
                                                        src={image.imageUrl}
                                                        alt={image.imageName}
                                                        className="w-full h-full object-contain"
                                                        onError={(e) => {
                                                          e.currentTarget.style.display = 'none';
                                                          const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                                                          if (nextElement) {
                                                            nextElement.style.display = 'flex';
                                                          }
                                                        }}
                                                      />
                                                    ) : null}
                                                    <div className="w-full h-full flex items-center justify-center text-gray-400" style={{ display: image.imageUrl ? 'none' : 'flex' }}>
                                                      <div className="text-center">
                                                        <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                                        <p className="text-sm">No preview available</p>
                                                      </div>
                                                    </div>
                                                  </div>


                                                  {/* Image metadata */}
                                                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                                                    <div className="flex justify-between">
                                                      <span className="text-sm text-gray-600">Uploaded:</span>
                                                      <span className="text-sm font-medium">{new Date(image.uploadedAt).toLocaleString()}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                      <span className="text-sm text-gray-600">Average Confidence:</span>
                                                      <Badge className={`text-xs ${
                                                        avgConfidence >= 90 ? 'bg-green-100 text-green-800' :
                                                        avgConfidence >= 80 ? 'bg-orange-100 text-orange-800' : 'bg-red-100 text-red-800'
                                                      }`}>
                                                        {Math.round(avgConfidence)}%
                                                      </Badge>
                                                    </div>
                                                  </div>
                                                </div>

                                                {/* Right: Extracted Containers */}
                                                <div className="space-y-4">
                                                  <h3 className="text-lg font-semibold text-gray-900">Extracted Containers</h3>
                                                  <div className="bg-white border rounded-lg h-96 overflow-y-auto">
                                                    <div className="p-4 space-y-2">
                                                      {image.extractedContainers.map((container, idx) => (
                                                        <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border hover:bg-gray-100 transition-colors">
                                                          <span className="text-sm font-mono font-medium">{container}</span>
                                                          <div className="flex items-center space-x-3">
                                                            <Badge variant={projectViewData.masterData.includes(container) ? "default" : "destructive"} className="text-xs">
                                                              {projectViewData.masterData.includes(container) ? "Matched" : "Unmatched"}
                                                            </Badge>
                                                            <span className={`text-xs font-medium px-2 py-1 rounded ${
                                                              (image.containerConfidences[container] || 0) >= 90 ? 'bg-green-100 text-green-800' :
                                                              (image.containerConfidences[container] || 0) >= 80 ? 'bg-orange-100 text-orange-800' : 'bg-red-100 text-red-800'
                                                            }`}>
                                                              {image.containerConfidences[container] || 0}%
                                                            </span>
                                                          </div>
                                                        </div>
                                                      ))}
                                                    </div>
                                                  </div>
                                                </div>
                                              </div>

                                              {/* Bottom: Statistics */}
                                              <div className="border-t pt-4">
                                                <div className="grid grid-cols-4 gap-4">
                                                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                                                    <p className="text-2xl font-bold text-blue-600">{image.extractedContainers.length}</p>
                                                    <p className="text-sm text-blue-700">Total Extracted</p>
                                                  </div>
                                                  <div className="text-center p-4 bg-green-50 rounded-lg">
                                                    <p className="text-2xl font-bold text-green-600">{matchedCount}</p>
                                                    <p className="text-sm text-green-700">Matched</p>
                                                  </div>
                                                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                                                    <p className="text-2xl font-bold text-orange-600">{unmatchedCount}</p>
                                                    <p className="text-sm text-orange-700">Unmatched</p>
                                                  </div>
                                                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                                                    <p className="text-2xl font-bold text-gray-900">{verificationRate}%</p>
                                                    <p className="text-sm text-gray-700">Verification Rate</p>
                                                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                                                      <div
                                                        className={`h-2 rounded-full transition-all duration-500 ${
                                                          verificationRate >= 90 ? 'bg-gradient-to-r from-green-400 to-green-600' :
                                                          verificationRate >= 70 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                                                          'bg-gradient-to-r from-red-400 to-red-600'
                                                        }`}
                                                        style={{ width: `${verificationRate}%` }}
                                                      ></div>
                                                    </div>
                                                  </div>
                                                </div>
                                              </div>
                                            </div>


                                          </DialogContent>
                                        </Dialog>
                                      </div>
                                    );
                                  })}
                                </div>

                                {/* Empty State */}
                                {(!projectViewData.images || projectViewData.images.length === 0) && (
                                  <div className="text-center py-8">
                                    <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                    <h3 className="text-base font-medium text-gray-900 mb-1">No Images Found</h3>
                                    <p className="text-sm text-gray-500">Upload some images to see verification results here.</p>
                                  </div>
                                )}
                              </CardContent>
                            </Card>

                            {/* Creative Master Data Verification Layout */}
                            <Card className="bg-white shadow-xl border border-gray-200 rounded-2xl overflow-hidden">
                              <CardHeader className="border-b border-gray-200 bg-gradient-to-r from-z-pale-green to-z-light-green">
                                <CardTitle className="text-xl font-bold text-gray-900 flex items-center space-x-3">
                                  <div className="w-10 h-10 bg-white/80 rounded-xl flex items-center justify-center shadow-sm">
                                    <Database className="w-5 h-5 text-gray-700" />
                                  </div>
                                  <span>Master Data Verification Matrix</span>
                                </CardTitle>
                                <CardDescription className="text-sm text-gray-600 mt-2">
                                  Cross-reference view of serial verification across all uploaded images • {projectViewData.masterData?.length || 0} total serials
                                </CardDescription>

                                {/* Search and Filter Controls */}
                                <div className="mt-4 flex flex-col sm:flex-row gap-3">
                                  <div className="flex-1">
                                    <div className="relative">
                                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                      <Input
                                        placeholder="Search serial numbers..."
                                        value={matrixSearchTerm}
                                        onChange={(e) => setMatrixSearchTerm(e.target.value)}
                                        className="pl-10 bg-white/80 border-gray-300 focus:border-blue-500"
                                      />
                                    </div>
                                  </div>
                                  <div className="flex gap-2">
                                    <Select value={matrixStatusFilter} onValueChange={(value: 'all' | 'verified' | 'unverified') => setMatrixStatusFilter(value)}>
                                      <SelectTrigger className="w-40 bg-white/80">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="verified">Verified Only</SelectItem>
                                        <SelectItem value="unverified">Unverified Only</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    {(matrixSearchTerm || matrixStatusFilter !== 'all') && (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                          setMatrixSearchTerm('');
                                          setMatrixStatusFilter('all');
                                        }}
                                        className="bg-white/80"
                                      >
                                        <X className="w-4 h-4 mr-1" />
                                        Clear
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              </CardHeader>
                              <CardContent className="p-8">
                                {(() => {
                                  const masterData = projectViewData.masterData || [];
                                  const images = projectViewData.images || [];

                                  // Create verification matrix data
                                  const allVerificationMatrix = masterData.map((serial: string) => {
                                    const verifications = images.map(img => {
                                      const isVerified = img.extractedContainers.includes(serial);
                                      return {
                                        imageId: img.imageId,
                                        imageName: img.imageName,
                                        isVerified,
                                        confidence: isVerified ? (img.containerConfidences[serial] || 0) : 0,
                                        uploadedAt: img.uploadedAt
                                      };
                                    });

                                    const totalVerified = verifications.filter(v => v.isVerified).length;
                                    const avgConfidence = totalVerified > 0
                                      ? verifications.filter(v => v.isVerified).reduce((sum, v) => sum + v.confidence, 0) / totalVerified
                                      : 0;

                                    return {
                                      serial,
                                      verifications,
                                      totalVerified,
                                      avgConfidence,
                                      status: totalVerified > 0 ? 'verified' : 'unverified'
                                    };
                                  });

                                  // Filter and sort verification matrix
                                  const verificationMatrix = allVerificationMatrix
                                    .filter(item => {
                                      const matchesSearch = item.serial.toLowerCase().includes(matrixSearchTerm.toLowerCase());
                                      const matchesStatus = matrixStatusFilter === 'all' || item.status === matrixStatusFilter;
                                      return matchesSearch && matchesStatus;
                                    })
                                    .sort((a, b) => {
                                      // Sort verified items first, then by average confidence
                                      if (a.status === 'verified' && b.status === 'unverified') return -1;
                                      if (a.status === 'unverified' && b.status === 'verified') return 1;
                                      if (a.status === 'verified' && b.status === 'verified') {
                                        return b.avgConfidence - a.avgConfidence; // Higher confidence first
                                      }
                                      return a.serial.localeCompare(b.serial); // Alphabetical for unverified
                                    });

                                  const verifiedCount = verificationMatrix.filter(item => item.status === 'verified').length;
                                  const unverifiedCount = verificationMatrix.filter(item => item.status === 'unverified').length;

                                  return (
                                    <div className="space-y-8">
                                      {/* Summary Stats */}
                                      <div className="grid grid-cols-3 gap-4">
                                        <div className="text-center p-4 bg-z-light-green rounded-lg border border-gray-200">
                                          <div className="text-2xl font-bold text-green-600 mb-1">{verifiedCount}</div>
                                          <div className="text-sm font-medium text-gray-700">Verified</div>
                                        </div>
                                        <div className="text-center p-4 bg-z-light-green rounded-lg border border-gray-200">
                                          <div className="text-2xl font-bold text-blue-600 mb-1">{masterData.length}</div>
                                          <div className="text-sm font-medium text-gray-700">Total Serials</div>
                                        </div>
                                        <div className="text-center p-4 bg-z-light-green rounded-lg border border-gray-200">
                                          <div className="text-2xl font-bold text-orange-600 mb-1">{unverifiedCount}</div>
                                          <div className="text-sm font-medium text-gray-700">Unverified</div>
                                        </div>
                                      </div>

                                      {/* Matrix Header */}
                                      <div className="bg-z-pale-green rounded-lg p-4 border border-gray-200">
                                        <div className="grid gap-3" style={{ gridTemplateColumns: `160px repeat(${images.length}, 1fr)` }}>
                                          {/* Header Row */}
                                          <div className="font-semibold text-gray-900 text-sm flex items-center bg-z-light-green rounded-lg p-2">
                                            <Hash className="w-4 h-4 mr-2 text-gray-600" />
                                            Master Data
                                          </div>
                                          {images.map((image, idx) => (
                                            <div key={image.imageId} className="text-center">
                                              <div className="bg-z-light-green rounded-lg p-2 shadow-sm border border-gray-200">
                                                <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-1">
                                                  <span className="text-xs font-bold text-blue-600">{idx + 1}</span>
                                                </div>
                                                <div className="font-medium text-gray-900 text-xs truncate" title={image.imageName}>
                                                  {image.imageName.length > 12 ? `${image.imageName.substring(0, 12)}...` : image.imageName}
                                                </div>
                                                <div className="text-xs text-gray-500 mt-1">
                                                  {new Date(image.uploadedAt).toLocaleDateString()}
                                                </div>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>

                                      {/* Matrix Content */}
                                      <div className="space-y-2">
                                        {verificationMatrix.map((item, rowIndex) => (
                                          <div key={item.serial} className="bg-z-light-green rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                                            <div className="grid gap-3 p-3" style={{ gridTemplateColumns: `160px repeat(${images.length}, 1fr)` }}>
                                              {/* Serial Number Column */}
                                              <div className="flex items-center space-x-2">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                                  item.status === 'verified'
                                                    ? item.avgConfidence >= 90
                                                      ? 'bg-green-100 border border-green-300'
                                                      : item.avgConfidence >= 80
                                                        ? 'bg-orange-100 border border-orange-300'
                                                        : 'bg-red-100 border border-red-300'
                                                    : 'bg-gray-100 border border-gray-300'
                                                }`}>
                                                  {item.status === 'verified' ? (
                                                    <CheckCircle className={`w-4 h-4 ${
                                                      item.avgConfidence >= 90 ? 'text-green-600' :
                                                      item.avgConfidence >= 80 ? 'text-orange-500' : 'text-red-600'
                                                    }`} />
                                                  ) : (
                                                    <XCircle className="w-4 h-4 text-gray-500" />
                                                  )}
                                                </div>
                                                <div>
                                                  <div className="font-mono font-semibold text-gray-900 text-sm">{item.serial}</div>
                                                </div>
                                              </div>

                                              {/* Image Verification Columns */}
                                              {item.verifications.map((verification, colIndex) => (
                                                <div key={verification.imageId} className="flex items-center justify-center">
                                                  {verification.isVerified ? (
                                                    <div className={`w-full h-10 rounded-lg border flex items-center justify-center transition-all duration-200 hover:scale-105 cursor-pointer ${
                                                      verification.confidence >= 90
                                                        ? 'border-green-400 bg-green-50 hover:border-green-500'
                                                        : verification.confidence >= 80
                                                          ? 'border-orange-400 bg-orange-50 hover:border-orange-500'
                                                          : 'border-red-400 bg-red-50 hover:border-red-500'
                                                    }`}>
                                                      <CheckCircle className={`w-4 h-4 ${
                                                        verification.confidence >= 90 ? 'text-green-600' :
                                                        verification.confidence >= 80 ? 'text-orange-500' : 'text-red-600'
                                                      }`} />
                                                    </div>
                                                  ) : (
                                                    <div className="w-full h-10 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center">
                                                      <XCircle className="w-3 h-3 text-gray-400" />
                                                    </div>
                                                  )}
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  );
                                })()}
                              </CardContent>
                            </Card>
                          </div>
                        )}
                      </div>
                    ) : (
                      <Card className="bg-z-light-green shadow-lg border border-gray-200 rounded-xl">
                        <CardContent className="p-12 text-center">
                          <div className="flex flex-col items-center space-y-4">
                            <div className="w-16 h-16 rounded-full flex items-center justify-center bg-white/80">
                              <Eye className="w-8 h-8 text-gray-700" />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 mb-2" style={{ fontFamily: 'Georgia, serif' }}>
                                No Project Data Available
                              </h3>
                              <p className="text-gray-600">
                                Please upload images to see verification data.
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            ) : (
              <Card className="bg-z-light-green shadow-lg border border-gray-200 rounded-xl">
                <CardContent className="p-12 text-center">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center bg-white/80">
                      <Eye className="w-8 h-8 text-gray-700" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2" style={{ fontFamily: 'Georgia, serif' }}>
                        Select a Project
                      </h3>
                      <p className="text-gray-600" style={{ fontFamily: 'Verdana, sans-serif' }}>
                        Choose a project from the dropdown to view detailed information
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
        </div>
      </div>
    </div>
  );
};

export default ProjectData;
