"use client";

import React from 'react';
import { useNetwork } from '@/contexts/NetworkContext';
import { Switch } from '@/components/ui/switch';

export function NetworkToggle() {
  const { switchNetwork, isDevnet, isMainnet, isLoading } = useNetwork();
  
  // Don't show during loading
  if (isLoading) return null;
  
  // Check if we're on devnet subdomain (locked mode)
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  const isDevnetDomain = hostname.startsWith('devnet.');
  const allowToggle = !isDevnetDomain && 
                      (process.env.NEXT_PUBLIC_ALLOW_NETWORK_TOGGLE === 'true' || 
                       process.env.NODE_ENV === 'development');
  
  const handleToggle = (checked: boolean) => {
    switchNetwork(checked ? 'devnet' : 'mainnet');
  };
  
  return (
    <div className="border-t border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
      <div className="p-3 flex justify-center">
        
        {/* Toggle Control */}
        <div className="flex items-center justify-between w-full max-w-md mx-auto">
          <div className="flex items-center gap-3">
            <span className={`text-sm font-medium transition-colors ${
              isMainnet ? 'text-green-600 dark:text-green-400' : 'text-gray-400'
            }`}>
              {/* {isMainnet && <CheckCircle className="h-4 w-4 inline mr-1" />} */}
              Money
            </span>
            
            <Switch
              checked={isDevnet}
              onCheckedChange={handleToggle}
              disabled={!allowToggle}
              className={isDevnet ? 'bg-yellow-500' : 'bg-green-500'}
            />
            
            <span className={`text-sm font-medium transition-colors ${
              isDevnet ? 'text-yellow-600 dark:text-yellow-400' : 'text-gray-400'
            }`}>
              {/* {isDevnet && <AlertTriangle className="h-4 w-4 inline mr-1" />} */}
              Paper
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

