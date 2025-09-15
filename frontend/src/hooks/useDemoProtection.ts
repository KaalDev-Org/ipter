import { useEffect, useRef } from 'react';
import { demoLock } from '../utils/demoLock';

/**
 * Hook to add additional demo protection layers
 * Monitors for tampering attempts and enforces demo restrictions
 */
export const useDemoProtection = () => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastCheckRef = useRef<number>(Date.now());

  useEffect(() => {
    // Continuous monitoring for demo status
    const monitorDemo = () => {
      try {
        const now = Date.now();
        const timeSinceLastCheck = now - lastCheckRef.current;
        
        // Check if too much time has passed (potential time manipulation)
        if (timeSinceLastCheck > 70000) { // More than 70 seconds
          console.warn('Potential time manipulation detected');
        }
        
        lastCheckRef.current = now;
        
        // Check demo status
        const isAllowed = demoLock.isAccessAllowed();
        if (!isAllowed) {
          // Force reload to show lock screen
          window.location.reload();
        }
      } catch (error) {
        console.error('Demo protection check failed:', error);
        // Fail-safe: reload on any error
        window.location.reload();
      }
    };

    // Start monitoring
    intervalRef.current = setInterval(monitorDemo, 60000); // Check every minute

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    // Prevent common tampering attempts
    const preventTampering = () => {
      // Disable right-click context menu
      const handleContextMenu = (e: MouseEvent) => {
        e.preventDefault();
        return false;
      };

      // Disable common keyboard shortcuts
      const handleKeyDown = (e: KeyboardEvent) => {
        // Disable F12 (Developer Tools)
        if (e.key === 'F12') {
          e.preventDefault();
          return false;
        }
        
        // Disable Ctrl+Shift+I (Developer Tools)
        if (e.ctrlKey && e.shiftKey && e.key === 'I') {
          e.preventDefault();
          return false;
        }
        
        // Disable Ctrl+Shift+J (Console)
        if (e.ctrlKey && e.shiftKey && e.key === 'J') {
          e.preventDefault();
          return false;
        }
        
        // Disable Ctrl+U (View Source)
        if (e.ctrlKey && e.key === 'u') {
          e.preventDefault();
          return false;
        }
        
        // Disable Ctrl+Shift+C (Element Inspector)
        if (e.ctrlKey && e.shiftKey && e.key === 'C') {
          e.preventDefault();
          return false;
        }
      };

      // Add event listeners
      document.addEventListener('contextmenu', handleContextMenu);
      document.addEventListener('keydown', handleKeyDown);

      // Cleanup function
      return () => {
        document.removeEventListener('contextmenu', handleContextMenu);
        document.removeEventListener('keydown', handleKeyDown);
      };
    };

    const cleanup = preventTampering();
    return cleanup;
  }, []);

  useEffect(() => {
    // Monitor for developer tools
    let devToolsOpen = false;
    
    const detectDevTools = () => {
      const threshold = 160;
      
      if (window.outerHeight - window.innerHeight > threshold || 
          window.outerWidth - window.innerWidth > threshold) {
        if (!devToolsOpen) {
          devToolsOpen = true;
          console.warn('Developer tools detected - demo protection active');
          
          // Optional: Show warning or take action
          // For now, just log the detection
        }
      } else {
        devToolsOpen = false;
      }
    };

    const devToolsInterval = setInterval(detectDevTools, 1000);
    
    return () => clearInterval(devToolsInterval);
  }, []);

  useEffect(() => {
    // Add demo watermark to prevent screenshots/recordings
    const addWatermark = () => {
      const watermark = document.createElement('div');
      watermark.id = 'demo-watermark';
      watermark.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) rotate(-45deg);
        font-size: 48px;
        color: rgba(255, 0, 0, 0.1);
        font-weight: bold;
        pointer-events: none;
        z-index: 9999;
        user-select: none;
        font-family: Arial, sans-serif;
      `;
      watermark.textContent = '';
      
      document.body.appendChild(watermark);
      
      return () => {
        const existingWatermark = document.getElementById('demo-watermark');
        if (existingWatermark) {
          existingWatermark.remove();
        }
      };
    };

    const removeWatermark = addWatermark();
    return removeWatermark;
  }, []);

  useEffect(() => {
    // Override console methods to prevent tampering
    const originalConsole = { ...console };
    
    // Monitor console usage for demo-related tampering
    console.log = (...args) => {
      const message = args.join(' ').toLowerCase();
      if (message.includes('demo') || message.includes('lock') || message.includes('expir')) {
        originalConsole.warn('Demo tampering attempt detected via console');
      }
      originalConsole.log.apply(console, args);
    };

    console.warn = (...args) => {
      originalConsole.warn.apply(console, args);
    };

    console.error = (...args) => {
      originalConsole.error.apply(console, args);
    };

    // Cleanup
    return () => {
      Object.assign(console, originalConsole);
    };
  }, []);

  // Return demo status for components that need it
  const getDemoStatus = () => {
    try {
      return demoLock.getDemoStatus();
    } catch (error) {
      console.error('Failed to get demo status:', error);
      return null;
    }
  };

  const isAccessAllowed = () => {
    try {
      return demoLock.isAccessAllowed();
    } catch (error) {
      console.error('Failed to check demo access:', error);
      return false;
    }
  };

  return {
    getDemoStatus,
    isAccessAllowed
  };
};
