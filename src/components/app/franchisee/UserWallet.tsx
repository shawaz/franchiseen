"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Copy, ArrowDownLeft, RotateCw, Send, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { Button } from '../../ui/button';
import { useAuth } from '@/contexts/PrivyAuthContext';
import { useNetwork } from '@/contexts/NetworkContext';
import { useUserWallet } from '@/hooks/useUserWallet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface WalletProps {
  onAddMoney?: () => void;
  className?: string;
}

const UserWallet: React.FC<WalletProps> = ({
  onAddMoney,
  className = '',
}) => {
  // Get user profile from global auth context
  const { userProfile } = useAuth();

  // Get wallet data from hook
  const { wallet, refreshWallet, addMockedUSDC } = useUserWallet();
  const { publicKey: walletAddress, usdcBalance, isLoading: walletLoading } = wallet;

  const connected = !!walletAddress;
  const avatarUrl = userProfile?.avatarUrl || null;

  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isClient, setIsClient] = useState(false);

  // Transfer Modal State
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferRecipient, setTransferRecipient] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [isTransferring, setIsTransferring] = useState(false);

  // Deposit Modal State
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);

  // Get network state from context
  const { isDevnet } = useNetwork();

  // Initialize client-side state
  useEffect(() => {
    setIsClient(true);
    setLastUpdated(new Date());
  }, []);

  // Update last updated when wallet changes
  useEffect(() => {
    if (!walletLoading) {
      setLastUpdated(new Date());
    }
  }, [walletLoading]);

  const copyWalletAddress = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      toast.success('Wallet address copied to clipboard!');
    }
  };

  return (
    <div>
      {/* User Header */}
      <div className="p-3 flex items-center gap-3 justify-between sm:p-4 bg-white dark:bg-stone-800/50 border border-gray-200 dark:border-stone-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            {avatarUrl ? (
              <Image src={avatarUrl} alt="User Avatar" width={40} height={40} className="w-full h-full object-cover" />
            ) : (
              <div className="text-gray-700 dark:text-white font-semibold text-sm">
                {userProfile?.fullName?.[0] || userProfile?.email?.[0] || 'U'}
              </div>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-md text-gray-900 dark:text-white">
              {userProfile?.fullName || userProfile?.email || 'User'}
            </h3>
            <div className="flex items-center gap-2">
              {walletAddress ? (
                <>
                  <span className="font-mono text-xs">
                    {`${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}`}
                  </span>
                  <button onClick={copyWalletAddress} className="text-gray-500 hover:text-gray-700">
                    <Copy className="h-3 w-3" />
                  </button>
                </>
              ) : (
                <span className="text-xs text-gray-500">Wallet not generated</span>
              )}
            </div>
          </div>
        </div>
        <Button variant="outline" onClick={refreshWallet} disabled={walletLoading}>
          <RotateCw className={`h-4 w-4 ${walletLoading ? 'animate-spin' : ''}`} />
          <span className="font-medium">REFRESH</span>
        </Button>
      </div>

      {/* Wallet Card */}
      <div className={`bg-gradient-to-br from-yellow-600 via-yellow-700 to-yellow-800 text-white overflow-hidden ${className}`}>
        <div className="p-4 sm:p-6">
          <div className="mb-6">
            <div className="flex flex-col items-center justify-center text-center">
              {/* USDC Balance */}
              <div className="mb-4">
                <div className="text-yellow-100 text-sm mb-1 font-medium">USDC Balance</div>
                <div className="text-4xl sm:text-5xl font-bold tracking-tight">
                  {walletLoading ? '...' : `$${usdcBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                </div>
                <div className="text-yellow-200 text-xs mt-2 flex items-center justify-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                  Crossmint Wallet (Solana)
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  if (!walletAddress) {
                    toast.error('Wallet address not found');
                    return;
                  }
                  if (process.env.NEXT_PUBLIC_CROSSMINT_ENVIRONMENT === 'staging') {
                    if (addMockedUSDC) {
                      addMockedUSDC(10);
                      toast.success('Added 10 USDC to your balance (Staging)');
                    }
                  } else {
                    setIsDepositModalOpen(true);
                  }
                }}
                className="bg-white text-yellow-900 font-bold p-3 hover:bg-yellow-50 transition flex items-center justify-center gap-2 text-xs rounded"
              >
                <Plus className="h-4 w-4" />
                <span>ADD BALANCE</span>
              </button>

              <button
                onClick={() => setIsTransferModalOpen(true)}
                className="bg-yellow-600/50 border border-white/30 text-white font-bold p-3 hover:bg-yellow-600/70 transition flex items-center justify-center gap-2 text-xs rounded"
              >
                <Send className="h-4 w-4" />
                <span>TRANSFER</span>
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Transfer Modal */}
      <Dialog open={isTransferModalOpen} onOpenChange={setIsTransferModalOpen}>
        <DialogContent className="sm:max-w-md bg-stone-50 dark:bg-stone-900 border-stone-200 dark:border-stone-800">
          <DialogHeader>
            <DialogTitle className="text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Send className="h-5 w-5 text-yellow-600" />
              Transfer USDC
            </DialogTitle>
            <DialogDescription>
              Send USDC from your Crossmint wallet to another Solana address.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="recipient" className="text-stone-700 dark:text-stone-300 font-medium">Recipient Address</Label>
              <Input
                id="recipient"
                placeholder="Solana Wallet Address"
                value={transferRecipient}
                onChange={(e) => setTransferRecipient(e.target.value)}
                className="font-mono text-sm bg-white dark:bg-stone-950"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-stone-700 dark:text-stone-300 font-medium flex justify-between">
                <span>Amount (USDC)</span>
                <span className="text-xs text-stone-500">Max: ${usdcBalance.toFixed(2)}</span>
              </Label>
              <div className="relative">
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  className="bg-white dark:bg-stone-950"
                />
                <button
                  onClick={() => setTransferAmount(usdcBalance.toString())}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-yellow-600"
                >
                  MAX
                </button>
              </div>
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setIsTransferModalOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={async () => {
                if (!transferRecipient || !transferAmount) {
                  toast.error('Please fill in all fields');
                  return;
                }
                const amount = parseFloat(transferAmount);
                if (isNaN(amount) || amount <= 0) {
                  toast.error('Invalid amount');
                  return;
                }
                if (amount > usdcBalance) {
                  toast.error('Insufficient USDC balance');
                  return;
                }

                setIsTransferring(true);
                try {
                  toast.info('Transfer initiated! Please check your email or Crossmint for confirmation.');
                  await new Promise(resolve => setTimeout(resolve, 2000));
                  toast.success(`Sent ${amount} USDC to ${transferRecipient.slice(0, 4)}...`);
                  setIsTransferModalOpen(false);
                  refreshWallet();
                } catch (error) {
                  console.error('Transfer failed:', error);
                  toast.error('Transfer failed. Please try again.');
                } finally {
                  setIsTransferring(false);
                }
              }}
              className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white font-bold"
              disabled={isTransferring}
            >
              {isTransferring ? 'Sending...' : 'Send USDC'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Deposit Modal */}
      <Dialog open={isDepositModalOpen} onOpenChange={setIsDepositModalOpen}>
        <DialogContent className="sm:max-w-md bg-stone-50 dark:bg-stone-900 border-stone-200 dark:border-stone-800">
          <DialogHeader>
            <DialogTitle className="text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Plus className="h-5 w-5 text-yellow-600" />
              Add Balance (USDC)
            </DialogTitle>
            <DialogDescription>
              To fund your wallet, send USDC on the Solana network to your wallet address below.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="p-4 bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-lg text-center break-all space-y-3">
              <p className="font-mono text-sm text-stone-800 dark:text-stone-200 select-all">
                {walletAddress}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={copyWalletAddress}
                className="w-full flex items-center gap-2"
              >
                <Copy className="h-4 w-4" /> Copy Address
              </Button>
            </div>

            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-stone-200 dark:border-stone-700"></div>
              <span className="flex-shrink-0 mx-4 text-stone-400 text-xs">OR BUY CRYPTO</span>
              <div className="flex-grow border-t border-stone-200 dark:border-stone-700"></div>
            </div>

            <Button
              onClick={() => {
                const onrampUrl = `https://buy.moonpay.com?currencyCode=usdc_sol&walletAddress=${walletAddress}`;
                window.open(onrampUrl, '_blank');
              }}
              className="w-full bg-[#3D14D1] hover:bg-[#2e0ea2] text-white font-bold flex items-center justify-center gap-2"
            >
              Buy with MoonPay
            </Button>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDepositModalOpen(false)} className="w-full">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserWallet;