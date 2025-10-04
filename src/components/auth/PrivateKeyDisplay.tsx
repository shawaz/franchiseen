"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy, Eye, EyeOff, Download, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface PrivateKeyDisplayProps {
  privateKey: Uint8Array;
  walletAddress: string;
  onContinue: () => void;
}

export function PrivateKeyDisplay({ privateKey, walletAddress, onContinue }: PrivateKeyDisplayProps) {
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [hasConfirmedBackup, setHasConfirmedBackup] = useState(false);
  const [hasConfirmedSecurity, setHasConfirmedSecurity] = useState(false);

  // Convert private key to base58 string for display
  const privateKeyString = privateKey.toString();

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied to clipboard`);
    } catch {
      toast.error(`Failed to copy ${label}`);
    }
  };

  const downloadPrivateKey = () => {
    const element = document.createElement('a');
    const file = new Blob([`Wallet Address: ${walletAddress}\nPrivate Key: ${privateKeyString}\n\nIMPORTANT: Keep this file secure and never share it with anyone!`], 
      { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `franchiseen-wallet-backup-${Date.now()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success('Private key backup downloaded');
  };

  const canContinue = hasConfirmedBackup && hasConfirmedSecurity;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Your Wallet Has Been Created
          </CardTitle>
          <CardDescription>
            Please securely backup your private key before continuing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Wallet Address */}
          <div className="space-y-2">
            <Label htmlFor="wallet-address">Wallet Address</Label>
            <div className="flex gap-2">
              <Input
                id="wallet-address"
                value={walletAddress}
                readOnly
                className="font-mono text-sm"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard(walletAddress, 'Wallet address')}
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

          {/* Download Button */}
          <Button
            variant="outline"
            onClick={downloadPrivateKey}
            className="w-full"
          >
            <Download className="h-4 w-4 mr-2" />
            Download Backup File
          </Button>

          {/* Security Warnings */}
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>CRITICAL SECURITY WARNING:</strong>
              <ul className="mt-2 space-y-1 text-sm">
                <li>• Never share your private key with anyone</li>
                <li>• Anyone with your private key can access your wallet</li>
                <li>• Store your private key in a secure location offline</li>
                <li>• Consider using a hardware wallet for additional security</li>
              </ul>
            </AlertDescription>
          </Alert>

          {/* Confirmation Checkboxes */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="backup-confirmed"
                checked={hasConfirmedBackup}
                onChange={(e) => setHasConfirmedBackup(e.target.checked)}
                className="rounded border-gray-300"
              />
              <Label htmlFor="backup-confirmed" className="text-sm">
                I have securely backed up my private key and understand that losing it means losing access to my wallet forever
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="security-confirmed"
                checked={hasConfirmedSecurity}
                onChange={(e) => setHasConfirmedSecurity(e.target.checked)}
                className="rounded border-gray-300"
              />
              <Label htmlFor="security-confirmed" className="text-sm">
                I understand the security risks and will never share my private key with anyone
              </Label>
            </div>
          </div>

          {/* Continue Button */}
          <Button
            onClick={onContinue}
            disabled={!canContinue}
            className="w-full"
          >
            Continue to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
