import React from 'react';
import Image from 'next/image';
import { Building2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FranchiseShare {
  id: string;
  brandLogo: string;
  name: string;
  location: {
    area: string;
    city: string;
    country: string;
  };
  stage: string;
  invested: number;
  earned: number;
  isOfferActive: boolean;
}

export default function SharesTab() {
  // Mock data - in a real app, this would come from an API
  const franchiseShares: FranchiseShare[] = [
    {
      id: '1',
      brandLogo: '/logo/logo-4.svg',
      name: 'Hubcv - 01',
      location: {
        area: 'Downtown',
        city: 'New York',
        country: 'USA'
      },
      stage: 'Funding',
      invested: 5000,
      earned: 1200,
      isOfferActive: true
    },
    {
      id: '3',
      brandLogo: '/logo/logo-4.svg',
      name: 'Hubcv - 03',
      location: {
        area: 'Downtown',
        city: 'New York',
        country: 'USA'
      },
      stage: 'Launching',
      invested: 5000,
      earned: 1200,
      isOfferActive: true
    },
    {
      id: '2',
      brandLogo: '/logo/logo-4.svg',
      name: 'Hubcv - 02',
      location: {
        area: 'Financial District',
        city: 'San Francisco',
        country: 'USA'
      },
      stage: 'Live',
      invested: 10000,
      earned: 2500,
      isOfferActive: false
    }
  ];

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
            className="w-64  border border-stone-200 py-2 pl-10 pr-4 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>
      </div>
      
      <div className="overflow-hidden  border border-stone-200 dark:border-stone-700">
        <table className="min-w-full divide-y divide-stone-200 dark:divide-stone-700">
          <thead className="bg-stone-50 dark:bg-stone-800">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-stone-500">
                Franchise
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-stone-500">
                Location
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-stone-500">
                Stage
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-stone-500">
                Invested
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
            {franchiseShares.map((franchise) => (
              <tr key={franchise.id} className="hover:bg-stone-50 dark:hover:bg-stone-800">
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="flex items-center">
                    <div className="h-10 w-10 flex-shrink-0">
                      {franchise.brandLogo ? (
                        <Image
                          src={franchise.brandLogo}
                          alt={franchise.name}
                          width={40}
                          height={40}
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center  bg-stone-100 dark:bg-stone-700">
                          <Building2 className="h-5 w-5 text-stone-400" />
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-stone-900 dark:text-white">{franchise.name}</div>
                    </div>
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-stone-500">
                  {franchise.location.area}, {franchise.location.city}, {franchise.location.country}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-stone-500">
                  <span className="inline-flex items-center  bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/20 dark:text-green-400">
                    {franchise.stage}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                  ${franchise.invested.toLocaleString()}
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
