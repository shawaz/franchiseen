"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getStoredWallet, getWalletBalance } from '@/lib/solanaWalletUtils';

export default function WalletDebugger() {
  const [franchiseId, setFranchiseId] = useState('');
  const [debugInfo, setDebugInfo] = useState<{
    franchiseId?: string;
    paddedId?: string;
    storedWallet?: { publicKey: string; secretKey?: Uint8Array } | null;
    paddedWallet?: { publicKey: string; secretKey?: Uint8Array } | null;
    actualWallet?: { publicKey: string; secretKey?: Uint8Array } | null;
    balance?: number;
    allFranchiseKeys?: string[];
    localStorageKeys?: string[];
    error?: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const debugWallet = async () => {
    if (!franchiseId) return;
    
    setLoading(true);
    try {
      // Check localStorage for stored wallets
      const allKeys = Object.keys(localStorage);
      const franchiseKeys = allKeys.filter(key => key.startsWith('franchise_wallet_'));
      
      console.log('All franchise wallet keys:', franchiseKeys);
      
      // Get specific wallet
      const storedWallet = getStoredWallet(franchiseId);
      console.log('Stored wallet for', franchiseId, ':', storedWallet);
      
      // Also try the zero-padded version
      const paddedId = franchiseId.replace(/(\d+)$/, (match) => match.padStart(2, '0'));
      const paddedWallet = getStoredWallet(paddedId);
      console.log('Stored wallet for', paddedId, ':', paddedWallet);
      
      let balance = 0;
      let actualWallet = storedWallet;
      
      if (storedWallet) {
        balance = await getWalletBalance(storedWallet.publicKey);
        actualWallet = storedWallet;
      } else if (paddedWallet) {
        balance = await getWalletBalance(paddedWallet.publicKey);
        actualWallet = paddedWallet;
      }
      
      setDebugInfo({
        franchiseId,
        paddedId,
        storedWallet,
        paddedWallet,
        actualWallet,
        balance,
        allFranchiseKeys: franchiseKeys,
        localStorageKeys: allKeys.filter(key => key.includes('franchise'))
      });
      
    } catch (error) {
      console.error('Debug error:', error);
      setDebugInfo({ error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setLoading(false);
    }
  };

  const clearAllWallets = () => {
    const allKeys = Object.keys(localStorage);
    const franchiseKeys = allKeys.filter(key => key.startsWith('franchise_wallet_'));
    franchiseKeys.forEach(key => localStorage.removeItem(key));
    setDebugInfo(null);
    alert('All franchise wallets cleared from localStorage');
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Wallet Debugger</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Enter franchise ID (e.g., nike-5)"
            value={franchiseId}
            onChange={(e) => setFranchiseId(e.target.value)}
          />
          <Button onClick={debugWallet} disabled={loading || !franchiseId}>
            {loading ? 'Debugging...' : 'Debug Wallet'}
          </Button>
        </div>
        
        <Button 
          onClick={clearAllWallets} 
          variant="outline" 
          className="w-full"
        >
          Clear All Wallets from localStorage
        </Button>
        
        {debugInfo && (
          <div className="mt-4 p-4 bg-stone-50 dark:bg-stone-800 rounded-lg">
            <h3 className="font-semibold mb-2">Debug Results:</h3>
            <pre className="text-xs overflow-auto">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
        )}
        
        <div className="text-sm text-stone-600 dark:text-stone-400">
          <p><strong>Instructions:</strong></p>
          <ol className="list-decimal list-inside space-y-1 mt-2">
            <li>Enter the franchise ID (e.g., &quot;nike-5&quot;)</li>
            <li>Click &quot;Debug Wallet&quot; to check if the wallet exists</li>
            <li>Check the console for detailed logs</li>
            <li>If no wallet is found, the franchise creation might have failed</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}
