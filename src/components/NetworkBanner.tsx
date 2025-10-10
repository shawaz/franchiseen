"use client";

import React from 'react';
import { useNetwork } from '@/contexts/NetworkContext';
import { AlertTriangle, Info, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export function NetworkBanner() {
  const { isDevnet, isLoading } = useNetwork();
  
  if (isLoading) return null;
  
  // Check if we're on devnet subdomain
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  const isDevnetDomain = hostname.startsWith('devnet.');
  
  // Show prominent banner on devnet subdomain
  if (isDevnetDomain) {
    return (
      <div className="bg-yellow-500 text-yellow-900 px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 flex-shrink-0" />
          <div>
            <div className="font-bold">DEVNET ENVIRONMENT - TEST NETWORK ONLY</div>
            <div className="text-sm">All balances and transactions use test SOL with no real value</div>
          </div>
        </div>
        <Link 
          href="https://franchiseen.com" 
          className="text-yellow-900 hover:text-yellow-800 flex items-center gap-1 font-semibold whitespace-nowrap"
        >
          Go to Production
          <ExternalLink className="h-4 w-4" />
        </Link>
      </div>
    );
  }
  
  // Show info banner when user toggles to devnet on main site
  if (isDevnet && !isDevnetDomain) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800 px-4 py-2">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-yellow-700 dark:text-yellow-400 flex-shrink-0" />
            <span className="text-sm text-yellow-700 dark:text-yellow-400">
              <strong>Test Mode:</strong> You&apos;re viewing Devnet. Switch to Mainnet in account menu for real transactions.
            </span>
          </div>
        </div>
      </div>
    );
  }
  
  return null;
}

