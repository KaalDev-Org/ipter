import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { 
  Upload, 
  Search, 
  CheckCircle, 
  AlertTriangle, 
  Eye, 
  FileText,
  Package,
  Hash,
  Clock,
  Zap
} from 'lucide-react';

interface UploadedImage {
  file: File;
  preview: string;
  id: string;
}

interface ScannedProduct {
  id: string;
  name: string;
  serialNumber: string;
  status: 'clear' | 'duplicate' | 'unclear';
  duplicateNote?: string;
}

interface ImageVerificationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  uploadedImages: UploadedImage[];
  projectName: string;
}

type VerificationStep = 
  | 'uploading' 
  | 'analyzing' 
  | 'extracting' 
  | 'processing' 
  | 'results' 
  | 'duplicates' 
  | 'unclear';

const ImageVerificationDialog: React.FC<ImageVerificationDialogProps> = ({
  isOpen,
  onClose,
  uploadedImages,
  projectName
}) => {
  const [currentStep, setCurrentStep] = useState<VerificationStep>('uploading');
  const [progress, setProgress] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [foundProducts, setFoundProducts] = useState(0);
  const [scannedProducts, setScannedProducts] = useState<ScannedProduct[]>([]);
  const [duplicateNotes, setDuplicateNotes] = useState<{[key: string]: string}>({});
  const [scanningAnimation, setScanningAnimation] = useState(false);

  // Simulation data
  const mockProducts: ScannedProduct[] = [
    { id: '1', name: 'Paracetamol 500mg', serialNumber: 'PAR001234', status: 'clear' },
    { id: '2', name: 'Ibuprofen 400mg', serialNumber: 'IBU005678', status: 'clear' },
    { id: '3', name: 'Aspirin 100mg', serialNumber: 'ASP009012', status: 'duplicate' },
    { id: '4', name: 'Vitamin C 1000mg', serialNumber: 'VIT003456', status: 'clear' },
    { id: '5', name: 'Amoxicillin 250mg', serialNumber: 'AMX007890', status: 'unclear' },
    { id: '6', name: 'Metformin 500mg', serialNumber: 'MET001122', status: 'clear' },
    { id: '7', name: 'Lisinopril 10mg', serialNumber: 'LIS003344', status: 'duplicate' },
    { id: '8', name: 'Atorvastatin 20mg', serialNumber: 'ATO005566', status: 'clear' },
  ];

  useEffect(() => {
    if (isOpen && uploadedImages.length > 0) {
      startVerification();
    }
  }, [isOpen, uploadedImages]);

  const startVerification = async () => {
    setCurrentStep('uploading');
    setProgress(0);
    setScanningAnimation(true);

    // Uploading phase
    await simulateProgress('uploading', 2000, 20);
    
    // Analyzing phase
    setCurrentStep('analyzing');
    await simulateProgress('analyzing', 3000, 50);
    
    // Finding products
    setCurrentStep('extracting');
    await simulateProductDiscovery();
    
    // Processing results
    setCurrentStep('processing');
    await simulateProgress('processing', 2000, 100);
    
    setScanningAnimation(false);
    
    // Determine next step based on results
    const duplicates = mockProducts.filter(p => p.status === 'duplicate');
    const unclear = mockProducts.filter(p => p.status === 'unclear');
    
    setScannedProducts(mockProducts);
    
    if (duplicates.length > 0) {
      setCurrentStep('duplicates');
    } else if (unclear.length > 0) {
      setCurrentStep('unclear');
    } else {
      setCurrentStep('results');
    }
  };

  const simulateProgress = (step: string, duration: number, targetProgress: number) => {
    return new Promise<void>((resolve) => {
      const startProgress = progress;
      const progressDiff = targetProgress - startProgress;
      const interval = 50;
      const steps = duration / interval;
      const progressPerStep = progressDiff / steps;
      
      let currentProgress = startProgress;
      const timer = setInterval(() => {
        currentProgress += progressPerStep;
        setProgress(Math.min(currentProgress, targetProgress));
        
        if (currentProgress >= targetProgress) {
          clearInterval(timer);
          resolve();
        }
      }, interval);
    });
  };

  const simulateProductDiscovery = async () => {
    for (let i = 1; i <= mockProducts.length; i++) {
      setFoundProducts(i);
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  };

  const getStepMessage = () => {
    switch (currentStep) {
      case 'uploading':
        return `Uploading ${uploadedImages.length} image${uploadedImages.length > 1 ? 's' : ''}...`;
      case 'analyzing':
        return `Analyzing image${uploadedImages.length > 1 ? 's' : ''} for products...`;
      case 'extracting':
        return `Found ${foundProducts} products, extracting serial numbers...`;
      case 'processing':
        return 'Processing verification results...';
      default:
        return '';
    }
  };

  const handleDuplicateNoteChange = (productId: string, note: string) => {
    setDuplicateNotes(prev => ({
      ...prev,
      [productId]: note
    }));
  };

  const canSubmitDuplicates = () => {
    const duplicates = scannedProducts.filter(p => p.status === 'duplicate');
    return duplicates.every(product => duplicateNotes[product.id]?.trim());
  };

  const handleSubmitDuplicates = () => {
    // Here you would submit the duplicate notes
    console.log('Submitting duplicate notes:', duplicateNotes);
    
    // Check if there are unclear products
    const unclear = scannedProducts.filter(p => p.status === 'unclear');
    if (unclear.length > 0) {
      setCurrentStep('unclear');
    } else {
      setCurrentStep('results');
    }
  };

  const handleRetakeUnclear = () => {
    // Close dialog and allow user to retake photos
    onClose();
  };

  const handleFinalSubmit = () => {
    // Submit all results
    console.log('Final submission:', scannedProducts);
    onClose();
  };

  const clearProducts = scannedProducts.filter(p => p.status === 'clear');
  const duplicateProducts = scannedProducts.filter(p => p.status === 'duplicate');
  const unclearProducts = scannedProducts.filter(p => p.status === 'unclear');

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-z-light-green">
        <DialogHeader className="border-b border-gray-200 pb-4 bg-z-pale-green -m-6 mb-6 p-6">
          <DialogTitle className="text-2xl font-header text-slate-900 flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-white/80">
              <Search className="w-5 h-5 text-gray-700" />
            </div>
            <div>
              <span>Image Verification</span>
              <p className="text-sm font-normal text-gray-600 mt-1 font-body">
                Project: {projectName}
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Image Preview with Scanning Animation */}
          {(currentStep === 'uploading' || currentStep === 'analyzing' || currentStep === 'extracting' || currentStep === 'processing') && (
            <Card className="bg-white/50 border border-gray-200 rounded-xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <Eye className="w-5 h-5 text-gray-700" />
                  <span>Processing Images</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {uploadedImages.map((image, index) => (
                    <div key={image.id} className="relative">
                      <img
                        src={image.preview}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border border-gray-200"
                      />
                      {scanningAnimation && (
                        <div className="absolute inset-0 bg-teal-500/20 rounded-lg flex items-center justify-center">
                          <div className="w-full h-1 bg-teal-500 animate-pulse rounded-full"></div>
                          <div className="absolute inset-0 border-2 border-teal-500 rounded-lg animate-ping"></div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Progress Section */}
          {(currentStep === 'uploading' || currentStep === 'analyzing' || currentStep === 'extracting' || currentStep === 'processing') && (
            <Card className="bg-white/50 border border-gray-200 rounded-xl">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                      <Zap className="w-4 h-4 text-teal-600 animate-pulse" />
                    </div>
                    <div className="flex-1">
                      <p className="text-lg font-semibold text-gray-900">{getStepMessage()}</p>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div 
                          className="bg-gradient-to-r from-teal-500 to-teal-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-gray-600">{Math.round(progress)}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          {/* Results Section */}
          {currentStep === 'results' && (
            <Card className="bg-white/50 border border-gray-200 rounded-xl">
              <CardHeader className="border-b border-gray-200 bg-green-50">
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span>Verification Complete</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">{clearProducts.length}</p>
                      <p className="text-sm text-gray-600">Products Verified</p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">{uploadedImages.length}</p>
                      <p className="text-sm text-gray-600">Images Processed</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <p className="text-2xl font-bold text-purple-600">100%</p>
                      <p className="text-sm text-gray-600">Success Rate</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold text-gray-900">Verified Products:</h4>
                    {clearProducts.map((product) => (
                      <div key={product.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="font-medium">{product.name}</span>
                        </div>
                        <span className="text-sm text-gray-600 font-mono">{product.serialNumber}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <Button onClick={handleFinalSubmit} className="bg-green-600 hover:bg-green-700 text-white">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Complete Verification
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Duplicates Section */}
          {currentStep === 'duplicates' && (
            <Card className="bg-white/50 border border-gray-200 rounded-xl">
              <CardHeader className="border-b border-gray-200 bg-orange-50">
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                  <span>Duplicate Serial Numbers Detected</span>
                </CardTitle>
                <p className="text-sm text-gray-600 mt-2">
                  {duplicateProducts.length} duplicate serial numbers found. Please add notes for each duplicate.
                </p>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* Clear Products Summary */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Verified Products ({clearProducts.length})</span>
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {clearProducts.map((product) => (
                        <div key={product.id} className="flex items-center justify-between p-2 bg-green-50 rounded text-sm">
                          <span>{product.name}</span>
                          <span className="font-mono text-gray-600">{product.serialNumber}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Duplicate Products */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                      <AlertTriangle className="w-4 h-4 text-orange-600" />
                      <span>Duplicate Products ({duplicateProducts.length}) - Notes Required</span>
                    </h4>
                    <div className="space-y-4">
                      {duplicateProducts.map((product) => (
                        <div key={product.id} className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <p className="font-medium text-gray-900">{product.name}</p>
                              <p className="text-sm text-gray-600 font-mono">{product.serialNumber}</p>
                            </div>
                            <div className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs font-medium">
                              DUPLICATE
                            </div>
                          </div>
                          <div>
                            <Label htmlFor={`note-${product.id}`} className="text-sm font-medium text-gray-700">
                              Add Note <span className="text-red-500">*</span>
                            </Label>
                            <Textarea
                              id={`note-${product.id}`}
                              placeholder="Explain why this duplicate exists (e.g., damaged package, return, etc.)"
                              value={duplicateNotes[product.id] || ''}
                              onChange={(e) => handleDuplicateNoteChange(product.id, e.target.value)}
                              className="mt-1 min-h-[80px]"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button
                      onClick={handleSubmitDuplicates}
                      disabled={!canSubmitDuplicates()}
                      className="bg-orange-600 hover:bg-orange-700 text-white disabled:opacity-50"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Submit with Notes
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Unclear Section */}
          {currentStep === 'unclear' && (
            <Card className="bg-white/50 border border-gray-200 rounded-xl">
              <CardHeader className="border-b border-gray-200 bg-yellow-50">
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                  <span>Unclear Serial Numbers</span>
                </CardTitle>
                <p className="text-sm text-gray-600 mt-2">
                  {clearProducts.length + duplicateProducts.length}/{scannedProducts.length} products scanned successfully.
                  {unclearProducts.length} products need clearer images.
                </p>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* Successfully Scanned */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Successfully Scanned ({clearProducts.length + duplicateProducts.length})</span>
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {[...clearProducts, ...duplicateProducts].map((product) => (
                        <div key={product.id} className="flex items-center justify-between p-2 bg-green-50 rounded text-sm">
                          <span>{product.name}</span>
                          <span className="font-mono text-gray-600">{product.serialNumber}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Unclear Products */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-600" />
                      <span>Unclear Products ({unclearProducts.length})</span>
                    </h4>
                    <div className="space-y-2">
                      {unclearProducts.map((product) => (
                        <div key={product.id} className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <AlertTriangle className="w-4 h-4 text-yellow-600" />
                            <span className="font-medium">{product.name}</span>
                          </div>
                          <div className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-medium">
                            UNCLEAR
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Tip:</strong> You can upload clearer images of these products later.
                      The successfully scanned products have been saved.
                    </p>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <Button onClick={handleRetakeUnclear} variant="outline">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Clearer Images
                    </Button>
                    <Button onClick={handleFinalSubmit} className="bg-blue-600 hover:bg-blue-700 text-white">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Continue with {clearProducts.length + duplicateProducts.length} Products
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageVerificationDialog;
