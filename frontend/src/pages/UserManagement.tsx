import React, { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Switch } from '../components/ui/switch';
import { Textarea } from '../components/ui/textarea';

import { UserPlus, Users, Eye, EyeOff, Loader2, Shield, Building, MapPin, User, Key, Settings, Search, Filter, MoreHorizontal, Calendar, Clock } from 'lucide-react';

const createUserSchema = z.object({
  username: z.string().min(1, 'Username is required').min(3, 'Username must be at least 3 characters'),
  loginId: z.string().min(1, 'Login ID is required').min(3, 'Login ID must be at least 3 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.string().min(1, 'Role is required'),
  organization: z.string().min(1, 'Organization is required'),
  designation: z.string().min(1, 'Designation is required'),
  address: z.string().min(1, 'Address is required'),
  status: z.string().min(1, 'Status is required'),
  viewAuditTrail: z.boolean(),
  createProjects: z.boolean(),
  viewReports: z.boolean(),
});

type CreateUserFormData = z.infer<typeof createUserSchema>;

// Mock user data
const mockUsers = [
  {
    id: '1',
    username: 'john_doe123',
    loginId: 'jdoe01',
    role: 'Administrator',
    organization: 'Zuellig Pharma',
    designation: 'Senior Manager',
    address: 'Changi Plant, Singapore',
    status: 'enabled',
    viewAuditTrail: true,
    createProjects: true,
    viewReports: true,
    createdAt: '2024-01-15T10:30:00Z',
    email: 'john.doe@zuelligpharma.com'
  },
  {
    id: '2',
    username: 'sarah_wilson',
    loginId: 'swilson02',
    role: 'Reviewer',
    organization: 'Zuellig Pharma',
    designation: 'Quality Analyst',
    address: 'Bangkok Office, Thailand',
    status: 'enabled',
    viewAuditTrail: true,
    createProjects: false,
    viewReports: true,
    createdAt: '2024-01-20T14:15:00Z',
    email: 'sarah.wilson@zuelligpharma.com'
  },
  {
    id: '3',
    username: 'mike_chen',
    loginId: 'mchen03',
    role: 'User',
    organization: 'Zuellig Pharma',
    designation: 'Lab Technician',
    address: 'Manila Facility, Philippines',
    status: 'disabled',
    viewAuditTrail: false,
    createProjects: false,
    viewReports: false,
    createdAt: '2024-02-01T09:45:00Z',
    email: 'mike.chen@zuelligpharma.com'
  },
  {
    id: '4',
    username: 'lisa_kumar',
    loginId: 'lkumar04',
    role: 'Reviewer',
    organization: 'Zuellig Pharma',
    designation: 'Process Engineer',
    address: 'Mumbai Plant, India',
    status: 'enabled',
    viewAuditTrail: true,
    createProjects: true,
    viewReports: true,
    createdAt: '2024-02-10T16:20:00Z',
    email: 'lisa.kumar@zuelligpharma.com'
  },
  {
    id: '5',
    username: 'david_tan',
    loginId: 'dtan05',
    role: 'User',
    organization: 'Zuellig Pharma',
    designation: 'Research Associate',
    address: 'Kuala Lumpur Office, Malaysia',
    status: 'enabled',
    viewAuditTrail: false,
    createProjects: false,
    viewReports: true,
    createdAt: '2024-02-15T11:10:00Z',
    email: 'david.tan@zuelligpharma.com'
  }
];

const UserManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('create');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Filtering and search state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');

  // Filtered users based on search and filters
  const filteredUsers = useMemo(() => {
    return mockUsers.filter(user => {
      const matchesSearch =
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.loginId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.designation.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
      const matchesRole = roleFilter === 'all' || user.role.toLowerCase() === roleFilter.toLowerCase();

      return matchesSearch && matchesStatus && matchesRole;
    });
  }, [searchTerm, statusFilter, roleFilter]);

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
      viewAuditTrail: false,
      createProjects: false,
      viewReports: false,
      status: 'enabled',
      role: '',
      organization: 'Zuellig Pharma',
    },
  });

  const onSubmit = async (data: CreateUserFormData) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Dummy API call - replace with actual API when available
      console.log('Creating user with data:', data);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      setSuccess('User created successfully!');
      reset();
    } catch (err: any) {
      setError('Failed to create user. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleUserStatus = (userId: string) => {
    // In a real app, this would make an API call
    console.log('Toggling status for user:', userId);
    // For demo purposes, we'll just log it
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-z-ivory via-z-light-green to-z-pale-green">
      {/* Clean Header Section */}
      <div className="bg-white border-b" style={{ borderColor: '#D9ECD2' }}>
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            {/* Left Content */}
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{
                background: 'linear-gradient(135deg, #AEE0E8 0%, #D9ECD2 100%)'
              }}>
                <Users className="w-6 h-6 text-gray-700" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 font-georgia">User Management</h1>
                <p className="text-gray-600 font-verdana">Manage user accounts and permissions</p>
              </div>
            </div>

            {/* Right Content - Modern Toggle Switch */}
            <div className="mt-6 lg:mt-0">
              <div className="relative inline-flex items-center bg-white rounded-xl p-1 shadow-lg border-2" style={{
                borderColor: '#D9ECD2'
              }}>
                {/* Active background slider */}
                <div
                  className="absolute top-1 bottom-1 rounded-lg transition-all duration-300 ease-out shadow-sm"
                  style={{
                    left: activeTab === 'create' ? '4px' : 'calc(50% - 2px)',
                    width: 'calc(50% - 2px)',
                    background: 'linear-gradient(135deg, #AEE0E8 0%, #D9ECD2 100%)',
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
              <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-0 overflow-hidden">
                <CardHeader className="border-b" style={{
                  background: 'linear-gradient(135deg, #F5FAF2 0%, #E4F2E7 100%)',
                  borderColor: '#D9ECD2'
                }}>
                  <CardTitle className="text-2xl font-header text-slate-900 flex items-center space-x-3">
                    <div className="p-2 rounded-lg" style={{
                      background: 'linear-gradient(135deg, #AEE0E8 0%, #D9ECD2 100%)'
                    }}>
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
                    {/* Account Information Section */}
                    <div className="space-y-6">
                      <div className="flex items-center space-x-3 pb-4 border-b border-gray-100">
                        <div className="p-2 bg-blue-50 rounded-lg">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900">Account Information</h3>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Username */}
                        <div className="space-y-3">
                          <Label htmlFor="username" className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                            <span>Username</span>
                            <span className="text-red-500">*</span>
                          </Label>
                          <div className="relative">
                            <Input
                              id="username"
                              type="text"
                              placeholder="john_doe123"
                              {...register('username')}
                              className={`h-12 pl-4 pr-4 border-2 rounded-xl transition-all duration-300 focus:border-z-sky focus:ring-4 focus:ring-z-sky/10 bg-white/80 backdrop-blur-sm ${
                                errors.username ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : 'border-gray-200 hover:border-gray-300'
                              }`}
                            />
                          </div>
                          {errors.username && (
                            <p className="text-sm text-red-500 flex items-center space-x-1">
                              <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                              <span>{errors.username?.message}</span>
                            </p>
                          )}
                        </div>

                        {/* Login ID */}
                        <div className="space-y-3">
                          <Label htmlFor="loginId" className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                            <span>Login ID</span>
                            <span className="text-red-500">*</span>
                          </Label>
                          <div className="relative">
                            <Input
                              id="loginId"
                              type="text"
                              placeholder="jdoe01"
                              {...register('loginId')}
                              className={`h-12 pl-4 pr-4 border-2 rounded-xl transition-all duration-300 focus:border-z-sky focus:ring-4 focus:ring-z-sky/10 bg-white/80 backdrop-blur-sm ${
                                errors.loginId ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : 'border-gray-200 hover:border-gray-300'
                              }`}
                            />
                          </div>
                          {errors.loginId && (
                            <p className="text-sm text-red-500 flex items-center space-x-1">
                              <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                              <span>{errors.loginId?.message}</span>
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Security Section */}
                    <div className="space-y-6">
                      <div className="flex items-center space-x-3 pb-4 border-b border-gray-100">
                        <div className="p-2 bg-green-50 rounded-lg">
                          <Key className="w-5 h-5 text-green-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900">Security</h3>
                      </div>

                      {/* Password */}
                      <div className="space-y-3">
                        <Label htmlFor="password" className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                          <span>Password</span>
                          <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                          <Input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="StrongP@ssw0rd!"
                            {...register('password')}
                            className={`h-12 pl-4 pr-12 border-2 rounded-xl transition-all duration-300 focus:border-z-sky focus:ring-4 focus:ring-z-sky/10 bg-white/80 backdrop-blur-sm ${
                              errors.password ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : 'border-gray-200 hover:border-gray-300'
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
                          >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                        {errors.password && (
                          <p className="text-sm text-red-500 flex items-center space-x-1">
                            <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                            <span>{errors.password?.message}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Role & Status Section */}
                    <div className="space-y-6">
                      <div className="flex items-center space-x-3 pb-4 border-b border-gray-100">
                        <div className="p-2 bg-purple-50 rounded-lg">
                          <Shield className="w-5 h-5 text-purple-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900">Role & Access</h3>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Role */}
                        <div className="space-y-3">
                          <Label htmlFor="role" className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                            <span>Role</span>
                            <span className="text-red-500">*</span>
                          </Label>
                          <Select onValueChange={(value) => setValue('role', value)}>
                            <SelectTrigger className={`h-12 border-2 rounded-xl transition-all duration-300 focus:border-z-sky focus:ring-4 focus:ring-z-sky/10 bg-white/80 backdrop-blur-sm ${
                              errors.role ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : 'border-gray-200 hover:border-gray-300'
                            }`}>
                              <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-0 shadow-xl">
                              <SelectItem value="user" className="rounded-lg">User</SelectItem>
                              <SelectItem value="reviewer" className="rounded-lg">Reviewer</SelectItem>
                              <SelectItem value="administrator" className="rounded-lg">Administrator</SelectItem>
                            </SelectContent>
                          </Select>
                          {errors.role && (
                            <p className="text-sm text-red-500 flex items-center space-x-1">
                              <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                              <span>{errors.role?.message}</span>
                            </p>
                          )}
                        </div>

                        {/* Status */}
                        <div className="space-y-3">
                          <Label htmlFor="status" className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                            <span>Status</span>
                            <span className="text-red-500">*</span>
                          </Label>
                          <Select onValueChange={(value) => setValue('status', value)} defaultValue="enabled">
                            <SelectTrigger className="h-12 border-2 rounded-xl border-gray-200 hover:border-gray-300 transition-all duration-300 focus:border-z-sky focus:ring-4 focus:ring-z-sky/10 bg-white/80 backdrop-blur-sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-0 shadow-xl">
                              <SelectItem value="enabled" className="rounded-lg">Enabled</SelectItem>
                              <SelectItem value="disabled" className="rounded-lg">Disabled</SelectItem>
                            </SelectContent>
                          </Select>
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

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Organization */}
                        <div className="space-y-3">
                          <Label htmlFor="organization" className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                            <span>Organization</span>
                            <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="organization"
                            type="text"
                            placeholder="Zuellig Pharma"
                            {...register('organization')}
                            className={`h-12 pl-4 pr-4 border-2 rounded-xl transition-all duration-300 focus:border-z-sky focus:ring-4 focus:ring-z-sky/10 bg-white/80 backdrop-blur-sm ${
                              errors.organization ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : 'border-gray-200 hover:border-gray-300'
                            }`}
                          />
                          {errors.organization && (
                            <p className="text-sm text-red-500 flex items-center space-x-1">
                              <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                              <span>{errors.organization?.message}</span>
                            </p>
                          )}
                        </div>

                        {/* Designation */}
                        <div className="space-y-3">
                          <Label htmlFor="designation" className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                            <span>Designation</span>
                            <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="designation"
                            type="text"
                            placeholder="Manager"
                            {...register('designation')}
                            className={`h-12 pl-4 pr-4 border-2 rounded-xl transition-all duration-300 focus:border-z-sky focus:ring-4 focus:ring-z-sky/10 bg-white/80 backdrop-blur-sm ${
                              errors.designation ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : 'border-gray-200 hover:border-gray-300'
                            }`}
                          />
                          {errors.designation && (
                            <p className="text-sm text-red-500 flex items-center space-x-1">
                              <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                              <span>{errors.designation?.message}</span>
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Address */}
                      <div className="space-y-3">
                        <Label htmlFor="address" className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                          <MapPin className="w-4 h-4" />
                          <span>Address</span>
                          <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                          id="address"
                          placeholder="Changi Plant, Singapore"
                          {...register('address')}
                          className={`min-h-[100px] border-2 rounded-xl transition-all duration-300 focus:border-z-sky focus:ring-4 focus:ring-z-sky/10 bg-white/80 backdrop-blur-sm resize-none ${
                            errors.address ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : 'border-gray-200 hover:border-gray-300'
                          }`}
                        />
                        {errors.address && (
                          <p className="text-sm text-red-500 flex items-center space-x-1">
                            <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                            <span>{errors.address?.message}</span>
                          </p>
                        )}
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
                            id="viewAuditTrail"
                            checked={watch('viewAuditTrail')}
                            onCheckedChange={(checked) => setValue('viewAuditTrail', checked)}
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
                            id="createProjects"
                            checked={watch('createProjects')}
                            onCheckedChange={(checked) => setValue('createProjects', checked)}
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
                            id="viewReports"
                            checked={watch('viewReports')}
                            onCheckedChange={(checked) => setValue('viewReports', checked)}
                            className="data-[state=checked]:bg-purple-600"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Success/Error Messages */}
                    {success && (
                      <div className="p-6 text-sm text-green-700 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl flex items-center space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="font-medium">{success}</span>
                      </div>
                    )}

                    {error && (
                      <div className="p-6 text-sm text-red-700 bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-xl flex items-center space-x-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span className="font-medium">{error}</span>
                      </div>
                    )}

                    {/* Submit Button */}
                    <div className="flex justify-center pt-8 border-t" style={{ borderColor: '#E4F2E7' }}>
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="px-12 py-4 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl text-base text-gray-700 hover:text-gray-800"
                        style={{
                          background: 'linear-gradient(135deg, #AEE0E8 0%, #D9ECD2 50%, #E4F2E7 100%)',
                          border: '1px solid #D9ECD2'
                        }}
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
                <Card className="bg-white/95 backdrop-blur-sm shadow-xl border-0">
                  <CardHeader style={{ background: 'linear-gradient(135deg, #F5FAF2 0%, #E4F2E7 100%)' }}>
                    <CardTitle className="text-lg font-header text-slate-900 flex items-center space-x-2">
                      <div className="p-1 rounded-lg" style={{ backgroundColor: '#D9ECD2' }}>
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
                <Card className="bg-white/95 backdrop-blur-sm shadow-xl border-0">
                  <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                    <CardTitle className="text-lg font-header text-slate-900 flex items-center space-x-2">
                      <div className="p-1 bg-green-100 rounded-lg">
                        <Users className="w-4 h-4 text-green-600" />
                      </div>
                      <span>User Statistics</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Total Users</span>
                        <span className="font-semibold text-slate-900">24</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Active Users</span>
                        <span className="font-semibold text-green-600">22</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Administrators</span>
                        <span className="font-semibold text-blue-600">3</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'view' && (
          <div className="space-y-6">
            {/* Search and Filter Section */}
            <Card className="bg-white/95 backdrop-blur-sm shadow-xl border-0">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  {/* Search */}
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      placeholder="Search users by name, email, or designation..."
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
                    Showing <span className="font-semibold">{filteredUsers.length}</span> of <span className="font-semibold">{mockUsers.length}</span> users
                  </p>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-gray-500">Live data</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Users Table */}
            <Card className="bg-white/95 backdrop-blur-sm shadow-xl border-0 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-b border-gray-100">
                <CardTitle className="text-xl font-header text-slate-900 flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <span>User Directory</span>
                  <div className="ml-auto bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
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
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">User</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Role & Organization</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Permissions</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Created</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredUsers.map((user, index) => {
                          const { date, time } = formatDate(user.createdAt);
                          return (
                            <tr key={user.id} className="hover:bg-gray-50 transition-colors duration-200">
                              {/* User Info */}
                              <td className="px-6 py-4">
                                <div className="flex items-center space-x-3">
                                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                                    <span className="text-white font-semibold text-sm">
                                      {user.username.charAt(0).toUpperCase()}
                                    </span>
                                  </div>
                                  <div>
                                    <div className="font-semibold text-gray-900">{user.username}</div>
                                    <div className="text-sm text-gray-500">{user.email}</div>
                                    <div className="text-xs text-gray-400">ID: {user.loginId}</div>
                                  </div>
                                </div>
                              </td>

                              {/* Role & Organization */}
                              <td className="px-6 py-4">
                                <div>
                                  <div className="flex items-center space-x-2">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                      user.role === 'Administrator' ? 'bg-purple-100 text-purple-800' :
                                      user.role === 'Reviewer' ? 'bg-blue-100 text-blue-800' :
                                      'bg-gray-100 text-gray-800'
                                    }`}>
                                      {user.role}
                                    </span>
                                  </div>
                                  <div className="text-sm text-gray-900 mt-1">{user.designation}</div>
                                  <div className="text-xs text-gray-500">{user.organization}</div>
                                </div>
                              </td>

                              {/* Permissions */}
                              <td className="px-6 py-4">
                                <div className="flex flex-wrap gap-1">
                                  {user.viewAuditTrail && (
                                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-green-100 text-green-800">
                                      Audit
                                    </span>
                                  )}
                                  {user.createProjects && (
                                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-blue-100 text-blue-800">
                                      Projects
                                    </span>
                                  )}
                                  {user.viewReports && (
                                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-purple-100 text-purple-800">
                                      Reports
                                    </span>
                                  )}
                                </div>
                              </td>

                              {/* Created Date */}
                              <td className="px-6 py-4">
                                <div className="flex items-center space-x-2 text-sm text-gray-900">
                                  <Calendar className="w-4 h-4 text-gray-400" />
                                  <div>
                                    <div>{date}</div>
                                    <div className="text-xs text-gray-500 flex items-center space-x-1">
                                      <Clock className="w-3 h-3" />
                                      <span>{time}</span>
                                    </div>
                                  </div>
                                </div>
                              </td>

                              {/* Status */}
                              <td className="px-6 py-4">
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                  user.status === 'enabled'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  <div className={`w-2 h-2 rounded-full mr-2 ${
                                    user.status === 'enabled' ? 'bg-green-500' : 'bg-red-500'
                                  }`}></div>
                                  {user.status === 'enabled' ? 'Active' : 'Inactive'}
                                </span>
                              </td>

                              {/* Actions */}
                              <td className="px-6 py-4">
                                <div className="flex items-center space-x-2">
                                  <Button
                                    size="sm"
                                    variant={user.status === 'enabled' ? 'outline' : 'default'}
                                    onClick={() => toggleUserStatus(user.id)}
                                    className={`text-xs px-3 py-1 rounded-lg transition-all duration-200 ${
                                      user.status === 'enabled'
                                        ? 'border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300'
                                        : 'bg-green-600 text-white hover:bg-green-700'
                                    }`}
                                  >
                                    {user.status === 'enabled' ? 'Disable' : 'Enable'}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-gray-400 hover:text-gray-600 p-1"
                                  >
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
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
    </div>
  );
};

export default UserManagement;
