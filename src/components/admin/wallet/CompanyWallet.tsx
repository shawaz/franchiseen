"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  DollarSign, 
  TrendingUp, 
  RefreshCw, 
  Wallet
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  getStoredCompanyWallet, 
  type CompanyWallet as CompanyWalletType 
} from '@/lib/companyWalletUtils';

// Helper function to get platform fee transactions from localStorage
const getPlatformFeeTransactions = () => {
  try {
    const transactions = [];
    
    console.log('Searching for platform fee transactions in localStorage...');
    
    // Get all localStorage keys that start with 'platform_fee_'
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('platform_fee_')) {
        console.log('Found platform fee key:', key);
        const transactionData = JSON.parse(localStorage.getItem(key) || '{}');
        console.log('Transaction data:', transactionData);
        
        if (transactionData.amount && transactionData.timestamp) {
          transactions.push({
            id: key,
            type: 'fee_collection' as const,
            amount: transactionData.amount,
            from: transactionData.from || 'Unknown Source',
            timestamp: transactionData.timestamp,
            status: 'completed' as const,
            description: transactionData.description || `Platform fee from ${transactionData.from || 'Unknown Source'}`
          });
        } else {
          console.log('Invalid transaction data:', transactionData);
        }
      }
    }
    
    console.log('Total platform fee transactions found:', transactions.length);
    console.log('All platform fee transactions:', transactions);
    
    // Sort by timestamp (newest first)
    return transactions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  } catch (error) {
    console.error('Error getting platform fee transactions:', error);
    return [];
  }
};

interface CompanyWalletData {
  address: string;
  balance: number;
  totalFees: number;
  monthlyFees: number;
  transactionCount: number;
  lastTransaction: string;
  status: 'active' | 'inactive';
  wallet?: CompanyWalletType;
}

