"use client";

import React from 'react';
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useMutation } from 'convex/react';
import { toast } from 'sonner';
import { 
  TrendingUp,
  Calendar,
  Building2,
  CreditCard,
  Store,
  Settings,
  Box,
  MapPin,
  Receipt,
  Package,
  Truck,
  AlertTriangle,
  DollarSign,
} from 'lucide-react';
import { ProductsTab } from './ProductsTab';
import { FranchiseTab } from './FranchiseTab';
import BrandWallet from './BrandWallet';
import { PayoutsTab } from './PayoutsTab';
import { SetupTab } from './SetupTab';
import { TeamTab } from './TeamTab';
import SettingsTab from './SettingsTab';
import { LocationTab } from './LocationTab';
import { useFranchiseBySlug } from '@/hooks/useFranchiseBySlug';
import { useConvexImageUrl, useConvexImageUrls } from '@/hooks/useConvexImageUrl';
import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { Id } from '../../../../convex/_generated/dataModel';
import { Badge } from '@/components/ui/badge';

interface BrandDashboardProps {
  brandSlug: string;
}



// Brand Wallet Transactions Tab Component
function TransactionsTab({ franchiserId }: { franchiserId: string }) {
  const transactions = useQuery(
    api.brandWallet.getBrandWalletTransactions,
    franchiserId ? { franchiserId: franchiserId as Id<"franchiser">, limit: 50 } : "skip"
  );

  if (!transactions) {
    return (
      <div className="space-y-6 py-12">
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600 mx-auto mb-4"></div>
            <p className="text-stone-600">Loading transactions...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="space-y-6 py-12">
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <Receipt className="h-12 w-12 text-stone-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-stone-800 mb-2">No Transactions</h3>
            <p className="text-stone-600">
              Brand wallet transactions will appear here once franchise funding is completed.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Brand Wallet Transactions</h2>
        <p className="text-sm text-stone-600">
          {transactions.length} transaction{transactions.length !== 1 ? 's' : ''} found
        </p>
      </div>
      
      <div className="space-y-4">
        {transactions.map((transaction, index: number) => (
          <Card key={index} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {transaction.description}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-sm text-gray-500">
                      {new Date(transaction.createdAt).toLocaleDateString()} at{' '}
                      {new Date(transaction.createdAt).toLocaleTimeString()}
                    </p>
                    {transaction.franchise && (
                      <>
                        <span className="text-gray-300">•</span>
                        <p className="text-sm text-blue-600 font-medium">
                          {transaction.franchise.title}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold text-green-600">
                  +${transaction.amount.toLocaleString()}
                </p>
                <Badge 
                  variant={transaction.status === 'completed' ? 'default' : 'secondary'}
                  className="mt-1"
                >
                  {transaction.status}
                </Badge>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

type TabId = 'overview' | 'products' | 'franchise' | 'approval' | 'launch' | 'finance' | 'transactions' | 'locations' | 'inventory' | 'setup' | 'payouts' | 'team' | 'settings';

type Tab = {
  id: TabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

export default function BrandDashboard({ brandSlug }: BrandDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [adjustStockDialog, setAdjustStockDialog] = useState<{
    open: boolean;
    productId?: string;
    productName?: string;
    currentStock?: number;
  }>({ open: false });
  const [stockAdjustment, setStockAdjustment] = useState<number>(0);
  
  const { franchiseData, isLoading, error } = useFranchiseBySlug(brandSlug);
  const logoUrl = useConvexImageUrl(franchiseData?.franchiser.logoUrl);
  
  // Mutations
  const adjustWarehouseStock = useMutation(api.productManagement.adjustWarehouseStock);
  const approveStockTransfer = useMutation(api.stockManagement.approveStockTransfer);
  const rejectStockTransfer = useMutation(api.stockManagement.rejectStockTransfer);
  
  // Get franchise locations data for the map
  const franchisesData = useQuery(api.franchiseManagement.getFranchises, 
    franchiseData?.franchiser._id ? { 
      limit: 100
    } : "skip"
  );
  
  // Get product image URLs
  const allProductImages = franchiseData?.products.flatMap(product => product.images) || [];
  const productImageUrls = useConvexImageUrls(allProductImages);

  // Get pending stock transfer requests
  const pendingStockTransfers = useQuery(api.stockManagement.getPendingStockTransfers,
    franchiseData?.franchiser._id ? { 
      franchiserId: franchiseData.franchiser._id,
      limit: 10 
    } : "skip"
  );

  // Get warehouse stock data
  const warehouseStock = useQuery(api.stockManagement.getWarehouseStock,
    franchiseData?.franchiser._id ? { 
      franchiserId: franchiseData.franchiser._id
    } : "skip"
  );

  // Get warehouse stock summary
  const stockSummary = useQuery(api.productManagement.getWarehouseStockSummary,
    franchiseData?.franchiser._id ? { 
      franchiserId: franchiseData.franchiser._id
    } : "skip"
  );

  // Filter franchise locations for this brand
  const brandFranchiseLocations = franchisesData?.filter(franchise => 
    franchise.franchiserId === franchiseData?.franchiser._id
  ) || [];
  

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
    { id: 'franchise', label: 'Franchise', icon: Store },
    { id: 'products', label: 'Products', icon: Box },
    { id: 'inventory', label: 'Warehouse', icon: Package },
    { id: 'transactions', label: 'Transactions', icon: Receipt },
    { id: 'locations', label: 'Locations', icon: MapPin },
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
              productImageUrls={productImageUrls?.filter((url: string | null) => url !== null) as string[] || []} 
              franchiserId={franchiseData.franchiser._id}
            />
          )}
          {activeTab === 'inventory' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Warehouse Inventory Management</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Manage central warehouse stock and distribution to franchise outlets
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <button className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                    <Truck className="h-4 w-4 mr-2" />
                    Transfer Stock
                  </button>
                </div>
              </div>

              {/* Warehouse Stock Summary */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total SKUs</p>
                      <p className="text-2xl font-bold">{stockSummary?.totalProducts || 0}</p>
                    </div>
                    <Package className="h-6 w-6 text-blue-500" />
                  </div>
                </Card>
                
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Stock Value</p>
                      <p className="text-2xl font-bold text-green-600">
                        ${stockSummary?.totalStockValue?.toLocaleString() || '0'}
                      </p>
                    </div>
                    <DollarSign className="h-6 w-6 text-green-500" />
                  </div>
                </Card>
                
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Low Stock Alerts</p>
                      <p className="text-2xl font-bold text-yellow-600">{stockSummary?.lowStockCount || 0}</p>
                    </div>
                    <AlertTriangle className="h-6 w-6 text-yellow-500" />
                  </div>
                </Card>
                
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Pending Requests</p>
                      <p className="text-2xl font-bold text-orange-600">
                        {pendingStockTransfers?.length || 0}
                      </p>
                    </div>
                    <Truck className="h-6 w-6 text-orange-500" />
                  </div>
                </Card>
              </div>

              {/* Warehouse Products Table */}
              <Card className="p-6">
                <h4 className="text-lg font-semibold mb-4">Warehouse Stock Levels</h4>
                {warehouseStock && warehouseStock.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700">
                          <th className="text-left py-3 px-4 font-medium">Product</th>
                          <th className="text-left py-3 px-4 font-medium">SKU</th>
                          <th className="text-left py-3 px-4 font-medium">Warehouse Stock</th>
                          <th className="text-left py-3 px-4 font-medium">Min Level</th>
                          <th className="text-left py-3 px-4 font-medium">Status</th>
                          <th className="text-left py-3 px-4 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {warehouseStock.map((stock, index) => {
                          const isLowStock = stock.warehouseStock <= stock.minWarehouseLevel;
                          const isOutOfStock = stock.warehouseStock === 0;
                          
                          return (
                            <tr key={index} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                              <td className="py-3 px-4">
                                <div className="flex items-center space-x-3">
                                  <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center">
                                    <Package className="h-4 w-4 text-gray-400" />
                                  </div>
                                  <div>
                                    <p className="font-medium text-sm">{stock.productName}</p>
                                    <p className="text-xs text-gray-500">{stock.productCategory}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <span className="text-sm font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                                  {stock.productSku}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <span className="font-semibold">{stock.warehouseStock}</span>
                                <span className="text-sm text-gray-500 ml-1">{stock.unit}</span>
                              </td>
                              <td className="py-3 px-4">
                                <span className="text-sm text-gray-600">{stock.minWarehouseLevel}</span>
                              </td>
                              <td className="py-3 px-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  isOutOfStock 
                                    ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                                    : isLowStock 
                                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                                    : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                }`}>
                                  {isOutOfStock ? 'Out of Stock' : isLowStock ? 'Low Stock' : 'In Stock'}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex items-center space-x-2">
                                  <button 
                                    onClick={() => {
                                      setAdjustStockDialog({
                                        open: true,
                                        productId: stock.productId,
                                        productName: stock.productName,
                                        currentStock: stock.warehouseStock,
                                      });
                                      setStockAdjustment(0);
                                    }}
                                    className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                                  >
                                    Adjust
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">No products in warehouse</p>
                  </div>
                )}
              </Card>

              {/* Recent Stock Transfers */}
              <Card className="p-6">
                <h4 className="text-lg font-semibold mb-4">Pending Stock Requests from Franchises</h4>
                <div className="space-y-3">
                  {pendingStockTransfers && pendingStockTransfers.length > 0 ? (
                    pendingStockTransfers.map((transfer, index) => {
                      // Get current warehouse stock for this product
                      const productStock = warehouseStock?.find(s => s.productId === transfer.productId);
                      const hasEnoughStock = productStock && productStock.warehouseStock >= transfer.requestedQuantity;
                      
                      return (
                        <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                          <div className="flex items-center space-x-4 flex-1">
                            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                              <Truck className="h-5 w-5 text-orange-600" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-sm">{transfer.product?.name || 'Unknown Product'}</p>
                                {!hasEnoughStock && (
                                  <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">
                                    Insufficient Stock
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-500 mt-1">
                                <span className="font-medium">{transfer.franchise?.businessName || 'Unknown Franchise'}</span>
                                {' • '}Requested: {transfer.requestedQuantity} units
                                {productStock && ` • Available: ${productStock.warehouseStock} ${productStock.unit}`}
                              </p>
                              {transfer.notes && (
                                <p className="text-xs text-gray-400 mt-1 italic">&quot;{transfer.notes}&quot;</p>
                              )}
                              <p className="text-xs text-gray-400 mt-1">
                                Requested on {new Date(transfer.createdAt).toLocaleDateString()} at {new Date(transfer.createdAt).toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={async () => {
                                if (!hasEnoughStock) {
                                  const confirmApproval = confirm(
                                    `Warehouse only has ${productStock?.warehouseStock || 0} units but franchise requested ${transfer.requestedQuantity}. Approve available quantity?`
                                  );
                                  if (!confirmApproval) return;
                                }
                                
                                try {
                                  await approveStockTransfer({
                                    transferId: transfer._id,
                                    approvedQuantity: hasEnoughStock 
                                      ? transfer.requestedQuantity 
                                      : (productStock?.warehouseStock || 0),
                                    notes: hasEnoughStock 
                                      ? "Approved - full quantity" 
                                      : "Approved - partial quantity (warehouse limitation)",
                                  });
                                  toast.success(`Stock transfer approved for ${transfer.franchise?.businessName}`);
                                } catch (error) {
                                  console.error("Failed to approve transfer:", error);
                                  toast.error(error instanceof Error ? error.message : "Failed to approve transfer");
                                }
                              }}
                              disabled={!productStock || productStock.warehouseStock === 0}
                              className="px-3 py-1.5 text-xs bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                            >
                              {hasEnoughStock ? 'Approve' : productStock?.warehouseStock ? 'Approve Partial' : 'No Stock'}
                            </button>
                            <button
                              onClick={async () => {
                                const reason = prompt("Reason for rejection:");
                                if (!reason) return;
                                
                                try {
                                  await rejectStockTransfer({
                                    transferId: transfer._id,
                                    notes: reason,
                                  });
                                  toast.success("Stock transfer rejected");
                                } catch (error) {
                                  console.error("Failed to reject transfer:", error);
                                  toast.error("Failed to reject transfer");
                                }
                              }}
                              className="px-3 py-1.5 text-xs bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8">
                      <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 dark:text-gray-400">No pending stock requests</p>
                      <p className="text-sm text-gray-500 mt-1">Franchise outlets can request stock when running low</p>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          )}
          {activeTab === 'franchise' && <FranchiseTab />}
          {activeTab === 'transactions' && <TransactionsTab franchiserId={franchiseData.franchiser._id} />}
          {activeTab === 'locations' && (
            <LocationTab 
              locations={franchiseData.locations}
              franchiseLocations={brandFranchiseLocations}
              onUpdateLocation={(locationId, updates) => {
                // TODO: Implement location update mutation
                console.log('Update location:', locationId, updates);
              }}
              onDeleteLocation={(locationId) => {
                // TODO: Implement location delete mutation
                console.log('Delete location:', locationId);
              }}
              onAddLocation={(location) => {
                // TODO: Implement location add mutation
                console.log('Add location:', location);
              }}
            />
          )}
          {activeTab === 'setup' && <SetupTab />}
          {activeTab === 'payouts' && <PayoutsTab />}
          {activeTab === 'team' && <TeamTab />}
          {activeTab === 'settings' && (
            <SettingsTab 
              franchiserId={franchiseData.franchiser._id}
              brandData={{
                name: franchiseData.franchiser.name,
                slug: franchiseData.franchiser.slug,
                description: franchiseData.franchiser.description,
                industry: franchiseData.franchiser.industry,
                category: franchiseData.franchiser.category,
                website: franchiseData.franchiser.website,
                logoUrl: logoUrl || undefined,
                timingPerWeek: {
                  is24Hours: false,
                  days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
                  startTime: '09:00',
                  endTime: '18:00'
                }
              }}
              interiorImages={franchiseData.franchiser.interiorImages || []}
              onUpdateBrand={(updates) => {
                // TODO: Implement brand update mutation
                console.log('Update brand:', updates);
              }}
              onUpdateInteriorImages={(images) => {
                // TODO: Implement interior images update mutation
                console.log('Update interior images:', images);
              }}
            />
          )}
        </div>
      </Card>

      {/* Stock Adjustment Dialog */}
      <Dialog open={adjustStockDialog.open} onOpenChange={(open) => setAdjustStockDialog({ open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adjust Warehouse Stock</DialogTitle>
            <DialogDescription>
              Adjust the warehouse stock level for {adjustStockDialog.productName}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Current Stock</Label>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {adjustStockDialog.currentStock || 0} units
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="adjustment">Stock Adjustment</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="adjustment"
                  type="number"
                  value={stockAdjustment}
                  onChange={(e) => setStockAdjustment(Number(e.target.value))}
                  placeholder="Enter adjustment (positive to add, negative to remove)"
                  className="flex-1"
                />
              </div>
              <p className="text-sm text-gray-500">
                Use positive numbers to add stock, negative to remove
              </p>
            </div>

            <div className="space-y-2">
              <Label>New Stock Level</Label>
              <div className="text-xl font-semibold text-blue-600">
                {(adjustStockDialog.currentStock || 0) + stockAdjustment} units
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAdjustStockDialog({ open: false })}
            >
              Cancel
            </Button>
            <Button
              onClick={async () => {
                if (!adjustStockDialog.productId) return;
                
                try {
                  await adjustWarehouseStock({
                    productId: adjustStockDialog.productId as Id<"franchiserProducts">,
                    quantity: stockAdjustment,
                    reason: "Manual adjustment",
                  });
                  setAdjustStockDialog({ open: false });
                  setStockAdjustment(0);
                } catch (error) {
                  console.error("Failed to adjust stock:", error);
                  alert("Failed to adjust stock. Please try again.");
                }
              }}
              disabled={stockAdjustment === 0}
            >
              Adjust Stock
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

