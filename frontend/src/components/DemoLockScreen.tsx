import React, { useEffect, useState } from 'react';
import { AlertTriangle, Calendar, Clock, Mail, Globe } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { demoLock, type DemoStatus } from '../utils/demoLock';

const DemoLockScreen: React.FC = () => {
  const [demoStatus, setDemoStatus] = useState<DemoStatus | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Update demo status
    const updateStatus = () => {
      try {
        const status = demoLock.getDemoStatus();
        setDemoStatus(status);
        setCurrentTime(new Date());
      } catch (error) {
        console.error('Failed to get demo status:', error);
        // Fail-safe: show expired state
        setDemoStatus({
          isExpired: true,
          isInGracePeriod: false,
          daysUntilExpiry: -1,
          expiryDate: new Date(),
          currentDate: new Date(),
          message: 'Demo verification failed',
          canAccess: false
        });
      }
    };

    updateStatus();
    
    // Update every minute
    const interval = setInterval(updateStatus, 60000);
    
    return () => clearInterval(interval);
  }, []);



  const formatDateShort = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!demoStatus) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Verifying demo status...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-red-100 to-orange-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        {/* Main Lock Screen */}
        <Card className="border-red-200 shadow-xl">
          <CardHeader className="text-center bg-red-600 text-white rounded-t-lg">
            <div className="flex justify-center mb-4">
              <div className="bg-white/20 p-4 rounded-full">
                <AlertTriangle className="h-12 w-12" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">
              Demo Application Expired
            </CardTitle>
            <p className="text-red-100 mt-2">
              This demonstration version of IPTER has reached its expiration date
            </p>
          </CardHeader>
          
          <CardContent className="p-8 space-y-6">
            {/* Status Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 text-gray-700 mb-2">
                  <Calendar className="h-4 w-4" />
                  <span className="font-semibold">Expiry Date</span>
                </div>
                <p className="text-sm text-gray-600">
                  {formatDateShort(demoStatus.expiryDate)}
                </p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 text-gray-700 mb-2">
                  <Clock className="h-4 w-4" />
                  <span className="font-semibold">Current Time</span>
                </div>
                <p className="text-sm text-gray-600">
                  {formatDateShort(currentTime)}
                </p>
              </div>
            </div>

            {/* Status Message */}
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
              <p className="text-red-800 font-medium text-center">
                {demoStatus.message}
              </p>
            </div>

            {/* Application Information */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                About IPTER Demo
              </h3>
              <div className="space-y-3 text-sm text-gray-600">
                <p>
                  <strong>Application:</strong> IPTER - Image Processing and Text Extraction for Retail
                </p>
                <p>
                  <strong>Version:</strong> Demo Version 1.0
                </p>
                <p>
                  <strong>Features:</strong> PDF Processing, Image Analysis, Serial Number Extraction, Data Verification
                </p>
                <p>
                  <strong>Purpose:</strong> Evaluation and demonstration only
                </p>
              </div>
            </div>

            {/* Contact Information */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Get Full License
              </h3>
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <p className="text-blue-800 mb-3">
                  To continue using IPTER beyond the demo period, please contact Zuellig Pharma for a full license.
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2 text-blue-700">
                    <Globe className="h-4 w-4" />
                    <span>www.zuelligpharma.com</span>
                  </div>
                  <div className="flex items-center space-x-2 text-blue-700">
                    <Mail className="h-4 w-4" />
                    <span>info@zuelligpharma.com</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button 
                onClick={() => window.location.reload()} 
                variant="outline" 
                className="flex-1"
              >
                Refresh Page
              </Button>
              <Button 
                onClick={() => window.open('https://www.zuelligpharma.com', '_blank')} 
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                Contact Zuellig Pharma
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>© 2024 Zuellig Pharma. All rights reserved.</p>
          <p className="mt-1">
            This demo application is for evaluation purposes only.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DemoLockScreen;
