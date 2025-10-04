import { Keypair } from '@solana/web3.js';
import bs58 from 'bs58';

/**
 * Simple encryption/decryption utilities for private keys
 * In production, consider using more robust encryption libraries
 */

/**
 * Encrypt a private key using a simple XOR cipher with user-specific key
 * @param privateKey - The private key as Uint8Array
 * @param userKey - User-specific key derived from user data
 * @returns Encrypted private key as base58 string
 */
export function encryptPrivateKey(privateKey: Uint8Array, userKey: string): string {
  try {
    // Create a deterministic key from user data
    const keyBytes = new TextEncoder().encode(userKey);
    const keyLength = keyBytes.length;
    
    // XOR encryption
    const encrypted = new Uint8Array(privateKey.length);
    for (let i = 0; i < privateKey.length; i++) {
      encrypted[i] = privateKey[i] ^ keyBytes[i % keyLength];
    }
    
    // Convert to base58 for storage
    return bs58.encode(encrypted);
  } catch (error) {
    console.error('Error encrypting private key:', error);
    throw new Error('Failed to encrypt private key');
  }
}

/**
 * Decrypt a private key
 * @param encryptedPrivateKey - Encrypted private key as base58 string
 * @param userKey - User-specific key derived from user data
 * @returns Decrypted private key as Uint8Array
 */
export function decryptPrivateKey(encryptedPrivateKey: string, userKey: string): Uint8Array {
  try {
    // Decode from base58
    const encrypted = bs58.decode(encryptedPrivateKey);
    
    // Create the same key used for encryption
    const keyBytes = new TextEncoder().encode(userKey);
    const keyLength = keyBytes.length;
    
    // XOR decryption
    const decrypted = new Uint8Array(encrypted.length);
    for (let i = 0; i < encrypted.length; i++) {
      decrypted[i] = encrypted[i] ^ keyBytes[i % keyLength];
    }
    
    return decrypted;
  } catch (error) {
    console.error('Error decrypting private key:', error);
    throw new Error('Failed to decrypt private key');
  }
}

/**
 * Generate a user-specific key from user data
 * @param userId - User ID
 * @param email - User email
 * @param createdAt - User creation timestamp
 * @returns User-specific key string
 */
export function generateUserKey(userId: string, email: string, createdAt: number): string {
  // Combine user data to create a unique key
  const keyData = `${userId}_${email}_${createdAt}_franchiseen`;
  
  // Simple hash function (in production, use crypto.subtle.digest)
  let hash = 0;
  for (let i = 0; i < keyData.length; i++) {
    const char = keyData.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return hash.toString(16);
}

/**
 * Generate a complete wallet with encrypted private key
 * @param userKey - User-specific key for encryption
 * @returns Wallet object with encrypted private key
 */
export function generateWalletWithEncryptedPrivateKey(userKey: string): {
  keypair: Keypair;
  publicKey: string;
  encryptedPrivateKey: string;
  privateKeyBytes: Uint8Array;
} {
  // Generate new keypair
  const keypair = Keypair.generate();
  
  // Encrypt the private key
  const encryptedPrivateKey = encryptPrivateKey(keypair.secretKey, userKey);
  
  return {
    keypair,
    publicKey: keypair.publicKey.toBase58(),
    encryptedPrivateKey,
    privateKeyBytes: keypair.secretKey
  };
}

/**
 * Recreate keypair from encrypted private key
 * @param publicKey - Public key as string
 * @param encryptedPrivateKey - Encrypted private key as string
 * @param userKey - User-specific key for decryption
 * @returns Keypair object
 */
export function recreateKeypairFromEncryptedPrivateKey(
  publicKey: string,
  encryptedPrivateKey: string,
  userKey: string
): Keypair {
  try {
    // Decrypt the private key
    const privateKeyBytes = decryptPrivateKey(encryptedPrivateKey, userKey);
    
    // Create keypair from decrypted private key
    return Keypair.fromSecretKey(privateKeyBytes);
  } catch (error) {
    console.error('Error recreating keypair:', error);
    throw new Error('Failed to recreate keypair from encrypted private key');
  }
}
