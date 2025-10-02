import { Keypair, PublicKey } from '@solana/web3.js';
import { generateMnemonic, mnemonicToSeedSync } from 'bip39';
import { derivePath } from 'ed25519-hd-key';

export interface CompanyWallet {
  publicKey: string;
  secretKey: Uint8Array;
  mnemonic: string;
  address: string;
  createdAt: string;
  type: 'company';
}

export interface CompanyWalletConfig {
  derivationPath?: string;
  passphrase?: string;
}

/**
 * Generate a new company wallet for platform fee collection
 * @param config Optional configuration for wallet generation
 * @returns CompanyWallet object with all necessary wallet information
 */
export function generateCompanyWallet(config: CompanyWalletConfig = {}): CompanyWallet {
  try {
    // Generate a new mnemonic phrase
    const mnemonic = generateMnemonic(256); // 24 words for maximum security
    
    // Default derivation path for company wallets
    const derivationPath = config.derivationPath || "m/44'/501'/0'/0'";
    
    // Generate seed from mnemonic
    const seed = mnemonicToSeedSync(mnemonic, config.passphrase);
    
    // Derive keypair from seed
    const derivedSeed = derivePath(derivationPath, seed.toString('hex')).key;
    const keypair = Keypair.fromSeed(derivedSeed);
    
    return {
      publicKey: keypair.publicKey.toString(),
      secretKey: keypair.secretKey,
      mnemonic,
      address: keypair.publicKey.toString(),
      createdAt: new Date().toISOString(),
      type: 'company'
    };
  } catch (error) {
    console.error('Error generating company wallet:', error);
    throw new Error('Failed to generate company wallet');
  }
}

/**
 * Create a keypair from an existing mnemonic
 * @param mnemonic The mnemonic phrase
 * @param config Optional configuration
 * @returns CompanyWallet object
 */
export function createCompanyWalletFromMnemonic(
  mnemonic: string, 
  config: CompanyWalletConfig = {}
): CompanyWallet {
  try {
    const derivationPath = config.derivationPath || "m/44'/501'/0'/0'";
    const seed = mnemonicToSeedSync(mnemonic, config.passphrase);
    const derivedSeed = derivePath(derivationPath, seed.toString('hex')).key;
    const keypair = Keypair.fromSeed(derivedSeed);
    
    return {
      publicKey: keypair.publicKey.toString(),
      secretKey: keypair.secretKey,
      mnemonic,
      address: keypair.publicKey.toString(),
      createdAt: new Date().toISOString(),
      type: 'company'
    };
  } catch (error) {
    console.error('Error creating company wallet from mnemonic:', error);
    throw new Error('Failed to create company wallet from mnemonic');
  }
}

/**
 * Validate a Solana address
 * @param address The address to validate
 * @returns boolean indicating if the address is valid
 */
export function isValidSolanaAddress(address: string): boolean {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
}

/**
 * Encrypt wallet data for secure storage
 * @param wallet The wallet to encrypt
 * @returns Encrypted wallet data
 */
export function encryptCompanyWallet(wallet: CompanyWallet): string {
  // In a production environment, use a proper encryption library like crypto-js
  // For now, we'll use a simple base64 encoding (NOT SECURE for production)
  const walletData = {
    publicKey: wallet.publicKey,
    address: wallet.address,
    mnemonic: wallet.mnemonic,
    createdAt: wallet.createdAt,
    type: wallet.type
  };
  
  return btoa(JSON.stringify(walletData));
}

/**
 * Decrypt wallet data
 * @param encryptedData The encrypted wallet data
 * @returns Decrypted wallet data
 */
export function decryptCompanyWallet(encryptedData: string): Partial<CompanyWallet> {
  try {
    // In a production environment, use proper decryption
    const decryptedData = JSON.parse(atob(encryptedData));
    return decryptedData;
  } catch (error) {
    console.error('Error decrypting company wallet:', error);
    throw new Error('Failed to decrypt company wallet');
  }
}

/**
 * Generate a company wallet with secure storage
 * @param config Optional configuration
 * @returns CompanyWallet object
 */
export async function generateAndStoreCompanyWallet(config: CompanyWalletConfig = {}): Promise<CompanyWallet> {
  const wallet = generateCompanyWallet(config);
  
  // Store wallet in localStorage (in production, use secure storage)
  try {
    const encryptedWallet = encryptCompanyWallet(wallet);
    localStorage.setItem('company-wallet', encryptedWallet);
    console.log('Company wallet generated and stored successfully');
  } catch (error) {
    console.error('Error storing company wallet:', error);
    // Don't throw error here as wallet generation was successful
  }
  
  return wallet;
}

/**
 * Retrieve stored company wallet
 * @returns CompanyWallet object or null if not found
 */
export function getStoredCompanyWallet(): Partial<CompanyWallet> | null {
  try {
    const storedWallet = localStorage.getItem('company-wallet');
    if (!storedWallet) {
      return null;
    }
    
    return decryptCompanyWallet(storedWallet);
  } catch (error) {
    console.error('Error retrieving stored company wallet:', error);
    return null;
  }
}

/**
 * Clear stored company wallet
 */
export function clearStoredCompanyWallet(): void {
  try {
    localStorage.removeItem('company-wallet');
    console.log('Company wallet cleared from storage');
  } catch (error) {
    console.error('Error clearing company wallet:', error);
  }
}
