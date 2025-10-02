"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  DollarSign, 
  Search, 
  Download, 
  Eye, 
  MoreHorizontal,
  TrendingUp,
  TrendingDown,
  Clock,
  Copy,
  ExternalLink,
  Building2,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface FranchiseWallet {
  id: string;
  address: string;
  balance: number;
  totalIncome: number;
  totalExpenses: number;
  totalPayouts: number;
  totalRoyalties: number;
  franchiseFees: number;
  setupCosts: number;
  transactionCount: number;
  lastActivity: string;
  status: 'active' | 'inactive' | 'suspended' | 'maintenance';
  franchise: {
    name: string;
    slug: string;
    brand: string;
    industry: string;
    category: string;
    location: string;
    launchDate: string;
  };
  manager: {
    name: string;
    email: string;
  };
  monthlyRevenue: number;
  monthlyExpenses: number;
  profitMargin: number;
}

export default function FranchiseWallet() {
  const [wallets, setWallets] = useState<FranchiseWallet[]>([]);
  const [filteredWallets, setFilteredWallets] = useState<FranchiseWallet[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchFranchiseWallets();
  }, []);

  useEffect(() => {
    filterWallets();
  }, [wallets, searchTerm, statusFilter]);

  const fetchFranchiseWallets = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data - replace with actual API
      const mockWallets: FranchiseWallet[] = [
        {
          id: '1',
          address: 'FranchiseWallet_001_nike_store_dubai_abcdef123456',
          balance: 25000.75,
          totalIncome: 150000.00,
          totalExpenses: 100000.25,
          totalPayouts: 50000.00,
          totalRoyalties: 15000.00,
          franchiseFees: 25000.00,
          setupCosts: 75000.00,
          transactionCount: 250,
          lastActivity: '2024-01-15T10:30:00Z',
          status: 'active',
          franchise: {
            name: 'Nike Store Dubai',
            slug: 'nike-store-dubai',
            brand: 'Nike',
            industry: 'Fashion & Apparel',
            category: 'Sports & Athletic',
            location: 'Dubai, UAE',
            launchDate: '2023-06-15T00:00:00Z'
          },
          manager: {
            name: 'Ahmed Al-Rashid',
            email: 'ahmed@nike-dubai.com'
          },
          monthlyRevenue: 25000.00,
          monthlyExpenses: 18000.00,
          profitMargin: 28.0
        },
        {
          id: '2',
          address: 'FranchiseWallet_002_starbucks_abudhabi_ghijkl789012',
          balance: 15000.50,
          totalIncome: 200000.00,
          totalExpenses: 150000.50,
          totalPayouts: 75000.00,
          totalRoyalties: 20000.00,
          franchiseFees: 30000.00,
          setupCosts: 100000.00,
          transactionCount: 300,
          lastActivity: '2024-01-14T15:45:00Z',
          status: 'active',
          franchise: {
            name: 'Starbucks Abu Dhabi',
            slug: 'starbucks-abu-dhabi',
            brand: 'Starbucks',
            industry: 'Food & Beverage',
            category: 'Coffee & Tea',
            location: 'Abu Dhabi, UAE',
            launchDate: '2023-08-20T00:00:00Z'
          },
          manager: {
            name: 'Sarah Johnson',
            email: 'sarah@starbucks-abudhabi.com'
          },
          monthlyRevenue: 35000.00,
          monthlyExpenses: 25000.00,
          profitMargin: 28.6
        },
        {
          id: '3',
          address: 'FranchiseWallet_003_mcdonalds_sharjah_mnopqr345678',
          balance: 5000.25,
          totalIncome: 75000.00,
          totalExpenses: 70000.75,
          totalPayouts: 25000.00,
          totalRoyalties: 10000.00,
          franchiseFees: 15000.00,
          setupCosts: 50000.00,
          transactionCount: 150,
          lastActivity: '2024-01-10T09:20:00Z',
          status: 'maintenance',
          franchise: {
            name: 'McDonald\'s Sharjah',
            slug: 'mcdonalds-sharjah',
            brand: 'McDonald\'s',
            industry: 'Food & Beverage',
            category: 'Fast Food',
            location: 'Sharjah, UAE',
            launchDate: '2023-12-01T00:00:00Z'
          },
          manager: {
            name: 'Mohammed Hassan',
            email: 'mohammed@mcdonalds-sharjah.com'
          },
          monthlyRevenue: 15000.00,
          monthlyExpenses: 12000.00,
          profitMargin: 20.0
        }
      ];
      
      setWallets(mockWallets);
    } catch (error) {
      console.error('Error fetching franchise wallets:', error);
      toast.error('Failed to fetch franchise wallets');
    } finally {
      setLoading(false);
    }
  };

  const filterWallets = () => {
    let filtered = wallets;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(wallet => 
        wallet.franchise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        wallet.franchise.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
        wallet.franchise.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        wallet.manager.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        wallet.manager.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4" />;
      case 'inactive':
        return <Clock className="h-4 w-4" />;
      case 'suspended':
        return <AlertCircle className="h-4 w-4" />;
      case 'maintenance':
        return <Building2 className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    toast.success('Address copied to clipboard');
  };

  const exportWallets = () => {
    toast.success('Exporting franchise wallet data...');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            Franchise Wallets
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
                  Total Franchise Wallets
                </p>
                <p className="text-2xl font-bold">
                  {loading ? '...' : wallets.length}
                </p>
              </div>
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <DollarSign className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-stone-600 dark:text-stone-400">
                  Active Franchises
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {loading ? '...' : wallets.filter(w => w.status === 'active').length}
                </p>
              </div>
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-stone-600 dark:text-stone-400">
                  Total Income
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {loading ? '...' : formatCurrency(wallets.reduce((sum, w) => sum + w.totalIncome, 0))}
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
                  Total Expenses
                </p>
                <p className="text-2xl font-bold text-orange-600">
                  {loading ? '...' : formatCurrency(wallets.reduce((sum, w) => sum + w.totalExpenses, 0))}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex-1 col-span-2">
              <div className="relative ">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-stone-400" />
                <Input
                  id="search"
                  placeholder="Search by franchise name, manager..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
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
                  <DropdownMenuItem onSelect={() => setStatusFilter("Maintenance")}>Maintenance</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
               
            
        </CardContent>
      </Card>

      {/* Wallets Table */}
      <Card className="border-stone-200 dark:border-stone-700 space-y-4 py-6 mb-14">
        <CardHeader>
          <CardTitle>Franchise Wallets ({filteredWallets.length})</CardTitle>
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
                      <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                        <Building2 className="h-5 w-5 text-red-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{wallet.franchise.name}</h3>
                        <p className="text-sm text-stone-600 dark:text-stone-400">
                          {wallet.franchise.brand} • {wallet.franchise.industry} • {wallet.franchise.category}
                        </p>
                        <p className="text-sm text-stone-600 dark:text-stone-400">
                          Location: {wallet.franchise.location}
                        </p>
                        <p className="text-sm text-stone-600 dark:text-stone-400">
                          Manager: {wallet.manager.name} ({wallet.manager.email})
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-xs text-stone-500 font-mono">
                            {wallet.address}
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyAddress(wallet.address)}
                            className="h-6 w-6 p-0"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
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
                        <p className="font-semibold text-blue-600">
                          {formatCurrency(wallet.totalIncome)}
                        </p>
                        <p className="text-sm text-stone-600 dark:text-stone-400">
                          Total Income
                        </p>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-semibold text-orange-600">
                          {formatCurrency(wallet.totalExpenses)}
                        </p>
                        <p className="text-sm text-stone-600 dark:text-stone-400">
                          Total Expenses
                        </p>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-semibold text-purple-600">
                          {wallet.profitMargin.toFixed(1)}%
                        </p>
                        <p className="text-sm text-stone-600 dark:text-stone-400">
                          Profit Margin
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(wallet.status)}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(wallet.status)}
                            {wallet.status}
                          </div>
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
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-stone-600 dark:text-stone-400">Monthly Revenue</p>
                        <p className="font-semibold text-green-600">
                          {formatCurrency(wallet.monthlyRevenue)}
                        </p>
                      </div>
                      <div>
                        <p className="text-stone-600 dark:text-stone-400">Monthly Expenses</p>
                        <p className="font-semibold text-orange-600">
                          {formatCurrency(wallet.monthlyExpenses)}
                        </p>
                      </div>
                      <div>
                        <p className="text-stone-600 dark:text-stone-400">Total Payouts</p>
                        <p className="font-semibold text-blue-600">
                          {formatCurrency(wallet.totalPayouts)}
                        </p>
                      </div>
                      <div>
                        <p className="text-stone-600 dark:text-stone-400">Total Royalties</p>
                        <p className="font-semibold text-purple-600">
                          {formatCurrency(wallet.totalRoyalties)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-stone-600 dark:text-stone-400 mt-3 pt-3 border-t border-stone-200 dark:border-stone-700">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        Last Activity: {formatDate(wallet.lastActivity)}
                      </div>
                      <div className="flex items-center gap-4">
                        <span>Launched: {formatDate(wallet.franchise.launchDate)}</span>
                        <span>Transactions: {wallet.transactionCount}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredWallets.length === 0 && (
                <div className="text-center py-8">
                  <DollarSign className="h-12 w-12 text-stone-400 mx-auto mb-4" />
                  <p className="text-stone-600 dark:text-stone-400">
                    No franchise wallets found matching your criteria
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
