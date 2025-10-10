"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ReactNode, useEffect, useState } from "react";

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  const [client, setClient] = useState<ConvexReactClient | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Determine network from localStorage or environment
    let network: 'mainnet' | 'devnet' = 'mainnet';
    
    // Check if on devnet subdomain
    const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
    const isDevnetDomain = hostname.startsWith('devnet.');
    
    if (isDevnetDomain) {
      network = 'devnet';
    } else {
      // Check localStorage for user preference
      const saved = localStorage.getItem('preferred_network') as 'mainnet' | 'devnet' | null;
      if (saved) {
        network = saved;
      } else {
        // Use environment default
        const envNetwork = process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'mainnet-beta';
        network = envNetwork === 'devnet' ? 'devnet' : 'mainnet';
      }
    }

    // Get correct Convex URL based on network
    const convexUrl = network === 'devnet'
      ? process.env.NEXT_PUBLIC_CONVEX_DEV_URL || process.env.NEXT_PUBLIC_CONVEX_URL
      : process.env.NEXT_PUBLIC_CONVEX_URL;

    if (!convexUrl) {
      console.error("Convex URL not configured");
      setIsLoading(false);
      return;
    }

    console.log(`[Convex] Network: ${network.toUpperCase()}`);
    console.log(`[Convex] Database: ${convexUrl}`);

    // Create Convex client for the selected network
    const newClient = new ConvexReactClient(convexUrl);
    setClient(newClient);
    setIsLoading(false);

    // Cleanup function
    return () => {
      newClient.close();
    };
  }, []); // Empty deps - only run once on mount

  // Show loading state while client initializes
  if (isLoading || !client) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-stone-50 dark:bg-stone-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-gray-100 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Connecting to database...
          </p>
        </div>
      </div>
    );
  }

  return <ConvexProvider client={client}>{children}</ConvexProvider>;
}
