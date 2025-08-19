import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { authAPI, SessionInfo } from '../services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Button } from '../components/ui/button';
import { User, Mail, Calendar, Shield } from 'lucide-react';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSessionInfo = async () => {
      try {
        const info = await authAPI.getSessionInfo();
        setSessionInfo(info);
      } catch (error) {
        console.error('Failed to fetch session info:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSessionInfo();
  }, []);

  const getInitials = (firstName?: string, lastName?: string, username?: string) => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    if (username) {
      return username.slice(0, 2).toUpperCase();
    }
    return 'U';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-z-ivory to-z-light-green">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-header font-bold text-slate-900 mb-2">
            Profile
          </h1>
          <p className="text-lg text-gray-600">
            Manage your account information and settings
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-2xl font-header flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src="" alt={user?.username} />
                  <AvatarFallback className="bg-z-pale-green text-slate-900 text-lg">
                    {getInitials(user?.firstName, user?.lastName, user?.username)}
                  </AvatarFallback>
                </Avatar>
                User Profile
              </CardTitle>
              <CardDescription>
                Your personal information and account details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Username</p>
                      <p className="text-lg">{user?.username}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Email</p>
                      <p className="text-lg">{user?.email}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {user?.firstName && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">First Name</p>
                      <p className="text-lg">{user.firstName}</p>
                    </div>
                  )}

                  {user?.lastName && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Last Name</p>
                      <p className="text-lg">{user.lastName}</p>
                    </div>
                  )}

                  {user?.roles && user.roles.length > 0 && (
                    <div className="flex items-center gap-3">
                      <Shield className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Roles</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {user.roles.map((role, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-z-pale-green text-slate-900 text-xs rounded-full"
                            >
                              {role}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t">
                <Button variant="outline" className="mr-3">
                  Edit Profile
                </Button>
                <Button variant="outline">
                  Change Password
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Session Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-header flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Session Info
              </CardTitle>
              <CardDescription>
                Current session details
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-sm text-gray-500">Loading session info...</p>
              ) : sessionInfo ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Session ID</p>
                    <p className="text-sm font-mono bg-gray-100 p-2 rounded">
                      {sessionInfo.sessionId}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-500">Expires At</p>
                    <p className="text-sm">{formatDate(sessionInfo.expiresAt)}</p>
                  </div>

                  <div className="pt-2 border-t">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-green-600">Active Session</span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">Failed to load session info</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Account Actions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-xl font-header">Account Actions</CardTitle>
            <CardDescription>
              Manage your account settings and preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="justify-start">
                Update Email
              </Button>
              <Button variant="outline" className="justify-start">
                Security Settings
              </Button>
              <Button variant="outline" className="justify-start">
                Privacy Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
