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
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const userData = await authAPI.getCurrentUser();
          setUser(userData);
        } catch (error) {
          console.error('Failed to get current user:', error);
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

      localStorage.setItem('token', response.token);

      // Handle refreshToken if provided
      if (response.refreshToken) {
        localStorage.setItem('refreshToken', response.refreshToken);
      }

      // Create user object from response
      const user: User = response.user || {
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
