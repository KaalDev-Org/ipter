import axios from 'axios';

// Use full backend URL directly
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

// Utility function to get valid token from localStorage
const getValidToken = (): string | null => {
  const rawToken = localStorage.getItem('token');
  return rawToken && rawToken !== 'null' && rawToken !== 'undefined' ? rawToken : null;
};

// Utility function to clean invalid tokens
const cleanInvalidTokens = (): void => {
  const rawToken = localStorage.getItem('token');
  const rawRefreshToken = localStorage.getItem('refreshToken');

  if (rawToken === 'null' || rawToken === 'undefined') {
    console.warn('Cleaning invalid token from localStorage:', rawToken);
    localStorage.removeItem('token');
  }

  if (rawRefreshToken === 'null' || rawRefreshToken === 'undefined') {
    console.warn('Cleaning invalid refresh token from localStorage:', rawRefreshToken);
    localStorage.removeItem('refreshToken');
  }
};

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Include credentials for CORS
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Clean any invalid tokens first
    cleanInvalidTokens();

    const token = getValidToken();

    console.log('API Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`,
      hasToken: !!token,
      tokenPreview: token ? `${token.substring(0, 20)}...` : 'No valid token',
      existingAuthHeader: config.headers.Authorization ? 'Present' : 'Missing'
    });

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Authorization header set:', config.headers.Authorization.substring(0, 30) + '...');
    } else {
      console.warn('No valid token found in localStorage for authenticated request to:', config.url);
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh and CORS errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.log('API Response Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url,
      method: error.config?.method
    });

    // Handle CORS and network errors
    if (!error.response) {
      console.error('Network error or CORS issue:', error.message);
      if (error.code === 'ERR_NETWORK') {
        throw new Error('Unable to connect to server. Please check if the backend is running on port 8080.');
      }
      throw error;
    }

    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      console.log('401 Unauthorized - attempting token refresh');
      originalRequest._retry = true;

      // Check if this is an audit endpoint - don't auto-redirect for audit 401s
      const isAuditEndpoint = originalRequest.url?.includes('/audit');

      // Check if the current token is already invalid (string "null")
      const currentToken = getValidToken();
      const isTokenAlreadyInvalid = !currentToken;

      try {
        const rawRefreshToken = localStorage.getItem('refreshToken');
        const refreshToken = rawRefreshToken && rawRefreshToken !== 'null' && rawRefreshToken !== 'undefined' ? rawRefreshToken : null;

        if (refreshToken) {
          console.log('Attempting to refresh token...');
          const response = await api.post('/auth/refresh', {
            refreshToken,
          });

          const { token } = response.data;
          localStorage.setItem('token', token);
          console.log('Token refreshed successfully');

          // Retry the original request
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        } else {
          console.log('No refresh token available');

          // Only remove tokens if they weren't already invalid
          // This prevents removing valid tokens when audit endpoints fail due to other reasons
          if (!isTokenAlreadyInvalid) {
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
          } else {
            console.log('Token was already invalid, not removing from localStorage');
          }

          // Don't auto-redirect for audit endpoints - let the component handle it
          if (!isAuditEndpoint && !window.location.pathname.includes('/login')) {
            console.log('Redirecting to login due to missing refresh token');
            window.location.href = '/login';
          } else if (isAuditEndpoint) {
            console.log('401 on audit endpoint - not redirecting, letting component handle it');
          }
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);

        // Only remove tokens if they weren't already invalid
        if (!isTokenAlreadyInvalid) {
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
        } else {
          console.log('Token was already invalid, not removing from localStorage after refresh failure');
        }

        // Don't auto-redirect for audit endpoints - let the component handle it
        if (!isAuditEndpoint && !window.location.pathname.includes('/login')) {
          console.log('Redirecting to login due to token refresh failure');
          window.location.href = '/login';
        } else if (isAuditEndpoint) {
          console.log('401 on audit endpoint after refresh failure - not redirecting, letting component handle it');
        }
      }
    }

    return Promise.reject(error);
  }
);

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface LoginData {
  username: string;
  password: string;
}

// Enums matching backend
export enum UserRole {
  USER = 'USER',
  REVIEWER = 'REVIEWER',
  ADMINISTRATOR = 'ADMINISTRATOR'
}

