import { Keypair } from '@solana/web3.js';

// Franchise Token/NFT utilities for share management
export interface FranchiseToken {
  mint: string;
  franchiseId: string;
  totalSupply: number;
  sharesIssued: number;
  sharePrice: number;
  metadata: {
    name: string;
    symbol: string;
    description: string;
    image: string;
  };
}

// Create a franchise token (represents shares)
export function createFranchiseToken(
  franchiseId: string,
  totalShares: number,
  sharePrice: number,
  franchiseName: string
): FranchiseToken {
  // Generate a unique mint address for this franchise
  const mintKeypair = Keypair.generate();
  
  return {
    mint: mintKeypair.publicKey.toString(),
    franchiseId,
    totalSupply: totalShares,
    sharesIssued: 0,
    sharePrice,
    metadata: {
      name: `${franchiseName} Franchise Shares`,
      symbol: `${franchiseName.substring(0, 4).toUpperCase()}SH`,
      description: `Fractional ownership shares in ${franchiseName} franchise`,
      image: `/franchise/${franchiseId}-shares.png`
    }
  };
}

// Store franchise token data
export function storeFranchiseToken(token: FranchiseToken): void {
  const storageKey = `franchise_token_${token.franchiseId}`;
  localStorage.setItem(storageKey, JSON.stringify(token));
  console.log('Stored franchise token:', token);
}

// Get franchise token data
export function getFranchiseToken(franchiseId: string): FranchiseToken | null {
  try {
    const storageKey = `franchise_token_${franchiseId}`;
    const stored = localStorage.getItem(storageKey);
    if (!stored) return null;
    
    return JSON.parse(stored);
  } catch (error) {
    console.error('Error retrieving franchise token:', error);
    return null;
  }
}

// Update shares issued
export function updateSharesIssued(franchiseId: string, sharesIssued: number): void {
  const token = getFranchiseToken(franchiseId);
  if (!token) return;
  
  token.sharesIssued = sharesIssued;
  storeFranchiseToken(token);
}

// Check if funding target is reached
export function isFundingComplete(franchiseId: string): boolean {
  const token = getFranchiseToken(franchiseId);
  if (!token) return false;
  
  return token.sharesIssued >= token.totalSupply;
}

// Get funding progress percentage
export function getFundingProgress(franchiseId: string): number {
  const token = getFranchiseToken(franchiseId);
  if (!token) return 0;
  
  return (token.sharesIssued / token.totalSupply) * 100;
}
