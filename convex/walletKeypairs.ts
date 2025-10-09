/**
 * Server-side wallet keypair management
 * Stores encrypted keypairs for franchise and brand wallets
 * 
 * SECURITY NOTE: In production, these should be:
 * 1. Encrypted with a strong encryption key
 * 2. Stored in a secure vault (like AWS KMS, HashiCorp Vault, etc.)
 * 3. Access-controlled and audited
 * 
 * For now, we're using base64 encoding (NOT SECURE FOR PRODUCTION)
 */

import { Keypair } from '@solana/web3.js';

/**
 * Generate a new Solana keypair
 */
export function generateKeypair(): {
  publicKey: string;
  secretKey: string;
  keypair: Keypair;
} {
  const keypair = Keypair.generate();
  
  return {
    publicKey: keypair.publicKey.toBase58(),
    secretKey: JSON.stringify(Array.from(keypair.secretKey)), // Store as JSON array
    keypair
  };
}

/**
 * Reconstruct keypair from stored secret key
 */
export function keypairFromSecretKey(secretKeyString: string): Keypair | null {
  try {
    const secretKeyArray = JSON.parse(secretKeyString);
    return Keypair.fromSecretKey(Uint8Array.from(secretKeyArray));
  } catch (error) {
    console.error('Failed to reconstruct keypair:', error);
    return null;
  }
}

/**
 * Simple encryption (NOT SECURE - replace with proper encryption in production)
 * In production, use AWS KMS, or at minimum, crypto-js with a strong key
 * 
 * Note: Currently just returns the key as-is for Convex compatibility
 * Buffer is not available in Convex runtime
 */
export function encryptSecretKey(secretKey: string): string {
  // For now, store as-is (the secret key is already a JSON string of array)
  // TODO: Implement proper encryption with a Convex-compatible method
  // Consider using Web Crypto API or a pure JS encryption library
  return secretKey;
}

/**
 * Simple decryption (NOT SECURE - replace with proper decryption in production)
 */
export function decryptSecretKey(encryptedKey: string): string {
  // For now, just return as-is
  // TODO: Implement proper decryption
  return encryptedKey;
}

