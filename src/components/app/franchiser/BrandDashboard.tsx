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
  Settings,
  Box,
  Users,
} from 'lucide-react';
import { ProductsTab } from './ProductsTab';
import { FranchiseTab } from './FranchiseTab';
import BrandWallet from './BrandWallet';
import { PayoutsTab } from './PayoutsTab';
import { SetupTab } from './SetupTab';
import { TeamTab } from './TeamTab';
import SettingsTab from './SettingsTab';
import { useFranchiseBySlug } from '@/hooks/useFranchiseBySlug';
import { useConvexImageUrl, useConvexImageUrls } from '@/hooks/useConvexImageUrl';

interface BrandDashboardProps {
  brandSlug: string;
}

type TabId = 'overview' | 'products' | 'franchise' | 'setup' | 'payouts' | 'team' | 'settings';

type Tab = {
  id: TabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

export default function BrandDashboard({ brandSlug }: BrandDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const { franchiseData, isLoading, error } = useFranchiseBySlug(brandSlug);
  const logoUrl = useConvexImageUrl(franchiseData?.franchiser.logoUrl);
  
  // Get product image URLs
  const allProductImages = franchiseData?.products.flatMap(product => product.images) || [];
  const productImageUrls = useConvexImageUrls(allProductImages);

  if (isLoading) {
    return (
      <div className="space-y-6 py-12">
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600 mx-auto mb-4"></div>
            <p className="text-stone-600">Loading brand dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !franchiseData) {
    return (
      <div className="space-y-6 py-12">
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-stone-800 mb-2">Brand Not Found</h1>
            <p className="text-stone-600">The brand you are looking for does not exist or has been removed.</p>
          </div>
        </div>
      </div>
    );
  }

  const tabs: Tab[] = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'products', label: 'Products', icon: Box },
    { id: 'franchise', label: 'Franchise', icon: Store },
    { id: 'setup', label: 'Setup', icon: Receipt },
    { id: 'payouts', label: 'Payouts', icon: Receipt },
    { id: 'team', label: 'Team', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="space-y-6 py-12">
      <BrandWallet 
        franchiserId={franchiseData.franchiser._id}
        business={{
          name: franchiseData.franchiser.name,
          logoUrl: logoUrl || undefined
        }}
      />
      {/* Navigation Tabs */}
      <Card className="p-0">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
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
                      <p className="text-sm text-gray-600 dark:text-gray-400">Locations</p>
                      <p className="text-xl font-bold">{franchiseData.locations.length}</p>
                    </div>
                    <Building2 className="h-6 w-6 text-blue-500" />
                  </div>
                </Card>
                
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Products</p>
                      <p className="text-xl font-bold">{franchiseData.products.length}</p>
                    </div>
                    <Box className="h-6 w-6 text-green-500" />
                  </div>
                </Card>
                
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Min Investment</p>
                      <p className="text-xl font-bold text-green-600">
                        ${franchiseData.locations[0]?.franchiseFee?.toLocaleString() || '0'}
                      </p>
                    </div>
                    <CreditCard className="h-6 w-6 text-green-500" />
                  </div>
                </Card>
                
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                      <p className="text-xl font-bold text-green-600">
                        {franchiseData.franchiser.status === 'approved' ? 'Live' : 'Pending'}
                      </p>
                    </div>
                    <Calendar className="h-6 w-6 text-purple-500" />
                  </div>
                </Card>
              </div>

              {/* Recent Activity Summary */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-4">
                  <h3 className="text-lg font-semibold mb-4">Locations Overview</h3>
                  <div className="space-y-3">
                    {franchiseData.locations.map((location, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">{location.country}</p>
                          <p className="text-xs text-gray-500">
                            {location.isNationwide ? 'Nationwide' : location.city}
                          </p>
                        </div>
                        <p className="font-semibold text-green-600">
                          ${location.franchiseFee.toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="p-4">
                  <h3 className="text-lg font-semibold mb-4">Products Overview</h3>
                  <div className="space-y-3">
                    {franchiseData.products.slice(0, 3).map((product, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">{product.name}</p>
                          <p className="text-xs text-gray-500">{product.category}</p>
                        </div>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          ${product.price.toFixed(2)}
                        </span>
                      </div>
                    ))}
                    {franchiseData.products.length > 3 && (
                      <p className="text-xs text-gray-500 text-center">
                        +{franchiseData.products.length - 3} more products
                      </p>
                    )}
                  </div>
                </Card>
              </div>
            </div>
          )}
          {activeTab === 'products' && (
            <ProductsTab 
              products={franchiseData.products} 
              productImageUrls={productImageUrls?.filter(url => url !== null) as string[] || []} 
            />
          )}
          {activeTab === 'franchise' && <FranchiseTab />}
          {activeTab === 'setup' && <SetupTab />}
          {activeTab === 'payouts' && <PayoutsTab />}
          {activeTab === 'team' && <TeamTab />}
          {activeTab === 'settings' && <SettingsTab />}
        </div>
      </Card>
    </div>
  );
}