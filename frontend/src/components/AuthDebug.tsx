import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { authAPI, auditAPI } from '../services/api';

const AuthDebug: React.FC = () => {
  const { user, isAuthenticated, isAdmin, isReviewer, loading } = useAuth();
  const [testResult, setTestResult] = useState<string>('');

  const testCurrentUser = async () => {
    try {
      const userData = await authAPI.getCurrentUser();
      setTestResult(`SUCCESS: ${JSON.stringify(userData, null, 2)}`);
    } catch (error: any) {
      setTestResult(`ERROR: ${error.response?.status} - ${error.response?.statusText} - ${JSON.stringify(error.response?.data)}`);
    }
  };

  const testAuditAPI = async () => {
    try {
      const auditData = await auditAPI.getAllAuditLogs({ page: 0, size: 1 });
      setTestResult(`AUDIT SUCCESS: ${JSON.stringify(auditData, null, 2)}`);
    } catch (error: any) {
      setTestResult(`AUDIT ERROR: ${error.response?.status} - ${error.response?.statusText} - ${JSON.stringify(error.response?.data)}`);
    }
  };

  return (
    <Card className="mb-4 bg-yellow-50 border-yellow-200">
      <CardHeader>
        <CardTitle className="text-sm font-bold text-yellow-800">Auth Debug Info</CardTitle>
      </CardHeader>
      <CardContent className="text-xs">
        <div className="space-y-2">
          <div><strong>Loading:</strong> {loading ? 'true' : 'false'}</div>
          <div><strong>Is Authenticated:</strong> {isAuthenticated ? 'true' : 'false'}</div>
          <div><strong>Is Admin:</strong> {isAdmin ? 'true' : 'false'}</div>
          <div><strong>Is Reviewer:</strong> {isReviewer ? 'true' : 'false'}</div>
          <div><strong>User Role:</strong> {user?.role || 'undefined'}</div>
          <div><strong>User Roles Array:</strong> {JSON.stringify(user?.roles) || 'undefined'}</div>
          <div><strong>User ID:</strong> {user?.id || 'undefined'}</div>
          <div><strong>Username:</strong> {user?.username || 'undefined'}</div>
          <div><strong>Email:</strong> {user?.email || 'undefined'}</div>
          <div><strong>Can View Audit Trail:</strong> {user?.canViewAuditTrail ? 'true' : 'false'}</div>
          <div><strong>Token Present:</strong> {localStorage.getItem('token') ? 'true' : 'false'}</div>
          <div><strong>Token Preview:</strong> {localStorage.getItem('token')?.substring(0, 30) + '...' || 'none'}</div>
        </div>

        <div className="mt-4 space-y-2">
          <Button onClick={testCurrentUser} size="sm" variant="outline">Test Current User API</Button>
          <Button onClick={testAuditAPI} size="sm" variant="outline">Test Audit API</Button>
        </div>

        {testResult && (
          <div className="mt-4 p-2 bg-gray-100 rounded text-xs">
            <strong>Test Result:</strong>
            <pre className="whitespace-pre-wrap">{testResult}</pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AuthDebug;
