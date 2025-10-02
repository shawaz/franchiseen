import { Keypair, PublicKey } from '@solana/web3.js';
import { createNewWallet, storeWallet } from './solanaWalletUtils';
import { getFranchisePDA, isFundingComplete } from './franchisePDA';

// Handle transition from funding stage to launching stage
export async function transitionToLaunchingStage(franchiseId: string): Promise<{
  success: boolean;
  walletAddress?: string;
  error?: string;
}> {
  try {
    // Check if funding is complete
    if (!isFundingComplete(franchiseId)) {
      return {
        success: false,
        error: 'Funding not complete yet'
      };
    }

    // Get franchise PDA data
    const pda = getFranchisePDA(franchiseId);
    if (!pda) {
      return {
        success: false,
        error: 'Franchise PDA not found'
      };
    }

    // Create actual franchise wallet
    const franchiseWallet = createNewWallet();
    console.log('Created franchise wallet for launching:', franchiseWallet.publicKey);
    
    // Store the wallet
    storeWallet(franchiseWallet.publicKey, franchiseWallet.secretKey, franchiseId);
    
    // TODO: Transfer funds from PDA to wallet using Solana program
    // This would be handled by your Solana program
    
    return {
      success: true,
      walletAddress: franchiseWallet.publicKey
    };
    
  } catch (error) {
    console.error('Error transitioning to launching stage:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Check if franchise is ready to transition to launching
export function isReadyForLaunching(franchiseId: string): boolean {
  return isFundingComplete(franchiseId);
}

// Get funding status for a franchise
export function getFundingStatus(franchiseId: string): {
  isComplete: boolean;
  progress: number;
  totalRaised: number;
  sharesIssued: number;
  totalShares: number;
} {
  const pda = getFranchisePDA(franchiseId);
  if (!pda) {
    return {
      isComplete: false,
      progress: 0,
      totalRaised: 0,
      sharesIssued: 0,
      totalShares: 0
    };
  }

  return {
    isComplete: pda.sharesIssued >= pda.totalShares,
    progress: (pda.sharesIssued / pda.totalShares) * 100,
    totalRaised: pda.totalRaised,
    sharesIssued: pda.sharesIssued,
    totalShares: pda.totalShares
  };
}
