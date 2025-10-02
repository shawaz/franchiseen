"use client";

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Building2, 
  Users, 
  Store, 
  TrendingUp, 
  DollarSign
} from 'lucide-react';
import CompanyWallet from '@/components/admin/wallet/CompanyWallet';
import UserWallet from '@/components/admin/wallet/UserWallet';
import BrandWallet from '@/components/admin/wallet/BrandWallet';
import FundingWallet from '@/components/admin/wallet/FundingWallet';
import FranchiseWallet from '@/components/admin/wallet/FranchiseWallet';

export default function WalletManagementPage() {
  const [activeTab, setActiveTab] = useState('company');

  const walletTypes = [
    {
      id: 'company',
      name: 'Company Wallet',
      description: 'Platform fee collection (2% per transaction)',
      icon: Building2,
      color: 'bg-blue-500',
      count: 1,
      status: 'active'
    },
    {
      id: 'user',
      name: 'User Wallets',
      description: 'Main user wallet management',
      icon: Users,
      color: 'bg-green-500',
      count: 0, // Will be fetched from API
      status: 'active'
    },
    {
      id: 'brand',
      name: 'Brand Wallets',
      description: 'Brand registration wallets',
      icon: Store,
      color: 'bg-purple-500',
      count: 0, // Will be fetched from API
      status: 'active'
    },
    {
      id: 'franchise-pda',
      name: 'Franchise PDAs',
      description: 'Franchise fundraising wallets',
      icon: TrendingUp,
      color: 'bg-orange-500',
      count: 0, // Will be fetched from API
      status: 'active'
    },
    {
      id: 'franchise-wallet',
      name: 'Franchise Wallets',
      description: 'Franchise operations & management',
      icon: DollarSign,
      color: 'bg-red-500',
      count: 0, // Will be fetched from API
      status: 'active'
    }
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">

      {/* Wallet Management Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          {walletTypes.map((wallet) => {
            const Icon = wallet.icon;
            return (
              <TabsTrigger key={wallet.id} value={wallet.id} className="flex items-center gap-2">
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{wallet.name}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value="company" className="space-y-4">
          <CompanyWallet />
        </TabsContent>

        <TabsContent value="user" className="space-y-4">
          <UserWallet />
        </TabsContent>

        <TabsContent value="brand" className="space-y-4">
          <BrandWallet />
        </TabsContent>

        <TabsContent value="franchise-pda" className="space-y-4">
          <FundingWallet />
        </TabsContent>

        <TabsContent value="franchise-wallet" className="space-y-4">
          <FranchiseWallet />
        </TabsContent>
      </Tabs>
    </div>
  );
}
