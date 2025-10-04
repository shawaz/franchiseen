"use client";

import React from 'react';
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import {
  TrendingUp,
  Calendar,
  Receipt,
  Building2,
  CreditCard,
  Settings,
  PieChart,
  Handshake,
  DollarSign,
  Wrench,
  Plus,
} from 'lucide-react';
import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { useSolana } from '@/components/solana/use-solana';
import UserWallet from './UserWallet';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function PropertyDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'properties' | 'agreements' | 'commission' | 'maintenance' | 'payouts'>('overview');
  const { account } = useSolana();

  // Get shares data from Convex
  const sharesData = useQuery(api.franchiseManagement.getSharesByInvestor, { 
    investorId: account?.address || 'no-wallet'
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
    { id: 'properties', label: 'Properties', icon: Building2 },
    { id: 'agreements', label: 'Agreements', icon: Handshake },
    { id: 'commission', label: 'Commission', icon: DollarSign },
    { id: 'maintenance', label: 'Maintenance', icon: Wrench },
    { id: 'payouts', label: 'Payouts', icon: Receipt },
  ];

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

          {activeTab === 'properties' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Property Management</h3>
                <Link href="/property/register">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Property
                  </Button>
                </Link>
              </div>
              <div className="text-center py-8">
                <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No properties listed yet</p>
                <p className="text-sm text-gray-400">Add your first property to get started</p>
              </div>
            </div>
          )}

          {activeTab === 'agreements' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Franchise Agreements</h3>
                <p className="text-sm text-gray-500">Created when users create new franchises</p>
              </div>
              <div className="text-center py-8">
                <Handshake className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No agreements yet</p>
                <p className="text-sm text-gray-400">Agreements will appear when franchises are created</p>
              </div>
            </div>
          )}

          {activeTab === 'commission' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Commission Earnings</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total Commission</p>
                      <p className="text-xl font-bold">$0.00</p>
                    </div>
                    <DollarSign className="h-6 w-6 text-green-500" />
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">This Month</p>
                      <p className="text-xl font-bold">$0.00</p>
                    </div>
                    <Calendar className="h-6 w-6 text-blue-500" />
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
                      <p className="text-xl font-bold">$0.00</p>
                    </div>
                    <TrendingUp className="h-6 w-6 text-yellow-500" />
                  </div>
                </Card>
              </div>
              <div className="text-center py-8">
                <p className="text-gray-500">No commission earnings yet</p>
                <p className="text-sm text-gray-400">Earn commission when agreements are signed</p>
              </div>
            </div>
          )}

          {activeTab === 'maintenance' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Maintenance Requests</h3>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  New Request
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Open Requests</p>
                      <p className="text-xl font-bold">0</p>
                    </div>
                    <Wrench className="h-6 w-6 text-orange-500" />
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">In Progress</p>
                      <p className="text-xl font-bold">0</p>
                    </div>
                    <Settings className="h-6 w-6 text-blue-500" />
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
                      <p className="text-xl font-bold">0</p>
                    </div>
                    <Receipt className="h-6 w-6 text-green-500" />
                  </div>
                </Card>
              </div>
              <div className="text-center py-8">
                <Wrench className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No maintenance requests yet</p>
                <p className="text-sm text-gray-400">Track and manage property maintenance requests</p>
              </div>
            </div>
          )}

          {activeTab === 'payouts' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Rental & Lease Payouts</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total Received</p>
                      <p className="text-xl font-bold">$0.00</p>
                    </div>
                    <DollarSign className="h-6 w-6 text-green-500" />
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">This Month</p>
                      <p className="text-xl font-bold">$0.00</p>
                    </div>
                    <Calendar className="h-6 w-6 text-blue-500" />
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Next Payout</p>
                      <p className="text-xl font-bold">--</p>
                    </div>
                    <Receipt className="h-6 w-6 text-purple-500" />
                  </div>
                </Card>
              </div>
              <div className="text-center py-8">
                <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No payouts yet</p>
                <p className="text-sm text-gray-400">Receive automatic payouts from rental and lease agreements</p>
              </div>
            </div>
          )}

        </div>
      </Card>
    </div>
  );
}