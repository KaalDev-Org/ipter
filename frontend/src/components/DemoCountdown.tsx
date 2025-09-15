import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Clock, Calendar, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { demoLock, type DemoStatus } from '../utils/demoLock';

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const DemoCountdown: React.FC = () => {
  const [demoStatus, setDemoStatus] = useState<DemoStatus | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    updateDemoStatus();
  }, []);

  useEffect(() => {
    if (demoStatus) {
      updateCountdown();

      // Update countdown every second
      const interval = setInterval(updateCountdown, 1000);

      return () => clearInterval(interval);
    }
  }, [demoStatus]);

  const updateDemoStatus = () => {
    try {
      const status = demoLock.getDemoStatus();
      setDemoStatus(status);
    } catch (error) {
      console.error('Failed to get demo status:', error);
      setDemoStatus(null);
    } finally {
      setLoading(false);
    }
  };

  const updateCountdown = () => {
    if (!demoStatus) return;

    const now = new Date().getTime();
    const expiryTime = demoStatus.expiryDate.getTime();
    const timeDiff = expiryTime - now;

    if (timeDiff > 0) {
      const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

      setTimeRemaining({ days, hours, minutes, seconds });
    } else {
      // For expired demos, show time since expiry as negative values or zero
      setTimeRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = () => {
    if (!demoStatus) return <Info className="w-4 h-4" />;
    
    if (demoStatus.isExpired) return <AlertTriangle className="w-4 h-4 text-red-600" />;
    if (demoStatus.daysUntilExpiry <= 7) return <AlertTriangle className="w-4 h-4 text-orange-600" />;
    return <CheckCircle className="w-4 h-4 text-green-600" />;
  };

  const getStatusBadge = () => {
    if (!demoStatus) return null;
    
    if (demoStatus.isExpired) {
      return <Badge variant="destructive" className="text-xs">Expired</Badge>;
    }
    if (demoStatus.daysUntilExpiry <= 7) {
      return <Badge variant="warning" className="text-xs">Expiring Soon</Badge>;
    }
    return <Badge variant="success" className="text-xs">Active</Badge>;
  };

  const getCardBorderColor = () => {
    if (!demoStatus) return 'border-gray-200';
    
    if (demoStatus.isExpired) return 'border-red-200';
    if (demoStatus.daysUntilExpiry <= 7) return 'border-orange-200';
    return 'border-green-200';
  };

  if (loading) {
    return (
      <Card className="bg-z-light-green backdrop-blur-sm shadow-xl border-0">
        <CardHeader className="bg-z-pale-green">
          <CardTitle className="text-lg font-header text-slate-900 flex items-center">
            <Clock className="w-4 h-4 mr-2" />
            Demo Status
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-slate-900 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600">Loading...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`bg-z-light-green backdrop-blur-sm shadow-xl border-2 ${getCardBorderColor()}`}>
      <CardHeader className="bg-z-pale-green">
        <CardTitle className="text-lg font-header text-slate-900 flex items-center justify-between">
          <div className="flex items-center">
            {getStatusIcon()}
            <span className="ml-2">Demo Status</span>
          </div>
          {getStatusBadge()}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        {demoStatus && (
          <>
            {/* Expiry Date */}
            <div className="space-y-2">
              <div className="flex items-center text-sm font-medium text-gray-600">
                <Calendar className="w-4 h-4 mr-2" />
                Demo Expires
              </div>
              <p className="text-base font-semibold text-slate-900 ml-6">
                {formatDate(demoStatus.expiryDate)}
              </p>
            </div>

            {/* Countdown Timer */}
            {!demoStatus.isExpired ? (
              <div className="space-y-3">
                <div className="flex items-center text-sm font-medium text-gray-600">
                  <Clock className="w-4 h-4 mr-2" />
                  Time Remaining
                </div>
                <div className="grid grid-cols-2 gap-2 ml-6">
                  <div className="text-center p-2 bg-white/50 rounded-lg border">
                    <div className="text-lg font-bold text-slate-900">{timeRemaining.days}</div>
                    <div className="text-xs text-gray-600">Days</div>
                  </div>
                  <div className="text-center p-2 bg-white/50 rounded-lg border">
                    <div className="text-lg font-bold text-slate-900">{timeRemaining.hours}</div>
                    <div className="text-xs text-gray-600">Hours</div>
                  </div>
                  <div className="text-center p-2 bg-white/50 rounded-lg border">
                    <div className="text-lg font-bold text-slate-900">{timeRemaining.minutes}</div>
                    <div className="text-xs text-gray-600">Minutes</div>
                  </div>
                  <div className="text-center p-2 bg-white/50 rounded-lg border">
                    <div className="text-lg font-bold text-slate-900">{timeRemaining.seconds}</div>
                    <div className="text-xs text-gray-600">Seconds</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center text-sm font-medium text-red-600">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Demo Expired
                </div>
                <div className="ml-6 p-3 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-sm text-red-700 font-medium">
                    This demo version has expired and all features are disabled.
                  </p>
                </div>
              </div>
            )}

            {/* Status Message */}
            <div className="pt-2 border-t border-gray-200">
              <p className="text-sm text-gray-700">
                {demoStatus.message}
              </p>
            </div>

            {/* Demo Information */}
            <div className="text-xs text-gray-500 space-y-1">
              <p>🏢 IPTER Demo Version</p>
              <p>📧 For evaluation purposes only</p>
              {demoStatus.isExpired && (
                <p className="text-red-600 font-medium">⚠️ All features disabled</p>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default DemoCountdown;
