"use client";

import React from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../../../convex/_generated/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/PrivyAuthContext';

export default function TokenHoldings() {
  const { userProfile } = useAuth();

  const tokenHoldings = useQuery(api.tokenManagement.getTokenHoldingsByInvestor, {
    investorId: userProfile?.walletAddress || '',
  });

  if (!userProfile?.walletAddress) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-gray-500">Please connect your wallet to view token holdings</p>
        </CardContent>
      </Card>
    );
  }

  if (!tokenHoldings) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-gray-500">Loading token holdings...</p>
        </CardContent>
      </Card>
    );
  }

  if (tokenHoldings.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-gray-500">No token holdings found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Token Holdings</h3>
      
      <div className="grid gap-4">
        {tokenHoldings.map((holding) => (
          <Card key={holding._id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  {holding.token?.tokenName || 'Unknown Token'}
                </CardTitle>
                <Badge variant={holding.token?.status === 'active' ? 'default' : 'secondary'}>
                  {holding.token?.status?.toUpperCase() || 'UNKNOWN'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Franchise</p>
                  <p className="font-medium">{holding.franchise?.businessName || 'Unknown'}</p>
                  <p className="text-sm text-gray-500">{holding.franchise?.franchiseSlug}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Symbol</p>
                  <p className="font-medium">{holding.token?.tokenSymbol || 'N/A'}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-3 border-t">
                <div>
                  <p className="text-sm text-gray-500">Balance</p>
                  <p className="text-xl font-bold">{holding.balance.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Current Value</p>
                  <p className="text-xl font-bold">
                    ${(holding.balance * (holding.token?.sharePrice || 0)).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Avg. Price</p>
                  <p className="text-lg font-semibold">
                    ${holding.averagePurchasePrice.toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-3 border-t">
                <div>
                  <p className="text-sm text-gray-500">Total Purchased</p>
                  <p className="font-medium">{holding.totalPurchased.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Sold</p>
                  <p className="font-medium">{holding.totalSold.toLocaleString()}</p>
                </div>
              </div>

              {holding.franchise?.stage && (
                <div className="pt-3 border-t">
                  <p className="text-sm text-gray-500">Franchise Stage</p>
                  <Badge 
                    variant={
                      holding.franchise.stage === 'ongoing' ? 'default' :
                      holding.franchise.stage === 'launching' ? 'secondary' :
                      holding.franchise.stage === 'funding' ? 'outline' : 'secondary'
                    }
                  >
                    {holding.franchise.stage.toUpperCase()}
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">Total Holdings</p>
              <p className="text-2xl font-bold">
                {tokenHoldings.reduce((sum, holding) => sum + holding.balance, 0).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Value</p>
              <p className="text-2xl font-bold">
                ${tokenHoldings.reduce((sum, holding) => 
                  sum + (holding.balance * (holding.token?.sharePrice || 0)), 0
                ).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Active Franchises</p>
              <p className="text-2xl font-bold">
                {tokenHoldings.filter(h => h.token?.status === 'active').length}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
