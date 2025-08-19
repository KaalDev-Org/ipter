import React, { useState } from 'react';
import { Button } from './ui/button';
import { checkBackendStatus, checkProxyStatus } from '../utils/backendChecker';

const ApiTest: React.FC = () => {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    setResult('Testing connection...\n');

    try {
      // First check if backend is running directly
      const backendStatus = await checkBackendStatus();
      let resultText = `Backend Direct: ${backendStatus.isRunning ? '✅' : '❌'} ${backendStatus.message}\n`;

      // Then check if proxy is working
      const proxyStatus = await checkProxyStatus();
      resultText += `Proxy: ${proxyStatus.isWorking ? '✅' : '❌'} ${proxyStatus.message}\n`;

      if (backendStatus.isRunning && proxyStatus.isWorking) {
        resultText += `\n🎉 Everything is working! You can now login.`;
      } else if (!backendStatus.isRunning) {
        resultText += `\n🚨 Please start the backend server:\n1. Navigate to the backend folder\n2. Run: mvn spring-boot:run\n3. Wait for "Started IpterApplication"`;
      } else if (!proxyStatus.isWorking) {
        resultText += `\n🚨 Proxy issue detected. Try restarting the frontend server.`;
      }

      setResult(resultText);
    } catch (error: any) {
      setResult(`❌ Unexpected error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="">
    </div>
  );
};

export default ApiTest;