export interface User {
  id: string;
  username: string;
  loginId?: string;
  email: string;
  role?: UserRole;
  organization?: string;
  designation?: string;
  address?: string;
  isActive?: boolean;
  canViewAuditTrail?: boolean;
  canCreateProjects?: boolean;
  canViewReports?: boolean;
  lastLogin?: string;
  createdAt?: string;
  updatedAt?: string;
  failedLoginAttempts?: number;
  firstName?: string;
  lastName?: string;
  roles?: string[];
}

export interface AuthResponse {
  token: string;
  tokenType: string;
  userId: string;
  username: string;
  email: string;
  role: UserRole;
  expiresIn: number;
  refreshToken?: string;
  user?: User;
  mustChangePassword?: boolean;
}

export interface SessionInfo {
  user: User;
  sessionId: string;
  expiresAt: string;
  activeUsers?: number;
  maxUsers?: number;
  availableSlots?: number;
}

// User Management interfaces
export interface CreateUserRequest {
  username: string;
  loginId: string;
  email: string;
  password: string;
  role: UserRole;
  organization?: string;
  designation?: string;
  address?: string;
  canViewAuditTrail?: boolean;
  canCreateProjects?: boolean;
  canViewReports?: boolean;
  mustChangePassword?: boolean;
}

export interface UpdateUserRequest {
  email?: string;
  role?: UserRole;
  organization?: string;
  designation?: string;
  address?: string;
  canViewAuditTrail?: boolean;
  canCreateProjects?: boolean;
  canViewReports?: boolean;
  isActive?: boolean;
}

export interface ResetPasswordRequest {
  newPassword: string;
  forcePasswordChange?: boolean;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UserResponse {
  id: string;
  username: string;
  loginId: string;
  email: string;
  role: UserRole;
  organization?: string;
  designation?: string;
  address?: string;
  isActive: boolean;
  canViewAuditTrail: boolean;
  canCreateProjects: boolean;
  canViewReports: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
  failedLoginAttempts: number;
  mustChangePassword: boolean;
}

export interface PaginatedResponse<T> {
  users?: T[];
  content?: T[];
  currentPage: number;
  totalItems: number;
  totalPages: number;
  pageSize: number;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  adminUsers: number;
  reviewerUsers: number;
  regularUsers: number;
  lockedUsers: number;
}

export const authAPI = {
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  refreshToken: async (refreshToken: string): Promise<{ token: string }> => {
    const response = await api.post('/auth/refresh', { refreshToken });
    return response.data;
  },

  validateToken: async (token: string): Promise<{ valid: boolean }> => {
    const response = await api.post('/auth/validate', { token });
    return response.data;
  },

  // Debug function to validate current token
  validateCurrentToken: async (): Promise<{ valid: boolean; user?: any; error?: string }> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return { valid: false, error: 'No token found' };
      }

      console.log('Validating current token:', token.substring(0, 20) + '...');
      const response = await api.post('/auth/validate', null, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error: any) {
      console.error('Token validation failed:', error);
      return { valid: false, error: error.response?.data?.message || error.message };
    }
  },

  getSessionInfo: async (): Promise<SessionInfo> => {
    const response = await api.get('/auth/session-info');
    return response.data;
  },

  changePassword: async (data: ChangePasswordRequest): Promise<{ message: string }> => {
    const response = await api.post('/auth/change-password', data);
    return response.data;
  },
};

