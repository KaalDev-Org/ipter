import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
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
  RefreshCw
} from 'lucide-react';
import { projectAPI, ProjectResponse, ProjectStatus } from '../services/api';

const ProjectData: React.FC = () => {
  const { showToast } = useToast();
  const [activeProjects, setActiveProjects] = useState<ProjectResponse[]>([]);
  const [selectedProject, setSelectedProject] = useState<ProjectResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);

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

  // Load active projects on component mount
  useEffect(() => {
    loadActiveProjects();
  }, [loadActiveProjects]);

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

  const handleProjectSelect = (projectId: string) => {
    if (projectId) {
      loadProjectDetails(projectId);
    } else {
      setSelectedProject(null);
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
                <h1 className="text-3xl font-bold text-gray-900 font-georgia">Project Data</h1>
                <p className="text-gray-600 font-verdana">View and analyze pharmaceutical shipment project information</p>
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
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Project Selection Sidebar */}
          <div className="lg:col-span-1">
            <Card className="bg-z-light-green shadow-lg border border-gray-200 rounded-xl sticky top-8">
              <CardHeader className="border-b border-gray-200 p-6 bg-z-pale-green">
                <CardTitle className="text-xl font-bold text-gray-900 flex items-center space-x-3" style={{ fontFamily: 'Georgia, serif' }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/80">
                    <Eye className="w-4 h-4 text-gray-700" />
                  </div>
                  <span>Select Project</span>
                </CardTitle>
                <CardDescription className="text-gray-600" style={{ fontFamily: 'Verdana, sans-serif' }}>
                  Choose a project to view detailed information
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700" style={{ fontFamily: 'Verdana, sans-serif' }}>
                      Active Projects ({activeProjects.length})
                    </label>
                    <Select onValueChange={handleProjectSelect} disabled={isLoadingProjects}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder={isLoadingProjects ? "Loading projects..." : "Select a project"} />
                      </SelectTrigger>
                      <SelectContent>
                        {activeProjects.map((project) => (
                          <SelectItem key={project.id} value={project.id}>
                            <div className="flex flex-col">
                              <span className="font-medium">{project.name}</span>
                              <span className="text-xs text-gray-500">
                                Created: {formatDate(project.createdAt)}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Quick Stats */}
                  <div className="pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3" style={{ fontFamily: 'Georgia, serif' }}>
                      Quick Stats
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Total Active</span>
                        <span className="font-semibold text-green-600">{activeProjects.length}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">With Master Data</span>
                        <span className="font-semibold text-blue-600">
                          {activeProjects.filter(p => p.masterDataProcessed).length}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Pending Processing</span>
                        <span className="font-semibold text-orange-600">
                          {activeProjects.filter(p => !p.masterDataProcessed).length}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Project Details Main Content */}
          <div className="lg:col-span-2">
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
                {/* Single Project Details Card */}
                <Card className="bg-z-light-green shadow-lg border border-gray-200 rounded-xl">
                  <CardHeader className="border-b border-gray-200 p-6 bg-z-pale-green">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Georgia, serif' }}>
                          {selectedProject.name}
                        </CardTitle>
                        <div className="flex items-center space-x-4">
                          {getStatusBadge(selectedProject.status)}
                        </div>
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
                  <CardContent className="p-6 space-y-8">

                    {/* Shipment Details Section */}
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3 pb-4 border-b border-gray-100">
                        <div className="p-2 bg-blue-50 rounded-lg">
                          <Truck className="w-5 h-5 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900" style={{ fontFamily: 'Georgia, serif' }}>Shipment Details</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3 pb-4 border-b border-gray-100">
                        <div className="p-2 bg-green-50 rounded-lg">
                          <Package className="w-5 h-5 text-green-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900" style={{ fontFamily: 'Georgia, serif' }}>Product Details</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3 pb-4 border-b border-gray-100">
                        <div className="p-2 bg-purple-50 rounded-lg">
                          <FileText className="w-5 h-5 text-purple-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900" style={{ fontFamily: 'Georgia, serif' }}>Study Information</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                          <p className="text-xs text-gray-500">Protocol</p>
                          <p className="text-sm font-medium">{selectedProject.protocol || 'Not specified'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Site</p>
                          <p className="text-sm font-medium">{selectedProject.site || 'Not specified'}</p>
                        </div>
                        <div className="md:col-span-2">
                          <p className="text-xs text-gray-500">Remarks</p>
                          <p className="text-sm font-medium text-gray-700">
                            {selectedProject.remarks || 'No remarks provided'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Timeline Section */}
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3 pb-4 border-b border-gray-100">
                        <div className="p-2 bg-orange-50 rounded-lg">
                          <Clock className="w-5 h-5 text-orange-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900" style={{ fontFamily: 'Georgia, serif' }}>Timeline</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <div>
                            <p className="text-sm font-medium">Created</p>
                            <p className="text-xs text-gray-500">{formatDateTime(selectedProject.createdAt)}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <div>
                            <p className="text-sm font-medium">Last Updated</p>
                            <p className="text-xs text-gray-500">{formatDateTime(selectedProject.updatedAt)}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Processing Status Section */}
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3 pb-4 border-b border-gray-100">
                        <div className="p-2 bg-indigo-50 rounded-lg">
                          <BarChart3 className="w-5 h-5 text-indigo-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900" style={{ fontFamily: 'Georgia, serif' }}>Processing Status</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Master Data Status */}
                        <div className="text-center">
                          <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-3 ${
                            selectedProject.masterDataProcessed
                              ? 'bg-green-100 text-green-600'
                              : 'bg-gray-100 text-gray-400'
                          }`}>
                            {selectedProject.masterDataProcessed ? (
                              <CheckCircle className="w-8 h-8" />
                            ) : (
                              <AlertCircle className="w-8 h-8" />
                            )}
                          </div>
                          <h4 className="font-semibold text-gray-900 mb-1">Master Data</h4>
                          <p className={`text-sm ${
                            selectedProject.masterDataProcessed ? 'text-green-600' : 'text-gray-500'
                          }`}>
                            {selectedProject.masterDataProcessed ? 'Processed' : 'Pending'}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Count: {selectedProject.masterDataCount}
                          </p>
                        </div>

                        {/* Images Status */}
                        <div className="text-center">
                          <div className="w-16 h-16 mx-auto rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-3">
                            <FileText className="w-8 h-8" />
                          </div>
                          <h4 className="font-semibold text-gray-900 mb-1">Images</h4>
                          <p className="text-sm text-blue-600">
                            {selectedProject.processedImages} / {selectedProject.totalImages}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Failed: {selectedProject.failedImages}
                          </p>
                        </div>

                        {/* Processing Progress */}
                        <div className="text-center">
                          <div className="w-16 h-16 mx-auto rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mb-3">
                            <BarChart3 className="w-8 h-8" />
                          </div>
                          <h4 className="font-semibold text-gray-900 mb-1">Processing</h4>
                          <p className="text-sm text-purple-600">
                            {selectedProject.processingProgress.toFixed(1)}%
                          </p>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                            <div
                              className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${selectedProject.processingProgress}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* Master Data Progress */}
                        <div className="text-center">
                          <div className="w-16 h-16 mx-auto rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mb-3">
                            <Database className="w-8 h-8" />
                          </div>
                          <h4 className="font-semibold text-gray-900 mb-1">Data Progress</h4>
                          <p className="text-sm text-orange-600">
                            {selectedProject.masterDataProgress.toFixed(1)}%
                          </p>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
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
    </div>
  );
};

export default ProjectData;
