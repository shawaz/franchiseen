"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import FranchiseStore from './store/FranchiseStore';
import FranchiseWallet from './FranchiseWallet';

interface FranchiseExampleProps {
  franchiseId?: string;
  franchiserId?: string;
}

/**
 * Example component showing how to use the updated franchise system with Solana wallet integration
 */
export default function FranchiseExample({ franchiseId, franchiserId }: FranchiseExampleProps) {
  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Franchise Store with Integrated Wallet</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-stone-600 dark:text-stone-400 mb-4">
            This example shows how the franchise store now integrates with automatically generated Solana wallets.
            When a franchise is created, a new wallet is generated and funds are transferred to it.
          </p>
          
          {/* Franchise Wallet Component */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Franchise Wallet</h3>
            <FranchiseWallet 
              franchiseId={franchiseId}
              business={{
                name: "Example Franchise",
                logoUrl: "/logo/logo-4.svg"
              }}
            />
          </div>

          {/* Franchise Store Component */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Franchise Store</h3>
            <FranchiseStore 
              franchiseId={franchiseId}
              franchiserId={franchiserId}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-sm font-semibold text-blue-600 dark:text-blue-400">1</div>
              <div>
                <h4 className="font-medium">Wallet Creation</h4>
                <p className="text-sm text-stone-600 dark:text-stone-400">
                  When a franchise is created, a new Solana wallet is automatically generated without requiring a seedphrase.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-sm font-semibold text-blue-600 dark:text-blue-400">2</div>
              <div>
                <h4 className="font-medium">Fund Transfer</h4>
                <p className="text-sm text-stone-600 dark:text-stone-400">
                  The investment amount is automatically transferred from the user&apos;s connected wallet to the new franchise wallet.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-sm font-semibold text-blue-600 dark:text-blue-400">3</div>
              <div>
                <h4 className="font-medium">Wallet Management</h4>
                <p className="text-sm text-stone-600 dark:text-stone-400">
                  The franchise wallet can be used for income, expenses, and transfers within the franchise ecosystem.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
