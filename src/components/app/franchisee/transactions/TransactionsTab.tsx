"use client";

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Download, 
  ArrowUpDown, 
  ArrowUpRight, 
  ArrowDownLeft,
  ExternalLink,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { useSolana } from '@/components/solana/use-solana';
import { useAuth } from '@/contexts/PrivyAuthContext';
import { useQuery } from 'convex/react';
import { api } from '../../../../../convex/_generated/api';

interface Transaction {
  id: string;
  type: 'share_purchase' | 'dividend' | 'withdrawal' | 'deposit' | 'refund';
  amount: number;
  amountSOL: number;
  description: string;
  franchiseSlug?: string;
  status: 'pending' | 'confirmed' | 'failed';
  transactionHash?: string;
  timestamp: number;
  fromAddress?: string;
  toAddress?: string;
  sharesPurchased?: number;
  sharePrice?: number;
}

export default function TransactionsTab() {
  const { account } = useSolana();
  const { userProfile } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Use the wallet address from user profile (generated wallet) instead of connected wallet
  const walletAddress = userProfile?.walletAddress;

  // Get shares data to create transaction history
  const sharesData = useQuery(api.franchiseManagement.getSharesByInvestor, { 
    investorId: walletAddress || 'no-wallet'
  });

  // Debug logging
  console.log('TransactionsTab Debug:', {
    walletAddress,
    connectedWallet: account?.address,
    sharesData: sharesData,
    sharesCount: sharesData?.length || 0
  });

  // Load transactions from localStorage and convert shares to transactions
  useEffect(() => {
    const loadTransactions = () => {
      try {
        // Get transactions from localStorage
        const storedTransactions = localStorage.getItem(`transactions_${walletAddress}`);
        const parsedTransactions: Transaction[] = storedTransactions ? JSON.parse(storedTransactions) : [];

        // Convert shares data to transactions
        const shareTransactions: Transaction[] = sharesData?.map(share => ({
            id: share._id,
          type: 'share_purchase' as const,
            amount: share.totalAmount,
            amountSOL: share.totalAmount / 150, // Convert USD to SOL (approximate)
          description: `Purchased ${share.sharesPurchased} shares in ${share.franchise?.franchiseSlug || 'Unknown Franchise'}`,
            franchiseSlug: share.franchise?.franchiseSlug,
          status: 'confirmed' as const,
          transactionHash: share.transactionHash,
          timestamp: share.purchasedAt,
            sharesPurchased: share.sharesPurchased,
            sharePrice: share.sharePrice,
          toAddress: 'franchise_pda'
        })) || [];

        // Combine stored transactions with share transactions
        const allTransactions = [...parsedTransactions, ...shareTransactions]
          .sort((a, b) => b.timestamp - a.timestamp); // Sort by newest first

        setTransactions(allTransactions);
      } catch (error) {
        console.error('Error loading transactions:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTransactions();
  }, [walletAddress, sharesData]);

  // Add a new transaction (for testing/demo purposes)
  const addTestTransaction = () => {
    const newTransaction: Transaction = {
      id: `test_${Date.now()}`,
      type: 'share_purchase',
      amount: 100,
      amountSOL: 0.67,
      description: 'Test share purchase',
      franchiseSlug: 'test-franchise',
      status: 'confirmed',
      transactionHash: `test_hash_${Math.random().toString(36).substring(2, 15)}`,
      timestamp: Date.now(),
      sharesPurchased: 10,
      sharePrice: 10
    };

    const updatedTransactions = [newTransaction, ...transactions];
    setTransactions(updatedTransactions);
    
    // Save to localStorage
    localStorage.setItem(`transactions_${walletAddress}`, JSON.stringify(updatedTransactions));
  };

  // Filter transactions based on search and type filter
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         transaction.franchiseSlug?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         transaction.transactionHash?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = filterType === 'all' || transaction.type === filterType;
    
    return matchesSearch && matchesType;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'share_purchase':
        return <ArrowUpRight className="h-4 w-4 text-blue-500" />;
      case 'dividend':
        return <ArrowDownLeft className="h-4 w-4 text-green-500" />;
      case 'withdrawal':
        return <ArrowUpRight className="h-4 w-4 text-red-500" />;
      case 'deposit':
        return <ArrowDownLeft className="h-4 w-4 text-green-500" />;
      default:
        return <ArrowUpDown className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatAmount = (amount: number, amountSOL: number) => {
    return (
      <div className="text-right">
        <div className="font-medium">${amount.toLocaleString()}</div>
        <div className="text-xs text-gray-500">{amountSOL.toFixed(4)} SOL</div>
      </div>
    );
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading transactions...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show no wallet available state
  if (!walletAddress) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <ArrowUpDown className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg font-medium">No Wallet Available</p>
            <p className="text-gray-400 text-sm mt-1">Please sign up or login to get a wallet address and view your transactions</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Transaction History</h2>
          <p className="text-gray-600 dark:text-gray-400">
            View all your share purchases, dividends, and other transactions
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={addTestTransaction}>
            Add Test Transaction
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search transactions, franchises, or transaction hash..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md bg-white dark:bg-gray-800 dark:border-gray-600"
        >
          <option value="all">All Types</option>
          <option value="share_purchase">Share Purchases</option>
          <option value="dividend">Dividends</option>
          <option value="withdrawal">Withdrawals</option>
          <option value="deposit">Deposits</option>
          <option value="refund">Refunds</option>
        </select>
      </div>

      {/* Transactions List */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Transaction
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Franchise
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Hash
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {getTypeIcon(transaction.type)}
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {transaction.description}
                          </div>
                          {transaction.sharesPurchased && (
                            <div className="text-xs text-gray-500">
                              {transaction.sharesPurchased} shares @ ${transaction.sharePrice}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                        {transaction.type.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {transaction.franchiseSlug || '-'}
                    </td>
                    <td className="px-6 py-4">
                      {formatAmount(transaction.amount, transaction.amountSOL)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {getStatusIcon(transaction.status)}
                        <span className="ml-2 text-sm text-gray-900 dark:text-white capitalize">
                          {transaction.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(transaction.timestamp).toLocaleDateString()} {new Date(transaction.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="px-6 py-4">
                      {transaction.transactionHash ? (
                        <div className="flex items-center">
                          <button
                            onClick={() => copyToClipboard(transaction.transactionHash!)}
                            className="text-xs font-mono text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            {transaction.transactionHash.slice(0, 8)}...{transaction.transactionHash.slice(-8)}
                          </button>
                          <ExternalLink className="h-3 w-3 ml-1 text-gray-400" />
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="text-center">
                      <ArrowUpDown className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg font-medium">No transactions found</p>
                      <p className="text-gray-400 text-sm mt-1">
                        {searchQuery || filterType !== 'all' 
                          ? 'Try adjusting your search or filters' 
                          : 'Your transaction history will appear here'
                        }
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Summary Stats */}
      {filteredTransactions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Transactions</p>
                <p className="text-xl font-bold">{filteredTransactions.length}</p>
              </div>
              <ArrowUpDown className="h-6 w-6 text-blue-500" />
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Amount</p>
                <p className="text-xl font-bold">
                  ${filteredTransactions.reduce((sum, t) => sum + t.amount, 0).toLocaleString()}
                </p>
              </div>
              <ArrowUpRight className="h-6 w-6 text-green-500" />
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Share Purchases</p>
                <p className="text-xl font-bold">
                  {filteredTransactions.filter(t => t.type === 'share_purchase').length}
                </p>
              </div>
              <CheckCircle className="h-6 w-6 text-purple-500" />
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
