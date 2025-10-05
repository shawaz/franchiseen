import { Keypair, PublicKey, Connection } from '@solana/web3.js';
import bs58 from 'bs58';

// Solana RPC endpoint - you can configure this
const SOLANA_RPC_URL = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';

/**
 * Generate a new Solana wallet for a franchise
 * @param franchiseSlug - The franchise slug for wallet naming
 * @returns Object containing wallet address, private key, and public key
 */
export async function generateFranchiseWallet() {
  try {
    // Generate a new keypair
    const keypair = Keypair.generate();
    
    // Get the public key (wallet address)
    const publicKey = keypair.publicKey.toString();
    
    // Get the private key as base58 string (for storage)
    const privateKey = bs58.encode(keypair.secretKey);
    
    return {
      walletAddress: publicKey,
      privateKey: privateKey,
      publicKey: keypair.publicKey,
      keypair: keypair,
    };
  } catch (error) {
    console.error('Error generating franchise wallet:', error);
    throw new Error('Failed to generate franchise wallet');
  }
}

/**
 * Get wallet balance from Solana blockchain
 * @param walletAddress - The wallet address to check
 * @returns Balance in SOL
 */
export async function getWalletBalance(walletAddress: string): Promise<number> {
  try {
    const connection = new Connection(SOLANA_RPC_URL);
    const publicKey = new PublicKey(walletAddress);
    
    // Get balance in lamports
    const lamports = await connection.getBalance(publicKey);
    
    // Convert lamports to SOL (1 SOL = 1,000,000,000 lamports)
    const sol = lamports / 1_000_000_000;
    
    return sol;
  } catch (error) {
    console.error('Error getting wallet balance:', error);
    return 0;
  }
}

/**
 * Get Solana Explorer URL for a wallet address
 * @param walletAddress - The wallet address
 * @param cluster - The Solana cluster (mainnet-beta, devnet, testnet)
 * @returns Explorer URL
 */
export function getSolanaExplorerUrl(
  walletAddress: string, 
  cluster: 'mainnet-beta' | 'devnet' | 'testnet' = 'mainnet-beta'
): string {
  const baseUrl = cluster === 'mainnet-beta' 
    ? 'https://explorer.solana.com'
    : `https://explorer.solana.com/?cluster=${cluster}`;
  
  return `${baseUrl}/address/${walletAddress}`;
}

/**
 * Get Solana Explorer URL for a transaction hash
 * @param transactionHash - The transaction hash
 * @param cluster - The Solana cluster (mainnet-beta, devnet, testnet)
 * @returns Explorer URL
 */
export function getSolanaExplorerTransactionUrl(
  transactionHash: string,
  cluster: 'mainnet-beta' | 'devnet' | 'testnet' = 'mainnet-beta'
): string {
  const baseUrl = cluster === 'mainnet-beta'
    ? 'https://explorer.solana.com'
    : `https://explorer.solana.com/?cluster=${cluster}`;
  
  return `${baseUrl}/tx/${transactionHash}`;
}

/**
 * Format wallet address for display (show first 4 and last 4 characters)
 * @param address - The wallet address
 * @returns Formatted address
 */
export function formatWalletAddress(address: string): string {
  if (address.length <= 8) return address;
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

/**
 * Validate if a string is a valid Solana wallet address
 * @param address - The address to validate
 * @returns True if valid, false otherwise
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
 * Generate a transaction signature for tracking
 * @param franchiseId - The franchise ID
 * @param transactionType - The type of transaction
 * @returns Transaction signature string
 */
export function generateTransactionSignature(
  franchiseId: string,
  transactionType: string
): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${transactionType}_${franchiseId}_${timestamp}_${random}`;
}

/**
 * Convert SOL to USD (mock function - in production, use real price API)
 * @param solAmount - Amount in SOL
 * @returns USD amount
 */
export function convertSolToUsd(solAmount: number): number {
  // Mock conversion rate - in production, fetch from CoinGecko or similar
  const solToUsdRate = 100; // 1 SOL = $100 (mock rate)
  return solAmount * solToUsdRate;
}

/**
 * Convert USD to SOL (mock function - in production, use real price API)
 * @param usdAmount - Amount in USD
 * @returns SOL amount
 */
export function convertUsdToSol(usdAmount: number): number {
  // Mock conversion rate - in production, fetch from CoinGecko or similar
  const usdToSolRate = 0.01; // $1 = 0.01 SOL (mock rate)
  return usdAmount * usdToSolRate;
}
