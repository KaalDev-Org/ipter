import React, { useState, useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Switch } from '../components/ui/switch';
import { Textarea } from '../components/ui/textarea';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '../components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { useAuth } from '../contexts/AuthContext';
import { userAPI, UserRole, UserResponse, CreateUserRequest, UserStats } from '../services/api';
import { useToast } from '../components/ui/toast';

import { UserPlus, Users, Eye, EyeOff, Loader2, Shield, Building, MapPin, User, Key, Settings, Search, Filter, MoreHorizontal, Calendar, Clock, RefreshCw, AlertCircle, CheckCircle, Edit, Trash2, Unlock, RotateCcw } from 'lucide-react';

const createUserSchema = z.object({
  username: z.string().min(1, 'Username is required').min(3, 'Username must be at least 3 characters'),
  loginId: z.string().min(1, 'Login ID is required').min(3, 'Login ID must be at least 3 characters'),

  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.nativeEnum(UserRole),
  organization: z.string().min(1, 'Organization is required'),
  designation: z.string().min(1, 'Designation is required'),
  address: z.string().min(1, 'Address is required'),
  canViewAuditTrail: z.boolean(),
  canCreateProjects: z.boolean(),
  canViewReports: z.boolean(),
  mustChangePassword: z.boolean(),
});

const updateUserSchema = z.object({

  role: z.nativeEnum(UserRole),
  organization: z.string().optional(),
  designation: z.string().optional(),
  address: z.string().optional(),
  canViewAuditTrail: z.boolean(),
  canCreateProjects: z.boolean(),
  canViewReports: z.boolean(),
  isActive: z.boolean(),
});

type CreateUserFormData = z.infer<typeof createUserSchema>;
type UpdateUserFormData = z.infer<typeof updateUserSchema>;

