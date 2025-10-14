"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy } from 'lucide-react';
import { toast } from 'sonner';
import { useUserWallet } from '@/hooks/useUserWallet';

export function WalletInfo() {
  const { wallet } = useUserWallet();
  const isWalletLoaded = !wallet.isLoading;

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied to clipboard`);
    } catch {
      toast.error(`Failed to copy ${label}`);
    }
  };

  if (!isWalletLoaded) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Wallet Information</CardTitle>
          <CardDescription>Loading your wallet...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!wallet.publicKey) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Wallet</CardTitle>
          <CardDescription>
            No wallet connected
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="border-blue-200 bg-blue-50">
            <AlertDescription className="text-blue-800">
              Please connect your wallet using Privy to access wallet features.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Wallet</CardTitle>
        <CardDescription>
          Your Solana wallet is managed securely by Privy
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Wallet Address */}
        <div className="space-y-2">
          <Label htmlFor="wallet-address">Wallet Address</Label>
          <div className="flex gap-2">
            <Input
              id="wallet-address"
              value={wallet.publicKey}
              readOnly
              className="font-mono text-sm"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => copyToClipboard(wallet.publicKey, 'Wallet address')}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Balance */}
        <div className="space-y-2">
          <Label>Balance</Label>
          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <span className="text-2xl font-bold">{wallet.balance.toFixed(4)} SOL</span>
          </div>
        </div>

        {/* Security Info */}
        <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
          <AlertDescription className="text-blue-800 dark:text-blue-200">
            <strong>Secure Wallet:</strong> Your private keys are securely managed by Privy. 
            You can export your wallet from your Privy account settings if needed.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
