"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { CreditCard, Wallet as WalletIcon, ArrowUpDown, PlusCircle, Copy } from 'lucide-react';
import { toast } from 'sonner';

interface WalletProps {
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
const DEMO_RATE = 150.50; // SOL to USD rate

const Wallet: React.FC<WalletProps> = ({
  onAddMoney,
  className = '',
  business = {
    name: 'Citymilana',
    logoUrl: '/logo/logo-2.svg'
  },
}) => {
  const [balance] = useState<number>(DEMO_BALANCE);
  const [loading] = useState<boolean>(false);
  const [selectedCurrency] = useState<string>('aed');
  
  const formatSol = (value: number) => {
    return value.toFixed(2) + ' SOL';
  };

  const formatAmount = (sol: number) => {
    return `${(sol * DEMO_RATE).toFixed(2)} AED`;
  };

  const copyWalletAddress = () => {
    navigator.clipboard.writeText(DEMO_WALLET);
    toast.success('Wallet address copied to clipboard!');
  };

  const handleSendSOL = () => {
    toast.info('This is a demo. Send SOL functionality is disabled.');
  };

  const handleRefresh = () => {
    toast.success('Balance refreshed!');
  };

  return (
    <div>
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
              <button
                onClick={copyWalletAddress}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <Copy className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Wallet Card */}
      <div className={`bg-gradient-to-br from-yellow-600 via-yellow-700 to-yellow-800 text-white overflow-hidden ${className}`}>
        <div className="p-4 sm:p-6">
          {/* Balance Display */}
          <div>
            <div className="grid grid-cols-2 gap-4">
              {/* AED Balance */}
              <div >
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
          {/* <div className="grid grid-cols-3 gap-3">
            <button
              onClick={handleRefresh}
              className="bg-white/20 border border-white/30 p-2 hover:bg-white/30 transition flex items-center justify-center gap-4 "
            >
              <ArrowUpDown className="h-4 w-4" />
              <span className="text-xs font-medium">DEPOSIT</span>
            </button>

            <button
              onClick={onAddMoney}
              className="bg-white/20 border border-white/30 p-2 hover:bg-white/30 transition flex  items-center justify-center gap-4 "
            >
              <PlusCircle className="h-4 w-4" />
              <span className="text-xs font-medium">TRANSFER</span>
            </button>

            <button
              onClick={handleSendSOL}
              className="bg-white/20 border border-white/30 p-2 hover:bg-white/30 transition flex  items-center justify-center gap-4 "
            >
              <CreditCard className="h-4 w-4" />
              <span className="text-xs font-medium">WITHDRAW</span>
            </button>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default Wallet;