const UserManagement: React.FC = () => {
  const { isAdmin, user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('create');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // User data state
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);

  // User action states
  const [selectedUser, setSelectedUser] = useState<UserResponse | null>(null);
  const [showResetPasswordDialog, setShowResetPasswordDialog] = useState(false);
  const [showEditUserDialog, setShowEditUserDialog] = useState(false);
  const [showUserDetailsDialog, setShowUserDetailsDialog] = useState(false);
  const [resetPasswordLoading, setResetPasswordLoading] = useState(false);
  const [editUserLoading, setEditUserLoading] = useState(false);
  const [newPassword, setNewPassword] = useState('');

  // Filtering and search state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');

  // Redirect non-admin users to their appropriate page
  useEffect(() => {
    if (user && !isAdmin) {
      console.log('UserManagement: Non-admin user detected, redirecting...', { user, isAdmin });
      const userRole = user.role;

      if (userRole === 'USER') {
        // For USER role, always redirect to Upload Image (their primary function)
        navigate('/upload-image', { replace: true });
      } else if (userRole === 'REVIEWER') {
        if (user.canViewAuditTrail === true) {
          navigate('/view-audit-trail', { replace: true });
        } else if (user.canViewReports === true) {
          navigate('/project-data', { replace: true });
        } else {
          navigate('/upload-image', { replace: true });
        }
      } else {
        // For other roles, check permissions
        if (user.canViewAuditTrail === true) {
          navigate('/view-audit-trail', { replace: true });
        } else if (user.canCreateProjects === true) {
          navigate('/project-management', { replace: true });
        } else if (user.canViewReports === true) {
          navigate('/project-data', { replace: true });
        } else {
          navigate('/upload-image', { replace: true });
        }
      }
    }
  }, [user, isAdmin, navigate]);

  // Load data on component mount
  useEffect(() => {
    if (isAdmin) {
      loadUsers();
      loadUserStats();
    }
  }, [isAdmin]);

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const response = await userAPI.getAllUsers({
        page: 0,
        size: 100, // Load all users for now
        sortBy: 'createdAt',
        sortDir: 'desc'
      });
      setUsers(response.users || response.content || []);
    } catch (error) {
      console.error('Failed to load users:', error);
      setError('Failed to load users. Please try refreshing the page.');
    } finally {
      setLoadingUsers(false);
    }
  };

  const loadUserStats = async () => {
    setLoadingStats(true);
    try {
      const stats = await userAPI.getUserStats();
      setUserStats(stats);
    } catch (error) {
      console.error('Failed to load user stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  // Filtered users based on search and filters
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch =
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.loginId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.designation && user.designation.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus = statusFilter === 'all' ||
        (statusFilter === 'enabled' && user.isActive) ||
        (statusFilter === 'disabled' && !user.isActive);

      const matchesRole = roleFilter === 'all' || user.role === roleFilter.toUpperCase();

      return matchesSearch && matchesStatus && matchesRole;
    });
  }, [users, searchTerm, statusFilter, roleFilter]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      canViewAuditTrail: false,
      canCreateProjects: false,
      canViewReports: false,
      mustChangePassword: false,
      role: UserRole.USER,
      organization: 'Zuellig Pharma',
    },
  });

  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    formState: { errors: editErrors },
    setValue: setEditValue,
    watch: watchEdit,
    reset: resetEdit,
  } = useForm<UpdateUserFormData>({
    resolver: zodResolver(updateUserSchema),
  });

  const onSubmit = async (data: CreateUserFormData) => {
    if (!isAdmin) {
      setError('Only administrators can create users');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const createUserData: CreateUserRequest = {
        username: data.username,
        loginId: data.loginId,
        email: `${data.username}@ipter.local`, // Generate default email based on username
        password: data.password,
        role: data.role,
        organization: data.organization,
        designation: data.designation,
        address: data.address,
        canViewAuditTrail: data.canViewAuditTrail,
        canCreateProjects: data.canCreateProjects,
        canViewReports: data.canViewReports,
        mustChangePassword: true, // Always force password change on user creation
      };

      const response = await userAPI.createUser(createUserData);

      // Show success toast
      showToast(`User ${data.username} has been created successfully!`, 'success');

      // Clear any existing success/error messages
      setSuccess(null);
      setError(null);
      reset();

      // Refresh user list and stats
      await loadUsers();
      await loadUserStats();

    } catch (err: any) {
      console.error('Failed to create user:', err);

      // More detailed error handling
      let errorMessage = 'Failed to create user. Please try again.';

      if (err.response) {
        // Server responded with error status
        if (err.response.status === 401) {
          errorMessage = 'Authentication failed. Please log in again.';
        } else if (err.response.status === 403) {
          errorMessage = 'You do not have permission to create users.';
        } else if (err.response.status === 409) {
          errorMessage = 'A user with this username or login ID already exists.';
        } else if (err.response.data?.error) {
          errorMessage = err.response.data.error;
        } else if (err.response.data?.message) {
          errorMessage = err.response.data.message;
        }
      } else if (err.request) {
        // Network error
        errorMessage = 'Network error. Please check your connection and try again.';
      }

      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleUserStatus = async (userId: string) => {
    if (!isAdmin) {
      setError('Only administrators can modify user status');
      return;
    }

    // Prevent admin from disabling themselves
    if (user?.id === userId) {
      setError('You cannot enable or disable your own account');
      return;
    }

    try {
      const response = await userAPI.toggleUserStatus(userId);
      setSuccess(response.message);

      // Update local state
      setUsers(prev => prev.map(user =>
        user.id === userId
          ? { ...user, isActive: response.user.isActive }
          : user
      ));

      // Refresh stats
      await loadUserStats();

    } catch (error: any) {
      console.error('Failed to toggle user status:', error);
      const errorMessage = error.response?.data?.error || 'Failed to update user status';
      setError(errorMessage);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      })
    };
  };

  // User action handlers
  const handleResetPassword = async () => {
    if (!selectedUser || !newPassword.trim()) {
      setError('Please enter a new password');
      return;
    }

    setResetPasswordLoading(true);
    try {
      await userAPI.resetUserPassword(selectedUser.id, {
        newPassword: newPassword.trim(),
        forcePasswordChange: true
      });

      setSuccess(`Password reset successfully for ${selectedUser.username}`);
      closeResetPasswordDialog();

    } catch (error: any) {
      console.error('Failed to reset password:', error);
      const errorMessage = error.response?.data?.error || 'Failed to reset password';
      setError(errorMessage);
    } finally {
      setResetPasswordLoading(false);
    }
  };

  const handleUnlockUser = async (userId: string) => {
    try {
      const response = await userAPI.unlockUserAccount(userId);
      setSuccess(response.message);

      // Update local state
      setUsers(prev => prev.map(user =>
        user.id === userId
          ? { ...user, failedLoginAttempts: 0 }
          : user
      ));

    } catch (error: any) {
      console.error('Failed to unlock user:', error);
      const errorMessage = error.response?.data?.error || 'Failed to unlock user account';
      setError(errorMessage);
    }
  };

  const onEditSubmit = async (data: UpdateUserFormData) => {
    if (!selectedUser) return;

    setEditUserLoading(true);
    setError(null);

    try {
      const response = await userAPI.updateUser(selectedUser.id, data);

      // Update the user in the local state
      setUsers(prevUsers =>
        prevUsers.map(u => u.id === selectedUser.id ? response.user : u)
      );

      showToast(`User ${selectedUser.username} has been updated successfully!`, 'success');
      setShowEditUserDialog(false);
      setSelectedUser(null);
      resetEdit();

    } catch (error: any) {
      console.error('Failed to update user:', error);
      const errorMessage = error.response?.data?.error || 'Failed to update user';
      setError(errorMessage);
    } finally {
      setEditUserLoading(false);
    }
  };

  const openResetPasswordDialog = (user: UserResponse) => {
    setSelectedUser(user);
    setNewPassword('');
    setShowResetPasswordDialog(true);
  };

  const closeResetPasswordDialog = () => {
    setShowResetPasswordDialog(false);
    setNewPassword('');
    setSelectedUser(null);
  };

  const openEditUserDialog = (user: UserResponse) => {
    setSelectedUser(user);
    // Pre-populate the form with current user data
    setEditValue('role', user.role);
    setEditValue('organization', user.organization || '');
    setEditValue('designation', user.designation || '');
    setEditValue('address', user.address || '');
    setEditValue('canViewAuditTrail', user.canViewAuditTrail);
    setEditValue('canCreateProjects', user.canCreateProjects);
    setEditValue('canViewReports', user.canViewReports);
    setEditValue('isActive', user.isActive);
    setShowEditUserDialog(true);
  };

  const openUserDetailsDialog = (user: UserResponse) => {
    setSelectedUser(user);
    setShowUserDetailsDialog(true);
  };

  // Check if user has admin access
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-z-ivory via-z-light-green to-z-pale-green flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-center text-red-600 flex items-center justify-center space-x-2">
              <AlertCircle className="w-6 h-6" />
              <span>Access Denied</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-600">
              You need administrator privileges to access user management.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-z-ivory">
      {/* Clean Header Section */}
      <div className="bg-z-pale-green shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            {/* Left Content */}
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-white/80">
                <Users className="w-6 h-6 text-gray-700" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 font-header">User Management</h1>
                <p className="text-gray-600 font-body">Manage user accounts and permissions</p>
              </div>
            </div>

            {/* Right Content - Modern Toggle Switch */}
            <div className="mt-6 lg:mt-0">
              <div className="relative inline-flex items-center bg-white rounded-xl p-1 shadow-lg border-2 border-z-pale-green">
                {/* Active background slider */}
                <div
                  className="absolute top-1 bottom-1 rounded-lg transition-all duration-300 ease-out shadow-sm bg-z-sky"
                  style={{
                    left: activeTab === 'create' ? '4px' : 'calc(50% - 2px)',
                    width: 'calc(50% - 2px)',
                  }}
                />

                {/* Buttons */}
                <button
                  onClick={() => setActiveTab('create')}
                  className={`relative z-10 px-5 py-2.5 text-sm font-medium transition-all duration-300 rounded-lg ${
                    activeTab === 'create'
                      ? 'text-gray-800 font-semibold'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  style={{ minWidth: '100px' }}
                >
                  Create User
                </button>
                <button
                  onClick={() => setActiveTab('view')}
                  className={`relative z-10 px-5 py-2.5 text-sm font-medium transition-all duration-300 rounded-lg ${
                    activeTab === 'view'
                      ? 'text-gray-800 font-semibold'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  style={{ minWidth: '100px' }}
                >
                  View Users
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-6 py-8">

        {activeTab === 'create' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2">
              <Card className="bg-z-light-green backdrop-blur-sm shadow-2xl border-0 overflow-hidden">
                <CardHeader className="border-b bg-z-pale-green border-z-pale-green">
                  <CardTitle className="text-2xl font-header text-slate-900 flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-white/80">
                      <UserPlus className="w-6 h-6 text-gray-700" />
                    </div>
                    <span>Create New User</span>
                  </CardTitle>
                  <CardDescription className="text-gray-600 text-base">
                    Fill in the details below to create a new user account for the IPTER system
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-8">
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                    {/* Account Information & Role Section - 4 Field Grid */}
                    <div className="space-y-6">
                      <div className="flex items-center space-x-3 pb-4 border-b border-gray-100">
                        <div className="p-2 bg-white/60 rounded-lg">
                          <User className="w-4 h-4 text-gray-700" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900">Account Information</h3>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Username */}
                        <div className="space-y-2">
                          <Label htmlFor="username" className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                            <span>Username</span>
                            <span className="text-red-500">*</span>
                          </Label>
                          <div className="relative">
                            <Input
                              id="username"
                              type="text"
                              placeholder="admin"
                              {...register('username')}
                              className={`h-9 pl-3 pr-3 border-2 rounded-lg transition-all duration-300 focus:border-z-sky focus:ring-2 focus:ring-z-sky/10 bg-white/80 backdrop-blur-sm ${
                                errors.username ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : 'border-gray-200 hover:border-gray-300'
                              }`}
                            />
                          </div>
                          {errors.username && (
                            <p className="text-xs text-red-500 flex items-center space-x-1">
                              <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                              <span>{errors.username?.message}</span>
                            </p>
                          )}
                        </div>

                        {/* Login ID */}
                        <div className="space-y-2">
                          <Label htmlFor="loginId" className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                            <span>Login ID</span>
                            <span className="text-red-500">*</span>
                          </Label>
                          <div className="relative">
                            <Input
                              id="loginId"
                              type="text"
                              placeholder="jdoe01"
                              {...register('loginId')}
                              className={`h-9 pl-3 pr-3 border-2 rounded-lg transition-all duration-300 focus:border-z-sky focus:ring-2 focus:ring-z-sky/10 bg-white/80 backdrop-blur-sm ${
                                errors.loginId ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : 'border-gray-200 hover:border-gray-300'
                              }`}
                            />
                          </div>
                          {errors.loginId && (
                            <p className="text-xs text-red-500 flex items-center space-x-1">
                              <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                              <span>{errors.loginId?.message}</span>
                            </p>
                          )}
                        </div>

                        {/* Role */}
                        <div className="space-y-2">
                          <Label htmlFor="role" className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                            <span>Role</span>
                            <span className="text-red-500">*</span>
                          </Label>
                          <Select onValueChange={(value) => setValue('role', value as UserRole)} defaultValue={UserRole.USER}>
                            <SelectTrigger className={`h-9 border-2 rounded-lg transition-all duration-300 focus:border-z-sky focus:ring-2 focus:ring-z-sky/10 bg-white/80 backdrop-blur-sm ${
                              errors.role ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : 'border-gray-200 hover:border-gray-300'
                            }`}>
                              <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                            <SelectContent className="rounded-lg border-0 shadow-xl">
                              <SelectItem value={UserRole.USER} className="rounded-lg">User</SelectItem>
                              <SelectItem value={UserRole.REVIEWER} className="rounded-lg">Reviewer</SelectItem>
                              <SelectItem value={UserRole.ADMINISTRATOR} className="rounded-lg">Administrator</SelectItem>
                            </SelectContent>
                          </Select>
                          {errors.role && (
                            <p className="text-xs text-red-500 flex items-center space-x-1">
                              <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                              <span>{errors.role?.message}</span>
                            </p>
                          )}
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                          <Label htmlFor="password" className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                            <span>Password</span>
                            <span className="text-red-500">*</span>
                          </Label>
                          <div className="relative">
                            <Input
                              id="password"
                              type={showPassword ? 'text' : 'password'}
                              placeholder="••••••••"
                              {...register('password')}
                              className={`h-9 pl-3 pr-10 border-2 rounded-lg transition-all duration-300 focus:border-z-sky focus:ring-2 focus:ring-z-sky/10 bg-white/80 backdrop-blur-sm ${
                                errors.password ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : 'border-gray-200 hover:border-gray-300'
                              }`}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                          {errors.password && (
                            <p className="text-xs text-red-500 flex items-center space-x-1">
                              <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                              <span>{errors.password?.message}</span>
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Organization Details Section */}
                    <div className="space-y-6">
                      <div className="flex items-center space-x-3 pb-4 border-b border-gray-100">
                        <div className="p-2 bg-orange-50 rounded-lg">
                          <Building className="w-5 h-5 text-orange-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900">Organization Details</h3>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Organization */}
                        <div className="space-y-2">
                          <Label htmlFor="organization" className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                            <span>Organization</span>
                            <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="organization"
                            type="text"
                            placeholder="Zuellig Pharma"
                            {...register('organization')}
                            className={`h-9 pl-3 pr-3 border-2 rounded-lg transition-all duration-300 focus:border-z-sky focus:ring-2 focus:ring-z-sky/10 bg-white/80 backdrop-blur-sm ${
                              errors.organization ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : 'border-gray-200 hover:border-gray-300'
                            }`}
                          />
                          {errors.organization && (
                            <p className="text-xs text-red-500 flex items-center space-x-1">
                              <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                              <span>{errors.organization?.message}</span>
                            </p>
                          )}
                        </div>

                        {/* Designation */}
                        <div className="space-y-2">
                          <Label htmlFor="designation" className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                            <span>Designation</span>
                            <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="designation"
                            type="text"
                            placeholder="Manager"
                            {...register('designation')}
                            className={`h-9 pl-3 pr-3 border-2 rounded-lg transition-all duration-300 focus:border-z-sky focus:ring-2 focus:ring-z-sky/10 bg-white/80 backdrop-blur-sm ${
                              errors.designation ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : 'border-gray-200 hover:border-gray-300'
                            }`}
                          />
                          {errors.designation && (
                            <p className="text-xs text-red-500 flex items-center space-x-1">
                              <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                              <span>{errors.designation?.message}</span>
                            </p>
                          )}
                        </div>

                        {/* Address */}
                        <div className="space-y-2">
                          <Label htmlFor="address" className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                            <MapPin className="w-4 h-4" />
                            <span>Address</span>
                            <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="address"
                            type="text"
                            placeholder="Changi Plant, Singapore"
                            {...register('address')}
                            className={`h-9 pl-3 pr-3 border-2 rounded-lg transition-all duration-300 focus:border-z-sky focus:ring-2 focus:ring-z-sky/10 bg-white/80 backdrop-blur-sm ${
                              errors.address ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : 'border-gray-200 hover:border-gray-300'
                            }`}
                          />
                          {errors.address && (
                            <p className="text-xs text-red-500 flex items-center space-x-1">
                              <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                              <span>{errors.address?.message}</span>
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Permissions Section */}
                    <div className="space-y-6">
                      <div className="flex items-center space-x-3 pb-4 border-b border-gray-100">
                        <div className="p-2 bg-indigo-50 rounded-lg">
                          <Settings className="w-5 h-5 text-indigo-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900">Permissions & Access</h3>
                      </div>

                      <div className="grid grid-cols-1 gap-4">
                        <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                          <div className="space-y-1">
                            <Label htmlFor="viewAuditTrail" className="text-sm font-semibold text-gray-800">
                              View Audit Trail
                            </Label>
                            <p className="text-xs text-gray-600">Allow user to view and access audit trail records</p>
                          </div>
                          <Switch
                            id="canViewAuditTrail"
                            checked={watch('canViewAuditTrail')}
                            onCheckedChange={(checked) => setValue('canViewAuditTrail', checked)}
                            className="data-[state=checked]:bg-blue-600"
                          />
                        </div>

                        <div className="flex items-center justify-between p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
                          <div className="space-y-1">
                            <Label htmlFor="createProjects" className="text-sm font-semibold text-gray-800">
                              Create Projects
                            </Label>
                            <p className="text-xs text-gray-600">Allow user to create and manage new projects</p>
                          </div>
                          <Switch
                            id="canCreateProjects"
                            checked={watch('canCreateProjects')}
                            onCheckedChange={(checked) => setValue('canCreateProjects', checked)}
                            className="data-[state=checked]:bg-green-600"
                          />
                        </div>

                        <div className="flex items-center justify-between p-6 bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl border border-purple-100">
                          <div className="space-y-1">
                            <Label htmlFor="viewReports" className="text-sm font-semibold text-gray-800">
                              View Reports
                            </Label>
                            <p className="text-xs text-gray-600">Allow user to view and generate system reports</p>
                          </div>
                          <Switch
                            id="canViewReports"
                            checked={watch('canViewReports')}
                            onCheckedChange={(checked) => setValue('canViewReports', checked)}
                            className="data-[state=checked]:bg-purple-600"
                          />
                        </div>

                        {/* Force Password Change is now automatically enabled for all new users */}
                      </div>
                    </div>



                    {/* Submit Button */}
                    <div className="flex justify-center pt-8 border-t" style={{ borderColor: '#E4F2E7' }}>
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="px-12 py-4 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl text-base text-gray-700 hover:text-gray-800 bg-z-light-green border border-z-pale-green"
                      >
                        {isLoading ? (
                          <div className="flex items-center space-x-3">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>Creating User...</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-3">
                            <UserPlus className="w-5 h-5" />
                            <span>Create User</span>
                          </div>
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-8 space-y-6">
                {/* Quick Tips Card */}
                <Card className="bg-z-light-green backdrop-blur-sm shadow-xl border-0">
                  <CardHeader className="bg-z-pale-green">
                    <CardTitle className="text-lg font-header text-slate-900 flex items-center space-x-2">
                      <div className="p-1 rounded-lg bg-z-pale-green">
                        <Settings className="w-4 h-4 text-gray-700" />
                      </div>
                      <span>Quick Tips</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div className="space-y-3 text-sm text-gray-600">
                      <div className="flex items-start space-x-3">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2"></div>
                        <p>Username should be unique and contain only letters, numbers, and underscores</p>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2"></div>
                        <p>Password must be at least 8 characters with special characters</p>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2"></div>
                        <p>Assign appropriate permissions based on user role</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* User Stats Card */}
                <Card className="bg-z-light-green backdrop-blur-sm shadow-xl border-0">
                  <CardHeader className="bg-z-pale-green">
                    <CardTitle className="text-lg font-header text-slate-900 flex items-center space-x-2">
                      <div className="p-1 bg-z-pale-green rounded-lg">
                        <Users className="w-4 h-4 text-gray-700" />
                      </div>
                      <span>User Statistics</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    {loadingStats ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                        <span className="ml-2 text-sm text-gray-500">Loading statistics...</span>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Total Users</span>
                          <span className="font-semibold text-slate-900">{userStats?.totalUsers || 0}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Active Users</span>
                          <span className="font-semibold text-green-600">{userStats?.activeUsers || 0}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Administrators</span>
                          <span className="font-semibold text-purple-600">{userStats?.adminUsers || 0}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Reviewers</span>
                          <span className="font-semibold text-teal-600">{userStats?.reviewerUsers || 0}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Regular Users</span>
                          <span className="font-semibold text-gray-600">{userStats?.regularUsers || 0}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Locked Accounts</span>
                          <span className="font-semibold text-red-600">{userStats?.lockedUsers || 0}</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'view' && (
          <div className="space-y-6">
            {/* Search and Filter Section */}
            <Card className="bg-z-ivory backdrop-blur-sm shadow-xl border-0">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  {/* Search */}
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      placeholder="Search users by name, login ID, or designation..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 h-12 rounded-xl"
                    />
                  </div>

                  {/* Filters */}
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Filter className="w-5 h-5 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">Filters:</span>
                    </div>

                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-32 h-10 border-2 border-gray-200 focus:border-blue-500 rounded-lg">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="enabled">Enabled</SelectItem>
                        <SelectItem value="disabled">Disabled</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={roleFilter} onValueChange={setRoleFilter}>
                      <SelectTrigger className="w-36 h-10 border-2 border-gray-200 focus:border-blue-500 rounded-lg">
                        <SelectValue placeholder="Role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Roles</SelectItem>
                        <SelectItem value="administrator">Administrator</SelectItem>
                        <SelectItem value="reviewer">Reviewer</SelectItem>
                        <SelectItem value="user">User</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Results count */}
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Showing <span className="font-semibold">{filteredUsers.length}</span> of <span className="font-semibold">{users.length}</span> users
                  </p>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-gray-500">Live data</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Users Table */}
            <Card className="bg-z-ivory backdrop-blur-sm shadow-xl border-0 overflow-hidden">
              <CardHeader className="bg-z-pale-green border-b border-gray-100">
                <CardTitle className="text-xl font-header text-slate-900 flex items-center space-x-3">
                  <div className="p-2 bg-z-light-green rounded-lg">
                    <Users className="w-5 h-5 text-gray-700" />
                  </div>
                  <span>User Directory</span>
                  <div className="ml-auto bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-sm font-medium">
                    {filteredUsers.length} users
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {filteredUsers.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">No users found</h3>
                    <p className="text-gray-500">Try adjusting your search or filter criteria</p>
                  </div>
                ) : (
                  <div className="w-full">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider" style={{width: '22%'}}>User</th>
                          <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider" style={{width: '18%'}}>Role & Organization</th>
                          <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider" style={{width: '16%'}}>Permissions</th>
                          <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider" style={{width: '14%'}}>Created</th>
                          <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider" style={{width: '18%'}}>Status</th>
                          <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider" style={{width: '12%'}}>Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-z-light-green divide-y divide-gray-200">
                        {filteredUsers.map((tableUser, index) => {
                          const { date, time } = formatDate(tableUser.createdAt);
                          return (
                            <tr key={tableUser.id} className="hover:bg-gray-50 transition-colors duration-200">
                              {/* User Info */}
                              <td className="px-4 py-4 align-top">
                                <div className="flex items-start space-x-2">
                                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                                    <span className="text-white font-semibold text-xs">
                                      {tableUser.username.charAt(0).toUpperCase()}
                                    </span>
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div className="font-semibold text-gray-900 text-sm truncate">{tableUser.username}</div>
                                    <div className="text-xs text-gray-400 truncate">ID: {tableUser.loginId}</div>
                                  </div>
                                </div>
                              </td>

                              {/* Role & Organization */}
                              <td className="px-4 py-4 align-top">
                                <div className="space-y-1">
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                    tableUser.role === UserRole.ADMINISTRATOR ? 'bg-purple-100 text-purple-800' :
                                    tableUser.role === UserRole.REVIEWER ? 'bg-teal-100 text-teal-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {tableUser.role}
                                  </span>
                                  <div className="text-xs text-gray-900 truncate">{tableUser.designation || 'N/A'}</div>
                                  <div className="text-xs text-gray-500 truncate">{tableUser.organization || 'N/A'}</div>
                                </div>
                              </td>

                              {/* Permissions */}
                              <td className="px-4 py-4 align-top">
                                <div className="flex flex-col gap-1">
                                  {tableUser.canViewAuditTrail && (
                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-green-100 text-green-800 w-fit">
                                      Audit
                                    </span>
                                  )}
                                  {tableUser.canCreateProjects && (
                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-teal-100 text-teal-800 w-fit">
                                      Projects
                                    </span>
                                  )}
                                  {tableUser.canViewReports && (
                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-purple-100 text-purple-800 w-fit">
                                      Reports
                                    </span>
                                  )}
                                  {!tableUser.canViewAuditTrail && !tableUser.canCreateProjects && !tableUser.canViewReports && (
                                    <span className="text-xs text-gray-400">None</span>
                                  )}
                                </div>
                              </td>

                              {/* Created Date */}
                              <td className="px-4 py-4 align-top">
                                <div className="text-xs">
                                  <div className="text-gray-900 font-medium">{date}</div>
                                  <div className="text-xs text-gray-500 flex items-center space-x-1 mt-1">
                                    <Clock className="w-3 h-3" />
                                    <span>{time}</span>
                                  </div>
                                </div>
                              </td>

                              {/* Status */}
                              <td className="px-4 py-4 align-top">
                                <div className="flex flex-wrap gap-1">
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                    tableUser.isActive
                                      ? 'bg-green-100 text-green-800'
                                      : 'bg-red-100 text-red-800'
                                  }`}>
                                    <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                                      tableUser.isActive ? 'bg-green-500' : 'bg-red-500'
                                    }`}></div>
                                    {tableUser.isActive ? 'Active' : 'Inactive'}
                                  </span>
                                  {tableUser.mustChangePassword && (
                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs bg-amber-100 text-amber-800 border border-amber-200">
                                      <Key className="w-3 h-3 mr-1" />
                                      <span>Reset Req.</span>
                                    </span>
                                  )}
                                </div>
                              </td>

                              {/* Actions */}
                              <td className="px-4 py-4 align-top">
                                <div className="flex items-center space-x-2">
                                  <Button
                                    size="sm"
                                    variant={tableUser.isActive ? 'outline' : 'default'}
                                    onClick={() => toggleUserStatus(tableUser.id)}
                                    disabled={user?.id === tableUser.id}
                                    className={`text-xs px-2 py-1 rounded-md transition-all duration-200 ${
                                      user?.id === tableUser.id
                                        ? 'opacity-50 cursor-not-allowed'
                                        : tableUser.isActive
                                        ? 'border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300'
                                        : 'bg-green-600 text-white hover:bg-green-700'
                                    }`}
                                    title={user?.id === tableUser.id ? 'You cannot modify your own account status' : ''}
                                  >
                                    {tableUser.isActive ? 'Disable' : 'Enable'}
                                  </Button>

                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="text-gray-400 hover:text-gray-600 p-1 h-8 w-8"
                                      >
                                        <MoreHorizontal className="w-4 h-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-48">
                                      <DropdownMenuItem onClick={() => openUserDetailsDialog(tableUser)}>
                                        <Eye className="w-4 h-4 mr-2" />
                                        View Details
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => openEditUserDialog(tableUser)}>
                                        <Edit className="w-4 h-4 mr-2" />
                                        Edit User
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem onClick={() => openResetPasswordDialog(tableUser)}>
                                        <Key className="w-4 h-4 mr-2" />
                                        Reset Password
                                      </DropdownMenuItem>
                                      {tableUser.failedLoginAttempts >= 5 && (
                                        <DropdownMenuItem onClick={() => handleUnlockUser(tableUser.id)}>
                                          <Unlock className="w-4 h-4 mr-2" />
                                          Unlock Account
                                        </DropdownMenuItem>
                                      )}
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Reset Password Dialog */}
      <Dialog open={showResetPasswordDialog} onOpenChange={(open) => {
        if (!open) closeResetPasswordDialog();
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Reset password for user: <strong>{selectedUser?.username}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="mt-1"
              />
            </div>
            <div className="text-sm text-gray-600">
              The user will be required to change this password on their next login.
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={closeResetPasswordDialog}
              disabled={resetPasswordLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleResetPassword}
              disabled={resetPasswordLoading || !newPassword.trim()}
            >
              {resetPasswordLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Resetting...
                </>
              ) : (
                'Reset Password'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={showEditUserDialog} onOpenChange={setShowEditUserDialog}>
        <DialogContent className="sm:max-w-3xl max-w-[95vw] max-h-[95vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Edit className="w-5 h-5" />
              <span>Edit User</span>
            </DialogTitle>
            <DialogDescription>
              Update information for user: <strong>{selectedUser?.username}</strong>
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="flex-1 overflow-y-auto">
              <form onSubmit={handleSubmitEdit(onEditSubmit)} className="space-y-6 p-1">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <span className="text-red-800 font-medium">Error</span>
                  </div>
                  <p className="text-red-700 mt-1">{error}</p>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Role */}
                <div className="space-y-2">
                  <Label htmlFor="edit-role" className="text-sm font-medium text-gray-700">
                    Role *
                  </Label>
                  <Select
                    value={watchEdit('role')}
                    onValueChange={(value) => setEditValue('role', value as UserRole)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={UserRole.USER}>Regular User</SelectItem>
                      <SelectItem value={UserRole.REVIEWER}>Reviewer</SelectItem>
                      <SelectItem value={UserRole.ADMINISTRATOR}>Administrator</SelectItem>
                    </SelectContent>
                  </Select>
                  {editErrors.role && (
                    <p className="text-red-600 text-sm">{editErrors.role.message}</p>
                  )}
                </div>

                {/* Organization */}
                <div className="space-y-2">
                  <Label htmlFor="edit-organization" className="text-sm font-medium text-gray-700">
                    Organization
                  </Label>
                  <Input
                    id="edit-organization"
                    {...registerEdit('organization')}
                    className="w-full"
                    placeholder="Organization name"
                  />
                  {editErrors.organization && (
                    <p className="text-red-600 text-sm">{editErrors.organization.message}</p>
                  )}
                </div>

                {/* Designation */}
                <div className="space-y-2">
                  <Label htmlFor="edit-designation" className="text-sm font-medium text-gray-700">
                    Designation
                  </Label>
                  <Input
                    id="edit-designation"
                    {...registerEdit('designation')}
                    className="w-full"
                    placeholder="Job title"
                  />
                  {editErrors.designation && (
                    <p className="text-red-600 text-sm">{editErrors.designation.message}</p>
                  )}
                </div>
              </div>

              {/* Address */}
              <div className="space-y-2">
                <Label htmlFor="edit-address" className="text-sm font-medium text-gray-700">
                  Address
                </Label>
                <Textarea
                  id="edit-address"
                  {...registerEdit('address')}
                  className="w-full"
                  placeholder="Full address"
                  rows={3}
                />
                {editErrors.address && (
                  <p className="text-red-600 text-sm">{editErrors.address.message}</p>
                )}
              </div>

              {/* Permissions */}
              <div className="space-y-4">
                <Label className="text-sm font-medium text-gray-700">Permissions</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Switch
                      id="edit-canViewAuditTrail"
                      checked={watchEdit('canViewAuditTrail')}
                      onCheckedChange={(checked) => setEditValue('canViewAuditTrail', checked)}
                    />
                    <Label htmlFor="edit-canViewAuditTrail" className="text-sm">
                      Can View Audit Trail
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Switch
                      id="edit-canCreateProjects"
                      checked={watchEdit('canCreateProjects')}
                      onCheckedChange={(checked) => setEditValue('canCreateProjects', checked)}
                    />
                    <Label htmlFor="edit-canCreateProjects" className="text-sm">
                      Can Create Projects
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Switch
                      id="edit-canViewReports"
                      checked={watchEdit('canViewReports')}
                      onCheckedChange={(checked) => setEditValue('canViewReports', checked)}
                    />
                    <Label htmlFor="edit-canViewReports" className="text-sm">
                      Can View Reports
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Switch
                      id="edit-isActive"
                      checked={watchEdit('isActive')}
                      onCheckedChange={(checked) => setEditValue('isActive', checked)}
                    />
                    <Label htmlFor="edit-isActive" className="text-sm">
                      Account Active
                    </Label>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowEditUserDialog(false)}
                  disabled={editUserLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={editUserLoading}
                  className="text-gray-700 hover:text-gray-800 bg-z-light-green border border-z-pale-green"
                >
                  {editUserLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Update User
                    </>
                  )}
                </Button>
              </DialogFooter>
              </form>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* User Details Dialog */}
      <Dialog open={showUserDetailsDialog} onOpenChange={setShowUserDetailsDialog}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              Detailed information for {selectedUser?.username}
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Username</Label>
                  <p className="text-sm">{selectedUser.username}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Login ID</Label>
                  <p className="text-sm">{selectedUser.loginId}</p>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-500">Role</Label>
                  <p className="text-sm">{selectedUser.role}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Organization</Label>
                  <p className="text-sm">{selectedUser.organization}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Designation</Label>
                  <p className="text-sm">{selectedUser.designation}</p>
                </div>
                <div className="col-span-2">
                  <Label className="text-sm font-medium text-gray-500">Address</Label>
                  <p className="text-sm">{selectedUser.address}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Status</Label>
                  <p className={`text-sm ${selectedUser.isActive ? 'text-green-600' : 'text-red-600'}`}>
                    {selectedUser.isActive ? 'Active' : 'Inactive'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Failed Login Attempts</Label>
                  <p className="text-sm">{selectedUser.failedLoginAttempts}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Password Status</Label>
                  <p className={`text-sm ${selectedUser.mustChangePassword ? 'text-yellow-600' : 'text-green-600'}`}>
                    {selectedUser.mustChangePassword ? 'Must Change Password' : 'Password OK'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Last Login</Label>
                  <p className="text-sm">
                    {selectedUser.lastLogin
                      ? new Date(selectedUser.lastLogin).toLocaleString()
                      : 'Never'
                    }
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Created At</Label>
                  <p className="text-sm">{new Date(selectedUser.createdAt).toLocaleString()}</p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-500">Permissions</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedUser.canViewAuditTrail && (
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-green-100 text-green-800">
                      View Audit Trail
                    </span>
                  )}
                  {selectedUser.canCreateProjects && (
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-teal-100 text-teal-800">
                      Create Projects
                    </span>
                  )}
                  {selectedUser.canViewReports && (
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-purple-100 text-purple-800">
                      View Reports
                    </span>
                  )}
                  {!selectedUser.canViewAuditTrail && !selectedUser.canCreateProjects && !selectedUser.canViewReports && (
                    <span className="text-xs text-gray-400">No special permissions</span>
                  )}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setShowUserDetailsDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;