export default function CompanyWallet() {
  const [walletData, setWalletData] = useState<CompanyWalletData>({
    address: 'CompanyWallet1234567890abcdef',
    balance: 0,
    totalFees: 0,
    monthlyFees: 0,
    transactionCount: 0,
    lastTransaction: '',
    status: 'active'
  });
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  // const [isGeneratingWallet, setIsGeneratingWallet] = useState(false);
  // const [showMnemonic, setShowMnemonic] = useState(false);
  const [transactions, setTransactions] = useState<Array<{
    id: string;
    type: 'fee_collection' | 'transfer' | 'withdrawal';
    amount: number;
    from: string;
    to?: string;
    timestamp: string;
    status: 'completed' | 'pending' | 'failed';
    description: string;
  }>>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);

  // Mock data - replace with actual API calls
  useEffect(() => {
    fetchWalletData();
    fetchTransactions();
  }, []);

  const fetchWalletData = async () => {
    setLoading(true);
    try {
      // Check for stored company wallet first
      const storedWallet = getStoredCompanyWallet();
      
      if (storedWallet && storedWallet.address) {
        // Use stored wallet data
        setWalletData({
          address: storedWallet.address,
          balance: 0, // Will be fetched from blockchain
          totalFees: 0,
          monthlyFees: 0,
          transactionCount: 0,
          lastTransaction: '',
          status: 'active',
          wallet: storedWallet as CompanyWalletType
        });
      } else {
        // No wallet found, show placeholder
        setWalletData({
          address: '',
          balance: 0,
          totalFees: 0,
          monthlyFees: 0,
          transactionCount: 0,
          lastTransaction: '',
          status: 'inactive'
        });
      }
    } catch (error) {
      console.error('Error fetching wallet data:', error);
      toast.error('Failed to fetch wallet data');
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    setIsLoadingTransactions(true);
    try {
      // Get platform fee transactions from localStorage
      const platformFeeTransactions = getPlatformFeeTransactions();
      // Calculate totals
      const totalFees = platformFeeTransactions.reduce((sum, tx) => sum + tx.amount, 0);
      const monthlyFees = platformFeeTransactions
        .filter(tx => {
          const txDate = new Date(tx.timestamp);
          const now = new Date();
          return txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear();
        })
        .reduce((sum, tx) => sum + tx.amount, 0);
      
      // Update wallet data with calculated totals
      setWalletData(prev => ({
        ...prev,
        totalFees,
        monthlyFees,
        transactionCount: platformFeeTransactions.length,
        lastTransaction: platformFeeTransactions.length > 0 ? platformFeeTransactions[0].timestamp : ''
      }));
      
      setTransactions(platformFeeTransactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error('Failed to fetch transactions');
    } finally {
      setIsLoadingTransactions(false);
    }
  };

  const refreshBalance = async () => {
    setIsRefreshing(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      await fetchWalletData();
      await fetchTransactions();
      toast.success('Balance and transactions refreshed successfully');
    } catch (error) {
      console.error('Error refreshing balance:', error);
      toast.error('Failed to refresh balance');
    } finally {
      setIsRefreshing(false);
    }
  };

  const clearOldTransactions = () => {
    try {
      // Clear transactions older than 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key && key.startsWith('platform_fee_')) {
          const transactionData = JSON.parse(localStorage.getItem(key) || '{}');
          if (transactionData.timestamp) {
            const txDate = new Date(transactionData.timestamp);
            if (txDate < thirtyDaysAgo) {
              localStorage.removeItem(key);
            }
          }
        }
      }
      
      toast.success('Old transactions cleared');
      fetchTransactions(); // Refresh the display
    } catch (error) {
      console.error('Error clearing old transactions:', error);
      toast.error('Failed to clear old transactions');
    }
  };

  // const copyAddress = () => {
  //   navigator.clipboard.writeText(walletData.address);
  //   toast.success('Address copied to clipboard');
  // };

  // const generateNewWallet = async () => {
  //   setIsGeneratingWallet(true);
  //   try {
  //     const newWallet = await generateAndStoreCompanyWallet();
      
  //     setWalletData(prev => ({
  //       ...prev,
  //       address: newWallet.address,
  //       status: 'active',
  //       wallet: newWallet
  //     }));
      
  //     toast.success('Company wallet generated successfully!');
  //     setShowMnemonic(true);
  //   } catch (error) {
  //     console.error('Error generating wallet:', error);
  //     toast.error('Failed to generate company wallet');
  //   } finally {
  //     setIsGeneratingWallet(false);
  //   }
  // };

  // const clearWallet = () => {
  //   clearStoredCompanyWallet();
  //   setWalletData({
  //     address: '',
  //     balance: 0,
  //     totalFees: 0,
  //     monthlyFees: 0,
  //     transactionCount: 0,
  //     lastTransaction: '',
  //     status: 'inactive'
  //   });
  //   setShowMnemonic(false);
  //   toast.success('Company wallet cleared');
  // };

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

  return (
    <div className="space-y-6 container mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            Company Wallet
          </h2>
         
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshBalance}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={clearOldTransactions}
          >
            Clear Old
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              console.log('=== DEBUG: All localStorage keys ===');
              for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith('platform_fee_')) {
                  const data = localStorage.getItem(key);
                  console.log(`Key: ${key}`, JSON.parse(data || '{}'));
                }
              }
              console.log('=== END DEBUG ===');
              fetchTransactions(); // Refresh the display
            }}
          >
            Debug
          </Button>
          <p className="text-stone-600 dark:text-stone-400 text-sm flex items-center">
            <Wallet className="h-4 w-4 mr-1" />
            {walletData.address || 'N/A'}
          </p>
        </div>
      </div>

      {/* Wallet Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-stone-600 dark:text-stone-400">
                  Current Balance
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {loading ? '...' : formatCurrency(walletData.balance)}
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
                  Total Fees Collected
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {loading ? '...' : formatCurrency(walletData.totalFees)}
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
                  This Month
                </p>
                <p className="text-2xl font-bold text-purple-600">
                  {loading ? '...' : formatCurrency(walletData.monthlyFees)}
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
                  Transactions
                </p>
                <p className="text-2xl font-bold text-orange-600">
                  {loading ? '...' : walletData.transactionCount.toLocaleString()}
                </p>
              </div>
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <RefreshCw className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card className="py-6 border-stone-200 dark:border-stone-700 space-y-4 mb-12" >
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Recent Transactions
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchTransactions}
              disabled={isLoadingTransactions}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingTransactions ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingTransactions ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-stone-400" />
              <span className="ml-2 text-stone-600 dark:text-stone-400">Loading transactions...</span>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8">
              <DollarSign className="h-12 w-12 text-stone-300 dark:text-stone-600 mx-auto mb-4" />
              <p className="text-stone-600 dark:text-stone-400">No platform fee transactions yet</p>
              <p className="text-sm text-stone-500 dark:text-stone-500">Platform fees will appear here when users create franchises or buy shares</p>
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 border border-stone-200 dark:border-stone-700 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${
                      transaction.type === 'fee_collection' 
                        ? 'bg-green-100 dark:bg-green-900/30' 
                        : transaction.type === 'transfer'
                        ? 'bg-blue-100 dark:bg-blue-900/30'
                        : 'bg-orange-100 dark:bg-orange-900/30'
                    }`}>
                      {transaction.type === 'fee_collection' ? (
                        <DollarSign className="h-4 w-4 text-green-600" />
                      ) : transaction.type === 'transfer' ? (
                        <TrendingUp className="h-4 w-4 text-blue-600" />
                      ) : (
                        <Building2 className="h-4 w-4 text-orange-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-sm text-stone-600 dark:text-stone-400">
                        {transaction.type === 'fee_collection' ? 'From' : transaction.type === 'transfer' ? 'To' : 'From'} {transaction.from}
                        {transaction.to && ` → ${transaction.to}`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <p className={`font-bold ${
                        transaction.type === 'fee_collection' 
                          ? 'text-green-600' 
                          : 'text-stone-600 dark:text-stone-400'
                      }`}>
                        {transaction.type === 'fee_collection' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </p>
                      <Badge 
                        variant={transaction.status === 'completed' ? 'default' : transaction.status === 'pending' ? 'secondary' : 'destructive'}
                        className="text-xs"
                      >
                        {transaction.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-stone-600 dark:text-stone-400">
                      {formatDate(transaction.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {transactions.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <Button variant="outline" size="sm" className="w-full">
                View All Transactions
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