// User Management API
export const userAPI = {
  // Create user (Admin only)
  createUser: async (data: CreateUserRequest): Promise<{ message: string; user: UserResponse }> => {
    const response = await api.post('/users/create', data);
    return response.data;
  },

  // Get all users with pagination
  getAllUsers: async (params?: {
    page?: number;
    size?: number;
    sortBy?: string;
    sortDir?: string;
  }): Promise<PaginatedResponse<UserResponse>> => {
    const response = await api.get('/users', { params });
    return response.data;
  },

  // Get all users as simple list
  getUsersList: async (): Promise<UserResponse[]> => {
    const response = await api.get('/users/list');
    return response.data;
  },

  // Get user by ID
  getUserById: async (userId: string): Promise<UserResponse> => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },

  // Update user
  updateUser: async (userId: string, data: UpdateUserRequest): Promise<{ message: string; user: UserResponse }> => {
    const response = await api.put(`/users/${userId}`, data);
    return response.data;
  },

  // Toggle user status (enable/disable)
  toggleUserStatus: async (userId: string): Promise<{ message: string; user: UserResponse }> => {
    const response = await api.post(`/users/${userId}/toggle-status`);
    return response.data;
  },

  // Reset user password (Admin only)
  resetUserPassword: async (userId: string, data: ResetPasswordRequest): Promise<{ message: string }> => {
    const response = await api.post(`/users/${userId}/reset-password`, data);
    return response.data;
  },

  // Unlock user account
  unlockUserAccount: async (userId: string): Promise<{ message: string; user: UserResponse }> => {
    const response = await api.post(`/users/${userId}/unlock`);
    return response.data;
  },

  // Get users by role
  getUsersByRole: async (role: UserRole): Promise<UserResponse[]> => {
    const response = await api.get(`/users/by-role/${role}`);
    return response.data;
  },

  // Get locked users
  getLockedUsers: async (): Promise<UserResponse[]> => {
    const response = await api.get('/users/locked');
    return response.data;
  },

  // Get user statistics
  getUserStats: async (): Promise<UserStats> => {
    const response = await api.get('/users/stats');
    return response.data;
  },
};

// Project Management interfaces
export enum ProjectStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  ARCHIVED = 'ARCHIVED',
  DELETED = 'DELETED'
}

export interface CreateProjectRequest {
  name: string;
  description?: string;
  shipper?: string;
  invoice?: string;
  compound?: string;
  quantity?: number;
  expDate?: string;
  shipmentId?: string;
  packageLot?: string;
  protocol?: string;
  site?: string;
  invoiceDate?: string;
  remarks?: string;
  exampleContainerNumber?: string;
}

export interface ProjectResponse {
  id: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  createdByUsername: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  shipper?: string;
  invoice?: string;
  compound?: string;
  quantity?: number;
  expDate?: string;
  shipmentId?: string;
  packageLot?: string;
  protocol?: string;
  site?: string;
  invoiceDate?: string;
  remarks?: string;
  masterDataProcessed: boolean;
  masterDataCount: number;
  exampleContainerNumber?: string;
  totalImages: number;
  processedImages: number;
  failedImages: number;
  processingProgress: number;
  masterDataProgress: number;
}

export interface ProcessPdfRequest {
  projectId: string;
  pdfFilePath?: string;
  forceReprocess?: boolean;
}

export interface ProcessPdfResponse {
  projectId: string;
  projectName: string;
  success: boolean;
  message: string;
  extractedCount: number;
  extractedContainerNumbers: string[];
  errors?: string[];
  processingTimeMs: number;
}

