import { Keypair } from '@solana/web3.js';
import bs58 from 'bs58';

/**
 * Generate a new Solana keypair for brand wallet
 * This creates a wallet without requiring a seed phrase from the user
 */
export function generateBrandWallet(): {
  keypair: Keypair;
  publicKey: string;
  secretKey: string;
} {
  // Generate a new random keypair
  const keypair = Keypair.generate();
  
  // Get the public key as base58 string
  const publicKey = keypair.publicKey.toBase58();
  
  // Get the secret key as base58 string (this is what we'll store securely)
  const secretKey = bs58.encode(keypair.secretKey);
  
  return {
    keypair,
    publicKey,
    secretKey,
  };
}

/**
 * Recreate a keypair from a stored secret key
 */
export function recreateKeypairFromSecretKey(secretKey: string): Keypair {
  try {
    const secretKeyBytes = bs58.decode(secretKey);
    return Keypair.fromSecretKey(secretKeyBytes);
  } catch {
    throw new Error('Invalid secret key format');
  }
}

/**
 * Validate a Solana public key format
 */
export function isValidSolanaPublicKey(publicKey: string): boolean {
  try {
    // Try to decode the base58 string
    const decoded = bs58.decode(publicKey);
    // Solana public keys are 32 bytes
    return decoded.length === 32;
  } catch {
    return false;
  }
}

/**
 * Format wallet address for display (show first 6 and last 6 characters)
 */
export function formatWalletAddress(address: string, maxLength: number = 12): string {
  if (address.length <= maxLength) {
    return address;
  }
  return `${address.slice(0, 6)}...${address.slice(-6)}`;
}
