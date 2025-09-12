import { BrowserRouter as Router } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './components/ui/toast';
import AppRouter from './components/AppRouter';
import { AuditLogger } from './utils/auditLogger';

function App() {
  useEffect(() => {
    // Initialize audit logger machine info on app start
    AuditLogger.initializeMachineInfo().catch(console.warn);
  }, []);

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
