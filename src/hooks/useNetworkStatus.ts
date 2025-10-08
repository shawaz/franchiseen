'use client';

import { useState, useEffect } from 'react';

interface NetworkStatus {
  isOnline: boolean;
  isConnecting: boolean;
  lastOnlineTime: Date | null;
  lastOfflineTime: Date | null;
}

export function useNetworkStatus(): NetworkStatus {
  const [isOnline, setIsOnline] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [lastOnlineTime, setLastOnlineTime] = useState<Date | null>(null);
  const [lastOfflineTime, setLastOfflineTime] = useState<Date | null>(null);

  useEffect(() => {
    // Check initial online status
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      setLastOnlineTime(new Date());
      setIsConnecting(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setLastOfflineTime(new Date());
    };

    // Listen for online/offline events
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Test connectivity by making a request to a reliable endpoint
    const testConnectivity = async () => {
      if (!navigator.onLine) return;
      
      setIsConnecting(true);
      try {
        // Try to fetch from a reliable endpoint
        const response = await fetch('/api/health', { 
          method: 'HEAD',
          cache: 'no-cache',
          signal: AbortSignal.timeout(5000) // 5 second timeout
        });
        
        if (response.ok) {
          setIsOnline(true);
          setLastOnlineTime(new Date());
        } else {
          setIsOnline(false);
          setLastOfflineTime(new Date());
        }
      } catch {
        setIsOnline(false);
        setLastOfflineTime(new Date());
      } finally {
        setIsConnecting(false);
      }
    };

    // Test connectivity periodically
    const interval = setInterval(testConnectivity, 30000); // Test every 30 seconds

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  return {
    isOnline,
    isConnecting,
    lastOnlineTime,
    lastOfflineTime,
  };
}

// Hook for detecting Convex/Denet connectivity issues
export function useConvexConnectivity() {
  const [isConnected, setIsConnected] = useState(true);
  const [lastError, setLastError] = useState<string | null>(null);

  useEffect(() => {
    // This would integrate with Convex client to detect connection issues
    // For now, we'll simulate it with a simple check
    
    const checkConvexConnection = () => {
      // In a real implementation, you would check the Convex client status
      // For now, we'll use a simple fetch to test connectivity
      fetch('/api/convex-health')
        .then(response => {
          if (response.ok) {
            setIsConnected(true);
            setLastError(null);
          } else {
            setIsConnected(false);
            setLastError('Convex service unavailable');
          }
        })
        .catch(error => {
          setIsConnected(false);
          setLastError(error.message);
        });
    };

    // Check initially
    checkConvexConnection();

    // Check periodically
    const interval = setInterval(checkConvexConnection, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  return {
    isConnected,
    lastError,
  };
}
