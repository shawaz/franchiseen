"use client";

import React, { useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../../../../../convex/_generated/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Wallet, AlertCircle, CheckCircle, Wrench } from 'lucide-react';

export default function FixWalletsPage() {
  const [franchiseSlug, setFranchiseSlug] = useState('');
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message?: string;
    franchiseWallet?: string;
    franchiseFeeTransferred?: number;
    setupCostTransferred?: number;
    workingCapitalTransferred?: number;
    totalTransferred?: number;
    error?: string;
    walletId?: string;
    currentBalance?: number;
  } | null>(null);

  // Get all franchises to show which ones need fixing
  const allFranchises = useQuery(api.franchiseManagement.getAllFranchisesDebug, {});
  
  const fixWallet = useMutation(api.franchiseManagement.fixFranchiseWithoutWallet);

  const handleFix = async () => {
    if (!franchiseSlug) {
      toast.error('Please enter a franchise slug');
      return;
    }

    setProcessing(true);
    setResult(null);

    try {
      const response = await fixWallet({ franchiseSlug });
      setResult(response);
      
      if (response.success) {
        toast.success(response.message || 'Wallet created successfully!');
      } else {
        toast.info(response.message || 'Wallet already exists');
      }
    } catch (error) {
      console.error('Error fixing wallet:', error);
      toast.error(`Failed to create wallet: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setResult({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setProcessing(false);
    }
  };

  type FranchiseDebugInfo = {
    _id: string;
    franchiseSlug: string;
    status: string;
    stage: string;
    hasWallet: boolean;
    walletAddress?: string;
    franchiserName?: string;
    createdAt: number;
  };

  const franchisesWithoutWallets = allFranchises?.filter((f: FranchiseDebugInfo) => 
    f.stage === 'launching' && !f.hasWallet
  ) || [];

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Fix Franchise Wallets</h1>
        <p className="text-stone-600 dark:text-stone-400 mt-2">
          Manually create wallets for franchises that are stuck in launching stage without a wallet
        </p>
      </div>

      {/* Franchises Without Wallets */}
      {franchisesWithoutWallets.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              Franchises Without Wallets ({franchisesWithoutWallets.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {franchisesWithoutWallets.map((franchise: FranchiseDebugInfo) => (
                <div key={franchise._id} className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <div>
                    <p className="font-medium">{franchise.franchiseSlug}</p>
                    <p className="text-sm text-stone-600 dark:text-stone-400">
                      Stage: {franchise.stage} • Status: {franchise.status}
                    </p>
                    <p className="text-xs text-stone-500">
                      Franchiser: {franchise.franchiserName}
                    </p>
                  </div>
                  <Button
                    onClick={() => {
                      setFranchiseSlug(franchise.franchiseSlug);
                      setTimeout(() => handleFix(), 100);
                    }}
                    size="sm"
                    className="bg-yellow-600 hover:bg-yellow-700"
                  >
                    <Wrench className="h-4 w-4 mr-2" />
                    Fix Now
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Manual Fix Form */}
      <Card>
        <CardHeader>
          <CardTitle>Manual Wallet Creation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="franchiseSlug">Franchise Slug</Label>
            <Input
              id="franchiseSlug"
              value={franchiseSlug}
              onChange={(e) => setFranchiseSlug(e.target.value)}
              placeholder="e.g., nike-01, starbucks-dubai"
            />
            <p className="text-xs text-stone-500">
              Enter the franchise slug (from the URL, e.g., /nike/nike-01)
            </p>
          </div>

          <Button
            onClick={handleFix}
            disabled={processing || !franchiseSlug}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {processing ? 'Creating Wallet...' : 'Create Wallet & Transfer Funds'}
          </Button>

          {result && (
            <div className={`p-4 rounded-lg border ${
              result.success 
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
            }`}>
              <div className="flex items-start gap-2">
                {result.success ? (
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className="font-medium text-sm mb-2">
                    {result.message || (result.success ? 'Success!' : 'Failed')}
                  </p>
                  
                  {result.success && (
                    <div className="text-xs space-y-1 text-stone-700 dark:text-stone-300">
                      <p>• Franchise Wallet ID: {result.franchiseWallet}</p>
                      <p>• Working Capital: ${result.workingCapitalTransferred?.toLocaleString()}</p>
                      <p>• Franchise Fee to Brand: ${result.franchiseFeeTransferred?.toLocaleString()}</p>
                      <p>• Setup Cost to Brand: ${result.setupCostTransferred?.toLocaleString()}</p>
                      <p className="font-medium pt-1">
                        Total Transferred: ${result.totalTransferred?.toLocaleString()}
                      </p>
                    </div>
                  )}
                  
                  {result.error && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                      Error: {result.error}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* All Franchises List */}
      <Card>
        <CardHeader>
          <CardTitle>All Franchises</CardTitle>
        </CardHeader>
        <CardContent>
          {!allFranchises ? (
            <p className="text-stone-600">Loading franchises...</p>
          ) : (
            <div className="space-y-2">
              {allFranchises.map((franchise: FranchiseDebugInfo) => (
                <div key={franchise._id} className="flex items-center justify-between p-3 bg-stone-50 dark:bg-stone-800 rounded-lg">
                  <div>
                    <p className="font-medium">{franchise.franchiseSlug}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={franchise.stage === 'funding' ? 'default' : franchise.stage === 'launching' ? 'secondary' : 'outline'}>
                        {franchise.stage}
                      </Badge>
                      <Badge variant={franchise.status === 'approved' ? 'default' : 'secondary'}>
                        {franchise.status}
                      </Badge>
                      {franchise.hasWallet ? (
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                          <Wallet className="h-3 w-3 mr-1" />
                          Has Wallet
                        </Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          No Wallet
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-stone-500 mt-1">
                      Franchiser: {franchise.franchiserName} • 
                      {franchise.hasWallet && ` Wallet: ${franchise.walletAddress?.slice(0, 20)}...`}
                    </p>
                  </div>
                  {!franchise.hasWallet && franchise.stage === 'launching' && (
                    <Button
                      onClick={() => {
                        setFranchiseSlug(franchise.franchiseSlug);
                      }}
                      size="sm"
                      variant="outline"
                    >
                      Select
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How to Use</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-stone-600 dark:text-stone-400">
          <p>
            <strong>1. Automatic Fix:</strong> Click &quot;Fix Now&quot; next to any franchise in the yellow alert box above.
          </p>
          <p>
            <strong>2. Manual Fix:</strong> Enter the franchise slug in the form and click &quot;Create Wallet & Transfer Funds&quot;.
          </p>
          <p>
            <strong>3. Verify:</strong> After fixing, the franchise should show &quot;Has Wallet&quot; badge and appear in green.
          </p>
          <p className="text-xs text-stone-500 pt-2 border-t">
            <strong>Note:</strong> This tool creates the franchise wallet with working capital and transfers franchise fee + setup cost to the brand wallet.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
