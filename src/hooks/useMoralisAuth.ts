import { useEffect, useState } from 'react';
import { useMoralis } from 'react-moralis';
import { initializeMoralis } from '@/lib/moralis';

export const useMoralisAuth = () => {
  const { isInitialized, isInitializing, initialize, ...rest } = useMoralis();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        if (!isInitialized && !isInitializing) {
          await initializeMoralis();
          setIsReady(true);
        }
      } catch (error) {
        console.error('Error initializing Moralis:', error);
      }
    };

    init();
  }, [isInitialized, isInitializing]);

  return {
    isReady,
    isInitialized,
    isInitializing,
    ...rest
  };
};