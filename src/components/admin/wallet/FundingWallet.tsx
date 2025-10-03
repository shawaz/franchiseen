"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  TrendingUp, 
  Search, 
  Download, 
  Eye, 
  MoreHorizontal,
  Wallet,
  Target,
  DollarSign,
  Clock,
  Copy,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { useMasterData } from '@/hooks/useMasterData';

interface FundingWallet {
  _id: string;
  address: string;
  balance: number;
  targetAmount: number;
  raisedAmount: number;
  sharesIssued: number;
  sharesPurchased: number;
  sharesRemaining: number;
  transactionCount: number;
  lastActivity: string;
  status: 'funding' | 'completed' | 'failed' | 'paused';
  franchise: {
    _id: string;
    name: string;
    slug: string;
    brand: string;
    industry: string;
    category: string;
    startDate: string;
    endDate: string;
  };
  investors: number;
  averageInvestment: number;
}

export default function FundingWallet() {
  const [filteredPdas, setFilteredPdas] = useState<FundingWallet[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [industryFilter, setIndustryFilter] = useState('All Industries');

  // Fetch real data from Convex
  const franchisesQuery = useQuery(api.franchiseManagement.getFranchises, { limit: 100 });
  const investmentsQuery = useQuery(api.investments.getAllInvestments);
  const franchises = useMemo(() => franchisesQuery || [], [franchisesQuery]);
  const investments = useMemo(() => investmentsQuery || [], [investmentsQuery]);
  const loading = franchises === undefined || investments === undefined;

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

  // Helper function to get franchiser name by ID
  // const getFranchiserName = (franchiserId: string) => {
  //   const franchiser = franchisers.find((f: { _id: string; name: string }) => f._id === franchiserId);
  //   return franchiser?.name || 'Unknown Brand';
  // };

  // Process real data into funding wallets
  const pdas = franchises.map((franchise) => {
    const franchiseInvestments = investments.filter((inv) => inv.franchiseId === franchise._id);
    const totalInvested = franchiseInvestments.reduce((sum, inv) => sum + (inv.totalInvestment || 0), 0);
    const totalSharesPurchased = franchiseInvestments.reduce((sum, inv) => sum + (inv.sharesIssued || 0), 0);
    
    // Calculate funding status
    let status: 'funding' | 'completed' | 'failed' | 'paused' = 'funding';
    if (franchise.stage === 'ongoing' || franchise.stage === 'closed') {
      status = 'completed';
    } else if (franchise.status === 'terminated') {
      status = 'failed';
    } else if (franchise.stage === 'launching') {
      status = 'paused';
    }

    return {
      _id: franchise._id,
      address: `Funding_${franchise._id.slice(-8)}_${franchise.franchiseSlug}`,
      balance: totalInvested, // Current balance = total invested
      targetAmount: 0,
      raisedAmount: totalInvested,
      sharesIssued: 0,
      sharesPurchased: totalSharesPurchased,
      sharesRemaining: 0,
      transactionCount: franchiseInvestments.length,
      lastActivity: new Date(franchise.updatedAt).toISOString(),
      status,
      franchise: {
        _id: franchise._id,
        name: franchise.businessName,
        slug: franchise.franchiseSlug,
        brand: franchise.franchiser?.name || 'Unknown Brand',
        industry: getIndustryName(franchise.franchiser?.industry || ''),
        category: getCategoryName(franchise.franchiser?.category || ''),
        startDate: new Date(franchise.createdAt).toISOString(),
        endDate: new Date(franchise.createdAt + (90 * 24 * 60 * 60 * 1000)).toISOString(), // 90 days from creation
      },
      investors: franchiseInvestments.length,
      averageInvestment: franchiseInvestments.length > 0 ? totalInvested / franchiseInvestments.length : 0,
    };
  });

  const filterPdas = useCallback(() => {
    let filtered = pdas;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(pda => 
        pda.franchise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pda.franchise.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pda.franchise.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pda.address.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'All Status') {
      const statusMap: { [key: string]: string } = {
        'All Status': 'all',
        'Funding': 'funding',
        'Completed': 'completed',
        'Failed': 'failed',
        'Paused': 'paused'
      };
      const actualStatus = statusMap[statusFilter] || statusFilter;
      if (actualStatus !== 'all') {
        filtered = filtered.filter(pda => pda.status === actualStatus);
      }
    }

    // Filter by industry
    if (industryFilter !== 'All Industries') {
      const industryMap: { [key: string]: string } = {
        'All Industries': 'all'
      };
      const actualIndustry = industryMap[industryFilter] || industryFilter;
      if (actualIndustry !== 'all') {
        filtered = filtered.filter(pda => pda.franchise.industry === actualIndustry);
      }
    }

    setFilteredPdas(filtered);
  }, [pdas, searchTerm, statusFilter, industryFilter]);

  useEffect(() => {
    filterPdas();
  }, [franchises, investments, searchTerm, statusFilter, industryFilter, industries, categories, filterPdas]);

  const refreshData = async () => {
    try {
      // Data will automatically refresh due to Convex reactivity
      toast.success('Funding wallets refreshed successfully');
    } catch (error) {
      console.error('Error refreshing data:', error);
      toast.error('Failed to refresh data');
    }
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
      case 'funding':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'funding':
        return <TrendingUp className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4" />;
      case 'paused':
        return <Clock className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    toast.success('Address copied to clipboard');
  };

  const exportPdas = () => {
    toast.success('Exporting franchise PDA data...');
  };

  const getUniqueIndustries = () => {
    const industries = [...new Set(pdas.map(pda => pda.franchise.industry))];
    return industries;
  };

  const getProgressPercentage = (raised: number, target: number) => {
    return Math.min((raised / target) * 100, 100);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            Funding Wallets
          </h2>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshData}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={exportPdas}>
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
                  Total PDAs
                </p>
                <p className="text-2xl font-bold">
                  {loading ? '...' : pdas.length}
                </p>
              </div>
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-stone-600 dark:text-stone-400">
                  Active Campaigns
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {loading ? '...' : pdas.filter(p => p.status === 'funding').length}
                </p>
              </div>
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-stone-600 dark:text-stone-400">
                  Total Raised
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {loading ? '...' : formatCurrency(pdas.reduce((sum, p) => sum + p.raisedAmount, 0))}
                </p>
              </div>
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-stone-600 dark:text-stone-400">
                  Total Investors
                </p>
                <p className="text-2xl font-bold text-purple-600">
                  {loading ? '...' : pdas.reduce((sum, p) => sum + p.investors, 0)}
                </p>
              </div>
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Wallet className="h-6 w-6 text-purple-600" />
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
                  placeholder="Search by funding name, brand..."
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
                  <DropdownMenuItem onSelect={() => setStatusFilter("Funding")}>Funding</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setStatusFilter("Completed")}>Completed</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setStatusFilter("Failed")}>Failed</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setStatusFilter("Paused")}>Paused</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    {industryFilter}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onSelect={() => setIndustryFilter("All Industries")}>All Industries</DropdownMenuItem>
                  {getUniqueIndustries().map(industry => (
                    <DropdownMenuItem key={industry} onSelect={() => setIndustryFilter(industry)}>{industry}</DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

            </div>

        </CardContent>
      </Card>

      {/* PDAs Table */}
      <Card className="border-stone-200 dark:border-stone-700 space-y-4 py-6 mb-14">
        <CardHeader>
          <CardTitle>Funding Wallets ({filteredPdas.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPdas.map((pda) => (
                <div key={pda._id} className="border border-stone-200 dark:border-stone-700 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                        <TrendingUp className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{pda.franchise.name}</h3>
                        <p className="text-sm text-stone-600 dark:text-stone-400">
                          {pda.franchise.brand} • {pda.franchise.industry} • {pda.franchise.category}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-xs text-stone-500 font-mono">
                            {pda.address}
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyAddress(pda.address)}
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
                          {formatCurrency(pda.balance)}
                        </p>
                        <p className="text-sm text-stone-600 dark:text-stone-400">
                          Current Balance
                        </p>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-semibold text-blue-600">
                          {formatCurrency(pda.raisedAmount)}
                        </p>
                        <p className="text-sm text-stone-600 dark:text-stone-400">
                          Raised / {formatCurrency(pda.targetAmount)}
                        </p>
                        <div className="w-20 bg-stone-200 dark:bg-stone-700 rounded-full h-2 mt-1">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${getProgressPercentage(pda.raisedAmount, pda.targetAmount)}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-semibold">
                          {pda.sharesPurchased} / {pda.sharesIssued}
                        </p>
                        <p className="text-sm text-stone-600 dark:text-stone-400">
                          Shares Sold
                        </p>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-semibold">
                          {pda.investors}
                        </p>
                        <p className="text-sm text-stone-600 dark:text-stone-400">
                          Investors
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(pda.status)}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(pda.status)}
                            {pda.status}
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
                    <div className="flex items-center justify-between text-sm text-stone-600 dark:text-stone-400">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        Last Activity: {formatDate(pda.lastActivity)}
                      </div>
                      <div className="flex items-center gap-4">
                        <span>Campaign: {formatDate(pda.franchise.startDate)} - {formatDate(pda.franchise.endDate)}</span>
                        <span>Avg Investment: {formatCurrency(pda.averageInvestment)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredPdas.length === 0 && (
                <div className="text-center py-8">
                  <TrendingUp className="h-12 w-12 text-stone-400 mx-auto mb-4" />
                  <p className="text-stone-600 dark:text-stone-400">
                    No funding wallets found matching your criteria
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
