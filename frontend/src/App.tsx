import { BrowserRouter as Router } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './components/ui/toast';
import AppRouter from './components/AppRouter';
import { AuditLogger } from './utils/auditLogger';
import { demoLock } from './utils/demoLock';
import DemoLockScreen from './components/DemoLockScreen';

function App() {
  const [isDemoExpired, setIsDemoExpired] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize audit logger machine info on app start
    AuditLogger.initializeMachineInfo().catch(console.warn);

    // Check demo status
    const checkDemoStatus = () => {
      try {
        const isExpired = !demoLock.isAccessAllowed();
        setIsDemoExpired(isExpired);
      } catch (error) {
        console.error('Demo lock check failed:', error);
        // Fail-safe: consider demo expired on any error
        setIsDemoExpired(true);
      } finally {
        setIsLoading(false);
      }
    };

    checkDemoStatus();

    // Check demo status every minute
    const interval = setInterval(checkDemoStatus, 60000);

    return () => clearInterval(interval);
  }, []);

  // Show loading screen while checking demo status
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading IPTER...</p>
        </div>
      </div>
    );
  }

  // Show demo lock screen if expired
  if (isDemoExpired) {
    return <DemoLockScreen />;
  }

  // Normal application flow
  return (
    <ToastProvider>
      <AuthProvider>
        <Router>
          <AppRouter />
        </Router>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
