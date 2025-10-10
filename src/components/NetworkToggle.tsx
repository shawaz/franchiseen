"use client";

import React from 'react';
import { useNetwork } from '@/contexts/NetworkContext';
import { Switch } from '@/components/ui/switch';
import { Globe, AlertTriangle, CheckCircle } from 'lucide-react';

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
      <div className="p-3">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Solana Network
            </span>
          </div>
          {!allowToggle && (
            <div className="text-xs text-gray-500 flex items-center gap-1">
              🔒 Locked
            </div>
          )}
        </div>
        
        {/* Toggle Control */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className={`text-sm font-medium transition-colors ${
              isMainnet ? 'text-green-600 dark:text-green-400' : 'text-gray-400'
            }`}>
              {isMainnet && <CheckCircle className="h-4 w-4 inline mr-1" />}
              Mainnet
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
              {isDevnet && <AlertTriangle className="h-4 w-4 inline mr-1" />}
              Devnet
            </span>
          </div>
        </div>
        
        {/* Network Info */}
        <div className={`mt-3 p-2 rounded text-xs ${
          isDevnet 
            ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800' 
            : 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800'
        }`}>
          {isDevnet ? (
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold">Paper Money Mode</div>
                <div className="mt-1">Using test SOL with no real value. Safe to experiment!</div>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold">Real Money Mode</div>
                <div className="mt-1">Real SOL and real money. All transactions are permanent.</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

