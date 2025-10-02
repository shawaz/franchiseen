"use client";

import React, { useEffect, useState, use } from 'react';
import FranchiseStore from '@/components/app/franchise/store/FranchiseStore';
import { getStoredWallet } from '@/lib/solanaWalletUtils';

interface FranchiseAccountProps {
  params: Promise<{
    brandSlug: string;
    franchiseSlug: string;
  }>;
}

export default function FranchiseAccount({ params }: FranchiseAccountProps) {
  const resolvedParams = use(params);
  const [franchiseId, setFranchiseId] = useState(resolvedParams.franchiseSlug);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Handle the ID mismatch issue - try both formats
    const possibleIds = [
      resolvedParams.franchiseSlug,
      resolvedParams.franchiseSlug.replace(/(\d+)$/, (match) => match.padStart(2, '0')), // nike-5 -> nike-05
      resolvedParams.franchiseSlug.replace(/(\d+)$/, (match) => parseInt(match).toString()) // nike-05 -> nike-5
    ];
    
    // Check which ID has a stored wallet
    let actualFranchiseId = resolvedParams.franchiseSlug;
    
    for (const id of possibleIds) {
      if (getStoredWallet(id)) {
        actualFranchiseId = id;
        console.log(`Found wallet for franchise ID: ${id}`);
        break;
      }
    }
    
    setFranchiseId(actualFranchiseId);
    setIsLoading(false);
  }, [resolvedParams.franchiseSlug]);

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Loading franchise...</div>;
  }

  return (
    <FranchiseStore 
      franchiseId={franchiseId}
      franchiserId={resolvedParams.brandSlug}
    />
  );
}