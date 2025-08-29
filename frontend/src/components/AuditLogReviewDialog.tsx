import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  User, 
  Calendar, 
  Globe, 
  Monitor, 
  FileText, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Save
} from 'lucide-react';
import { AuditLog, ReviewStatus, auditAPI } from '../services/api';
import { useToast } from './ui/toast';

interface AuditLogReviewDialogProps {
  log: AuditLog | null;
  isOpen: boolean;
  onClose: () => void;
  onReviewComplete: () => void;
}

const AuditLogReviewDialog: React.FC<AuditLogReviewDialogProps> = ({
  log,
  isOpen,
  onClose,
  onReviewComplete
}) => {
  const { showToast } = useToast();
  const [reviewStatus, setReviewStatus] = useState<ReviewStatus>(ReviewStatus.REVIEWED);
  const [reviewComments, setReviewComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!log) return null;

  const handleSubmitReview = async () => {
    try {
      setIsSubmitting(true);
      
      await auditAPI.reviewAuditLog({
        auditLogId: log.id,
        reviewStatus,
        reviewComments: reviewComments.trim() || undefined
      });

      showToast(`Audit log has been marked as ${reviewStatus.toLowerCase()}`, "success");

      onReviewComplete();
      onClose();
      setReviewComments('');
      setReviewStatus(ReviewStatus.REVIEWED);
    } catch (error) {
      console.error('Error submitting review:', error);
      showToast("Failed to submit review", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusIcon = (status: ReviewStatus) => {
    switch (status) {
      case ReviewStatus.PENDING:
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case ReviewStatus.APPROVED:
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case ReviewStatus.REJECTED:
        return <XCircle className="w-4 h-4 text-red-500" />;
      case ReviewStatus.FLAGGED:
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case ReviewStatus.REVIEWED:
        return <Eye className="w-4 h-4 text-blue-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: ReviewStatus) => {
    switch (status) {
      case ReviewStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case ReviewStatus.APPROVED:
        return 'bg-green-100 text-green-800 border-green-200';
      case ReviewStatus.REJECTED:
        return 'bg-red-100 text-red-800 border-red-200';
      case ReviewStatus.FLAGGED:
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case ReviewStatus.REVIEWED:
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
      })
    };
  };

  const timestamp = formatTimestamp(log.timestamp);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center space-x-3 font-georgia">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-z-pale-green">
              <FileText className="w-5 h-5 text-green-600" />
            </div>
            <span>Audit Log Review</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Log Details */}
          <div className="bg-z-light-green rounded-lg p-6 border border-gray-200">
            <div className="grid grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 font-verdana">Action</label>
                  <div className="mt-1 text-lg font-bold text-gray-900 font-georgia">{log.action}</div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 font-verdana">Entity Type</label>
                  <div className="mt-1">
                    {log.entityType ? (
                      <Badge variant="outline" className="text-sm">
                        {log.entityType}
                      </Badge>
                    ) : (
                      <span className="text-gray-500 font-verdana">Not specified</span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 font-verdana">Current Status</label>
                  <div className="mt-1">
                    <Badge className={`text-sm ${getStatusColor(log.reviewStatus)}`}>
                      <span className="mr-2">{getStatusIcon(log.reviewStatus)}</span>
                      {log.reviewStatus}
                    </Badge>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 font-verdana">Performed By</label>
                  <div className="mt-1 flex items-center space-x-2">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-900 font-verdana">
                      {log.performedBy?.username || 'Unknown User'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 font-verdana">Timestamp</label>
                  <div className="mt-1 flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <div>
                      <div className="text-gray-900 font-verdana">{timestamp.date}</div>
                      <div className="text-sm text-gray-600 font-mono">{timestamp.time}</div>
                    </div>
                  </div>
                </div>

                {log.ipAddress && (
                  <div>
                    <label className="text-sm font-semibold text-gray-700 font-verdana">IP Address</label>
                    <div className="mt-1 flex items-center space-x-2">
                      <Globe className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-900 font-mono">{log.ipAddress}</span>
                    </div>
                  </div>
                )}

                {log.entityId && (
                  <div>
                    <label className="text-sm font-semibold text-gray-700 font-verdana">Entity ID</label>
                    <div className="mt-1 text-gray-900 font-mono text-sm break-all">
                      {log.entityId}
                    </div>
                  </div>
                )}

                {log.userAgent && (
                  <div>
                    <label className="text-sm font-semibold text-gray-700 font-verdana">User Agent</label>
                    <div className="mt-1 flex items-center space-x-2">
                      <Monitor className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600 text-sm font-verdana truncate" title={log.userAgent}>
                        {log.userAgent}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Details */}
            {log.details && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <label className="text-sm font-semibold text-gray-700 font-verdana">Details</label>
                <div className="mt-2 p-4 bg-white rounded-lg border border-gray-200">
                  <pre className="text-sm text-gray-900 font-verdana whitespace-pre-wrap">
                    {log.details}
                  </pre>
                </div>
              </div>
            )}

            {/* Previous Review Info */}
            {log.reviewedBy && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <label className="text-sm font-semibold text-gray-700 font-verdana">Previous Review</label>
                <div className="mt-2 p-4 bg-white rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600 font-verdana">
                      Reviewed by {log.reviewedBy.username}
                    </span>
                    {log.reviewedAt && (
                      <span className="text-sm text-gray-500 font-verdana">
                        {formatTimestamp(log.reviewedAt).date}
                      </span>
                    )}
                  </div>
                  {log.reviewComments && (
                    <div className="text-sm text-gray-900 font-verdana">
                      {log.reviewComments}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Review Form */}
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 font-georgia">Submit Review</h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 font-verdana">Review Status</label>
                <Select value={reviewStatus} onValueChange={(value) => setReviewStatus(value as ReviewStatus)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ReviewStatus.REVIEWED}>Reviewed</SelectItem>
                    <SelectItem value={ReviewStatus.APPROVED}>Approved</SelectItem>
                    <SelectItem value={ReviewStatus.REJECTED}>Rejected</SelectItem>
                    <SelectItem value={ReviewStatus.FLAGGED}>Flagged for Attention</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 font-verdana">Comments (Optional)</label>
                <Textarea
                  value={reviewComments}
                  onChange={(e) => setReviewComments(e.target.value)}
                  placeholder="Add any comments about this audit log..."
                  className="mt-1"
                  rows={4}
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmitReview} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Save className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Submit Review
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AuditLogReviewDialog;