export interface MasterDataResponse {
  id: string;
  containerNumber: string;
  lineNumber?: number;
  pageNumber?: number;
  confidenceScore?: number;
  rawText?: string;
  isValidated: boolean;
  validationNotes?: string;
  isMatched: boolean;
  matchCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ImageDataResponse {
  id: string;
  fileName: string;
  extractedSerials: string[];
  processingStatus: string;
  uploadedAt: string;
}

export interface VerificationStatusResponse {
  projectId: string;
  totalMasterData: number;
  matchedCount: number;
  unmatchedCount: number;
  duplicateCount: number;
  totalImages: number;
  processedImages: number;
  verificationProgress: number;
  masterData: MasterDataResponse[];
  imageData: ImageDataResponse[];
}

export interface ExtractedDataItem {
  containerNumber: string;
  confidence: number;
  matched: boolean;
}

export interface ProjectViewDataResponse {
  projectId: string;
  projectName: string;
  createdAt: string;
  masterData: string[];
  images: ImageDataSummary[];
  summary: ProjectSummary;
  /**
   * Completion percentage calculated as (matched / total from PDFs) * 100
   * Rounded to two decimals by backend; may be 0 if no PDF data exists
   */
  completionPercentage: number;
  /**
   * Effective project status derived from completion rules.
   * Preserves ARCHIVED/DELETED, auto-COMPLETED at 100%, ACTIVE otherwise.
   */
  status: ProjectStatus;
}

export interface ImageDataSummary {
  imageId: string;
  imageName: string;
  imageUrl: string;
  uploadedAt: string;
  extractedContainers: string[];
  containerConfidences: { [key: string]: number };
}

export interface ProjectSummary {
  totalMasterSerialNos: number;
  totalExtractedSerialNos: number;
  matchedSerialNos: number;
  unmatchedSerialNos: number;
  duplicateSerialNos: number;
}

// Gemini Container Extraction Interfaces
export interface ContainerNumber {
  number: string;
  confidence: number;
  bounding_box: any;
  validation_status: string;
}

export interface ProcessingMetadata {
  engine: string;
  timestamp: string;
  processing_time: number;
  engine_version: string;
  preprocessing_applied: any;
}

export interface GridStructure {
  rows: number;
  columns: number;
  total_products: number;
}

// New grid-based response format from backend
export interface GridPosition {
  number: string;
  confidence: string;
}

export interface GridRow {
  [position: string]: GridPosition; // "1", "2", "3", etc.
}

export interface GeminiExtractionResponse {
  // Metadata
  imageId: string;
  projectId: string;
  imageName: string;
  uploadedAt: string;
  success: boolean;

  // Grid structure
  grid_structure: {
    rows: number;
    columns: number;
    total_products: number;
  };

  // New calculated fields
  totalContainers: number;
  averageConfidence: number;

