// Solana configuration for franchise system
export const SOLANA_CONFIG = {
  // Program IDs (replace with your actual deployed program IDs)
  PROGRAMS: {
    // Main franchise program ID (replace with your actual program ID)
    FRANCHISE_PROGRAM: "FranchiseProgram1111111111111111111111111111111",
    
    // System program ID (this is always valid)
    SYSTEM_PROGRAM: "11111111111111111111111111111111",
    
    // Token program ID
    TOKEN_PROGRAM: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
    
    // Associated token program ID
    ASSOCIATED_TOKEN_PROGRAM: "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL",
  },
  
  // Network configuration - Using Helius RPC for better performance
  NETWORK: {
    // Mainnet - Helius RPC (recommended for production)
    MAINNET: process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com",
    
    // Devnet - Helius RPC (recommended for development)
    DEVNET: process.env.NEXT_PUBLIC_SOLANA_DEVNET_RPC_URL || "https://api.devnet.solana.com",
    
    // Testnet
    TESTNET: "https://api.testnet.solana.com",
    
    // Helius RPC endpoints (set via environment variables) - with fallbacks
    HELIUS_MAINNET: process.env.NEXT_PUBLIC_HELIUS_RPC_URL || "https://api.mainnet-beta.solana.com",
    HELIUS_DEVNET: process.env.NEXT_PUBLIC_HELIUS_DEVNET_RPC_URL || "https://api.devnet.solana.com",
  },
  
  // Default configuration
  DEFAULT: {
    PROGRAM_ID: "11111111111111111111111111111111", // System program as fallback
    NETWORK: "devnet", // Use devnet for development
  }
};

// Helper function to get program ID with fallback
export function getProgramId(programType: keyof typeof SOLANA_CONFIG.PROGRAMS): string {
  return SOLANA_CONFIG.PROGRAMS[programType] || SOLANA_CONFIG.DEFAULT.PROGRAM_ID;
}

// Helper function to validate Solana public key
export async function isValidSolanaPublicKey(key: string): Promise<boolean> {
  try {
    const { PublicKey } = await import('@solana/web3.js');
    new PublicKey(key);
    return true;
  } catch {
    return false;
  }
}

// Helper function to get network URL
export function getNetworkUrl(network: keyof typeof SOLANA_CONFIG.NETWORK = 'DEVNET'): string {
  return SOLANA_CONFIG.NETWORK[network];
}

// Helper function to get the best available RPC URL (Helius preferred)
export function getBestRpcUrl(network: 'mainnet' | 'devnet' = 'devnet'): string {
  if (network === 'mainnet') {
    // Prefer Helius mainnet RPC if available, fallback to environment variable, then default
    return (
      process.env.NEXT_PUBLIC_HELIUS_RPC_URL ||
      process.env.NEXT_PUBLIC_SOLANA_RPC_URL ||
      SOLANA_CONFIG.NETWORK.MAINNET
    );
  } else {
    // Prefer Helius devnet RPC if available, fallback to environment variable, then default
    return (
      process.env.NEXT_PUBLIC_HELIUS_DEVNET_RPC_URL ||
      process.env.NEXT_PUBLIC_SOLANA_DEVNET_RPC_URL ||
      SOLANA_CONFIG.NETWORK.DEVNET
    );
  }
}

// Helper function to check if we're using Helius RPC
export function isUsingHeliusRpc(): boolean {
  const mainnetUrl = getBestRpcUrl('mainnet');
  const devnetUrl = getBestRpcUrl('devnet');
  
  return (
    mainnetUrl.includes('helius-rpc') ||
    devnetUrl.includes('helius-rpc') ||
    !!process.env.NEXT_PUBLIC_HELIUS_RPC_URL ||
    !!process.env.NEXT_PUBLIC_HELIUS_DEVNET_RPC_URL
  );
}

