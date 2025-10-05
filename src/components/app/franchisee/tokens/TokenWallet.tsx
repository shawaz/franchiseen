"use client";

import React from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../../../convex/_generated/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { Coins, TrendingUp, Wallet } from 'lucide-react';

export default function TokenWallet() {
  const { userProfile } = useAuth();

  const tokenHoldings = useQuery(api.tokenManagement.getTokenHoldingsByInvestor, {
    investorId: userProfile?.walletAddress || '',
  });

  if (!userProfile?.walletAddress) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <Wallet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Please connect your wallet to view token holdings</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!tokenHoldings) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading token holdings...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (tokenHoldings.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <Coins className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">No token holdings found</p>
            <p className="text-sm text-gray-400">
              Purchase tokens from franchise investment opportunities to see them here
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalValue = tokenHoldings.reduce((sum, holding) => 
    sum + (holding.balance * (holding.token?.sharePrice || 0)), 0
  );

  const totalTokens = tokenHoldings.reduce((sum, holding) => sum + holding.balance, 0);

  return (
    <div className="space-y-4">
      {/* Portfolio Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Wallet className="h-5 w-5" />
            <span>Token Portfolio</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{totalTokens.toLocaleString()}</div>
              <div className="text-sm text-gray-500">Total Tokens</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">${totalValue.toLocaleString()}</div>
              <div className="text-sm text-gray-500">Total Value</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Individual Holdings */}
      <div className="space-y-3">
        {tokenHoldings.map((holding) => (
          <Card key={holding._id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Coins className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">
                      {holding.token?.tokenName || 'Unknown Token'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {holding.franchise?.businessName || 'Unknown Franchise'}
                    </p>
                  </div>
                </div>
                <Badge 
                  variant={
                    holding.token?.status === 'active' ? 'default' :
                    holding.token?.status === 'paused' ? 'secondary' : 'outline'
                  }
                >
                  {holding.token?.status?.toUpperCase() || 'UNKNOWN'}
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-3">
                <div>
                  <div className="text-sm text-gray-500">Balance</div>
                  <div className="font-semibold">{holding.balance.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Price</div>
                  <div className="font-semibold">${holding.token?.sharePrice?.toFixed(2) || '0.00'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Value</div>
                  <div className="font-semibold text-green-600">
                    ${(holding.balance * (holding.token?.sharePrice || 0)).toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-1 text-gray-500">
                  <TrendingUp className="h-4 w-4" />
                  <span>Avg. Price: ${holding.averagePurchasePrice.toFixed(2)}</span>
                </div>
                <div className="text-gray-500">
                  Symbol: {holding.token?.tokenSymbol || 'N/A'}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
