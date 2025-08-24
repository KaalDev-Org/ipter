import axios from 'axios';

// Use full backend URL directly
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

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
    const token = localStorage.getItem('token');

    console.log('API Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`,
      hasToken: !!token,
      tokenPreview: token ? `${token.substring(0, 20)}...` : 'No token'
    });

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Authorization header set:', config.headers.Authorization.substring(0, 30) + '...');
    } else {
      console.warn('No token found in localStorage for authenticated request');
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

      try {
        const refreshToken = localStorage.getItem('refreshToken');
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
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          // Only redirect to login if we're not already on the login page
          if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        // Refresh failed, clear tokens but don't auto-redirect
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        // Only redirect to login if we're not already on the login page
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
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

// Project Management API
export const projectAPI = {
  // Create project
  createProject: async (data: CreateProjectRequest): Promise<{ message: string; project: ProjectResponse }> => {
    const response = await api.post('/projects/create', data);
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

  // Process PDF file with request body
  processPdfFileWithRequest: async (data: ProcessPdfRequest): Promise<{ message: string; result: ProcessPdfResponse }> => {
    const response = await api.post('/projects/process-pdf', data);
    return response.data;
  },
};

export default api;
