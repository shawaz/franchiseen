import React from 'react';
import { Search } from 'lucide-react';
import { Card } from '@/components/ui/card';
import Image from 'next/image';

interface DailyPayout {
  id: string;
  date: string;
  franchise: {
    id: string;
    name: string;
    brandLogo: string;
  };
  totalRevenue: number;
  userShare: number;
  userPayout: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

export default function DailyPayoutsTab() {
  // Mock data - in a real app, this would come from an API
  const dailyPayouts: DailyPayout[] = [
    {
      id: '1',
      date: '2024-09-19',
      franchise: {
        id: '1',
        name: 'Hubcv - 01',
        brandLogo: '/logo/logo-4.svg',
      },
      totalRevenue: 5000,
      userShare: 0.1, // 10% share
      userPayout: 500, // 10% of 5000
      status: 'completed',
    },
    {
      id: '2',
      date: '2024-09-18',
      franchise: {
        id: '1',
        name: 'Hubcv - 01',
        brandLogo: '/logo/logo-4.svg',
      },
      totalRevenue: 4800,
      userShare: 0.1,
      userPayout: 480,
      status: 'completed',
    },
    {
      id: '3',
      date: '2024-09-17',
      franchise: {
        id: '2',
        name: 'Hubcv - 02',
        brandLogo: '/logo/logo-4.svg',
      },
      totalRevenue: 7500,
      userShare: 0.05, // 5% share
      userPayout: 375,
      status: 'completed',
    },
  ];

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
  const totalPayout = dailyPayouts.reduce((sum, payout) => sum + payout.userPayout, 0);
  const averageDailyPayout = dailyPayouts.length > 0 ? totalPayout / dailyPayouts.length : 0;

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
              className="pl-10 pr-4 py-2 border border-stone-300 dark:border-stone-600 text-sm focus:ring-amber-500 focus:border-amber-500 dark:bg-stone-800 dark:text-white"
            />
          </div>
        </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <p className="text-sm text-stone-600 dark:text-stone-300">Total Payouts</p>
          <p className="text-2xl font-bold">${totalPayout.toLocaleString()}</p>
          <p className="text-xs text-stone-500 dark:text-stone-400">All time</p>
        </Card>
        
        <Card className="p-4">
          <p className="text-sm text-stone-600 dark:text-stone-300">Average Daily</p>
          <p className="text-2xl font-bold">${averageDailyPayout.toFixed(2)}</p>
          <p className="text-xs text-stone-500 dark:text-stone-400">Based on {dailyPayouts.length} days</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-stone-600 dark:text-stone-300">Active Franchises</p>
          <p className="text-2xl font-bold">
            {new Set(dailyPayouts.map(p => p.franchise.id)).size}
          </p>
          <p className="text-xs text-stone-500 dark:text-stone-400">Generating revenue</p>
        </Card>
      </div>

      {/* Payouts Table */}
      <div className="border border-stone-200 dark:border-stone-700 overflow-hidden ">
        
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
                  Total Revenue
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-stone-500 dark:text-stone-300 uppercase tracking-wider">
                  Your Share
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
              {dailyPayouts.map((payout) => (
                <tr key={payout.id} className="hover:bg-stone-50 dark:hover:bg-stone-800">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-500 dark:text-stone-400">
                    {new Date(payout.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <Image className="h-10 w-10 rounded-md" width={100} height={100} src={payout.franchise.brandLogo} alt={payout.franchise.name} />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-stone-900 dark:text-white">{payout.franchise.name}</div>
                        <div className="text-sm text-stone-500 dark:text-stone-400">
                          {(payout.userShare * 100).toFixed(1)}% Share
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-stone-900 dark:text-white">
                    ${payout.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-stone-500 dark:text-stone-400">
                    {(payout.userShare * 100).toFixed(1)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-green-600">
                    +${payout.userPayout.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    {getStatusBadge(payout.status)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination would go here */}
        <div className="bg-white dark:bg-stone-900 px-4 py-3 flex items-center justify-between border-t border-stone-200 dark:border-stone-700 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button className="relative inline-flex items-center px-4 py-2 border border-stone-300 text-sm font-medium rounded-md text-stone-700 bg-white hover:bg-stone-50">
              Previous
            </button>
            <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-stone-300 text-sm font-medium rounded-md text-stone-700 bg-white hover:bg-stone-50">
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-stone-700 dark:text-stone-300">
                Showing <span className="font-medium">1</span> to <span className="font-medium">{dailyPayouts.length}</span> of{' '}
                <span className="font-medium">{dailyPayouts.length}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-stone-300 bg-white text-sm font-medium text-stone-500 hover:bg-stone-50">
                  <span className="sr-only">Previous</span>
                  {/* Heroicon name: solid/chevron-left */}
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-stone-300 bg-white text-sm font-medium text-stone-500 hover:bg-stone-50">
                  <span className="sr-only">Next</span>
                  {/* Heroicon name: solid/chevron-right */}
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
