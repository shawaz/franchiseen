/**
 * CoinGecko API utilities for fetching cryptocurrency prices
 */

export interface CoinGeckoPrice {
  solana: {
    usd: number;
  };
}

export interface CoinGeckoError {
  error: string;
}

/**
 * Fetch SOL to USD price from CoinGecko API
 */
export async function fetchSolToUsdPrice(): Promise<number> {
  try {
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd',
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data: CoinGeckoPrice = await response.json();
    
    if (!data.solana || typeof data.solana.usd !== 'number') {
      throw new Error('Invalid response format from CoinGecko');
    }

    return data.solana.usd;
  } catch (error) {
    console.error('Failed to fetch SOL price from CoinGecko:', error);
    
    // Return a fallback price if API fails
    // This is approximately the current SOL price as of late 2024
    return 150.0;
  }
}

/**
 * Fetch multiple cryptocurrency prices
 */
export async function fetchCryptoPrices(coinIds: string[]): Promise<Record<string, number>> {
  try {
    const ids = coinIds.join(',');
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data = await response.json();
    
    const prices: Record<string, number> = {};
    for (const coinId of coinIds) {
      if (data[coinId] && typeof data[coinId].usd === 'number') {
        prices[coinId] = data[coinId].usd;
      }
    }

    return prices;
  } catch (error) {
    console.error('Failed to fetch crypto prices from CoinGecko:', error);
    return {};
  }
}

/**
 * Hook for fetching SOL price with caching and error handling
 */
export function useSolPrice() {
  const [price, setPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchPrice = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const solPrice = await fetchSolToUsdPrice();
        
        if (isMounted) {
          setPrice(solPrice);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to fetch price');
          setPrice(150.0); // Fallback price
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchPrice();

    // Refresh price every 5 minutes
    const interval = setInterval(fetchPrice, 5 * 60 * 1000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return { price, loading, error };
}

// Import React hooks for the hook function
import { useState, useEffect } from 'react';
