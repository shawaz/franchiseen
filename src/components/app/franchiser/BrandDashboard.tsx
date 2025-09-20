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
  Store,
  CheckSquare,
  Settings,
  Box,
  Users,
} from 'lucide-react';
import { ProductsTab } from './ProductsTab';
import { FranchiseTab } from './FranchiseTab';
import BrandWallet from './BrandWallet';
import { ApprovalTab } from './ApprovalTab';
import { PayoutsTab } from './PayoutsTab';
import { SetupTab } from './SetupTab';
import { TeamTab } from './TeamTab';
import { SettingsTab } from './SettingsTab';


export default function BrandDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'franchise' | 'approvals' | 'setup' | 'payouts' | 'team' | 'settings'>('overview');


  const tabs = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'products', label: 'Products', icon: Box },
    { id: 'franchise', label: 'Franchise', icon: Store },
    { id: 'approvals', label: 'Approvals', icon: CheckSquare },
    { id: 'setup', label: 'Setup', icon: Receipt },
    { id: 'payouts', label: 'Payouts', icon: Receipt },
    { id: 'team', label: 'Team', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="space-y-6 py-6">
      <BrandWallet />
      {/* Navigation Tabs */}
      <Card className="p-0">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as 'overview' | 'products' | 'franchise' | 'approvals' | 'setup' | 'payouts' | 'team' | 'settings')}
                  className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-amber-500 text-amber-600'
                      : 'border-transparent text-stone-500 hover:text-stone-700'
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
                      <p className="text-xl font-bold">123</p>
                    </div>
                    <CreditCard className="h-6 w-6 text-blue-500" />
                  </div>
                </Card>
                
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total Shares</p>
                      <p className="text-xl font-bold">123</p>
                    </div>
                    <Building2 className="h-6 w-6 text-green-500" />
                  </div>
                </Card>
                
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total Earnings</p>
                      <p className="text-xl font-bold text-green-600">123</p>
                    </div>
                    <TrendingUp className="h-6 w-6 text-green-500" />
                  </div>
                </Card>
                
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">This Month</p>
                      <p className="text-xl font-bold text-green-600">123</p>
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

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">Franchise 1</p>
                          <p className="text-xs text-gray-500">Sep 2024</p>
                        </div>
                        <p className="font-semibold text-green-600">123</p>
                      </div>

                  </div>
                </Card>

                <Card className="p-4">
                  <h3 className="text-lg font-semibold mb-4">Active Contracts</h3>
                  <div className="space-y-3">

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">Franchise 1</p>
                          <p className="text-xs text-gray-500">Token #123</p>
                        </div>
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Active</span>
                      </div>
                  </div>
                </Card>
              </div>
            </div>
          )}
          {activeTab === 'products' && <ProductsTab />}
          {activeTab === 'franchise' && <FranchiseTab />}
          {activeTab === 'approvals' && <ApprovalTab />}
          {activeTab === 'setup' && <SetupTab />}
          {activeTab === 'payouts' && <PayoutsTab />}
          {activeTab === 'team' && <TeamTab />}
          {activeTab === 'settings' && <SettingsTab />}
        </div>
      </Card>
    </div>
  );
}