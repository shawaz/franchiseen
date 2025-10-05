import { Keypair } from '@solana/web3.js';
import bs58 from 'bs58';

/**
 * Generate a real Solana wallet that will exist on the blockchain
 * @param franchiseId - The franchise ID for deterministic generation
 * @param franchiseSlug - The franchise slug for additional entropy
 * @returns Object containing wallet address, private key, and public key
 */
export function generateRealFranchiseWallet(franchiseId: string, franchiseSlug: string) {
  try {
    // Create a deterministic seed from franchise data
    const seedData = `${franchiseId}_${franchiseSlug}_${Date.now()}`;
    
    // Convert to bytes for keypair generation
    const seedBytes = new TextEncoder().encode(seedData);
    
    // Create a keypair from the seed (deterministic)
    const keypair = Keypair.fromSeed(seedBytes.slice(0, 32));
    
    // Get the public key (wallet address)
    const publicKey = keypair.publicKey.toString();
    
    // Get the private key as base58 string (for storage)
    const privateKey = bs58.encode(keypair.secretKey);
    
    return {
      walletAddress: publicKey,
      privateKey: privateKey,
      publicKey: keypair.publicKey,
      keypair: keypair,
      isReal: true, // Flag to indicate this is a real wallet
    };
  } catch (error) {
    console.error('Error generating real franchise wallet:', error);
    throw new Error('Failed to generate real franchise wallet');
  }
}

/**
 * Generate a mock wallet for development/testing
 * @param franchiseId - The franchise ID for deterministic generation
 * @param franchiseSlug - The franchise slug for additional entropy
 * @returns Object containing mock wallet address
 */
export function generateMockFranchiseWallet(franchiseId: string, franchiseSlug: string) {
  // Use a simpler approach for mock wallets
  const seedData = `${franchiseId}_${franchiseSlug}_${Date.now()}`;
  const hash = new TextEncoder().encode(seedData);
  
  const base58Chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  let walletAddress = '';
  for (let i = 0; i < 44; i++) {
    const charIndex = hash[i % hash.length] % base58Chars.length;
    walletAddress += base58Chars[charIndex];
  }
  
  return {
    walletAddress,
    privateKey: null,
    publicKey: null,
    keypair: null,
    isReal: false, // Flag to indicate this is a mock wallet
  };
}

/**
 * Check if we should use real wallets or mock wallets
 * @returns boolean indicating whether to use real wallets
 */
export function shouldUseRealWallets(): boolean {
  // In production, always use real wallets
  if (process.env.NODE_ENV === 'production') {
    return true;
  }
  
  // In development, check environment variable
  return process.env.NEXT_PUBLIC_USE_REAL_WALLETS === 'true';
}
