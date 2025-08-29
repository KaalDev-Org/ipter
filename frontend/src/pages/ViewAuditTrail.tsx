import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { 
  FileSearch, 
  Terminal, 
  History, 
  RefreshCw, 
  AlertTriangle,
  MessageSquare
} from 'lucide-react';
import { auditAPI, AuditLog, ReviewStatus } from '../services/api';
import { useToast } from '../components/ui/toast';
import { useAuth } from '../contexts/AuthContext';

interface ReviewSession {
  id: string;
  reviewer: {
    username: string;
  };
  reviewedAt: string;
  reviewComments: string;
  reviewedLogsCount: number;
}

const ViewAuditTrail: React.FC = () => {
  const { showToast } = useToast();
  const { user, isAuthenticated, isAdmin } = useAuth();
  const [pendingLogs, setPendingLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewComment, setReviewComment] = useState('');
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewSessions, setReviewSessions] = useState<ReviewSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<ReviewSession | null>(null);
  const [sessionLogs, setSessionLogs] = useState<AuditLog[]>([]);
  const [accessDenied, setAccessDenied] = useState(false);

  // Fetch pending review logs (main console display)
  const fetchPendingLogs = async () => {
    try {
      setLoading(true);
      const response = await auditAPI.getPendingReviewLogs();

      // Transform the response to match expected format
      const pendingLogsData = response.auditLogs.map((reviewLog: any) => ({
        id: reviewLog.auditLogId,
        action: reviewLog.action,
        entityType: reviewLog.entityType,
        entityId: reviewLog.entityId,
        details: reviewLog.details,
        performedBy: {
          id: 'unknown',
          username: reviewLog.performedByUsername || 'Unknown',
          email: 'unknown@example.com'
        },
        timestamp: reviewLog.timestamp,
        ipAddress: reviewLog.ipAddress,
        userAgent: reviewLog.userAgent,
        reviewStatus: reviewLog.reviewStatus,
        reviewedBy: reviewLog.reviewedByUsername ? {
          id: 'unknown',
          username: reviewLog.reviewedByUsername,
          email: 'unknown@example.com'
        } : undefined,
        reviewedAt: reviewLog.reviewedAt,
        reviewComments: reviewLog.reviewComments
      }));

      setPendingLogs(pendingLogsData);
    } catch (error: any) {
      console.error('Error fetching pending review logs:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        setAccessDenied(true);
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch review sessions for sidebar
  const fetchReviewSessions = async () => {
    try {
      console.log('Fetching review sessions...');
      const sessions = await auditAPI.getAllReviewSessions();
      console.log('Review sessions fetched:', sessions);
      setReviewSessions(sessions);
    } catch (error: any) {
      console.error('Error fetching review sessions:', error);
    }
  };

  // Fetch logs for selected review session
  const fetchSessionLogs = async (sessionId: string) => {
    try {
      setLoading(true);
      const response = await auditAPI.getAuditLogsByReviewSession(sessionId);
      
      const logsData = response.auditLogs.map((reviewLog: any) => ({
        id: reviewLog.auditLogId,
        action: reviewLog.action,
        entityType: reviewLog.entityType,
        entityId: reviewLog.entityId,
        details: reviewLog.details,
        performedBy: {
          id: 'unknown',
          username: reviewLog.performedByUsername || 'Unknown',
          email: 'unknown@example.com'
        },
        timestamp: reviewLog.timestamp,
        ipAddress: reviewLog.ipAddress,
        userAgent: reviewLog.userAgent,
        reviewStatus: reviewLog.reviewStatus,
        reviewedBy: reviewLog.reviewedByUsername ? {
          id: 'unknown',
          username: reviewLog.reviewedByUsername,
          email: 'unknown@example.com'
        } : undefined,
        reviewedAt: reviewLog.reviewedAt,
        reviewComments: reviewLog.reviewComments
      }));

      setSessionLogs(logsData);
    } catch (error: any) {
      console.error('Error fetching session logs:', error);
    } finally {
      setLoading(false);
    }
  };



  // Handle bulk review of all pending logs
  const handleBulkReview = async () => {
    if (!reviewComment.trim()) {
      showToast("Please enter a review comment", "error");
      return;
    }

    if (pendingLogs.length === 0) {
      showToast("No pending logs to review", "error");
      return;
    }

    try {
      setIsReviewing(true);
      console.log('Attempting bulk review with data:', {
        reviewStatus: ReviewStatus.REVIEWED,
        reviewComments: reviewComment
      });

      const result = await auditAPI.bulkReviewPendingLogs({
        reviewStatus: ReviewStatus.REVIEWED,
        reviewComments: reviewComment
      });

      console.log('Bulk review result:', result);
      showToast(`Successfully reviewed ${pendingLogs.length} audit logs`, "success");
      setReviewComment('');

      // Refresh data to show updated state
      console.log('Refreshing pending logs...');
      await fetchPendingLogs();
      console.log('Refreshing review sessions...');
      await fetchReviewSessions();
      setSelectedSession(null);
    } catch (error: any) {
      console.error('Bulk review failed:', error);
      console.error('Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      showToast(`Failed to review audit logs: ${error.response?.data?.message || error.message}`, "error");
    } finally {
      setIsReviewing(false);
    }
  };

  // Format timestamp for display
  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  // Handle session selection
  const handleSessionSelect = (session: ReviewSession) => {
    setSelectedSession(session);
    setReviewComment(session.reviewComments || ''); // Show the review comments for this session
    fetchSessionLogs(session.id);
  };



  // Clear session selection to show pending logs
  const showPendingLogs = () => {
    setSelectedSession(null);
    setSessionLogs([]);
    setReviewComment(''); // Clear the comment field when switching back to pending
  };

  useEffect(() => {
    const rawToken = localStorage.getItem('token');
    const rawRefreshToken = localStorage.getItem('refreshToken');

    console.log('ViewAuditTrail useEffect - Auth status:', {
      isAuthenticated,
      isAdmin,
      user: user ? {
        username: user.username,
        role: user.role,
        roles: user.roles
      } : null,
      rawToken: rawToken,
      rawRefreshToken: rawRefreshToken,
      tokenIsNull: rawToken === 'null',
      tokenIsUndefined: rawToken === 'undefined',
      tokenIsEmpty: rawToken === '',
      tokenIsActuallyNull: rawToken === null
    });

    // Clean up invalid tokens immediately
    if (rawToken === 'null' || rawToken === 'undefined') {
      console.warn('Found invalid token, cleaning up:', rawToken);
      localStorage.removeItem('token');
    }
    if (rawRefreshToken === 'null' || rawRefreshToken === 'undefined') {
      console.warn('Found invalid refresh token, cleaning up:', rawRefreshToken);
      localStorage.removeItem('refreshToken');
    }

    if (isAuthenticated && isAdmin) {
      fetchPendingLogs();
      fetchReviewSessions();
    } else if (isAuthenticated && !isAdmin) {
      console.warn('User is authenticated but not admin:', user?.role);
      setAccessDenied(true);
    }
  }, [isAuthenticated, isAdmin, user]);

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen bg-z-ivory flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-400 mb-2">Access Denied</h3>
          <p className="text-gray-600">Administrator privileges required</p>
        </div>
      </div>
    );
  }

  const currentLogs = selectedSession ? sessionLogs : pendingLogs;
  const isShowingPending = !selectedSession;

  return (
    <div className="min-h-screen bg-z-ivory">
      {/* Header Section */}
      <div className="bg-z-pale-green shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg bg-white/80">
              <FileSearch className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 font-georgia">Audit Trail</h1>
              <p className="text-gray-600 font-verdana">Monitor and review system activities</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-6">
          {/* Left Sidebar - Review Sessions */}
          <div className="w-80 space-y-4">
            <Card className="bg-z-light-green shadow-lg border border-gray-200 rounded-xl">
              <CardHeader className="border-b border-gray-200 p-4 bg-z-pale-green">
                <CardTitle className="text-lg font-bold text-gray-900 flex items-center space-x-2 font-georgia">
                  <History className="w-5 h-5 text-green-600" />
                  <span>Review Sessions</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 max-h-96 overflow-y-auto">
                <div className="space-y-2">
                  <button
                    onClick={showPendingLogs}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      isShowingPending 
                        ? 'bg-green-100 border-2 border-green-300' 
                        : 'bg-white hover:bg-gray-50 border border-gray-200'
                    }`}
                  >
                    <div className="font-medium text-gray-900">Pending Review</div>
                    <div className="text-sm text-gray-600">{pendingLogs.length} logs</div>
                  </button>
                  
                  {reviewSessions.map((session) => (
                    <button
                      key={session.id}
                      onClick={() => handleSessionSelect(session)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        selectedSession?.id === session.id 
                          ? 'bg-green-100 border-2 border-green-300' 
                          : 'bg-white hover:bg-gray-50 border border-gray-200'
                      }`}
                    >
                      <div className="font-medium text-gray-900">
                        Reviewed by {session.reviewer.username}
                      </div>
                      <div className="text-sm text-gray-600">
                        {formatTimestamp(session.reviewedAt)}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center justify-between">
                        <span>{session.reviewedLogsCount} logs</span>
                        {session.reviewComments && (
                          <div title="Has comments">
                            <MessageSquare className="w-4 h-4 text-blue-500" />
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Console Area */}
          <div className="flex-1">
            <Card className="bg-white shadow-lg border border-gray-200 rounded-xl">
              <CardHeader className="border-b border-gray-200 p-4 bg-z-pale-green">
                <CardTitle className="text-lg font-bold text-gray-900 flex items-center space-x-2 font-georgia">
                  <Terminal className="w-5 h-5 text-green-600" />
                  <span>
                    {isShowingPending ? 'Pending Review Logs' : `Review Session - ${selectedSession?.reviewer.username}`}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 bg-slate-800 min-h-96">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <RefreshCw className="w-8 h-8 animate-spin text-green-400" />
                    <span className="ml-2 text-green-400 font-mono">Loading audit logs...</span>
                  </div>
                ) : currentLogs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Terminal className="w-12 h-12 text-slate-400 mb-4" />
                    <h3 className="text-lg font-semibold text-slate-300 mb-2 font-mono">
                      {isShowingPending ? 'No pending logs' : 'No logs in this session'}
                    </h3>
                    <p className="text-slate-400 font-mono">
                      {isShowingPending ? 'All logs have been reviewed' : 'Session contains no audit logs'}
                    </p>
                  </div>
                ) : (
                  <div>
                    {/* Show review comment for the session if available */}
                    {!isShowingPending && selectedSession && selectedSession.reviewComments && (
                      <div className="p-4 bg-slate-700 border-b border-slate-600 border-l-4 border-cyan-400">
                        <div className="text-xs text-cyan-300 mb-1 font-mono">Review Session Comment:</div>
                        <div className="text-cyan-400 font-mono text-sm break-words">{selectedSession.reviewComments}</div>
                      </div>
                    )}

                    <div className="divide-y divide-slate-600">
                    {currentLogs.map((log) => {
                      const timestamp = formatTimestamp(log.timestamp);
                      return (
                        <div key={log.id} className="p-4 hover:bg-slate-700 transition-colors font-mono text-sm">
                          <div className="flex items-start space-x-4">
                            <div className="text-green-400 font-bold min-w-0 flex-shrink-0">
                              [{timestamp}]
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-white">
                                <span className="text-blue-400">{log.performedBy?.username || 'Unknown'}</span>
                                <span className="text-slate-300"> performed </span>
                                <span className="text-yellow-400">{log.action}</span>
                                {log.entityType && (
                                  <>
                                    <span className="text-slate-300"> on </span>
                                    <span className="text-purple-400">{log.entityType}</span>
                                  </>
                                )}
                              </div>
                              {log.details && (
                                <div className="text-slate-400 mt-1 break-words">{log.details}</div>
                              )}
                              {log.ipAddress && (
                                <div className="text-slate-500 text-xs mt-1">IP: {log.ipAddress}</div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Review Section - Only show for pending logs */}
            {isShowingPending && pendingLogs.length > 0 && (
              <Card className="mt-6 bg-white shadow-lg border border-gray-200 rounded-xl">
                <CardHeader className="border-b border-gray-200 p-4 bg-z-light-green">
                  <CardTitle className="text-lg font-bold text-gray-900 flex items-center space-x-2 font-georgia">
                    <MessageSquare className="w-5 h-5 text-green-600" />
                    <span>Review All Pending Logs</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {selectedSession ? "Review Comments for this Session:" : "Review Comment (Required)"}
                      </label>
                      <Textarea
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        placeholder={selectedSession ? "Review comments for this session..." : "Enter your review comments for all pending logs..."}
                        className={`w-full ${selectedSession ? 'bg-gray-50 cursor-default' : ''}`}
                        rows={3}
                        readOnly={!!selectedSession}
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-600">
                        {pendingLogs.length} logs will be reviewed
                      </div>
                      <Button
                        onClick={handleBulkReview}
                        disabled={isReviewing || !reviewComment.trim()}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        {isReviewing ? (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            Reviewing...
                          </>
                        ) : (
                          'Review All'
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewAuditTrail;
