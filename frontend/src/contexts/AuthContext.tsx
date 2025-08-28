import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authAPI, User, LoginData, UserRole } from '../services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (data: LoginData) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isReviewer: boolean;
  hasRole: (role: UserRole) => boolean;
  mustChangePassword: boolean;
  setMustChangePassword: (value: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [mustChangePassword, setMustChangePassword] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      const rawToken = localStorage.getItem('token');
      // Handle the case where token is the string "null" instead of actual null
      const token = rawToken && rawToken !== 'null' && rawToken !== 'undefined' ? rawToken : null;

      if (token) {
        try {
          const userData = await authAPI.getCurrentUser();
          // Ensure roles array is set properly for navbar compatibility
          const user: User = {
            ...userData,
            roles: userData.role ? [userData.role] : []
          };
          setUser(user);
        } catch (error: any) {
          console.error('Failed to get current user:', error);
          console.error('AuthContext: getCurrentUser failed with status:', error.response?.status, error.response?.data);
          console.trace('AuthContext: Token removal stack trace');

          // Only remove token if it's actually invalid (401/403), not for network errors
          if (error.response?.status === 401 || error.response?.status === 403) {
            console.warn('AuthContext: Removing token due to authentication failure');
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
          } else {
            console.warn('AuthContext: Keeping token despite getCurrentUser failure (network/server error)');
          }
        }
      } else {
        // Clean up invalid tokens
        if (rawToken === 'null' || rawToken === 'undefined') {
          console.warn('Found invalid token in localStorage, cleaning up:', rawToken);
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (data: LoginData) => {
    try {
      console.log('Attempting login with:', data);
      const response = await authAPI.login(data);
      console.log('Login response:', response);

      // Ensure we don't store null/undefined as strings
      if (response.token && response.token !== 'null' && response.token !== 'undefined') {
        localStorage.setItem('token', response.token);
      } else {
        throw new Error('Invalid token received from server');
      }

      // Handle refreshToken if provided
      if (response.refreshToken && response.refreshToken !== 'null' && response.refreshToken !== 'undefined') {
        localStorage.setItem('refreshToken', response.refreshToken);
      }

      // Create user object from response
      const user: User = response.user ? {
        ...response.user,
        roles: response.user.role ? [response.user.role] : []
      } : {
        id: response.userId || '',
        username: response.username || '',
        email: response.email || '',
        role: response.role,
        isActive: true, // User is active if they can login
        roles: response.role ? [response.role] : []
      };

      console.log('Setting user:', user);
      setUser(user);
      setMustChangePassword(response.mustChangePassword || false);
      console.log('User set successfully');
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };



  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      setUser(null);
      setMustChangePassword(false);
    }
  };

  // Helper functions for role checking
  const hasRole = (role: UserRole): boolean => {
    return user?.role === role;
  };

  const isAdmin = hasRole(UserRole.ADMINISTRATOR);
  const isReviewer = hasRole(UserRole.REVIEWER);

  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin,
    isReviewer,
    hasRole,
    mustChangePassword,
    setMustChangePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
