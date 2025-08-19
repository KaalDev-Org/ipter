/**
 * Utility to check if the backend server is running
 */
export const checkBackendStatus = async (): Promise<{
  isRunning: boolean;
  message: string;
  details?: any;
}> => {
  try {
    // Try to reach the backend directly (bypassing proxy)
    const response = await fetch('http://localhost:8080/api/auth/session-info', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      mode: 'cors',
    });

    if (response.ok) {
      const data = await response.json();
      return {
        isRunning: true,
        message: 'Backend is running correctly',
        details: data,
      };
    } else {
      return {
        isRunning: false,
        message: `Backend responded with error: ${response.status} ${response.statusText}`,
      };
    }
  } catch (error: any) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return {
        isRunning: false,
        message: 'Backend server is not running on port 8080',
      };
    }
    
    return {
      isRunning: false,
      message: `Error connecting to backend: ${error.message}`,
    };
  }
};

/**
 * Check if the proxy is working correctly
 */
export const checkProxyStatus = async (): Promise<{
  isWorking: boolean;
  message: string;
  details?: any;
}> => {
  try {
    // Try to reach the backend through the configured API URL
    const response = await fetch('http://localhost:8080/api/auth/session-info', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      return {
        isWorking: true,
        message: 'Proxy is working correctly',
        details: data,
      };
    } else {
      return {
        isWorking: false,
        message: `Proxy error: ${response.status} ${response.statusText}`,
      };
    }
  } catch (error: any) {
    return {
      isWorking: false,
      message: `Proxy error: ${error.message}`,
    };
  }
};
