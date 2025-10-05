"use client";

import React from 'react';
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import {
  TrendingUp,
  FileText,
  Calendar,
  Receipt,
  Building2,
  CreditCard,
  Settings,
  Store,
  PieChart,
} from 'lucide-react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { useSolana } from '@/components/solana/use-solana';
import { useAuth } from '@/contexts/AuthContext';
import UserWallet from './UserWallet';
import TransactionsTab from './transactions/TransactionsTab';
import SharesTab from './shares/SharesTab';
import DailyPayoutsTab from './payouts/DailyPayoutsTab';
import InvoicesTab from './invoices/InvoicesTab';
import SettingsTab from './settings/SettingsTab';

export default function ProfileDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'shares' | 'payouts' | 'invoices' | 'settings' | 'contracts' | 'earnings' | 'transactions'>('overview');
  const { account } = useSolana();
  const { userProfile } = useAuth();

  // Use the wallet address from user profile (generated wallet) instead of connected wallet
  const walletAddress = userProfile?.walletAddress;

  // Get shares data from Convex
  const sharesData = useQuery(api.franchiseManagement.getSharesByInvestor, { 
    investorId: walletAddress || 'no-wallet'
  });

  // Test data mutations
  const createTestShares = useMutation(api.testData.createTestFranchiseShares);
  const createTestInvoices = useMutation(api.testData.createTestInvoices);
  const createTestTokens = useMutation(api.createTestTokens.createTestTokensForFranchises);
  const createTestTokenHoldings = useMutation(api.createTestTokens.createTestTokenHoldings);
  const debugData = useQuery(api.testData.debugInvestorData, { 
    investorId: walletAddress || 'no-wallet'
  });
  const debugShares = useQuery(api.debugShares.debugInvestorShares, { 
    investorId: walletAddress || 'no-wallet'
  });

  // Debug logging
  console.log('ProfileDashboard Debug:', {
    walletAddress,
    connectedWallet: account?.address,
    sharesData: sharesData,
    sharesCount: sharesData?.length || 0,
    userProfile: userProfile,
    debugData: debugData,
    debugShares: debugShares
  });

  // Group shares by franchise and calculate summary statistics
  const franchiseSharesMap = new Map<string, { totalAmount: number; sharesPurchased: number; status: string }>();
  
  sharesData?.forEach((share) => {
    const franchiseSlug = share.franchise?.franchiseSlug || 'Unknown Franchise';
    const existing = franchiseSharesMap.get(franchiseSlug);
    
    if (existing) {
      existing.totalAmount += share.totalAmount;
      existing.sharesPurchased += share.sharesPurchased;
    } else {
      franchiseSharesMap.set(franchiseSlug, {
        totalAmount: share.totalAmount,
        sharesPurchased: share.sharesPurchased,
        status: share.franchise?.status || 'funding'
      });
    }
  });

  // Calculate summary statistics
  const totalInvestment = sharesData?.reduce((sum, share) => sum + share.totalAmount, 0) || 0;
  const totalShares = sharesData?.reduce((sum, share) => sum + share.sharesPurchased, 0) || 0;
  const totalEarnings = 0; // This would need to be calculated from actual earnings data
  const thisMonthEarnings = 0; // This would need to be calculated from actual earnings data

  const tabs = [
    { id: 'overview', label: 'Overview', icon: PieChart },
    { id: 'transactions', label: 'Transactions', icon: Receipt },
    { id: 'shares', label: 'Shares', icon: Store },
    { id: 'payouts', label: 'Payouts', icon: Receipt },
    { id: 'invoices', label: 'Invoices', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  // Show no wallet available state
  if (!walletAddress) {
    return (
      <div className="space-y-6 py-12">
        <UserWallet />
        <Card className="p-6">
          <div className="text-center">
            <Building2 className="h-12 w-12 text-stone-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-stone-800 mb-2">No Wallet Available</h3>
            <p className="text-stone-600">Please sign up or login to get a wallet address and view your dashboard</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-12">
        <UserWallet />


      {/* Navigation Tabs */}
      <Card className="p-0">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Debug Section */}
              <Card className="p-4 bg-blue-50 dark:bg-blue-900/20">
                <h3 className="text-lg font-semibold mb-4">Debug Information</h3>
                <div className="space-y-2 text-sm">
                  <p><strong>Generated Wallet Address:</strong> {walletAddress || 'Not available'}</p>
                  <p><strong>Connected Wallet:</strong> {account?.address || 'Not connected'}</p>
                  <p><strong>User Profile:</strong> {userProfile ? 'Available' : 'Not available'}</p>
                  <p><strong>Shares Count:</strong> {sharesData?.length || 0}</p>
                  <p><strong>Debug Data:</strong> {debugData ? `${debugData.sharesCount} shares, ${debugData.invoicesCount} invoices` : 'Loading...'}</p>
                  <p><strong>Share Statuses:</strong> {debugShares ? `${debugShares.summary.confirmedShares} confirmed, ${debugShares.summary.pendingShares} pending` : 'Loading...'}</p>
                  <p><strong>Total Amounts:</strong> {debugShares ? `Confirmed: $${debugShares.totals.confirmedShares.amount.toLocaleString()}, All: $${debugShares.totals.allShares.amount.toLocaleString()}` : 'Loading...'}</p>
                  {walletAddress && (
                    <div className="flex gap-2 mt-4 flex-wrap">
                      <button
                        onClick={() => createTestShares({ investorId: walletAddress })}
                        className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                      >
                        Create Test Shares
                      </button>
                      <button
                        onClick={() => createTestInvoices({ investorId: walletAddress })}
                        className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                      >
                        Create Test Invoices
                      </button>
                      <button
                        onClick={async () => {
                          try {
                            await createTestTokens();
                            await createTestTokenHoldings();
                            alert('Test tokens created successfully!');
                          } catch (error) {
                            console.error('Error creating test tokens:', error);
                            alert('Error creating test tokens');
                          }
                        }}
                        className="px-3 py-1 bg-purple-600 text-white rounded text-xs hover:bg-purple-700"
                      >
                        Create Test Tokens
                      </button>
                    </div>
                  )}
                  {!walletAddress && (
                    <p className="text-red-600 mt-4">Please sign up/login to get a wallet address.</p>
                  )}
                </div>
              </Card>

              {/* Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total Investment</p>
                      <p className="text-xl font-bold">${totalInvestment.toLocaleString()}</p>
                    </div>
                    <CreditCard className="h-6 w-6 text-blue-500" />
                  </div>
                </Card>
                
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total Shares</p>
                      <p className="text-xl font-bold">{totalShares.toLocaleString()}</p>
                    </div>
                    <Building2 className="h-6 w-6 text-green-500" />
                  </div>
                </Card>
                
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total Earnings</p>
                      <p className="text-xl font-bold text-green-600">${totalEarnings.toLocaleString()}</p>
                    </div>
                    <TrendingUp className="h-6 w-6 text-green-500" />
                  </div>
                </Card>
                
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">This Month</p>
                      <p className="text-xl font-bold text-green-600">${thisMonthEarnings.toLocaleString()}</p>
                    </div>
                    <Calendar className="h-6 w-6 text-purple-500" />
                  </div>
                </Card>
              </div>

              {/* Recent Activity Summary */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-4">
                  <h3 className="text-lg font-semibold mb-4">Recent Earnings</h3>
                  <div className="space-y-3">
                    {franchiseSharesMap.size > 0 ? (
                      Array.from(franchiseSharesMap.entries()).slice(0, 3).map(([franchiseSlug, data]) => (
                        <div key={franchiseSlug} className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-sm">{franchiseSlug}</p>
                            <p className="text-xs text-gray-500">{data.sharesPurchased} shares</p>
                          </div>
                          <p className="font-semibold text-green-600">${data.totalAmount.toLocaleString()}</p>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-gray-500 text-sm">No recent earnings</p>
                      </div>
                    )}
                  </div>
                </Card>

                <Card className="p-4">
                  <h3 className="text-lg font-semibold mb-4">Active Contracts</h3>
                  <div className="space-y-3">
                    {franchiseSharesMap.size > 0 ? (
                      Array.from(franchiseSharesMap.entries()).slice(0, 3).map(([franchiseSlug, data]) => (
                        <div key={franchiseSlug} className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-sm">{franchiseSlug}</p>
                            <p className="text-xs text-gray-500">{data.sharesPurchased} shares</p>
                          </div>
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                            {data.status === 'active' ? 'Active' : 
                             data.status === 'approved' ? 'Approved' : 'Funding'}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-gray-500 text-sm">No active contracts</p>
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'transactions' && (
            <TransactionsTab />
          )}

          {activeTab === 'shares' && (
            <SharesTab />
          )}

          {activeTab === 'payouts' && <DailyPayoutsTab />}

          {activeTab === 'invoices' && <InvoicesTab />}
          
          {activeTab === 'settings' && <SettingsTab />}

        </div>
      </Card>
    </div>
  );
}