import { PublicKey } from '@solana/web3.js';
import { createHash } from 'crypto';
import { getProgramId, isValidSolanaPublicKey } from './solanaConfig';

// Franchise PDA utilities
export interface FranchisePDA {
  franchiseId: string;
  pda: string;
  bump: number;
  totalShares: number;
  sharesIssued: number;
  sharePrice: number;
  totalRaised: number;
  isActive: boolean;
  createdAt: number;
}

// Create a franchise PDA
export function createFranchisePDA(
  franchiseId: string,
  programId?: string
): { pda: PublicKey; bump: number } {
  // Create a seed from franchise ID
  const seed = Buffer.from(franchiseId, 'utf8');
  
  // Get program ID with validation
  let finalProgramId: string;
  
  if (programId && isValidSolanaPublicKey(programId)) {
    finalProgramId = programId;
  } else {
    // Use system program as fallback (always valid)
    finalProgramId = getProgramId('SYSTEM_PROGRAM');
    if (programId) {
      console.warn(`Invalid program ID provided: ${programId}, using fallback: ${finalProgramId}`);
    }
  }
  
  let programPublicKey: PublicKey;
  
  try {
    programPublicKey = new PublicKey(finalProgramId);
  } catch (error) {
    console.error('Failed to create PublicKey even with fallback:', error);
    throw new Error('Invalid program ID configuration');
  }
  
  // Find PDA
  const [pda, bump] = PublicKey.findProgramAddressSync(
    [Buffer.from("franchise"), seed],
    programPublicKey
  );
  
  return { pda, bump };
}

// Generate franchise PDA data
export function generateFranchisePDA(
  franchiseId: string,
  totalShares: number,
  sharePrice: number,
  programId?: string
): FranchisePDA {
  const { pda, bump } = createFranchisePDA(franchiseId, programId);
  
  return {
    franchiseId,
    pda: pda.toString(),
    bump,
    totalShares,
    sharesIssued: 0,
    sharePrice,
    totalRaised: 0,
    isActive: true,
    createdAt: Date.now()
  };
}

// Store franchise PDA data
export function storeFranchisePDA(pda: FranchisePDA): void {
  const storageKey = `franchise_pda_${pda.franchiseId}`;
  localStorage.setItem(storageKey, JSON.stringify(pda));
  console.log('Stored franchise PDA:', pda);
}

// Get franchise PDA data
export function getFranchisePDA(franchiseId: string): FranchisePDA | null {
  try {
    const storageKey = `franchise_pda_${franchiseId}`;
    const stored = localStorage.getItem(storageKey);
    if (!stored) return null;
    
    return JSON.parse(stored);
  } catch (error) {
    console.error('Error retrieving franchise PDA:', error);
    return null;
  }
}

// Update shares issued in PDA
export function updatePDASharesIssued(franchiseId: string, sharesIssued: number, totalRaised: number): void {
  const pda = getFranchisePDA(franchiseId);
  if (!pda) return;
  
  pda.sharesIssued = sharesIssued;
  pda.totalRaised = totalRaised;
  storeFranchisePDA(pda);
}

// Check if funding target is reached
export function isFundingComplete(franchiseId: string): boolean {
  const pda = getFranchisePDA(franchiseId);
  if (!pda) return false;
  
  return pda.sharesIssued >= pda.totalShares;
}

// Get funding progress percentage
export function getFundingProgress(franchiseId: string): number {
  const pda = getFranchisePDA(franchiseId);
  if (!pda) return 0;
  
  return (pda.sharesIssued / pda.totalShares) * 100;
}

// Get all franchise PDAs
export function getAllFranchisePDAs(): FranchisePDA[] {
  const pdas: FranchisePDA[] = [];
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith('franchise_pda_')) {
      try {
        const pda = JSON.parse(localStorage.getItem(key) || '');
        if (pda && pda.franchiseId) {
          pdas.push(pda);
        }
      } catch (error) {
        console.error('Error parsing PDA:', error);
      }
    }
  }
  
  return pdas;
}

// Create franchise PDA with Solana program instruction
export function createFranchisePDAInstruction(
  franchiseId: string,
  totalShares: number,
  sharePrice: number,
  programId?: string
) {
  const { pda, bump } = createFranchisePDA(franchiseId, programId);
  const finalProgramId = programId && isValidSolanaPublicKey(programId) 
    ? programId 
    : getProgramId('SYSTEM_PROGRAM');
  
  // This would be used with your Solana program
  return {
    programId: new PublicKey(finalProgramId),
    accounts: [
      { pubkey: pda, isSigner: false, isWritable: true },
      // Add other required accounts (payer, system program, etc.)
    ],
    data: Buffer.concat([
      Buffer.from([0]), // Instruction discriminator
      Buffer.from(franchiseId, 'utf8'),
      Buffer.from(totalShares.toString()),
      Buffer.from(sharePrice.toString()),
      Buffer.from([bump])
    ])
  };
}

// Buy shares instruction for franchise PDA
export function buySharesInstruction(
  franchiseId: string,
  sharesToBuy: number,
  buyerPublicKey: string,
  programId?: string
) {
  const { pda } = createFranchisePDA(franchiseId, programId);
  const finalProgramId = programId && isValidSolanaPublicKey(programId) 
    ? programId 
    : getProgramId('SYSTEM_PROGRAM');
  
  return {
    programId: new PublicKey(finalProgramId),
    accounts: [
      { pubkey: pda, isSigner: false, isWritable: true },
      { pubkey: new PublicKey(buyerPublicKey), isSigner: true, isWritable: true },
      // Add other required accounts
    ],
    data: Buffer.concat([
      Buffer.from([1]), // Instruction discriminator for buy shares
      Buffer.from(sharesToBuy.toString()),
    ])
  };
}
