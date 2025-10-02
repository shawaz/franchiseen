import React, { useState } from 'react';
import { FileText, Search, Download, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import Image from 'next/image';
import { useQuery } from 'convex/react';
import { api } from '../../../../../convex/_generated/api';
import { useSolana } from '@/components/solana/use-solana';
import { useConvexImageUrl } from '@/hooks/useConvexImageUrl';
import { Id } from '../../../../../convex/_generated/dataModel';

// Helper function to validate URLs
// const isValidUrl = (url: string): boolean => {
//   try {
//     new URL(url);
//     return true;
//   } catch {
//     return false;
//   }
// };

interface Invoice {
  id: string;
  date: string;
  type: 'purchase' | 'transfer' | 'dividend';
  franchise: {
    id: string;
    name: string;
    brandLogo: string;
  };
  shares: number;
  pricePerShare: number;
  subtotal: number;
  platformFee: number;
  total: number;
  status: 'paid' | 'pending' | 'failed' | 'refunded';
  transactionHash?: string;
}

// Franchise Logo Component
const FranchiseLogo: React.FC<{ franchise: { name: string; brandLogo: string } }> = ({ franchise }) => {
  const logoUrl = useConvexImageUrl(franchise.brandLogo as Id<"_storage">);
  
  return (
    <div className="h-10 w-10 rounded-md">
      {logoUrl ? (
        <Image
          src={logoUrl}
          alt={franchise.name}
          width={40}
          height={40}
          className="h-10 w-10 rounded-md object-contain"
          unoptimized
        />
      ) : (
        <div className="h-10 w-10 rounded-md bg-stone-100 dark:bg-stone-700 flex items-center justify-center">
          <FileText className="h-5 w-5 text-stone-400" />
        </div>
      )}
    </div>
  );
};

export default function InvoicesTab() {
  const { account } = useSolana();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Get invoices data from Convex
  const invoicesData = useQuery(api.franchiseManagement.getInvoicesByInvestor, { 
    investorId: account?.address || 'no-wallet' // Use actual wallet address
  });

  // Transform the data for display
  const allInvoices: Invoice[] = invoicesData?.map((invoice) => {
    const sharesItem = invoice.items.find(item => item.description.includes('shares'));
    const shares = sharesItem?.quantity || 0;
    const pricePerShare = sharesItem ? sharesItem.unitPrice : 0;
    const subtotal = shares * pricePerShare;
    const platformFee = invoice.items.find(item => item.description.includes('Service fee'))?.total || 0;
    
    return {
      id: invoice.invoiceNumber,
      date: new Date(invoice.createdAt).toISOString().split('T')[0],
      type: 'purchase' as const,
      franchise: {
        id: invoice.franchise?._id || 'unknown',
        name: invoice.franchise?.businessName || 'Unknown Franchise',
        brandLogo: invoice.franchise?.franchiser?.logoUrl || '/logo/logo-4.svg',
      },
      shares,
      pricePerShare,
      subtotal,
      platformFee,
      total: invoice.amount,
      status: invoice.status === 'paid' ? 'paid' : 
              invoice.status === 'sent' ? 'pending' : 'failed',
      transactionHash: invoice.transactionHash,
    };
  }) || [];

  // Filter invoices based on search query
  const invoices = allInvoices.filter(invoice => 
    invoice.franchise.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    invoice.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    invoice.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (invoice.transactionHash && invoice.transactionHash.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      paid: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      failed: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
      refunded: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
    };

    return (
      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
        statusClasses[status as keyof typeof statusClasses] || ''
      }`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getTypeIcon = (type: string) => {
    const typeIcons = {
      purchase: <ArrowDownRight className="h-4 w-4 text-amber-600" />,
      transfer: <ArrowUpRight className="h-4 w-4 text-blue-600" />,
      dividend: <FileText className="h-4 w-4 text-green-600" />,
    };
    
    const typeLabels = {
      purchase: 'Purchase',
      transfer: 'Transfer',
      dividend: 'Dividend',
    };

    return (
      <div className="flex items-center space-x-2">
        <div className="p-1.5 rounded-full bg-amber-50 dark:bg-amber-900/30">
          {typeIcons[type as keyof typeof typeIcons]}
        </div>
        <span className="text-sm font-medium text-stone-700 dark:text-stone-300">
          {typeLabels[type as keyof typeof typeLabels]}
        </span>
      </div>
    );
  };

  // Show loading state
  if (invoicesData === undefined) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold text-stone-900 dark:text-white">INVOICES</h3>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-yellow-500"></div>
        </div>
      </div>
    );
  }

  // Show no wallet connected state
  if (!account?.address) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold text-stone-900 dark:text-white">INVOICES</h3>
        </div>
        <div className="text-center py-8">
          <p className="text-gray-500">Please connect your wallet to view your invoices</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Search */}
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-stone-900 dark:text-white">INVOICES</h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Search invoices..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 border border-stone-300 dark:border-stone-600 text-sm focus:ring-amber-500 focus:border-amber-500 dark:bg-stone-800 dark:text-white"
          />
        </div>
      </div>

      {/* Summary Cards */}
      {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <p className="text-sm text-stone-600 dark:text-stone-300">Total Spent</p>
          <p className="text-2xl font-bold">${totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
          <p className="text-xs text-stone-500 dark:text-stone-400">All transactions</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-stone-600 dark:text-stone-300">Platform Fees</p>
          <p className="text-2xl font-bold">${totalFees.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
          <p className="text-xs text-stone-500 dark:text-stone-400">Total fees paid</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-stone-600 dark:text-stone-300">Total Shares</p>
          <p className="text-2xl font-bold">{totalShares.toLocaleString()}</p>
          <p className="text-xs text-stone-500 dark:text-stone-400">Across all franchises</p>
        </Card>
      </div> */}

      {/* Invoices Table */}
      {invoices.length === 0 ? (
        <div className="text-center py-8">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">
            {searchQuery ? 'No invoices found matching your search' : 'No invoices found'}
          </p>
          <p className="text-sm text-gray-400 mt-2">
            {searchQuery ? 'Try adjusting your search terms' : 'Your invoice history will appear here'}
          </p>
        </div>
      ) : (
        <div className="border border-stone-200 dark:border-stone-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-stone-200 dark:divide-stone-700">
            <thead className="bg-stone-50 dark:bg-stone-800">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-stone-500 dark:text-stone-300 uppercase tracking-wider">
                  Transaction
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-stone-500 dark:text-stone-300 uppercase tracking-wider">
                  Franchise
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-stone-500 dark:text-stone-300 uppercase tracking-wider">
                  Shares
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-stone-500 dark:text-stone-300 uppercase tracking-wider">
                  Price/Share
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-stone-500 dark:text-stone-300 uppercase tracking-wider">
                  Platform Fee
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-stone-500 dark:text-stone-300 uppercase tracking-wider">
                  Total
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-stone-500 dark:text-stone-300 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-stone-900 divide-y divide-stone-200 dark:divide-stone-700">
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-stone-50 dark:hover:bg-stone-800">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <div className="text-sm font-medium text-stone-900 dark:text-white">
                        {getTypeIcon(invoice.type)}
                      </div>
                      <div className="text-xs text-stone-500 dark:text-stone-400">
                        {new Date(invoice.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </div>
                      <div className="text-xs font-mono text-stone-400">
                        {invoice.id}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <FranchiseLogo franchise={invoice.franchise} />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-stone-900 dark:text-white">
                          {invoice.franchise.name}
                        </div>
                        {invoice.transactionHash && (
                          <a 
                            href={`https://explorer.solana.com/tx/${invoice.transactionHash}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center"
                          >
                            View on Solana Explorer
                            <ArrowUpRight className="ml-1 h-3 w-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-stone-900 dark:text-white">
                    {invoice.shares.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-stone-500 dark:text-stone-400">
                    ${invoice.pricePerShare.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-stone-500 dark:text-stone-400">
                    ${invoice.platformFee.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="text-stone-900 dark:text-white">
                      ${invoice.total.toFixed(2)}
                    </div>
                    <div className="text-xs text-stone-500 dark:text-stone-400">
                      Subtotal: ${invoice.subtotal.toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    {getStatusBadge(invoice.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-amber-600 hover:text-amber-900 dark:text-amber-400 dark:hover:text-amber-300">
                      <Download className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
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
                Showing <span className="font-medium">1</span> to <span className="font-medium">{invoices.length}</span> of{' '}
                <span className="font-medium">{invoices.length}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-stone-300 bg-white text-sm font-medium text-stone-500 hover:bg-stone-50">
                  <span className="sr-only">Previous</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-stone-300 bg-white text-sm font-medium text-stone-500 hover:bg-stone-50">
                  <span className="sr-only">Next</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
        </div>
      )}
    </div>
  );
}
