"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type NetworkType = 'mainnet' | 'devnet';

interface NetworkContextType {
  network: NetworkType;
  switchNetwork: (network: NetworkType) => void;
  isDevnet: boolean;
  isMainnet: boolean;
  isLoading: boolean;
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

interface NetworkProviderProps {
  children: ReactNode;
}

export function NetworkProvider({ children }: NetworkProviderProps) {
  const [network, setNetwork] = useState<NetworkType>('mainnet');
  const [isLoading, setIsLoading] = useState(true);

  // Load network preference from localStorage on mount
  useEffect(() => {
    // Check if we're on devnet subdomain
    const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
    const isDevnetDomain = hostname.startsWith('devnet.');
    
    if (isDevnetDomain) {
      // Force devnet on devnet subdomain
      setNetwork('devnet');
      setIsLoading(false);
      return;
    }
    
    // Load from localStorage on main domain
    const saved = localStorage.getItem('preferred_network') as NetworkType;
    const envNetwork = process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'mainnet-beta';
    const defaultNetwork: NetworkType = envNetwork === 'devnet' ? 'devnet' : 'mainnet';
    
    setNetwork(saved || defaultNetwork);
    setIsLoading(false);
  }, []);

  const switchNetwork = (newNetwork: NetworkType) => {
    // Confirmation for switching to mainnet
    if (newNetwork === 'mainnet' && network === 'devnet') {
      const confirmed = window.confirm(
        '⚠️ Switch to MAINNET?\n\n' +
        'You will use REAL SOL and REAL MONEY.\n' +
        'Transactions cannot be reversed.\n\n' +
        'Are you sure?'
      );
      if (!confirmed) return;
    }
    
    // Save preference
    localStorage.setItem('preferred_network', newNetwork);
    setNetwork(newNetwork);
    
    // Reload to apply changes
    window.location.reload();
  };

  return (
    <NetworkContext.Provider
      value={{
        network,
        switchNetwork,
        isDevnet: network === 'devnet',
        isMainnet: network === 'mainnet',
        isLoading,
      }}
    >
      {children}
    </NetworkContext.Provider>
  );
}

export const useNetwork = () => {
  const context = useContext(NetworkContext);
  if (!context) {
    throw new Error('useNetwork must be used within NetworkProvider');
  }
  return context;
};

