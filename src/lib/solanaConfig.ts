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
  
  // Network configuration
  NETWORK: {
    // Mainnet
    MAINNET: "https://api.mainnet-beta.solana.com",
    
    // Devnet (for testing)
    DEVNET: "https://api.devnet.solana.com",
    
    // Testnet
    TESTNET: "https://api.testnet.solana.com",
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

