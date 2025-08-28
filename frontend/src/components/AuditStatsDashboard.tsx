import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  BarChart3, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Eye, 
  XCircle,
  Download,
  RefreshCw,
  Users,
  Activity
} from 'lucide-react';
import { auditAPI, AuditStatistics, ReviewStatistics } from '../services/api';
import { useToast } from './ui/toast';

interface AuditStatsDashboardProps {
  onRefresh?: () => void;
}

const AuditStatsDashboard: React.FC<AuditStatsDashboardProps> = ({ onRefresh }) => {
  const { showToast } = useToast();
  const [auditStats, setAuditStats] = useState<AuditStatistics | null>(null);
  const [reviewStats, setReviewStats] = useState<ReviewStatistics | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const [auditData, reviewData] = await Promise.all([
        auditAPI.getAuditStatistics(),
        auditAPI.getReviewStatistics()
      ]);
      setAuditStats(auditData);
      setReviewStats(reviewData);
    } catch (error) {
      console.error('Error fetching statistics:', error);
      showToast("Failed to fetch statistics", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatistics();
  }, []);

  const handleRefresh = () => {
    fetchStatistics();
    onRefresh?.();
    showToast("Statistics have been updated", "success");
  };

  const handleExport = async () => {
    try {
      // This would typically call an export API endpoint
      showToast("Audit logs export will be available shortly", "info");
    } catch (error) {
      showToast("Failed to export audit logs", "error");
    }
  };

  if (loading) {
    return (
      <Card className="bg-z-light-green shadow-lg border border-gray-200 rounded-xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="w-6 h-6 animate-spin text-green-600" />
            <span className="ml-2 text-gray-600 font-verdana">Loading statistics...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Logs */}
        <Card className="bg-white shadow-lg border border-gray-200 rounded-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 font-verdana">Total Logs</p>
                <p className="text-3xl font-bold text-gray-900 font-georgia">
                  {auditStats?.totalLogs || 0}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-blue-100">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pending Reviews */}
        <Card className="bg-white shadow-lg border border-gray-200 rounded-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 font-verdana">Pending Reviews</p>
                <p className="text-3xl font-bold text-yellow-600 font-georgia">
                  {auditStats?.pendingReviews || 0}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-yellow-100">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Flagged Logs */}
        <Card className="bg-white shadow-lg border border-gray-200 rounded-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 font-verdana">Flagged</p>
                <p className="text-3xl font-bold text-red-600 font-georgia">
                  {auditStats?.flaggedLogs || 0}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-red-100">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Approved Logs */}
        <Card className="bg-white shadow-lg border border-gray-200 rounded-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 font-verdana">Approved</p>
                <p className="text-3xl font-bold text-green-600 font-georgia">
                  {auditStats?.approvedLogs || 0}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-green-100">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Review Statistics */}
      <Card className="bg-z-light-green shadow-lg border border-gray-200 rounded-xl">
        <CardHeader className="border-b border-gray-200 p-4 bg-z-pale-green">
          <CardTitle className="text-lg font-bold text-gray-900 flex items-center space-x-2 font-georgia">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <span>Review Statistics</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 font-verdana">Review Status</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Eye className="w-4 h-4 text-blue-500" />
                    <span className="text-sm text-gray-600 font-verdana">Reviewed</span>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800">
                    {auditStats?.reviewedLogs || 0}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-gray-600 font-verdana">Approved</span>
                  </div>
                  <Badge className="bg-green-100 text-green-800">
                    {auditStats?.approvedLogs || 0}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <XCircle className="w-4 h-4 text-red-500" />
                    <span className="text-sm text-gray-600 font-verdana">Rejected</span>
                  </div>
                  <Badge className="bg-red-100 text-red-800">
                    {auditStats?.rejectedLogs || 0}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 font-verdana">Activity</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Activity className="w-4 h-4 text-purple-500" />
                    <span className="text-sm text-gray-600 font-verdana">Recent Activity</span>
                  </div>
                  <Badge className="bg-purple-100 text-purple-800">
                    {auditStats?.recentActivity || 0}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-indigo-500" />
                    <span className="text-sm text-gray-600 font-verdana">Total Reviews</span>
                  </div>
                  <Badge className="bg-indigo-100 text-indigo-800">
                    {reviewStats?.totalReviews || 0}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 font-verdana">Performance</h4>
              <div className="space-y-2">
                <div className="text-sm text-gray-600 font-verdana">
                  Average Review Time
                </div>
                <div className="text-2xl font-bold text-gray-900 font-georgia">
                  {reviewStats?.averageReviewTime ? 
                    `${Math.round(reviewStats.averageReviewTime / 60)}m` : 
                    'N/A'
                  }
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="bg-z-light-green shadow-lg border border-gray-200 rounded-xl">
        <CardHeader className="border-b border-gray-200 p-4 bg-z-pale-green">
          <CardTitle className="text-lg font-bold text-gray-900 flex items-center space-x-2 font-georgia">
            <Activity className="w-5 h-5 text-green-600" />
            <span>Quick Actions</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-3">
            <Button onClick={handleRefresh} variant="outline" className="flex items-center space-x-2">
              <RefreshCw className="w-4 h-4" />
              <span>Refresh Data</span>
            </Button>
            
            <Button onClick={handleExport} variant="outline" className="flex items-center space-x-2">
              <Download className="w-4 h-4" />
              <span>Export Logs</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="flex items-center space-x-2"
              onClick={() => window.location.href = '#pending'}
            >
              <Clock className="w-4 h-4 text-yellow-500" />
              <span>View Pending ({auditStats?.pendingReviews || 0})</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="flex items-center space-x-2"
              onClick={() => window.location.href = '#flagged'}
            >
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <span>View Flagged ({auditStats?.flaggedLogs || 0})</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuditStatsDashboard;
