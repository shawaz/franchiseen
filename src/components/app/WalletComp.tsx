// components/app/WalletComp.tsx
"use client";

import React from 'react';
import Image from 'next/image';
import { toast } from 'sonner';

interface WalletCompProps {
  onAddMoney?: () => void;
  className?: string;
  business?: {
    name?: string;
    logoUrl?: string;
  };
}

// Demo data
const DEMO_BALANCE = 12.75;
const DEMO_WALLET = 'HjZ5j...8Xy9z';
const DEMO_RATE = 150.50; // SOL to AED rate

export function WalletComp({
  onAddMoney,
  className = '',
  business = {
    name: 'Shawaz Sharif',
    logoUrl: '/avatar/avatar-m-5.png'
  },
}: WalletCompProps) {
  const [balance] = React.useState<number>(DEMO_BALANCE);
  const [loading] = React.useState<boolean>(false);
  
  const formatSol = (value: number) => {
    return value.toFixed(2) + ' SOL';
  };

  const formatAmount = (sol: number) => {
    return `${(sol * DEMO_RATE).toFixed(2)} AED`;
  };

  const handleAction = (action: string) => {
    switch (action) {
      case 'deposit':
        toast.info('Redirecting to Solana faucet...');
        // Handle deposit action
        break;
      case 'withdraw':
        toast.info('Withdraw functionality is disabled in demo.');
        // Handle withdraw action
        break;
      case 'transfer':
        if (onAddMoney) onAddMoney();
        // Handle transfer action
        break;
    }
  };

  return (
    <div className={className}>
      {/* Brand Header */}
      <div className="p-3 sm:p-4 bg-white dark:bg-stone-800/50 border border-gray-200 dark:border-stone-700">
        <div className="flex items-center gap-3">
          {/* Brand Logo */}
          <div className="w-10 h-10 rounded overflow-hidden bg-white/20 flex items-center justify-center">
            {business?.logoUrl ? (
              <Image
                src={business.logoUrl}
                alt="Brand Logo"
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-gray-700 dark:text-white font-semibold text-sm">
                {business?.name?.charAt(0) || 'B'}
              </div>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-md text-gray-900 dark:text-white">
              {business?.name || 'Demo Brand'}
            </h3>
            <div className="flex items-center gap-2">
              <p className="text-sm font-mono text-gray-600 dark:text-gray-300">
                {DEMO_WALLET}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Wallet Card */}
      <div className="bg-gradient-to-br from-yellow-600 via-yellow-700 to-yellow-800 text-white overflow-hidden">
        <div className="p-4 sm:p-6">
          {/* Balance Display */}
          <div className="mb-6">
            <div className="grid grid-cols-2 gap-4">
              {/* AED Balance */}
              <div>
                <div className="text-yellow-100 text-xs mb-1">
                  AED Balance
                </div>
                <div className="text-2xl sm:text-3xl font-bold">
                  {loading ? '...' : formatAmount(balance)}
                </div>
                <div className="text-yellow-200 text-xs mt-1">
                  {DEMO_RATE.toFixed(2)} AED/SOL
                </div>
              </div>
              {/* SOL Balance */}
              <div className="text-right">
                <div className="text-yellow-100 text-xs mb-1">SOL Balance</div>
                <div className="text-2xl sm:text-3xl font-bold">
                  {loading ? '...' : formatSol(balance)}
                </div>
                <div className="text-yellow-200 text-xs mt-1">
                  Updated: {new Date().toLocaleTimeString()}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => handleAction('deposit')}
              className="bg-white/20 border border-white/30 p-2 hover:bg-white/30 transition flex items-center justify-center gap-4"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              <span className="text-xs font-medium">DEPOSIT</span>
            </button>

            <button
              onClick={() => handleAction('transfer')}
              className="bg-white/20 border border-white/30 p-2 hover:bg-white/30 transition flex items-center justify-center gap-4"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <polyline points="19 12 12 19 5 12"></polyline>
              </svg>
              <span className="text-xs font-medium">TRANSFER</span>
            </button>

            <button
              onClick={() => handleAction('withdraw')}
              className="bg-white/20 border border-white/30 p-2 hover:bg-white/30 transition flex items-center justify-center gap-4"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                <line x1="1" y1="10" x2="23" y2="10"></line>
              </svg>
              <span className="text-xs font-medium">WITHDRAW</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}