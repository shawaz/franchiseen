"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Store, 
  Search, 
  Download, 
  Eye, 
  MoreHorizontal,
  TrendingUp,
  Building2,
  Clock,
  Copy,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { useMasterData } from '@/hooks/useMasterData';

interface BrandWalletData {
  _id: string;
  ownerWalletAddress: string;
  brandWalletAddress: string;
  brandWalletSecretKey?: string;
  logoUrl?: string;
  name: string;
  slug: string;
  description: string;
  industry: string;
  category: string;
  website?: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  createdAt: number;
  updatedAt: number;
  // Mock balance data (in real app, this would come from Solana RPC)
  balance?: number;
  totalReceived?: number;
  totalSent?: number;
  transactionCount?: number;
  lastActivity?: string;
}

export default function BrandWallet() {
  const [filteredWallets] = useState<BrandWalletData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [industryFilter, setIndustryFilter] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch all franchisers (brand wallets) from Convex
  const franchisers = useQuery(api.franchises.getAllFranchisers) || [];
  const loading = franchisers === undefined;

  // Get industry and category names
  const { industries, categories } = useMasterData();

  // Helper function to get industry name by ID
  const getIndustryName = (industryId: string) => {
    const industry = industries?.find((i: { _id: string; name: string }) => i._id === industryId);
    return industry?.name || 'Unknown Industry';
  };

  // Helper function to get category name by ID
  const getCategoryName = (categoryId: string) => {
    const category = categories?.find((c: { _id: string; name: string }) => c._id === categoryId);
    return category?.name || 'Unknown Category';
  };

  // Use franchiser data without mock balance data
  const walletsWithBalance: BrandWalletData[] = franchisers.map((franchiser: BrandWalletData) => ({
    ...franchiser,
    balance: 0, // Will be fetched from Solana RPC in future
    totalReceived: 0, // Will be fetched from Solana RPC in future
    totalSent: 0, // Will be fetched from Solana RPC in future
    transactionCount: 0, // Will be fetched from Solana RPC in future
    lastActivity: new Date(franchiser.updatedAt).toISOString(), // Use updatedAt as last activity
  }));

  const refreshData = async () => {
    setIsRefreshing(true);
    try {
      // The data will automatically refresh due to Convex reactivity
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Brand wallets refreshed successfully');
    } catch (error) {
      console.error('Error refreshing data:', error);
      toast.error('Failed to refresh data');
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'draft':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    toast.success('Address copied to clipboard');
  };

  const exportWallets = () => {
    toast.success('Exporting brand wallet data...');
  };

  // const getUniqueIndustries = () => {
  //   const uniqueIndustries = [...new Set(walletsWithBalance.map((wallet: BrandWalletData) => getIndustryName(wallet.industry)))];
  //   return uniqueIndustries;
  // };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            Brand Wallets
          </h2>
          <p className="text-stone-600 dark:text-stone-400">
            Manage brand wallets created during registration
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshData}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={exportWallets}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-stone-600 dark:text-stone-400">
                  Total Brand Wallets
                </p>
                <p className="text-2xl font-bold">
                  {loading ? '...' : walletsWithBalance.length}
                </p>
              </div>
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Store className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-stone-600 dark:text-stone-400">
                  Approved Brands
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {loading ? '...' : walletsWithBalance.filter(w => w.status === 'approved').length}
                </p>
              </div>
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-stone-600 dark:text-stone-400">
                  Total Received
                </p>
                <p className="text-2xl font-bold text-stone-500">
                  {loading ? '...' : 'Not Available'}
                </p>
              </div>
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-stone-600 dark:text-stone-400">
                  Total Sent
                </p>
                <p className="text-2xl font-bold text-stone-500">
                  {loading ? '...' : 'Not Available'}
                </p>
              </div>
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex-1 col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-stone-400" />
                <Input
                  id="search"
                  placeholder="Search by brand name, owner..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    {statusFilter === 'all' ? 'All Status' : statusFilter}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onSelect={() => setStatusFilter("all")}>All Status</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setStatusFilter("draft")}>Draft</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setStatusFilter("pending")}>Pending</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setStatusFilter("approved")}>Approved</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setStatusFilter("rejected")}>Rejected</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    {industryFilter === 'all' ? 'All Industries' : industryFilter}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onSelect={() => setIndustryFilter("all")}>All Industries</DropdownMenuItem>
                  {industries?.map((industry: { _id: string; name: string; icon?: string }) => (
                    <DropdownMenuItem 
                      key={industry._id} 
                      onSelect={() => setIndustryFilter(industry.name)}
                    >
                      {industry.icon && <span className="mr-2">{industry.icon}</span>}
                      {industry.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

          </div>
        </CardContent>
      </Card>

      {/* Wallets Table */}
      <Card>
        <CardHeader>
          <CardTitle>Brand Wallets ({filteredWallets.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredWallets.map((wallet) => (
                <div key={wallet._id} className="border border-stone-200 dark:border-stone-700 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                        <Building2 className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{wallet.name}</h3>
                        <p className="text-sm text-stone-600 dark:text-stone-400">
                          {getIndustryName(wallet.industry)} • {getCategoryName(wallet.category)}
                        </p>
                        <p className="text-sm text-stone-600 dark:text-stone-400">
                          Owner: {wallet.ownerWalletAddress.slice(0, 8)}...{wallet.ownerWalletAddress.slice(-8)}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-xs text-stone-500 font-mono">
                            {wallet.brandWalletAddress}
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyAddress(wallet.brandWalletAddress)}
                            className="h-6 w-6 p-0"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-semibold text-stone-500">
                          Not Available
                        </p>
                        <p className="text-sm text-stone-600 dark:text-stone-400">
                          Current Balance
                        </p>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-semibold text-stone-500">
                          Not Available
                        </p>
                        <p className="text-sm text-stone-600 dark:text-stone-400">
                          Total Received
                        </p>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-semibold text-stone-500">
                          Not Available
                        </p>
                        <p className="text-sm text-stone-600 dark:text-stone-400">
                          Total Sent
                        </p>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-semibold text-stone-500">
                          Not Available
                        </p>
                        <p className="text-sm text-stone-600 dark:text-stone-400">
                          Transactions
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(wallet.status)}>
                          {wallet.status}
                        </Badge>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-stone-200 dark:border-stone-700">
                    <div className="flex items-center justify-between text-sm text-stone-600 dark:text-stone-400">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        Last Activity: {formatDate(wallet.lastActivity || new Date(wallet.updatedAt).toISOString())}
                      </div>
                      <div>
                        Registered: {formatDate(new Date(wallet.createdAt).toISOString())}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredWallets.length === 0 && (
                <div className="text-center py-8">
                  <Store className="h-12 w-12 text-stone-400 mx-auto mb-4" />
                  <p className="text-stone-600 dark:text-stone-400">
                    No brand wallets found matching your criteria
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
