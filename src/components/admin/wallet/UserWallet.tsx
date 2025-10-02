"use client";

import React, { useState, useEffect } from 'react';
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

interface UserWallet {
  id: string;
  address: string;
  balance: number;
  totalInvested: number;
  totalEarnings: number;
  transactionCount: number;
  lastActivity: string;
  status: 'active' | 'inactive' | 'suspended';
  user: {
    name: string;
    email: string;
    joinedDate: string;
  };
}

export default function UserWallet() {
  const [wallets, setWallets] = useState<UserWallet[]>([]);
  const [filteredWallets, setFilteredWallets] = useState<UserWallet[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchUserWallets();
  }, []);

  useEffect(() => {
    filterWallets();
  }, [wallets, searchTerm, statusFilter]);

  const fetchUserWallets = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data - replace with actual API
      const mockWallets: UserWallet[] = [
        {
          id: '1',
          address: 'UserWallet_001_abcdef123456',
          balance: 2500.75,
          totalInvested: 15000.00,
          totalEarnings: 1250.50,
          transactionCount: 45,
          lastActivity: '2024-01-15T10:30:00Z',
          status: 'active',
          user: {
            name: 'John Doe',
            email: 'john.doe@example.com',
            joinedDate: '2023-06-15T00:00:00Z'
          }
        },
        {
          id: '2',
          address: 'UserWallet_002_ghijkl789012',
          balance: 5000.25,
          totalInvested: 25000.00,
          totalEarnings: 3500.75,
          transactionCount: 78,
          lastActivity: '2024-01-14T15:45:00Z',
          status: 'active',
          user: {
            name: 'Jane Smith',
            email: 'jane.smith@example.com',
            joinedDate: '2023-08-20T00:00:00Z'
          }
        },
        {
          id: '3',
          address: 'UserWallet_003_mnopqr345678',
          balance: 0.00,
          totalInvested: 5000.00,
          totalEarnings: 0.00,
          transactionCount: 12,
          lastActivity: '2024-01-10T09:20:00Z',
          status: 'inactive',
          user: {
            name: 'Bob Johnson',
            email: 'bob.johnson@example.com',
            joinedDate: '2023-12-01T00:00:00Z'
          }
        }
      ];
      
      setWallets(mockWallets);
    } catch (error) {
      console.error('Error fetching user wallets:', error);
      toast.error('Failed to fetch user wallets');
    } finally {
      setLoading(false);
    }
  };

  const filterWallets = () => {
    let filtered = wallets;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(wallet => 
        wallet.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        wallet.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        wallet.address.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(wallet => wallet.status === statusFilter);
    }

    setFilteredWallets(filtered);
  };

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
                  {loading ? '...' : formatCurrency(wallets.reduce((sum, w) => sum + w.totalInvested, 0))}
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
                  {loading ? '...' : formatCurrency(wallets.reduce((sum, w) => sum + w.totalEarnings, 0))}
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
                      <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                        <Wallet className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{wallet.user.name}</h3>
                        <p className="text-sm text-stone-600 dark:text-stone-400">
                          {wallet.user.email}
                        </p>
                        <p className="text-xs text-stone-500 font-mono">
                          {wallet.address}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-semibold text-green-600">
                          {formatCurrency(wallet.balance)}
                        </p>
                        <p className="text-sm text-stone-600 dark:text-stone-400">
                          Current Balance
                        </p>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-semibold">
                          {formatCurrency(wallet.totalInvested)}
                        </p>
                        <p className="text-sm text-stone-600 dark:text-stone-400">
                          Total Invested
                        </p>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-semibold text-orange-600">
                          {formatCurrency(wallet.totalEarnings)}
                        </p>
                        <p className="text-sm text-stone-600 dark:text-stone-400">
                          Total Earnings
                        </p>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-semibold">
                          {wallet.transactionCount}
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
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-stone-200 dark:border-stone-700">
                    <div className="flex items-center justify-between text-sm text-stone-600 dark:text-stone-400">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        Last Activity: {formatDate(wallet.lastActivity)}
                      </div>
                      <div>
                        Joined: {formatDate(wallet.user.joinedDate)}
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
