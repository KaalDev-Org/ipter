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
    console.log('API Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`
    });

    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await api.post('/auth/refresh', {
            refreshToken,
          });

          const { token } = response.data;
          localStorage.setItem('token', token);

          // Retry the original request
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
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

export default api;
