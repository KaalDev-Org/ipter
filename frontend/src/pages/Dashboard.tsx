import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-z-ivory to-z-light-green">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-header font-bold text-slate-900 mb-2">
            Welcome to IPTER Dashboard
          </h1>
          <p className="text-lg text-gray-600">
            Hello, {user?.firstName && user?.lastName 
              ? `${user.firstName} ${user.lastName}`
              : user?.username
            }! You have successfully logged in.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-xl font-header">Getting Started</CardTitle>
              <CardDescription>
                Welcome to your dashboard. This is where you'll manage your account and access features.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Explore the navigation menu to access different sections of the application.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-xl font-header">Profile Information</CardTitle>
              <CardDescription>
                View and manage your profile details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm"><strong>Username:</strong> {user?.username}</p>
                <p className="text-sm"><strong>Email:</strong> {user?.email}</p>
                {user?.firstName && (
                  <p className="text-sm"><strong>First Name:</strong> {user.firstName}</p>
                )}
                {user?.lastName && (
                  <p className="text-sm"><strong>Last Name:</strong> {user.lastName}</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-xl font-header">Quick Actions</CardTitle>
              <CardDescription>
                Common tasks and shortcuts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                More features will be added here as the application grows.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 text-center">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl font-header">Application Status</CardTitle>
              <CardDescription>
                Current development status and next steps
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                  <h3 className="font-semibold text-green-800 mb-2">✅ Completed Features</h3>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• User Registration and Login</li>
                    <li>• JWT Token Authentication</li>
                    <li>• Responsive UI with Zuellig Pharma Design System</li>
                    <li>• Profile Management</li>
                    <li>• Session Management</li>
                  </ul>
                </div>
                
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                  <h3 className="font-semibold text-blue-800 mb-2">🚧 Coming Soon</h3>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Additional application features</li>
                    <li>• Enhanced user management</li>
                    <li>• Advanced dashboard analytics</li>
                    <li>• Integration with backend services</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
