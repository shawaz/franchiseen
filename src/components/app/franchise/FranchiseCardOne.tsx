// client/src/components/app/FranchiseCard.tsx
"use client";

import Image from "next/image";
import Link from "next/link";

interface FranchiseCardProps {
  franchise: {
    id: string;
    brand: {
      id: string;
      name: string;
      logo: string;
      industry: string;
      category: string;
    };
    location: {
      area: string;
      city: string;
      country: string;
    };
    wallet: {
      balance: number;
      currency: string;
    };
    investment: {
      total: number;
      raised: number;
      shares: number;
      sharePrice: number;
    };
    status: string;
  };
  returnRate?: number;
  type?: 'fund' | 'launch' | 'live';
}

export default function FranchiseCard({ franchise, returnRate, type }: FranchiseCardProps) {
  const progress = Math.min(100, (franchise.investment.raised / franchise.investment.total) * 100);
  
  return (
    <div className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="p-4">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 relative">
            <Image
              src={franchise.brand.logo}
              alt={franchise.brand.name}
              fill
              className="object-contain"
            />
            {type && (
              <span className="absolute -top-2 -right-2 bg-primary text-white text-xs px-2 py-1 rounded-full">
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </span>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-lg">{franchise.brand.name}</h3>
            <div className="text-sm text-muted-foreground">
              {franchise.brand.industry} • {franchise.brand.category}
              {returnRate && (
                <span className="ml-2 text-green-600 font-medium">
                  {returnRate}% ROI
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <p className="text-sm text-gray-500">Location</p>
            <p>{franchise.location.area}, {franchise.location.city}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Wallet Balance</p>
            <p>{franchise.wallet.balance.toLocaleString()} {franchise.wallet.currency}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Investment Progress</p>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
              <div
                className="bg-primary h-2.5 rounded-full"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span>{progress.toFixed(1)}% Funded</span>
              <span>
                {franchise.investment.raised.toLocaleString()} / {franchise.investment.total.toLocaleString()} {franchise.wallet.currency}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-between items-center">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            franchise.status === 'Active' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {franchise.status}
          </span>
          <Link 
            href={`/franchises/${franchise.id}`}
            className="text-primary hover:underline text-sm font-medium"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}