import React, { useEffect, useState } from 'react';
import { authAPI, SessionInfo } from '../services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { User, Mail, Calendar, Shield, Clock, MapPin, Building, Key, Settings, Activity, CheckCircle, AlertCircle, Eye, FolderOpen, FileText } from 'lucide-react';
import ChangePasswordModal from '../components/ChangePasswordModal';
import { AuditLogger } from '../utils/auditLogger';

interface UserProfile {
  id: string;
  username: string;
  email: string;
  role: string;
  isActive: boolean;
  lastLogin: string;
  createdAt: string;
  organization?: string;
  designation?: string;
  address?: string;
  canViewAuditTrail?: boolean;
  canCreateProjects?: boolean;
  canViewReports?: boolean;
  mustChangePassword?: boolean;
}

const Profile: React.FC = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Fetch user profile from /me endpoint
        const profileResponse = await authAPI.getCurrentUser();
        setUserProfile({
          ...profileResponse,
          role: profileResponse.role?.toString() || 'USER',
          isActive: profileResponse.isActive ?? false,
          lastLogin: profileResponse.lastLogin || '',
          createdAt: profileResponse.createdAt || '',
          mustChangePassword: (profileResponse as any).mustChangePassword ?? false
        });

        // Log page view
        if (profileResponse?.username) {
          await AuditLogger.logPageView(profileResponse.username, 'Profile', document.referrer || 'Direct');
        }

        // Fetch session info
        const sessionResponse = await authAPI.getSessionInfo();
        setSessionInfo(sessionResponse);
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const getInitials = (username?: string) => {
    if (username) {
      return username.slice(0, 2).toUpperCase();
    }
    return 'U';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'ADMINISTRATOR':
        return 'destructive';
      case 'REVIEWER':
        return 'warning';
      case 'USER':
        return 'info';
      default:
        return 'secondary';
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'ADMINISTRATOR':
        return 'Administrator';
      case 'REVIEWER':
        return 'Reviewer';
      case 'USER':
        return 'User';
      default:
        return role;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-z-ivory to-z-light-green flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-z-light-green">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-header font-bold text-slate-900 mb-2">
            My Profile
          </h1>
          <p className="text-base text-gray-600">
            Manage your account information and settings
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Profile Card */}
          <Card className="lg:col-span-2 bg-z-light-green backdrop-blur-sm shadow-xl border-0">
            <CardHeader className="bg-z-pale-green">
              <div className="flex items-center space-x-6">
                <Avatar className="h-20 w-20 ring-4 ring-white shadow-lg">
                  <AvatarImage src="" alt={userProfile?.username} />
                  <AvatarFallback className="bg-white/90 text-slate-900 text-2xl font-bold">
                    {getInitials(userProfile?.username)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-3xl font-header text-slate-900 mb-2">
                    {userProfile?.username}
                  </CardTitle>
                  <div className="flex items-center space-x-3">
                    <Badge variant={getRoleBadgeVariant(userProfile?.role || '')} className="text-sm">
                      <Shield className="w-3 h-3 mr-1" />
                      {getRoleDisplayName(userProfile?.role || '')}
                    </Badge>
                    <Badge variant={userProfile?.isActive ? 'success' : 'destructive'} className="text-sm">
                      {userProfile?.isActive ? (
                        <>
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Active
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Inactive
                        </>
                      )}
                    </Badge>
                    {userProfile?.mustChangePassword && (
                      <Badge variant="warning" className="text-sm">
                        <Key className="w-3 h-3 mr-1" />
                        Password Change Required
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center">
                  <User className="w-4 h-4 mr-2 text-slate-600" />
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500">Username</p>
                    <p className="text-base text-slate-900">{userProfile?.username}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500">Account Status</p>
                    <p className={`text-base font-medium ${userProfile?.isActive ? 'text-green-600' : 'text-red-600'}`}>
                      {userProfile?.isActive ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Organization Information */}
              {(userProfile?.organization || userProfile?.designation || userProfile?.address) && (
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center">
                    <Building className="w-4 h-4 mr-2 text-slate-600" />
                    Organization Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {userProfile?.organization && (
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-500">Organization</p>
                        <p className="text-base text-slate-900">{userProfile.organization}</p>
                      </div>
                    )}
                    {userProfile?.designation && (
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-500">Designation</p>
                        <p className="text-base text-slate-900">{userProfile.designation}</p>
                      </div>
                    )}
                    {userProfile?.address && (
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-500">Address</p>
                        <p className="text-base text-slate-900 flex items-start">
                          <MapPin className="w-4 h-4 mr-2 text-gray-400 mt-1" />
                          {userProfile.address}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Permissions */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center">
                  <Settings className="w-4 h-4 mr-2 text-slate-600" />
                  Permissions & Access
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className={`p-3 rounded-lg border-2 ${userProfile?.canViewAuditTrail ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
                    <div className="flex items-center space-x-2">
                      <Eye className={`w-4 h-4 ${userProfile?.canViewAuditTrail ? 'text-green-600' : 'text-gray-400'}`} />
                      <div>
                        <p className="font-medium text-slate-900 text-sm">Audit Trail</p>
                        <p className="text-xs text-gray-600">
                          {userProfile?.canViewAuditTrail ? 'Enabled' : 'Disabled'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className={`p-3 rounded-lg border-2 ${userProfile?.canCreateProjects ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
                    <div className="flex items-center space-x-2">
                      <FolderOpen className={`w-4 h-4 ${userProfile?.canCreateProjects ? 'text-green-600' : 'text-gray-400'}`} />
                      <div>
                        <p className="font-medium text-slate-900 text-sm">Create Projects</p>
                        <p className="text-xs text-gray-600">
                          {userProfile?.canCreateProjects ? 'Enabled' : 'Disabled'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className={`p-3 rounded-lg border-2 ${userProfile?.canViewReports ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
                    <div className="flex items-center space-x-2">
                      <FileText className={`w-4 h-4 ${userProfile?.canViewReports ? 'text-green-600' : 'text-gray-400'}`} />
                      <div>
                        <p className="font-medium text-slate-900 text-sm">View Reports</p>
                        <p className="text-xs text-gray-600">
                          {userProfile?.canViewReports ? 'Enabled' : 'Disabled'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Account Activity */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center">
                  <Activity className="w-4 h-4 mr-2 text-slate-600" />
                  Account Activity
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500">Last Login</p>
                    <p className="text-base text-slate-900 flex items-center">
                      <Clock className="w-4 h-4 mr-2 text-gray-400" />
                      {userProfile?.lastLogin ? formatDate(userProfile.lastLogin) : 'Never'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500">Account Created</p>
                    <p className="text-base text-slate-900 flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                      {userProfile?.createdAt ? formatDate(userProfile.createdAt) : 'Unknown'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions Sidebar */}
          <div className="space-y-6">
            {/* Actions Card */}
            <Card className="bg-z-light-green backdrop-blur-sm shadow-xl border-0">
              <CardHeader className="bg-z-pale-green">
                <CardTitle className="text-xl font-header text-slate-900">Quick Actions</CardTitle>
                <CardDescription className="text-slate-700">
                  Manage your account settings
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <Button
                  onClick={async () => {
                    // Log change password modal open
                    if (userProfile?.username) {
                      await AuditLogger.logButtonClick(userProfile.username, 'Change Password', 'Profile');
                      await AuditLogger.logDialogAction(userProfile.username, 'Change Password Modal', 'opened');
                    }
                    setShowChangePasswordModal(true);
                  }}
                  className="w-full bg-slate-600 hover:bg-slate-700 text-white"
                >
                  <Key className="mr-2 h-4 w-4" />
                  Change Password
                </Button>
                {/* <Button className="w-full" variant="outline">
                  <Settings className="mr-2 h-4 w-4" />
                  Account Settings
                </Button>
                <Button className="w-full" variant="outline">
                  <Activity className="mr-2 h-4 w-4" />
                  Activity Log
                </Button> */}
              </CardContent>
            </Card>

            {/* Session Info Card */}
            {/* {sessionInfo && (
              <Card className="bg-white/95 backdrop-blur-sm shadow-xl border-0">
                <CardHeader className="bg-gradient-to-r from-z-light-green to-z-ivory">
                  <CardTitle className="text-lg font-header text-slate-900">Session Info</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Session ID</p>
                      <p className="text-sm text-gray-700 font-mono break-all">{sessionInfo.sessionId}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Status</p>
                      <Badge variant="success" className="text-xs">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Active Session
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )} */}
          </div>
        </div>

        {/* Change Password Modal */}
        <ChangePasswordModal
          isOpen={showChangePasswordModal}
          onClose={async () => {
            // Log modal close
            if (userProfile?.username) {
              await AuditLogger.logDialogAction(userProfile.username, 'Change Password Modal', 'closed');
            }
            setShowChangePasswordModal(false);
          }}
          onSuccess={async () => {
            // Log successful password change
            if (userProfile?.username) {
              await AuditLogger.logPasswordChange(userProfile.username, userProfile.username, false);
              await AuditLogger.logDialogAction(userProfile.username, 'Change Password Modal', 'completed successfully');
            }
            setShowChangePasswordModal(false);
            // Could add a toast notification here
          }}
          username={userProfile?.username || ''}
        />
      </div>
    </div>
  );
};

export default Profile;
