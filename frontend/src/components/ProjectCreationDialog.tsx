import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { 
  CheckCircle, 
  Loader2, 
  Package, 
  FileText, 
  Database, 
  Clock,
  AlertCircle,
  Copy,
  ExternalLink
} from 'lucide-react';

interface ProcessStep {
  id: string;
  label: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  message?: string;
  duration?: number;
}

interface ProjectCreationResult {
  projectId: string;
  projectName: string;
  success: boolean;
  message: string;
  extractedCount?: number;
  extractedContainerNumbers?: string[];
  errors?: string[] | null;
  processingTimeMs?: number;
}

interface ProjectCreationDialogProps {
  open: boolean;
  onClose: () => void;
  projectName: string;
  hasFile: boolean;
  onComplete?: (result: ProjectCreationResult) => void;
  onExecute?: (controller: any) => Promise<void>;
}

const ProjectCreationDialog: React.FC<ProjectCreationDialogProps> = ({
  open,
  onClose,
  projectName,
  hasFile,
  onComplete,
  onExecute
}) => {
  const [steps, setSteps] = useState<ProcessStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [result, setResult] = useState<ProjectCreationResult | null>(null);
  const [processingMessages, setProcessingMessages] = useState<string[]>([]);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const hasExecutedRef = useRef(false);

  // Engaging processing messages like ChatGPT
  const projectCreationMessages = [
    "Setting up your project...",
    "Configuring project parameters...",
    "Initializing project workspace...",
    "Finalizing project setup..."
  ];

  const pdfProcessingMessages = [
    "Analyzing PDF structure...",
    "Extracting text content...",
    "Identifying container numbers...",
    "Processing master data...",
    "Validating extracted information...",
    "Organizing data entries...",
    "Finalizing extraction process..."
  ];

  useEffect(() => {
    if (open) {
      // Initialize steps based on whether file is uploaded
      const initialSteps: ProcessStep[] = [
        {
          id: 'create-project',
          label: 'Create Project',
          status: 'pending'
        }
      ];

      if (hasFile) {
        initialSteps.push({
          id: 'process-pdf',
          label: 'Process PDF & Extract Data',
          status: 'pending'
        });
      }

      setSteps(initialSteps);
      setCurrentStep(0);
      setResult(null);
      setCurrentMessageIndex(0);
      hasExecutedRef.current = false;
    }
  }, [open, hasFile]);

  // Separate effect for execution with proper dependency management
  useEffect(() => {
    if (open && onExecute && !hasExecutedRef.current && steps.length > 0) {
      hasExecutedRef.current = true;
      const controller = {
        startStep,
        completeStep,
        errorStep,
        setResult
      };

      // Use setTimeout to ensure this runs after the current render cycle
      setTimeout(() => {
        onExecute(controller);
      }, 0);
    }
  }, [open, onExecute, steps.length]);

  // Animate processing messages
  useEffect(() => {
    if (steps[currentStep]?.status === 'processing') {
      const messages = currentStep === 0 ? projectCreationMessages : pdfProcessingMessages;
      setProcessingMessages(messages);
      
      const interval = setInterval(() => {
        setCurrentMessageIndex((prev) => (prev + 1) % messages.length);
      }, 2000); // Change message every 2 seconds

      return () => clearInterval(interval);
    }
  }, [currentStep, steps]);

  const updateStep = (stepIndex: number, updates: Partial<ProcessStep>) => {
    setSteps(prev => prev.map((step, index) => 
      index === stepIndex ? { ...step, ...updates } : step
    ));
  };

  const startStep = (stepIndex: number, message?: string) => {
    setCurrentStep(stepIndex);
    updateStep(stepIndex, { status: 'processing', message });
  };

  const completeStep = (stepIndex: number, message?: string, duration?: number) => {
    updateStep(stepIndex, { status: 'completed', message, duration });
  };

  const errorStep = (stepIndex: number, message: string) => {
    updateStep(stepIndex, { status: 'error', message });
  };

  const getStepIcon = (step: ProcessStep) => {
    switch (step.status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'processing':
        return <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <div className="w-5 h-5 rounded-full border-2 border-gray-300" />;
    }
  };

  const getStepColor = (step: ProcessStep) => {
    switch (step.status) {
      case 'completed':
        return 'text-green-600';
      case 'processing':
        return 'text-blue-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-400';
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const formatProcessingTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            <Package className="w-6 h-6 text-blue-600" />
            <span>Creating Project: {projectName}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Progress Steps */}
          <div className="space-y-3">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-start space-x-4">
                <div className="flex-shrink-0 mt-1">
                  {getStepIcon(step)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`font-medium ${getStepColor(step)}`}>
                    {step.label}
                  </div>
                  {step.status === 'processing' && (
                    <div className="text-sm text-gray-600 mt-1 animate-pulse">
                      {processingMessages[currentMessageIndex]}
                    </div>
                  )}
                  {step.message && step.status !== 'processing' && (
                    <div className="text-sm text-gray-600 mt-1">
                      {step.message}
                    </div>
                  )}
                  {step.duration && (
                    <div className="text-xs text-gray-500 mt-1">
                      Completed in {formatProcessingTime(step.duration)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Results Section */}
          {result && (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <h3 className="text-lg font-semibold text-green-800">
                    Project Created Successfully!
                  </h3>
                </div>

                <div className="mb-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Project Name</label>
                    <div className="text-sm font-medium mt-1">{result.projectName}</div>
                  </div>
                </div>

                {result.extractedCount && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">Master Data Extracted</span>
                      <Badge className="bg-blue-100 text-blue-800">
                        {result.extractedCount} containers
                      </Badge>
                    </div>
                    
                    {result.processingTimeMs && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600">Processing Time</span>
                        <div className="flex items-center space-x-1 text-sm text-gray-600">
                          <Clock className="w-3 h-3" />
                          <span>{formatProcessingTime(result.processingTimeMs)}</span>
                        </div>
                      </div>
                    )}

                    {result.extractedContainerNumbers && result.extractedContainerNumbers.length > 0 && (
                      <div>
                        <label className="text-sm font-medium text-gray-600 mb-2 block">
                          Sample Container Numbers (first 10)
                        </label>
                        <div className="flex flex-wrap gap-1">
                          {result.extractedContainerNumbers.slice(0, 10).map((container, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {container}
                            </Badge>
                          ))}
                          {result.extractedContainerNumbers.length > 10 && (
                            <Badge variant="outline" className="text-xs">
                              +{result.extractedContainerNumbers.length - 10} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            {result ? (
              <>
                <Button variant="outline" onClick={onClose}>
                  Close
                </Button>
                <Button onClick={() => {
                  onComplete?.(result);
                  onClose();
                }}>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Project
                </Button>
              </>
            ) : (
              <Button variant="outline" onClick={onClose} disabled={currentStep < steps.length}>
                Cancel
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectCreationDialog;
