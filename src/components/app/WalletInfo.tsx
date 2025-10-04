"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { useUserWallet } from '@/hooks/useUserWallet';
import { Id } from '../../../convex/_generated/dataModel';

interface WalletInfoProps {
  userId?: string;
}

export function WalletInfo({ userId }: WalletInfoProps) {
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const { wallet, isWalletLoaded } = useUserWallet({ userId: userId as Id<"users"> });

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

  const privateKeyString = Array.from(wallet.privateKey).join(',');

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Wallet</CardTitle>
        <CardDescription>
          Your Solana wallet address and private key
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

        {/* Private Key */}
        <div className="space-y-2">
          <Label htmlFor="private-key">Private Key</Label>
          <div className="flex gap-2">
            <Input
              id="private-key"
              type={showPrivateKey ? "text" : "password"}
              value={privateKeyString}
              readOnly
              className="font-mono text-sm"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowPrivateKey(!showPrivateKey)}
            >
              {showPrivateKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => copyToClipboard(privateKeyString, 'Private key')}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Security Warning */}
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Security Warning:</strong> Keep your private key secure and never share it with anyone. 
            Anyone with your private key can access your wallet.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
