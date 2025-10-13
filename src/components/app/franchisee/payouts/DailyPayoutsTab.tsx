import React from 'react';
import { Search, Receipt } from 'lucide-react';
import { Card } from '@/components/ui/card';
import Image from 'next/image';
// import { useQuery } from 'convex/react';
// import { api } from '../../../../../convex/_generated/api';
import { useAuth } from '@/contexts/AuthContext';

export default function DailyPayoutsTab() {
  const { userProfile } = useAuth();
  const investorId = userProfile?.walletAddress;

  console.log('DailyPayoutsTab - investorId:', investorId);
  console.log('DailyPayoutsTab - userProfile:', userProfile);

  // Get all payouts for this investor across all franchises
  // Temporarily set to empty array until Convex deploys the new function
  // const payouts = useQuery(
  //   api.payoutManagement.getAllInvestorPayouts,
  //   investorId ? { investorId } : "skip"
  // );
  
  // Temporary: Return empty array until Convex function is deployed
  const payouts: Array<{
    _id: string;
    payoutId: string;
    franchiseId: string;
    investorId: string;
    shares: number;
    totalShares: number;
    sharePercentage: number;
    payoutAmount: number;
    period: string;
    status: string;
    createdAt: number;
    franchise: {
      _id: string;
      franchiseSlug: string;
      businessName: string;
      stage: string;
      status: string;
    } | null;
    franchisePayout: {
      grossRevenue: number;
      distributionRule: string;
      reservePercentage: number;
    } | null;
  }> = [];

  console.log('DailyPayoutsTab - payouts:', payouts);
  console.log('DailyPayoutsTab - Using temporary null payouts until getAllInvestorPayouts is deployed to Convex');

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      completed: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      failed: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
    };

    return (
      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusClasses[status as keyof typeof statusClasses] || ''}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // Calculate total payouts
  const totalPayout = payouts?.reduce((sum, payout) => sum + payout.payoutAmount, 0) || 0;
  const averagePayout = payouts && payouts.length > 0 ? totalPayout / payouts.length : 0;
  const activeFranchises = payouts ? new Set(payouts.map(p => p.franchiseId)).size : 0;

  if (!investorId) {
    return (
      <div className="text-center py-12">
        <Receipt className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Wallet Not Connected</h3>
        <p className="text-gray-600 dark:text-gray-400">
          Please connect your wallet to view your payouts.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold text-stone-900 dark:text-white">PAYOUTS</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Search payouts..."
              className="pl-10 pr-4 py-2 border border-stone-300 dark:border-stone-600 rounded-md text-sm focus:ring-amber-500 focus:border-amber-500 dark:bg-stone-800 dark:text-white"
            />
          </div>
        </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <p className="text-sm text-stone-600 dark:text-stone-300">Total Earnings</p>
          <p className="text-2xl font-bold text-green-600">${totalPayout.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
          <p className="text-xs text-stone-500 dark:text-stone-400">All time</p>
        </Card>
        
        <Card className="p-4">
          <p className="text-sm text-stone-600 dark:text-stone-300">Average Payout</p>
          <p className="text-2xl font-bold">${averagePayout.toFixed(2)}</p>
          <p className="text-xs text-stone-500 dark:text-stone-400">Per distribution</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-stone-600 dark:text-stone-300">Active Franchises</p>
          <p className="text-2xl font-bold text-blue-600">
            {activeFranchises}
          </p>
          <p className="text-xs text-stone-500 dark:text-stone-400">Generating payouts</p>
        </Card>
      </div>

      {/* Payouts Table */}
      <div className="border border-stone-200 dark:border-stone-700 overflow-hidden rounded-lg">
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-stone-200 dark:divide-stone-700">
            <thead className="bg-stone-50 dark:bg-stone-800">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-stone-500 dark:text-stone-300 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-stone-500 dark:text-stone-300 uppercase tracking-wider">
                  Franchise
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-stone-500 dark:text-stone-300 uppercase tracking-wider">
                  Revenue
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-stone-500 dark:text-stone-300 uppercase tracking-wider">
                  Your Shares
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-stone-500 dark:text-stone-300 uppercase tracking-wider">
                  Share %
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-stone-500 dark:text-stone-300 uppercase tracking-wider">
                  Your Payout
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-stone-500 dark:text-stone-300 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-stone-900 divide-y divide-stone-200 dark:divide-stone-700">
              {payouts && payouts.length > 0 ? payouts.map((payout) => (
                <tr key={payout._id} className="hover:bg-stone-50 dark:hover:bg-stone-800">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-500 dark:text-stone-400">
                    {new Date(payout.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-stone-100 dark:bg-stone-700 rounded-lg flex items-center justify-center overflow-hidden">
                        <Image 
                          className="h-10 w-10 object-contain" 
                          width={40} 
                          height={40} 
                          src="/logo/logo-4.svg" 
                          alt={payout.franchise?.businessName || 'Franchise'} 
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-stone-900 dark:text-white">
                          {payout.franchise?.franchiseSlug || 'Unknown'}
                        </div>
                        <div className="text-xs text-stone-500 dark:text-stone-400">
                          {payout.period}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-stone-900 dark:text-white">
                    ${payout.franchisePayout?.grossRevenue?.toLocaleString() || '0'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-stone-500 dark:text-stone-400">
                    {payout.shares.toLocaleString()} / {payout.totalShares.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-stone-500 dark:text-stone-400">
                    {payout.sharePercentage.toFixed(2)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-green-600">
                    +${payout.payoutAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    {getStatusBadge(payout.status)}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <Receipt className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                      No Payouts Yet
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400">
                      You haven&apos;t received any payouts yet. Payouts will appear here once franchises start generating revenue.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Footer with count */}
        {payouts && payouts.length > 0 && (
          <div className="bg-white dark:bg-stone-900 px-6 py-3 border-t border-stone-200 dark:border-stone-700">
            <p className="text-sm text-stone-700 dark:text-stone-300">
              Showing <span className="font-medium">{payouts.length}</span> payout{payouts.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
