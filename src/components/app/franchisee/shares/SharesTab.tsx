import React, { useState } from 'react';
import Image from 'next/image';
import { Building2, Search } from 'lucide-react';
import { useQuery } from 'convex/react';
import { api } from '../../../../../convex/_generated/api';
import { useRouter } from 'next/navigation';
import { useSolana } from '@/components/solana/use-solana';
import { useConvexImageUrl } from '@/hooks/useConvexImageUrl';
import { useAuth } from '@/contexts/PrivyAuthContext';
import { Id } from '../../../../../convex/_generated/dataModel';

interface FranchiseShare {
  id: string;
  brandLogo: string;
  name: string;
  franchiseSlug: string;
  brandSlug: string;
  location: {
    area: string;
    city: string;
    country: string;
  };
  stage: string;
  invested: number;
  earned: number;
  isOfferActive: boolean;
  totalShares: number;
  sharePrice: number;
}

export default function SharesTab() {
  const router = useRouter();
  const { account } = useSolana();
  const { userProfile } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Use the wallet address from user profile (generated wallet) instead of connected wallet
  const walletAddress = userProfile?.walletAddress;
  
  // Get shares data from Convex
  const sharesData = useQuery(api.franchiseManagement.getSharesByInvestor, { 
    investorId: walletAddress || 'no-wallet' // Use generated wallet address
  });

  // Debug logging
  console.log('SharesTab Debug:', {
    walletAddress,
    connectedWallet: account?.address,
    sharesData: sharesData,
    sharesCount: sharesData?.length || 0,
    userProfile: userProfile,
    franchiseStages: sharesData?.map(share => ({
      franchiseSlug: share.franchise?.franchiseSlug,
      status: share.franchise?.status,
      stage: share.franchise?.stage
    }))
  });

  // Group shares by franchise and aggregate data
  const franchiseSharesMap = new Map<string, {
    id: string;
    brandLogo: string;
    name: string;
    franchiseSlug: string;
    brandSlug: string;
    location: {
      area: string;
      city: string;
      country: string;
    };
    stage: string;
    invested: number;
    earned: number;
    isOfferActive: boolean;
    totalShares: number;
    sharePrice: number;
  }>();

  sharesData?.forEach((share) => {
    const franchiseSlug = share.franchise?.franchiseSlug || 'Unknown Franchise';
    const existing = franchiseSharesMap.get(franchiseSlug);
    
    if (existing) {
      // Aggregate data for existing franchise
      existing.invested += share.totalAmount;
      existing.totalShares += share.sharesPurchased;
      // Keep the most recent stage (use actual stage field)
      existing.stage = share.franchise?.stage === 'ongoing' ? 'Live' : 
                      share.franchise?.stage === 'launching' ? 'Launching' : 
                      share.franchise?.stage === 'closed' ? 'Closed' : 'Funding';
    } else {
      // Create new franchise entry
      franchiseSharesMap.set(franchiseSlug, {
        id: share._id,
        brandLogo: share.franchise?.franchiser?.logoUrl || '/logo/logo-4.svg',
        name: franchiseSlug,
        franchiseSlug: franchiseSlug,
        brandSlug: share.franchise?.franchiser?.slug || '',
        location: {
          area: share.franchise?.buildingName || 'Unknown Area',
          city: share.franchise?.address?.split(',')[1]?.trim() || 'Unknown City',
          country: share.franchise?.address?.split(',').pop()?.trim() || 'Unknown Country'
        },
        stage: share.franchise?.stage === 'ongoing' ? 'Live' : 
               share.franchise?.stage === 'launching' ? 'Launching' : 
               share.franchise?.stage === 'closed' ? 'Closed' : 'Funding',
        invested: share.totalAmount,
        earned: 0, // This would need to be calculated from actual earnings
        isOfferActive: true, // This would be determined by business logic
        totalShares: share.sharesPurchased,
        sharePrice: share.sharePrice
      });
    }
  });

  // Convert map to array for display
  const allFranchiseShares: FranchiseShare[] = Array.from(franchiseSharesMap.values());

  // Filter franchises based on search query
  const franchiseShares = allFranchiseShares.filter(franchise => 
    franchise.franchiseSlug.toLowerCase().includes(searchQuery.toLowerCase()) ||
    franchise.brandSlug.toLowerCase().includes(searchQuery.toLowerCase()) ||
    franchise.location.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
    franchise.location.country.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Show loading state
  if (sharesData === undefined) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">My Franchise Shares</h2>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-yellow-500"></div>
        </div>
      </div>
    );
  }

  // Show no wallet available state
  if (!walletAddress) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">My Franchise Shares</h2>
        </div>
        <div className="text-center py-8">
          <p className="text-gray-500">Please sign up or login to get a wallet address and view your shares</p>
        </div>
      </div>
    );
  }

  const toggleOffer = (id: string) => {
    // In a real app, this would update the backend
    console.log(`Toggling offer for franchise ${id}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">My Franchise Shares</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
          <input
            type="text"
            placeholder="Search franchises..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-64  border border-stone-200 py-2 pl-10 pr-4 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>
      </div>
      
      {franchiseShares.length === 0 ? (
        <div className="text-center py-8">
          <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">
            {searchQuery ? 'No franchises found matching your search' : 'No franchise shares found'}
          </p>
          <p className="text-sm text-gray-400 mt-2">
            {searchQuery ? 'Try adjusting your search terms' : 'Start investing in franchises to see your shares here'}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden  border border-stone-200 dark:border-stone-700">
          <table className="min-w-full divide-y divide-stone-200 dark:divide-stone-700">
            <thead className="bg-stone-50 dark:bg-stone-800">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-stone-500">
                  Franchise
                </th>
                {/* <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-stone-500">
                  Location
                </th> */}
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-stone-500">
                  Stage
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-stone-500">
                  Total Invested
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-stone-500">
                  Total Shares
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-stone-500">
                  Earned
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-stone-500">
                  Open to Offer
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200 bg-white dark:divide-stone-700 dark:bg-stone-900">
              {franchiseShares.map((franchise) => {
                const FranchiseLogo = () => {
                  const logoUrl = useConvexImageUrl(franchise.brandLogo as Id<"_storage">);
                  
                  return (
                    <div className="h-10 w-10 flex-shrink-0">
                      {logoUrl ? (
                        <Image
                          src={logoUrl}
                          alt={franchise.name}
                          width={40}
                          height={40}
                          className="object-contain"
                          unoptimized
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center bg-stone-100 dark:bg-stone-700">
                          <Building2 className="h-5 w-5 text-stone-400" />
                        </div>
                      )}
                    </div>
                  );
                };

                return (
                  <tr key={franchise.id} className="hover:bg-stone-50 dark:hover:bg-stone-800">
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center">
                        <FranchiseLogo />
                        <div className="ml-4">
                          <button 
                            onClick={() => router.push(`/${franchise.brandSlug}/${franchise.franchiseSlug}`)}
                            className="text-sm font-medium text-stone-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer"
                          >
                            {franchise.franchiseSlug}
                          </button>
                        </div>
                      </div>
                    </td>
                  {/* <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-stone-500">
                    {franchise.location.area}, {franchise.location.city}, {franchise.location.country}
                  </td> */}
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-stone-500">
                    <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full ${
                      franchise.stage === 'Live' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                      franchise.stage === 'Launching' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                      franchise.stage === 'Closed' ? 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400' :
                      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                    }`}>
                      {franchise.stage}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                    ${franchise.invested.toLocaleString()}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                    {franchise.totalShares.toLocaleString()}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium text-green-600">
                    +${franchise.earned.toLocaleString()}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                    <button
                      onClick={() => toggleOffer(franchise.id)}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer  border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 ${
                        franchise.isOfferActive ? 'bg-amber-600' : 'bg-stone-200'
                      }`}
                      role="switch"
                      aria-checked={franchise.isOfferActive}
                    >
                      <span className="sr-only">Toggle offer</span>
                      <span
                        aria-hidden="true"
                        className={`pointer-events-none inline-block h-5 w-5 transform  bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          franchise.isOfferActive ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
