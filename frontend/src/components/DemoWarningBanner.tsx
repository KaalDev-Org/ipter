import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription } from './ui/alert';
import { Button } from './ui/button';
import { X, AlertTriangle, Clock, Info, ExternalLink } from 'lucide-react';
import { demoLock, type DemoStatus } from '../utils/demoLock';

const DemoWarningBanner: React.FC = () => {
  const [demoStatus, setDemoStatus] = useState<DemoStatus | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    updateDemoStatus();
    
    // Update demo status every minute
    const interval = setInterval(updateDemoStatus, 60000);
    
    return () => clearInterval(interval);
  }, []);

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

  // Reset dismissed state when entering grace period
  useEffect(() => {
    if (demoStatus?.isInGracePeriod && demoStatus.daysUntilExpiry <= 3) {
      setDismissed(false);
    }
  }, [demoStatus?.isInGracePeriod, demoStatus?.daysUntilExpiry]);

  if (loading || !demoStatus || dismissed) {
    return null;
  }

  // Don't show banner if demo is expired (lock screen will handle that)
  if (demoStatus.isExpired) {
    return null;
  }

  // Only show banner if in grace period or close to expiry (within 30 days)
  if (!demoStatus.isInGracePeriod && demoStatus.daysUntilExpiry > 30) {
    return null;
  }

  const getAlertVariant = () => {
    if (demoStatus.daysUntilExpiry <= 3) return 'destructive';
    if (demoStatus.daysUntilExpiry <= 7) return 'default';
    return 'default';
  };

  const getIcon = () => {
    if (demoStatus.daysUntilExpiry <= 3) return <AlertTriangle className="h-4 w-4" />;
    if (demoStatus.daysUntilExpiry <= 7) return <Clock className="h-4 w-4" />;
    return <Info className="h-4 w-4" />;
  };

  const getBannerColor = () => {
    if (demoStatus.daysUntilExpiry <= 3) return 'border-l-red-500 bg-red-50';
    if (demoStatus.daysUntilExpiry <= 7) return 'border-l-orange-500 bg-orange-50';
    return 'border-l-blue-500 bg-blue-50';
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleContactClick = () => {
    window.open('https://www.zuelligpharma.com', '_blank');
  };

  return (
    <div className="relative mb-4">
      <Alert variant={getAlertVariant()} className={`border-l-4 ${getBannerColor()}`}>
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            {getIcon()}
            <div className="flex-1 min-w-0">
              <AlertDescription className="text-sm">
                <div className="font-semibold mb-2 flex items-center space-x-2">
                  <span>🚨 Demo Version Warning</span>
                </div>
                
                <div className="space-y-2">
                  <div className="font-medium text-gray-900">
                    {demoStatus.message}
                  </div>
                  
                  <div className="text-xs text-gray-600 space-y-1">
                    <div>
                      📅 <strong>Expiry Date:</strong> {formatDate(demoStatus.expiryDate)}
                    </div>
                    <div>
                      🏢 <strong>Application:</strong> IPTER Demo Version - For evaluation purposes only
                    </div>
                    <div>
                      ⚠️ <strong>Notice:</strong> All features will be disabled after expiration
                    </div>
                  </div>

                  {demoStatus.daysUntilExpiry <= 7 && (
                    <div className="mt-3 pt-2 border-t border-gray-200">
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button
                          size="sm"
                          onClick={handleContactClick}
                          className="bg-blue-600 hover:bg-blue-700 text-white text-xs"
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Get Full License
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setDismissed(true)}
                          className="text-xs"
                        >
                          Dismiss for now
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </AlertDescription>
            </div>
          </div>
          
          {demoStatus.daysUntilExpiry > 7 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDismissed(true)}
              className="h-6 w-6 p-0 hover:bg-transparent flex-shrink-0"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </Alert>
    </div>
  );
};

export default DemoWarningBanner;