  // Row data
  row1: GridRow;
  row2: GridRow;
  row3: GridRow;
  [key: string]: any; // Allow for additional row properties
}

export interface SerialNumberUpdate {
  row: number;
  position: number;
  serial_number: string;
  is_user_modified: boolean;
  confidence: string;
}

export interface SerialNumberUpdateRequest {
  image_id: string;
  project_id: string;
  updated_serials: SerialNumberUpdate[];
}

export interface SerialNumberUpdateResponse {
  image_id: string;
  project_id: string;
  updated_count: number;
  updated_at: string;
  message: string;
  success: boolean;
}

// Project Management API
export const projectAPI = {
  // Create project
  createProject: async (data: CreateProjectRequest): Promise<{ message: string; project: ProjectResponse }> => {
    const response = await api.post('/projects/create', data);
    return response.data;
  },

  // Update an existing project
  updateProject: async (projectId: string, data: CreateProjectRequest): Promise<{ message: string; project: ProjectResponse }> => {
    const response = await api.put(`/projects/${projectId}`, data);
    return response.data;
  },

  // Get all projects with pagination
  getAllProjects: async (params?: {
    page?: number;
    size?: number;
    sortBy?: string;
    sortDir?: string;
  }): Promise<PaginatedResponse<ProjectResponse>> => {
    const response = await api.get('/projects', { params });
    return response.data;
  },

  // Get active projects
  getActiveProjects: async (): Promise<{ projects: ProjectResponse[]; count: number }> => {
    const response = await api.get('/projects/active');
    return response.data;
  },

  // Get project by ID
  getProjectById: async (projectId: string): Promise<ProjectResponse> => {
    const response = await api.get(`/projects/${projectId}`);
    return response.data;
  },

  // Update project status
  updateProjectStatus: async (projectId: string, status: ProjectStatus): Promise<{ message: string; project: ProjectResponse }> => {
    const response = await api.put(`/projects/${projectId}/status`, null, { params: { status } });
    return response.data;
  },

  // Upload PDF file
  uploadPdfFile: async (projectId: string, file: File): Promise<{ message: string; project: ProjectResponse }> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post(`/projects/${projectId}/upload-pdf`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Process PDF file
  processPdfFile: async (projectId: string, forceReprocess = false): Promise<{ message: string; result: ProcessPdfResponse }> => {
    const response = await api.post(`/projects/${projectId}/process-pdf`, null, {
      params: { forceReprocess }
    });
    return response.data;
  },

  // Upload and process PDF in a single step (new combined API)
  uploadAndProcessPdf: async (projectId: string, file: File, forceReprocess = false, exampleNumber?: string): Promise<{ message: string; result: ProcessPdfResponse }> => {
    const formData = new FormData();
    formData.append('file', file);

    const params: any = { forceReprocess };
    if (exampleNumber && exampleNumber.trim()) {
      params.exampleNumber = exampleNumber.trim();
    }

    const response = await api.post(`/projects/${projectId}/upload-and-process-pdf`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      params
    });
    return response.data;
  },

  // Get master data for a project
  getMasterData: async (projectId: string): Promise<MasterDataResponse[]> => {
    // TODO: Replace with actual API call when backend is ready
    // const response = await api.get(`/projects/${projectId}/master-data`);
    // return response.data;

    // Mock data for testing
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
    return [
      {
        id: '1',
        containerNumber: '999-9-999',
        lineNumber: 1,
        pageNumber: 1,
        confidenceScore: 0.95,
        rawText: 'Container: 999-9-999',
        isValidated: true,
        isMatched: true,
        matchCount: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '2',
        containerNumber: '888-8-888',
        lineNumber: 2,
        pageNumber: 1,
        confidenceScore: 0.92,
        rawText: 'Container: 888-8-888',
        isValidated: true,
        isMatched: false,
        matchCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
  },

  // Extract containers using Gemini API
  extractContainersGemini: async (projectId: string, imageFile: File): Promise<GeminiExtractionResponse> => {
    const formData = new FormData();
    formData.append('file', imageFile);
    formData.append('projectId', projectId);
    formData.append('description', 'Container extraction from product image');

    const response = await fetch(`${API_BASE_URL}/images/upload-and-extract`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getValidToken()}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  // Verify an image
  verifyImage: async (imageId: string, isVerified: boolean = true): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/images/${imageId}/verify?isVerified=${isVerified}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${getValidToken()}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  // Update serial numbers after user verification
  updateSerialNumbers: async (request: SerialNumberUpdateRequest): Promise<SerialNumberUpdateResponse> => {
    console.log('🔧 updateSerialNumbers called with request:', request);
    console.log('🔄 Using axios instance like other working endpoints...');

    try {
      const response = await api.post('/images/update-serial-numbers', request);
      console.log('✅ updateSerialNumbers success with axios:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ updateSerialNumbers failed with axios:', error);
      console.error('❌ Error response:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      console.error('❌ Error headers:', error.response?.headers);
      throw error;
    }
  },

  // Get project view data (master data + extracted data from images)
  getProjectViewData: async (projectId: string): Promise<{ message: string; data: ProjectViewDataResponse }> => {
    const response = await api.get(`/projects/${projectId}/view-data`);
    return response.data;
  },

  // Get verification status for a project
  getVerificationStatus: async (projectId: string): Promise<VerificationStatusResponse> => {
    // TODO: Replace with actual API call when backend is ready
    // const response = await api.get(`/projects/${projectId}/verification-status`);
    // return response.data;

    // Mock data for testing
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API delay
    return {
      projectId,
      totalMasterData: 9,
      matchedCount: 6,
      unmatchedCount: 2,
      duplicateCount: 1,
      totalImages: 3,
      processedImages: 3,
      verificationProgress: 66.7,
      masterData: [
        {
          id: '1',
          containerNumber: '999-9-999',
          lineNumber: 1,
          pageNumber: 1,
          confidenceScore: 0.95,
          rawText: 'Container: 999-9-999',
          isValidated: true,
          isMatched: true,
          matchCount: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '2',
          containerNumber: '888-8-888',
          lineNumber: 2,
          pageNumber: 1,
          confidenceScore: 0.92,
          rawText: 'Container: 888-8-888',
          isValidated: true,
          isMatched: false,
          matchCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '3',
          containerNumber: '777-7-777',
          lineNumber: 3,
          pageNumber: 1,
          confidenceScore: 0.88,
          rawText: 'Container: 777-7-777',
          isValidated: true,
          isMatched: true,
          matchCount: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '4',
          containerNumber: '666-6-666',
          lineNumber: 4,
          pageNumber: 1,
          confidenceScore: 0.91,
          rawText: 'Container: 666-6-666',
          isValidated: true,
          isMatched: false,
          matchCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '5',
          containerNumber: '555-5-555',
          lineNumber: 5,
          pageNumber: 1,
          confidenceScore: 0.94,
          rawText: 'Container: 555-5-555',
          isValidated: true,
          isMatched: true,
          matchCount: 2,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '6',
          containerNumber: '444-4-444',
          lineNumber: 6,
          pageNumber: 1,
          confidenceScore: 0.89,
          rawText: 'Container: 444-4-444',
          isValidated: true,
          isMatched: true,
          matchCount: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '7',
          containerNumber: '333-3-333',
          lineNumber: 7,
          pageNumber: 1,
          confidenceScore: 0.93,
          rawText: 'Container: 333-3-333',
          isValidated: true,
          isMatched: true,
          matchCount: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '8',
          containerNumber: '222-2-222',
          lineNumber: 8,
          pageNumber: 1,
          confidenceScore: 0.87,
          rawText: 'Container: 222-2-222',
          isValidated: true,
          isMatched: true,
          matchCount: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '9',
          containerNumber: '111-1-111',
          lineNumber: 9,
          pageNumber: 1,
          confidenceScore: 0.96,
          rawText: 'Container: 111-1-111',
          isValidated: true,
          isMatched: false,
          matchCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ],
      imageData: [
        {
          id: 'img1',
          fileName: 'image_01.jpg',
          extractedSerials: ['999-9-999', '777-7-777', '444-4-444'],
          processingStatus: 'COMPLETED',
          uploadedAt: new Date().toISOString()
        },
        {
          id: 'img2',
          fileName: 'image_02.jpg',
          extractedSerials: ['555-5-555', '333-3-333'],
          processingStatus: 'COMPLETED',
          uploadedAt: new Date().toISOString()
        },
        {
          id: 'img3',
          fileName: 'image_03.jpg',
          extractedSerials: ['999-9-999', '555-5-555', '222-2-222'],
          processingStatus: 'COMPLETED',
          uploadedAt: new Date().toISOString()
        }
      ]
    };
  },

  // Process PDF file with request body
  processPdfFileWithRequest: async (data: ProcessPdfRequest): Promise<{ message: string; result: ProcessPdfResponse }> => {
    const response = await api.post('/projects/process-pdf', data);
    return response.data;
  },
};

// Audit Log interfaces
export enum ReviewStatus {
  PENDING = 'PENDING',
  REVIEWED = 'REVIEWED',
  FLAGGED = 'FLAGGED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export interface AuditLog {
  id: string;
  action: string;
  entityType?: string;
  entityId?: string;
  details?: string;
  performedBy?: {
    id: string;
    username: string;
    email: string;
  };
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
  reviewStatus: ReviewStatus;
  reviewedBy?: {
    id: string;
    username: string;
    email: string;
  };
  reviewedAt?: string;
  reviewComments?: string;
}

export interface AuditLogReviewRequest {
  auditLogId: string;
  reviewStatus: ReviewStatus;
  reviewComments?: string;
}

export interface BulkAuditLogReviewRequest {
  auditLogIds: string[];
  reviewStatus: ReviewStatus;
  reviewComments?: string;
}

export interface AuditLogReviewResponse {
  auditLogId: string;
  action: string;
  entityType?: string;
  entityId?: string;
  details?: string;
  performedByUsername?: string;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
  reviewStatus: ReviewStatus;
  reviewedByUsername?: string;
  reviewedAt?: string;
  reviewComments?: string;
}

export interface AuditStatistics {
  totalLogs: number;
  pendingReviews: number;
  reviewedLogs: number;
  flaggedLogs: number;
  approvedLogs: number;
  rejectedLogs: number;
  recentActivity: number;
}

export interface ReviewStatistics {
  totalReviews: number;
  pendingReviews: number;
  approvedReviews: number;
  rejectedReviews: number;
  flaggedReviews: number;
  averageReviewTime: number;
}

// Audit API
export const auditAPI = {
  // Get all audit logs with pagination
  getAllAuditLogs: async (params?: {
    page?: number;
    size?: number;
    sortBy?: string;
    sortDir?: string;
  }): Promise<PaginatedResponse<AuditLog>> => {
    const response = await api.get('/audit', { params });
    return response.data;
  },

  // Get audit logs by date range
  getAuditLogsByDateRange: async (startDate: string, endDate: string): Promise<AuditLog[]> => {
    const response = await api.get('/audit/date-range', {
      params: { startDate, endDate }
    });
    return response.data;
  },

  // Get audit logs by action
  getAuditLogsByAction: async (action: string): Promise<AuditLog[]> => {
    const response = await api.get(`/audit/action/${action}`);
    return response.data;
  },

  // Get recent audit logs
  getRecentAuditLogs: async (hours: number = 24): Promise<AuditLog[]> => {
    const response = await api.get('/audit/recent', { params: { hours } });
    return response.data;
  },

  // Get audit logs for specific entity
  getAuditLogsForEntity: async (entityId: string): Promise<AuditLog[]> => {
    const response = await api.get(`/audit/entity/${entityId}`);
    return response.data;
  },

  // Get audit statistics
  getAuditStatistics: async (): Promise<AuditStatistics> => {
    const response = await api.get('/audit/statistics');
    return response.data;
  },

  // Review an audit log
  reviewAuditLog: async (data: AuditLogReviewRequest): Promise<{ message: string; auditLog: AuditLogReviewResponse }> => {
    const response = await api.post('/audit/review', data);
    return response.data;
  },

  // Bulk review multiple audit logs
  bulkReviewAuditLogs: async (data: BulkAuditLogReviewRequest): Promise<{ message: string; reviewedCount: number }> => {
    // Since backend doesn't have bulk endpoint, we'll call individual reviews
    const promises = data.auditLogIds.map(auditLogId =>
      api.post('/audit/review', {
        auditLogId,
        reviewStatus: data.reviewStatus,
        reviewComments: data.reviewComments
      })
    );

    const results = await Promise.all(promises);
    return {
      message: `Successfully reviewed ${results.length} audit logs`,
      reviewedCount: results.length
    };
  },

  // Bulk review all pending logs
  bulkReviewPendingLogs: async (data: { reviewStatus: ReviewStatus; reviewComments: string }): Promise<{ sessionId: string; reviewedCount: number; reviewedAt: string }> => {
    // The request interceptor will handle the token, but let's use it directly for these critical endpoints
    const response = await api.post('/audit/bulk-review', data);
    return response.data;
  },

  // Get all review sessions
  getAllReviewSessions: async (): Promise<any[]> => {
    // The request interceptor will handle the token
    const response = await api.get('/audit/review-sessions');
    return response.data;
  },

  // Get audit logs by review session
  getAuditLogsByReviewSession: async (reviewSessionId: string): Promise<{ auditLogs?: any[]; reviewedLogs?: any[]; count: number }> => {
    // The request interceptor will handle the token
    const response = await api.get(`/audit/review-session/${reviewSessionId}/logs`);
    return response.data;
  },

  // Get audit logs by review status
  getAuditLogsByReviewStatus: async (status: ReviewStatus, params?: {
    page?: number;
    size?: number;
  }): Promise<PaginatedResponse<AuditLogReviewResponse>> => {
    const response = await api.get(`/audit/review-status/${status}`, { params });
    return response.data;
  },

  // Get pending review logs
  getPendingReviewLogs: async (): Promise<{ auditLogs: AuditLogReviewResponse[]; count: number }> => {
    const response = await api.get('/audit/pending-reviews');
    return response.data;
  },

  // Get flagged audit logs
  getFlaggedLogs: async (): Promise<{ auditLogs: AuditLogReviewResponse[]; count: number }> => {
    const response = await api.get('/audit/flagged');
    return response.data;
  },

  // Get reviewed logs by date range
  getReviewedLogsByDateRange: async (startDate: string, endDate: string): Promise<{ auditLogs: AuditLogReviewResponse[]; count: number }> => {
    const response = await api.get('/audit/reviewed-logs', {
      params: { startDate, endDate }
    });
    return response.data;
  },

  // Get review statistics
  getReviewStatistics: async (): Promise<ReviewStatistics> => {
    const response = await api.get('/audit/review-statistics');
    return response.data;
  },
};

export default api;
