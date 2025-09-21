// src/app/providers.tsx
'use client';

import { MoralisProvider } from 'react-moralis';
import { ReactNode } from 'react';

export function MoralisProviders({ children }: { children: ReactNode }) {
  return (
    <MoralisProvider
      initializeOnMount={false}
    >
      {children}
    </MoralisProvider>
  );
}