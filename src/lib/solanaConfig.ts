import { clusterApiUrl, PublicKey } from '@solana/web3.js';

export type SolanaNetwork = 'mainnet-beta' | 'devnet' | 'testnet' | 'localnet';

export interface SolanaRpcConfig {
  primary: string;
  fallbacks: string[];
}

/**
 * Get Solana RPC configuration with Helius as primary and fallbacks
 */
export const getSolanaRpcConfig = (network: SolanaNetwork = 'mainnet-beta'): SolanaRpcConfig => {
  const isDevnet = network === 'devnet';
  
  if (isDevnet) {
    // Devnet Configuration
    const heliusKey = process.env.NEXT_PUBLIC_HELIUS_API_KEY_DEVNET;
    const heliusUrl = heliusKey 
      ? `https://devnet.helius-rpc.com/?api-key=${heliusKey}`
      : null;
    
    const customRpc = process.env.NEXT_PUBLIC_SOLANA_DEVNET_RPC_URL;
    
    return {
      primary: heliusUrl || customRpc || clusterApiUrl('devnet'),
      fallbacks: [
        process.env.NEXT_PUBLIC_SOLANA_DEVNET_FALLBACK_1,
        'https://api.devnet.solana.com',
        'https://rpc.ankr.com/solana_devnet',
      ].filter(Boolean) as string[],
    };
  } else {
    // Mainnet Configuration
    const heliusKey = process.env.NEXT_PUBLIC_HELIUS_API_KEY_MAINNET;
    const heliusUrl = heliusKey 
      ? `https://mainnet.helius-rpc.com/?api-key=${heliusKey}`
      : null;
    
    const customRpc = process.env.NEXT_PUBLIC_SOLANA_MAINNET_RPC_URL;
    
    return {
      primary: heliusUrl || customRpc || clusterApiUrl('mainnet-beta'),
      fallbacks: [
        process.env.NEXT_PUBLIC_SOLANA_MAINNET_FALLBACK_1,
        process.env.NEXT_PUBLIC_SOLANA_MAINNET_FALLBACK_2,
        'https://api.mainnet-beta.solana.com',
        'https://solana-api.projectserum.com',
        'https://solana-mainnet.rpc.extrnode.com',
      ].filter(Boolean) as string[],
    };
  }
};

/**
 * Get network from environment variable
 */
export const getNetworkFromEnv = (): SolanaNetwork => {
  const network = process.env.NEXT_PUBLIC_SOLANA_NETWORK;
  if (network === 'devnet' || network === 'testnet' || network === 'localnet') {
    return network;
  }
  return 'mainnet-beta';
};

/**
 * Generate Solana Explorer URL
 */
export const getSolanaExplorerUrl = (
  identifier: string, 
  type: 'tx' | 'address' | 'block' = 'tx',
  network?: SolanaNetwork
): string => {
  const net = network || getNetworkFromEnv();
  const cluster = net === 'mainnet-beta' ? '' : `?cluster=${net}`;
  return `https://explorer.solana.com/${type}/${identifier}${cluster}`;
};

/**
 * Get display name for network
 */
export const getNetworkDisplayName = (network: SolanaNetwork): string => {
  const names: Record<SolanaNetwork, string> = {
    'mainnet-beta': 'Mainnet',
    'devnet': 'Devnet',
    'testnet': 'Testnet',
    'localnet': 'Localnet',
  };
  return names[network] || 'Unknown';
};

/**
 * Check if Helius is configured for a network
 */
export const isHeliusConfigured = (network: SolanaNetwork): boolean => {
  if (network === 'devnet') {
    return !!process.env.NEXT_PUBLIC_HELIUS_API_KEY_DEVNET;
  }
  return !!process.env.NEXT_PUBLIC_HELIUS_API_KEY_MAINNET;
};

/**
 * Get best RPC URL for a network (backwards compatibility)
 * @deprecated Use getSolanaRpcConfig instead
 */
export const getBestRpcUrl = (network: 'mainnet' | 'devnet' = 'mainnet'): string => {
  const solanaNetwork: SolanaNetwork = network === 'devnet' ? 'devnet' : 'mainnet-beta';
  const config = getSolanaRpcConfig(solanaNetwork);
  return config.primary;
};

/**
 * Validate if a string is a valid Solana public key
 */
export const isValidSolanaPublicKey = (key: string): boolean => {
  try {
    new PublicKey(key);
    return true;
  } catch {
    return false;
  }
};

/**
 * Get Program ID for franchise PDAs
 * Note: This should be configured per environment
 */
export const getProgramId = (type?: string): string => {
  // Return appropriate program ID based on type
  if (type === 'SYSTEM_PROGRAM') {
    return '11111111111111111111111111111111';
  }
  
  // Default to Solana Token Program for now
  // TODO: Replace with actual franchise program ID when deployed
  return 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';
};
