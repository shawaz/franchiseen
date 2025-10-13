"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Download, 
  Eye, 
  MoreHorizontal,
  Wallet,
  TrendingUp,
  TrendingDown,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';
import { DropdownMenuContent, DropdownMenu, DropdownMenuTrigger, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { Id } from '../../../../convex/_generated/dataModel';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';

interface UserWallet {
  id?: Id<"users"> | string;
  address?: string;
  balance: number;
  totalInvested?: number;
  totalEarnings?: number;
  transactionCount?: number;
  lastActivity?: string;
  status?: 'active' | 'inactive' | 'suspended';
  user?: {
    name: string;
    email: string;
    joinedDate: string;
  };
}

export default function UserWallet() {
  const [filteredWallets, setFilteredWallets] = useState<UserWallet[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [refreshKey, setRefreshKey] = useState(0); // Force re-render key

  // Get current user data for fallback
  const { userProfile } = useAuth();
  const avatarUrl = userProfile?.avatarUrl || userProfile?.image || null;

  // Debug: Log user profile data
  console.log('UserWallet: userProfile:', userProfile);
  console.log('UserWallet: avatarUrl:', avatarUrl);

  // Fetch real user wallet data from Convex
  const walletsDataRaw = useQuery(api.userManagement.getAllUserWallets);
  const walletsData = useMemo(() => walletsDataRaw || [], [walletsDataRaw]);
  const loading = walletsDataRaw === undefined;

  // Debug: Log the raw data from Convex
  console.log('UserWallet: Raw walletsData from Convex:', walletsData);
  console.log('UserWallet: Number of wallets found:', walletsData.length);
  
  // Debug: Check localStorage for wallet addresses
  const currentUserWallet = typeof window !== 'undefined' ? localStorage.getItem('userWalletAddress') : null;
  const currentUserBalance = typeof window !== 'undefined' ? localStorage.getItem('userWalletBalance') : null;
  console.log('UserWallet: Current user wallet from localStorage:', currentUserWallet);
  console.log('UserWallet: Current user balance from localStorage:', currentUserBalance);
  
  // Debug: Check all localStorage keys related to wallets
  const walletKeys = typeof window !== 'undefined' ? Object.keys(localStorage).filter(key => key.includes('wallet')) : [];
  console.log('UserWallet: All wallet-related localStorage keys:', walletKeys);

  // Enhance wallets with real-time balance (recalculate when refreshKey changes)
  const wallets = React.useMemo(() => {
    let enhancedWallets = walletsData.map(wallet => {
      // For demo purposes, we'll simulate balance updates
      // In a real implementation, this would be stored in the database
      const balanceKey = `wallet_balance_${wallet?.address}`;
      const storedBalance = typeof window !== 'undefined' ? localStorage.getItem(balanceKey) : null;
      const balance = storedBalance ? parseFloat(storedBalance) : (wallet?.balance || 0);
      
      console.log(`UserWallet: Wallet ${wallet?.address}, balanceKey: ${balanceKey}, storedBalance: ${storedBalance}, final balance: ${balance}, refreshKey: ${refreshKey}`);
      
      // If this is the current user's wallet, update with real user data
      if (wallet?.address === currentUserWallet && userProfile) {
        return {
          ...wallet,
          balance,
          user: {
            name: userProfile.firstName && userProfile.lastName 
              ? `${userProfile.firstName} ${userProfile.lastName}`
              : userProfile.email || wallet?.user?.name || 'Unknown',
            email: userProfile.email || wallet?.user?.email || 'Unknown',
            joinedDate: userProfile.createdAt ? new Date(userProfile.createdAt).toISOString() : wallet?.user?.joinedDate || new Date().toISOString()
          }
        };
      }
      
      return {
        ...wallet,
        balance
      };
    });

    // If no wallets found in database but we have a current user wallet, add it
    if (enhancedWallets.length === 0 && currentUserWallet) {
      console.log('UserWallet: No wallets found in database, adding current user wallet from localStorage');
      const currentBalance = currentUserBalance ? parseFloat(currentUserBalance) : 0;
      
      enhancedWallets = [{
        id: 'current-user' as Id<"users">,
        address: currentUserWallet,
        balance: currentBalance,
        totalInvested: 0,
        totalEarnings: 0,
        transactionCount: 0,
        lastActivity: new Date().toISOString(),
        status: 'active' as 'active' | 'inactive' | 'suspended',
        user: {
          name: userProfile?.firstName && userProfile?.lastName 
            ? `${userProfile.firstName} ${userProfile.lastName}`
            : userProfile?.email || 'Current User',
          email: userProfile?.email || 'current@user.com',
          joinedDate: userProfile?.createdAt ? new Date(userProfile.createdAt).toISOString() : new Date().toISOString()
        },
        shares: []
      }];
    }

    return enhancedWallets;
  }, [walletsData, refreshKey, currentUserWallet, currentUserBalance, userProfile]);

  const filterWallets = useCallback(() => {
    let filtered = wallets;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(wallet => 
        wallet.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        wallet.user?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        wallet.address?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(wallet => wallet.status === statusFilter);
    }

    setFilteredWallets(filtered);
  }, [wallets, searchTerm, statusFilter]);

  useEffect(() => {
    filterWallets();
  }, [wallets, searchTerm, statusFilter, filterWallets]);

  // Refresh wallets when localStorage changes (for balance updates)
  useEffect(() => {
    const handleStorageChange = () => {
      // Force re-render when localStorage changes
      console.log('UserWallet: Storage changed, refreshing...');
      setRefreshKey(prev => prev + 1);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange);
      
      // Also listen for custom events for same-tab updates
      const handleBalanceUpdate = (event: Event) => {
        const customEvent = event as CustomEvent;
        console.log('UserWallet: Received walletBalanceUpdated event:', customEvent.detail);
        setRefreshKey(prev => prev + 1);
      };
      
      window.addEventListener('walletBalanceUpdated', handleBalanceUpdate);

      return () => {
        window.removeEventListener('storage', handleStorageChange);
        window.removeEventListener('walletBalanceUpdated', handleBalanceUpdate);
      };
    }
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
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
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
      case 'suspended':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const exportWallets = () => {
    // Implement export functionality
    toast.success('Exporting wallet data...');
  };

  return (
    <div className="space-y-6 container mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            User Wallets
          </h2>
        </div>
        <div className="flex gap-2">
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
                  Total Wallets
                </p>
                <p className="text-2xl font-bold">
                  {loading ? '...' : wallets.length}
                </p>
              </div>
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Wallet className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-stone-600 dark:text-stone-400">
                  Active Wallets
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {loading ? '...' : wallets.filter(w => w.status === 'active').length}
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
                  Total Invested
                </p>
                <p className="text-2xl font-bold text-purple-600">
                  {loading ? '...' : formatCurrency(wallets.reduce((sum, w) => sum + (w.totalInvested || 0), 0))}
                </p>
              </div>
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-stone-600 dark:text-stone-400">
                  Total Earnings
                </p>
                <p className="text-2xl font-bold text-orange-600">
                  {loading ? '...' : formatCurrency(wallets.reduce((sum, w) => sum + (w.totalEarnings || 0), 0))}
                </p>
              </div>
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <TrendingDown className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-stone-400" />
                <Input
                  id="search"
                  placeholder="Search by name, email, or address..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    {statusFilter}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onSelect={() => setStatusFilter("All Status")}>All Status</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setStatusFilter("Active")}>Active</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setStatusFilter("Inactive")}>Inactive</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setStatusFilter("Suspended")}>Suspended</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Wallets Table */}
      <Card className="py-6 border-stone-200 dark:border-stone-700 space-y-4 mb-12">
        <CardHeader>
          <CardTitle>User Wallets ({filteredWallets.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredWallets.map((wallet) => (
                <div key={wallet.id} className="border border-stone-200 dark:border-stone-700 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="relative h-12 w-12 flex-shrink-0">
                        {(wallet.id === 'current-user' || wallet.address === currentUserWallet) && avatarUrl ? (
                          <Image
                            src={avatarUrl}
                            alt={wallet.user?.name || 'User'}
                            width={48}
                            height={48}
                            loading="lazy"
                            className="object-cover rounded-lg"
                            unoptimized
                          />
                        ) : (
                          <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg h-12 w-12 flex items-center justify-center">
                            <Wallet className="h-6 w-6 text-green-600" />
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold">{wallet.user?.name || 'Unknown User'}</h3>
                        <p className="text-sm text-stone-600 dark:text-stone-400">
                          {wallet.user?.email || 'No email'}
                        </p>
                        <p className="text-xs text-stone-500 font-mono">
                          {wallet.address || 'No address'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-semibold text-green-600">
                          {wallet.balance.toFixed(4)} SOL
                        </p>
                        <p className="text-sm text-stone-600 dark:text-stone-400">
                          Current Balance
                        </p>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-semibold">
                          {formatCurrency(wallet.totalInvested || 0)}
                        </p>
                        <p className="text-sm text-stone-600 dark:text-stone-400">
                          Total Invested
                        </p>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-semibold text-orange-600">
                          {formatCurrency(wallet.totalEarnings || 0)}
                        </p>
                        <p className="text-sm text-stone-600 dark:text-stone-400">
                          Total Earnings
                        </p>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-semibold">
                          {wallet.transactionCount || 0}
                        </p>
                        <p className="text-sm text-stone-600 dark:text-stone-400">
                          Transactions
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(wallet.status || 'inactive')}>
                          {wallet.status || 'inactive'}
                        </Badge>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
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
                        Last Activity: {formatDate(wallet.lastActivity || new Date().toISOString())}
                      </div>
                      <div>
                        Joined: {formatDate(wallet.user?.joinedDate || new Date().toISOString())}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredWallets.length === 0 && (
                <div className="text-center py-8">
                  <Wallet className="h-12 w-12 text-stone-400 mx-auto mb-4" />
                  <p className="text-stone-600 dark:text-stone-400">
                    No wallets found matching your criteria
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
