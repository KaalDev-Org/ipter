import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { FileSearch } from 'lucide-react';

const ViewAuditTrail: React.FC = () => {
  return (
    <div className="min-h-screen bg-z-ivory">
      {/* Header Section */}
      <div className="bg-z-pale-green shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg bg-white/80">
              <FileSearch className="w-6 h-6 text-gray-700" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 font-georgia">View Audit Trail</h1>
              <p className="text-gray-600 font-verdana">Monitor system activities and user actions</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Card className="bg-z-light-green shadow-lg border border-gray-200 rounded-xl overflow-hidden">
          <CardHeader className="border-b border-gray-200 p-6 bg-z-pale-green">
            <CardTitle className="text-2xl font-bold text-gray-900 flex items-center space-x-3" style={{ fontFamily: 'Georgia, serif' }}>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-white/80">
                <FileSearch className="w-5 h-5 text-gray-700" />
              </div>
              <span>Audit Trail</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-12 text-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center bg-white/80">
                <FileSearch className="w-8 h-8 text-gray-700" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2" style={{ fontFamily: 'Georgia, serif' }}>
                  Audit Trail Coming Soon
                </h3>
                <p className="text-gray-600" style={{ fontFamily: 'Verdana, sans-serif' }}>
                  This feature will allow you to view detailed audit logs of all system activities
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ViewAuditTrail;
