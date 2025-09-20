"use client";

import React from 'react';
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import {
  TrendingUp,
  DollarSign,
  FileText,
  ArrowUpRight,
  Calendar,
  Receipt,
  Building2,
  Link as LinkIcon,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  ArrowDownRight,
  CreditCard,
  Settings,
  Box,
  Library,
  Users,
} from 'lucide-react';
import Wallet from '../franchiser/BrandWallet';
import Image from 'next/image';
import FranchiseWallet from './FranchiseWallet';


export default function FranchiseDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'budget' | 'stock' | 'income' | 'expense' | 'salaries' | 'tax' | 'earnings' | 'payouts' | 'transactions' | 'settings'>('overview');


  const tabs = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'budget', label: 'Budget', icon: Library },
    { id: 'stock', label: 'Stock', icon: Box },
    { id: 'income', label: 'Income', icon: FileText },
    { id: 'expense', label: 'Expense', icon: DollarSign },
    { id: 'earnings', label: 'Earnings', icon: Receipt },
    { id: 'payouts', label: 'Payouts', icon: Receipt },
    { id: 'transactions', label: 'Transactions', icon: CreditCard },
    { id: 'team', label: 'Team', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="space-y-6 py-12">
      <FranchiseWallet />
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

          {activeTab === 'budget' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Your Franchise Shares</h3>
              <div className="space-y-4">

                  <Card className="p-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-lg overflow-hidden relative">
                        <Image
                          src={"/default-logo.png"}
                          alt={"Business Logo"}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">Franchise 1</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Building 1</p>
                        <p className="text-xs text-gray-500">Address 1</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">123 shares</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          123
                        </p>
                      </div>
                    </div>
                  </Card>
              </div>
            </div>
          )}

          {activeTab === 'stock' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Blockchain Contracts</h3>
              <div className="space-y-4">
                  <Card className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <LinkIcon className="h-4 w-4 text-blue-500" />
                        <span className="font-medium">Franchise 1</span>
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                          Active
                        </span>
                      </div>
                      <button className="text-blue-500 hover:text-blue-700">
                        <ExternalLink className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Token ID</p>
                        <p className="font-mono">#123</p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Shares</p>
                        <p>123</p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Network</p>
                        <p>Solana</p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Purchase Date</p>
                        <p>2024-01-01</p>
                      </div>
                    </div>
                  </Card>
              </div>
            </div>
          )}

          {activeTab === 'expense' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Invoice History</h3>
              <div className="space-y-4">

                  <Card className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`p-2 rounded-full ${
                          'bg-blue-100 dark:bg-blue-900/20' 
                        }`}>
                          <ArrowUpRight className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">Franchise 1</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Description 1</p>
                          <p className="text-xs text-gray-500">Invoice 1</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${
                          'text-green-600'
                        }`}>
                          +123
                        </p>
                        <div className="flex items-center space-x-2">
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            2024-01-01
                          </p>
                          <CheckCircle className="h-4 w-4 text-green-500" />

                        </div>
                      </div>
                    </div>
                  </Card>

              </div>
            </div>
          )}

          {activeTab === 'earnings' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Earnings History</h3>
              <div className="space-y-4">
                <Card className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`p-2 rounded-full ${'bg-green-100 dark:bg-green-900/20'}`}>
                          <ArrowDownRight className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium">Franchise 1</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            January • 123 shares
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">+123</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          123/share
                        </p>
                      </div>
                    </div>
                  </Card>
              </div>
            </div>
          )}

          {activeTab === 'payouts' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Payout History</h3>
              <div className="space-y-4">
                  <Card className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/20">
                          <DollarSign className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium">Franchise 1</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Description 1</p>
                          <p className="text-xs text-gray-500">2024-01-01</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">+123</p>
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-xs text-gray-500">Paid</span>
                        </div>
                      </div>
                    </div>
                  </Card>
              </div>
            </div>
          )}

          {activeTab === 'transactions' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Wallet Transactions</h3>   
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}