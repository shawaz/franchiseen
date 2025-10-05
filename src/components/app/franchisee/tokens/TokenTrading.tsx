"use client";

import React, { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../../../convex/_generated/api';
import { Id } from '../../../../../convex/_generated/dataModel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface TokenTradingProps {
  franchiseId: string;
}

export default function TokenTrading({ franchiseId }: TokenTradingProps) {
  const { userProfile } = useAuth();
  const [tradeAmount, setTradeAmount] = useState<string>('');
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');

  // Get franchise token details
  const franchiseToken = useQuery(api.tokenManagement.getFranchiseToken, {
    franchiseId: franchiseId as Id<"franchises">,
  });

  // Get user's token holdings
  const tokenHoldings = useQuery(api.tokenManagement.getTokenHoldingsByInvestor, {
    investorId: userProfile?.walletAddress || '',
  });

  // Get token transactions
  const tokenTransactions = useQuery(api.tokenManagement.getTokenTransactions, {
    franchiseId: franchiseId as Id<"franchises">,
    limit: 20,
  });

  // Find user's holding for this franchise
  const userHolding = tokenHoldings?.find(
    holding => holding.franchiseId === franchiseId
  );

  const handleTrade = async () => {
    if (!userProfile?.walletAddress) {
      toast.error('Please connect your wallet');
      return;
    }

    if (!tradeAmount || parseFloat(tradeAmount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    const amount = parseFloat(tradeAmount);
    const totalValue = amount * (franchiseToken?.sharePrice || 0);

    try {
      if (tradeType === 'buy') {
        // In a real implementation, this would handle the payment and mint tokens
        toast.success(`Buy order placed for ${amount} tokens ($${totalValue.toFixed(2)})`);
      } else {
        // In a real implementation, this would burn tokens and process payment
        if (!userHolding || userHolding.balance < amount) {
          toast.error('Insufficient token balance');
          return;
        }
        toast.success(`Sell order placed for ${amount} tokens ($${totalValue.toFixed(2)})`);
      }
      
      setTradeAmount('');
    } catch (error) {
      console.error('Trade error:', error);
      toast.error('Failed to place trade order');
    }
  };

  if (!franchiseToken) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-gray-500">Loading token information...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Token Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Token Information</span>
            <Badge variant={franchiseToken.status === 'active' ? 'default' : 'secondary'}>
              {franchiseToken.status.toUpperCase()}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Token Name</p>
              <p className="font-semibold">{franchiseToken.tokenName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Symbol</p>
              <p className="font-semibold">{franchiseToken.tokenSymbol}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Price per Token</p>
              <p className="font-semibold">${franchiseToken.sharePrice.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Circulating Supply</p>
              <p className="font-semibold">{franchiseToken.circulatingSupply.toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Holdings */}
      {userHolding && (
        <Card>
          <CardHeader>
            <CardTitle>Your Holdings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Current Balance</p>
                <p className="text-2xl font-bold">{userHolding.balance.toLocaleString()} tokens</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Value</p>
                <p className="text-2xl font-bold">
                  ${(userHolding.balance * franchiseToken.sharePrice).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Average Purchase Price</p>
                <p className="font-semibold">${userHolding.averagePurchasePrice.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Purchased</p>
                <p className="font-semibold">{userHolding.totalPurchased.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Trading Interface */}
      <Card>
        <CardHeader>
          <CardTitle>Trade Tokens</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <Button
              variant={tradeType === 'buy' ? 'default' : 'outline'}
              onClick={() => setTradeType('buy')}
            >
              Buy
            </Button>
            <Button
              variant={tradeType === 'sell' ? 'default' : 'outline'}
              onClick={() => setTradeType('sell')}
              disabled={!userHolding || userHolding.balance === 0}
            >
              Sell
            </Button>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Amount ({tradeType === 'buy' ? 'to buy' : 'to sell'})
            </label>
            <Input
              type="number"
              placeholder="Enter amount"
              value={tradeAmount}
              onChange={(e) => setTradeAmount(e.target.value)}
              max={tradeType === 'sell' ? userHolding?.balance : undefined}
            />
            {tradeAmount && (
              <p className="text-sm text-gray-500">
                Total: ${(parseFloat(tradeAmount || '0') * franchiseToken.sharePrice).toFixed(2)}
              </p>
            )}
          </div>

          <Button 
            onClick={handleTrade}
            className="w-full"
            disabled={!tradeAmount || parseFloat(tradeAmount) <= 0}
          >
            {tradeType === 'buy' ? 'Buy Tokens' : 'Sell Tokens'}
          </Button>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {tokenTransactions && tokenTransactions.length > 0 ? (
            <div className="space-y-2">
              {tokenTransactions.slice(0, 10).map((tx, index) => (
                <div key={index} className="flex justify-between items-center p-2 border rounded">
                  <div>
                    <p className="font-medium">
                      {tx.transactionType === 'mint' ? 'Minted' : 
                       tx.transactionType === 'burn' ? 'Burned' : 
                       tx.transactionType === 'transfer' ? 'Transferred' : 
                       tx.transactionType}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      {tx.amount.toLocaleString()} tokens
                    </p>
                    {tx.totalValue && (
                      <p className="text-sm text-gray-500">
                        ${tx.totalValue.toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500">No transactions yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
