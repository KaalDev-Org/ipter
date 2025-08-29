import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
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
  XCircle
} from 'lucide-react';
import { projectAPI, ProjectResponse, ProjectStatus, MasterDataResponse, VerificationStatusResponse } from '../services/api';

const ProjectData: React.FC = () => {
  const { showToast } = useToast();
  const [activeProjects, setActiveProjects] = useState<ProjectResponse[]>([]);
  const [selectedProject, setSelectedProject] = useState<ProjectResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [verificationData, setVerificationData] = useState<VerificationStatusResponse | null>(null);
  const [isLoadingVerification, setIsLoadingVerification] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [selectedStatistic, setSelectedStatistic] = useState<string | null>(null);
  const [verificationFilter, setVerificationFilter] = useState<'all' | 'matched' | 'unmatched' | 'duplicates'>('all');
  const [searchSerial, setSearchSerial] = useState('');

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

  const handleProjectSelect = (projectId: string) => {
    if (projectId) {
      loadProjectDetails(projectId);
      loadVerificationData(projectId);
    } else {
      setSelectedProject(null);
      setVerificationData(null);
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
                {/* Project Header */}
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
                </Card>

                {/* Tabbed Content */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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

                  <TabsContent value="details" className="mt-6">
                    <Card className="bg-z-light-green shadow-lg border border-gray-200 rounded-xl">
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
                  </TabsContent>

                  <TabsContent value="verification" className="mt-6">
                    {isLoadingVerification ? (
                      <Card className="bg-z-light-green shadow-lg border border-gray-200 rounded-xl">
                        <CardContent className="p-12 text-center">
                          <div className="flex flex-col items-center space-y-4">
                            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-gray-600">Loading verification data...</p>
                          </div>
                        </CardContent>
                      </Card>
                    ) : verificationData ? (
                      <div className="space-y-6">
                        {/* Verification Statistics */}
                        <div className="bg-z-pale-green p-4 rounded-lg">
                          <div className="flex items-center space-x-2 mb-4">
                            <BarChart3 className="w-5 h-5 text-gray-700" />
                            <h3 className="text-lg font-semibold text-gray-900" style={{ fontFamily: 'Georgia, serif' }}>
                              Verification Statistics
                            </h3>
                          </div>

                          <div className="grid grid-cols-5 gap-4">
                            <div className="bg-blue-100 rounded-lg p-4 text-center">
                              <div className="text-3xl font-bold text-blue-600 mb-1">{verificationData.totalMasterData}</div>
                              <div className="text-sm font-medium text-blue-800">Project Master</div>
                              <div className="text-xs text-blue-600">Serial Nos</div>
                            </div>
                            <div className="bg-green-100 rounded-lg p-4 text-center">
                              <div className="text-3xl font-bold text-green-600 mb-1">{verificationData.totalImages}</div>
                              <div className="text-sm font-medium text-green-800">Data extracted</div>
                              <div className="text-xs text-green-600">from Images</div>
                            </div>
                            <div className="bg-emerald-100 rounded-lg p-4 text-center">
                              <div className="text-3xl font-bold text-emerald-600 mb-1">{verificationData.matchedCount}</div>
                              <div className="text-sm font-medium text-emerald-800">Matched Serial</div>
                              <div className="text-xs text-emerald-600">Nos</div>
                            </div>
                            <div className="bg-orange-100 rounded-lg p-4 text-center">
                              <div className="text-3xl font-bold text-orange-600 mb-1">{verificationData.unmatchedCount}</div>
                              <div className="text-sm font-medium text-orange-800">Un matched</div>
                              <div className="text-xs text-orange-600">Serial Nos</div>
                            </div>
                            <div className="bg-red-100 rounded-lg p-4 text-center">
                              <div className="text-3xl font-bold text-red-600 mb-1">{verificationData.duplicateCount}</div>
                              <div className="text-sm font-medium text-red-800">Duplicate</div>
                              <div className="text-xs text-red-600">Serial Nos</div>
                            </div>
                          </div>

                          {/* Filters */}
                          <div className="flex flex-col lg:flex-row gap-4 mt-6">
                            <div className="flex-1">
                              <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <Input
                                  type="text"
                                  placeholder="Search serial numbers..."
                                  value={searchSerial}
                                  onChange={(e) => setSearchSerial(e.target.value)}
                                  className="w-full pl-10 pr-4 py-2 bg-white"
                                />
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => setVerificationFilter('all')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                  verificationFilter === 'all'
                                    ? 'bg-z-sky text-gray-900'
                                    : 'bg-white text-gray-600 hover:bg-gray-50'
                                }`}
                              >
                                All
                              </button>
                              <button
                                onClick={() => setVerificationFilter('matched')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                  verificationFilter === 'matched'
                                    ? 'bg-emerald-500 text-white'
                                    : 'bg-white text-gray-600 hover:bg-gray-50'
                                }`}
                              >
                                Matched
                              </button>
                              <button
                                onClick={() => setVerificationFilter('unmatched')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                  verificationFilter === 'unmatched'
                                    ? 'bg-orange-500 text-white'
                                    : 'bg-white text-gray-600 hover:bg-gray-50'
                                }`}
                              >
                                Unmatched
                              </button>
                              <button
                                onClick={() => setVerificationFilter('duplicates')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                  verificationFilter === 'duplicates'
                                    ? 'bg-red-500 text-white'
                                    : 'bg-white text-gray-600 hover:bg-gray-50'
                                }`}
                              >
                                Duplicates
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Detailed View Modal/Section */}
                        {selectedStatistic && (
                          <Card className="bg-z-light-green shadow-lg border border-gray-200 rounded-xl">
                            <CardHeader className="border-b border-gray-200 p-6 bg-z-pale-green">
                              <div className="flex items-center justify-between">
                                <CardTitle className="text-xl font-bold text-gray-900 flex items-center space-x-3" style={{ fontFamily: 'Georgia, serif' }}>
                                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/80">
                                    <Eye className="w-4 h-4 text-gray-700" />
                                  </div>
                                  <span>
                                    {selectedStatistic === 'master' && 'Master Data Details'}
                                    {selectedStatistic === 'extracted' && 'Extracted Data Details'}
                                    {selectedStatistic === 'matched' && 'Matched Serial Numbers'}
                                    {selectedStatistic === 'unmatched' && 'Unmatched Serial Numbers'}
                                    {selectedStatistic === 'duplicate' && 'Duplicate Serial Numbers'}
                                  </span>
                                </CardTitle>
                                <Button
                                  onClick={() => setSelectedStatistic(null)}
                                  variant="outline"
                                  size="sm"
                                  className="text-gray-600 hover:text-gray-800"
                                >
                                  Close
                                </Button>
                              </div>
                            </CardHeader>
                            <CardContent className="p-6">
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                                {selectedStatistic === 'master' && verificationData.masterData.map((item) => (
                                  <div key={item.id} className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                                    <div className="flex items-center space-x-3">
                                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <Hash className="w-4 h-4 text-blue-600" />
                                      </div>
                                      <div>
                                        <p className="font-semibold text-gray-900">{item.containerNumber}</p>
                                        <p className="text-sm text-gray-500">Master Serial</p>
                                      </div>
                                    </div>
                                  </div>
                                ))}

                                {selectedStatistic === 'extracted' && verificationData.imageData.map((image, index) => (
                                  <div key={image.id} className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                                    <div className="flex items-center space-x-3 mb-3">
                                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                        <FileText className="w-4 h-4 text-green-600" />
                                      </div>
                                      <div>
                                        <p className="font-semibold text-gray-900">{image.fileName || `Image_${String(index + 1).padStart(2, '0')}`}</p>
                                        <p className="text-sm text-gray-500">{image.extractedSerials.length} serials</p>
                                      </div>
                                    </div>
                                    <div className="space-y-1">
                                      {image.extractedSerials.slice(0, 3).map((serial, idx) => (
                                        <p key={idx} className="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded">{serial}</p>
                                      ))}
                                      {image.extractedSerials.length > 3 && (
                                        <p className="text-xs text-gray-500">+{image.extractedSerials.length - 3} more...</p>
                                      )}
                                    </div>
                                  </div>
                                ))}

                                {selectedStatistic === 'matched' && verificationData.masterData
                                  .filter(master => verificationData.imageData.some(img => img.extractedSerials.includes(master.containerNumber)))
                                  .map((item) => (
                                    <div key={item.id} className="bg-white p-4 rounded-lg border border-green-200 hover:shadow-md transition-shadow">
                                      <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                          <CheckCircle className="w-4 h-4 text-green-600" />
                                        </div>
                                        <div>
                                          <p className="font-semibold text-gray-900">{item.containerNumber}</p>
                                          <p className="text-sm text-green-600">Successfully Matched</p>
                                        </div>
                                      </div>
                                    </div>
                                  ))}

                                {selectedStatistic === 'unmatched' && verificationData.masterData
                                  .filter(master => !verificationData.imageData.some(img => img.extractedSerials.includes(master.containerNumber)))
                                  .map((item) => (
                                    <div key={item.id} className="bg-white p-4 rounded-lg border border-orange-200 hover:shadow-md transition-shadow">
                                      <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                                          <AlertTriangle className="w-4 h-4 text-orange-600" />
                                        </div>
                                        <div>
                                          <p className="font-semibold text-gray-900">{item.containerNumber}</p>
                                          <p className="text-sm text-orange-600">Not Found in Images</p>
                                        </div>
                                      </div>
                                    </div>
                                  ))}

                                {selectedStatistic === 'duplicate' && (() => {
                                  const allExtracted = verificationData.imageData.flatMap(img => img.extractedSerials);
                                  const duplicates = allExtracted.filter((serial, index) => allExtracted.indexOf(serial) !== index);
                                  const uniqueDuplicates = Array.from(new Set(duplicates));

                                  return uniqueDuplicates.map((serial, index) => (
                                    <div key={index} className="bg-white p-4 rounded-lg border border-red-200 hover:shadow-md transition-shadow">
                                      <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                                          <Copy className="w-4 h-4 text-red-600" />
                                        </div>
                                        <div>
                                          <p className="font-semibold text-gray-900">{serial}</p>
                                          <p className="text-sm text-red-600">Found {allExtracted.filter(s => s === serial).length} times</p>
                                        </div>
                                      </div>
                                    </div>
                                  ));
                                })()}
                              </div>
                            </CardContent>
                          </Card>
                        )}

                        {/* IPTER - Uploaded Data View Table */}
                        <div className="bg-z-pale-green p-4 rounded-lg">
                          <div className="flex items-center space-x-2 mb-4">
                            <Hash className="w-5 h-5 text-gray-700" />
                            <h3 className="text-lg font-semibold text-gray-900" style={{ fontFamily: 'Georgia, serif' }}>
                              IPTER - Uploaded Data View
                            </h3>
                          </div>

                          <div className="bg-white rounded-lg overflow-hidden shadow-sm">
                            <div className="overflow-x-auto">
                              <table className="w-full">
                                <thead>
                                  <tr className="bg-z-sky">
                                    <th className="px-4 py-3 text-left font-semibold text-gray-900 border-r border-gray-300">
                                      Master data
                                    </th>
                                    {verificationData.imageData.map((image, index) => (
                                      <th key={image.id} className="px-4 py-3 text-center font-semibold text-gray-900 border-r border-gray-300 last:border-r-0 min-w-32">
                                        {image.fileName || `Image ${String(index + 1).padStart(2, '0')}`}
                                      </th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {(() => {
                                    // Filter logic
                                    let filteredData = verificationData.masterData;

                                    if (verificationFilter === 'matched') {
                                      filteredData = verificationData.masterData.filter(master =>
                                        verificationData.imageData.some(img => img.extractedSerials.includes(master.containerNumber))
                                      );
                                    } else if (verificationFilter === 'unmatched') {
                                      filteredData = verificationData.masterData.filter(master =>
                                        !verificationData.imageData.some(img => img.extractedSerials.includes(master.containerNumber))
                                      );
                                    } else if (verificationFilter === 'duplicates') {
                                      const allExtracted = verificationData.imageData.flatMap(img => img.extractedSerials);
                                      const duplicates = allExtracted.filter((serial, index) => allExtracted.indexOf(serial) !== index);
                                      const uniqueDuplicates = Array.from(new Set(duplicates));
                                      filteredData = verificationData.masterData.filter(master =>
                                        uniqueDuplicates.includes(master.containerNumber)
                                      );
                                    }

                                    // Search filter
                                    if (searchSerial) {
                                      filteredData = filteredData.filter(master =>
                                        master.containerNumber.toLowerCase().includes(searchSerial.toLowerCase())
                                      );
                                    }

                                    return filteredData.map((masterItem) => {
                                      const matchedImages = verificationData.imageData.filter(img =>
                                        img.extractedSerials.includes(masterItem.containerNumber)
                                      );
                                      const isDuplicate = matchedImages.length > 1;

                                      return (
                                        <tr key={masterItem.id} className={`border-b border-gray-200 hover:bg-gray-50 ${
                                          isDuplicate ? 'bg-red-50' : ''
                                        }`}>
                                          <td className={`px-4 py-3 font-medium border-r border-gray-300 ${
                                            isDuplicate ? 'text-red-800' : 'text-gray-900'
                                          }`}>
                                            {masterItem.containerNumber}
                                            {isDuplicate && (
                                              <div className="text-xs text-red-600 mt-1">⚠️ Duplicate</div>
                                            )}
                                          </td>
                                          {verificationData.imageData.map((image) => {
                                            const isMatched = image.extractedSerials.includes(masterItem.containerNumber);
                                            return (
                                              <td key={`${masterItem.id}-${image.id}`} className="px-4 py-3 text-center border-r border-gray-300 last:border-r-0">
                                                {isMatched ? (
                                                  <div className="flex items-center justify-center space-x-1">
                                                    <CheckCircle className={`w-4 h-4 ${
                                                      isDuplicate ? 'text-red-600' : 'text-green-600'
                                                    }`} />
                                                    <span className={`text-sm font-medium ${
                                                      isDuplicate ? 'text-red-700' : 'text-green-700'
                                                    }`}>
                                                      {masterItem.containerNumber}
                                                    </span>
                                                  </div>
                                                ) : (
                                                  <span className="text-gray-400 text-lg">-</span>
                                                )}
                                              </td>
                                            );
                                          })}
                                        </tr>
                                      );
                                    });
                                  })()}
                                </tbody>
                              </table>
                            </div>

                            {/* No results message */}
                            {(() => {
                              let filteredData = verificationData.masterData;

                              if (verificationFilter === 'matched') {
                                filteredData = verificationData.masterData.filter(master =>
                                  verificationData.imageData.some(img => img.extractedSerials.includes(master.containerNumber))
                                );
                              } else if (verificationFilter === 'unmatched') {
                                filteredData = verificationData.masterData.filter(master =>
                                  !verificationData.imageData.some(img => img.extractedSerials.includes(master.containerNumber))
                                );
                              } else if (verificationFilter === 'duplicates') {
                                const allExtracted = verificationData.imageData.flatMap(img => img.extractedSerials);
                                const duplicates = allExtracted.filter((serial, index) => allExtracted.indexOf(serial) !== index);
                                const uniqueDuplicates = Array.from(new Set(duplicates));
                                filteredData = verificationData.masterData.filter(master =>
                                  uniqueDuplicates.includes(master.containerNumber)
                                );
                              }

                              if (searchSerial) {
                                filteredData = filteredData.filter(master =>
                                  master.containerNumber.toLowerCase().includes(searchSerial.toLowerCase())
                                );
                              }

                              return filteredData.length === 0 ? (
                                <div className="text-center py-12 bg-white">
                                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                                    <Search className="w-8 h-8 text-gray-400" />
                                  </div>
                                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Results Found</h3>
                                  <p className="text-gray-500">
                                    {searchSerial ?
                                      `No serial numbers match "${searchSerial}"` :
                                      `No ${verificationFilter === 'all' ? '' : verificationFilter} serial numbers found`
                                    }
                                  </p>
                                </div>
                              ) : null;
                            })()}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <Card className="bg-z-light-green shadow-lg border border-gray-200 rounded-xl">
                        <CardContent className="p-12 text-center">
                          <div className="flex flex-col items-center space-y-4">
                            <div className="w-16 h-16 rounded-full flex items-center justify-center bg-white/80">
                              <Search className="w-8 h-8 text-gray-700" />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 mb-2" style={{ fontFamily: 'Georgia, serif' }}>
                                No Verification Data
                              </h3>
                              <p className="text-gray-600" style={{ fontFamily: 'Verdana, sans-serif' }}>
                                Upload images and process master data to see verification results
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
    </div>
  );
};

export default ProjectData;
