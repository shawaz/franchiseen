import { getSolanaRpcConfig, getNetworkFromEnv, getSolanaExplorerUrl, SolanaNetwork } from './solanaConfig';

export type NetworkType = 'mainnet' | 'devnet';

export interface NetworkConfig {
  network: NetworkType;
  isDevnet: boolean;
  isMainnet: boolean;
  isDevnetDomain: boolean;
  allowToggle: boolean;
  
  // RPC Configuration
  solanaRpcUrl: string;
  fallbackRpcUrls: string[];
  
  // Convex Configuration
  convexUrl: string | undefined;
  
  // Explorer
  explorerUrl: (hash: string, type?: 'tx' | 'address') => string;
  
  // Display
  clusterName: string;
  badgeColor: string;
  badgeIcon: string;
}

export const getNetworkConfig = (): NetworkConfig => {
  // Check if we're on the devnet subdomain
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  const isDevnetDomain = hostname.startsWith('devnet.');
  
  // Get user preference from localStorage (only on main domain)
  let userPreference: NetworkType | null = null;
  if (typeof window !== 'undefined' && !isDevnetDomain) {
    userPreference = localStorage.getItem('preferred_network') as NetworkType;
  }
  
  // Get environment default
  const envNetwork = getNetworkFromEnv();
  const defaultIsDevnet = envNetwork === 'devnet';
  
  // Determine final network
  let network: NetworkType;
  if (isDevnetDomain) {
    // Force devnet on devnet subdomain
    network = 'devnet';
  } else if (userPreference) {
    // Use user preference on main domain
    network = userPreference;
  } else {
    // Use environment default
    network = defaultIsDevnet ? 'devnet' : 'mainnet';
  }
  
  const isDevnet = network === 'devnet';
  const isMainnet = !isDevnet;
  
  // Get RPC configuration with Helius
  const solanaNetwork: SolanaNetwork = isDevnet ? 'devnet' : 'mainnet-beta';
  const rpcConfig = getSolanaRpcConfig(solanaNetwork);
  
  // Can toggle only on main domain and if allowed
  const allowToggle = !isDevnetDomain && 
                      (process.env.NEXT_PUBLIC_ALLOW_NETWORK_TOGGLE === 'true' ||
                       process.env.NODE_ENV === 'development');
  
  return {
    network,
    isDevnet,
    isMainnet,
    isDevnetDomain,
    allowToggle,
    
    // RPC Configuration (Helius + Fallbacks)
    solanaRpcUrl: rpcConfig.primary,
    fallbackRpcUrls: rpcConfig.fallbacks,
    
    // Convex URLs
    convexUrl: isDevnet
      ? process.env.NEXT_PUBLIC_CONVEX_DEV_URL || process.env.NEXT_PUBLIC_CONVEX_URL
      : process.env.NEXT_PUBLIC_CONVEX_URL,
    
    // Explorer URL generator
    explorerUrl: (hash: string, type: 'tx' | 'address' = 'tx') => 
      getSolanaExplorerUrl(hash, type, solanaNetwork),
    
    // Display info
    clusterName: isDevnet ? 'Devnet' : 'Mainnet',
    badgeColor: isDevnet 
      ? 'bg-yellow-500 text-yellow-900' 
      : 'bg-green-500 text-green-900',
    badgeIcon: isDevnet ? '🧪' : '💎',
  };
};

