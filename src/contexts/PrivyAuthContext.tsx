"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth as useCrossmintAuth, useWallet } from '@crossmint/client-sdk-react-ui';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';

interface UserProfile {
  _id: string;
  email?: string;
  fullName?: string;
  avatarUrl?: string;
  privyUserId?: string; // Keeping field name for database compatibility
  walletAddress?: string;
  createdAt?: number;
  updatedAt?: number;
}

interface AuthContextType {
  isAuthenticated: boolean;
  userProfile: UserProfile | null;
  privyUser: any | null; // Mapped to crossmint user for backward compatibility
  isLoading: boolean;
  login: () => void;
  logout: () => void;
  signOut: () => void; // Alias for logout
}

const PrivyAuthContext = createContext<AuthContextType | undefined>(undefined);

export function PrivyAuthProvider({ children }: { children: React.ReactNode }) {
  const { login, logout, user, status } = useCrossmintAuth() as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const crossmintWallet = useWallet() as any;

  const authenticated = status === "logged-in";
  const ready = status !== "in-progress" && status !== "loading";

  // Track if we're on client side to avoid SSR issues
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Get user profile from Convex using Crossmint user ID
  const userProfile = useQuery(
    api.userManagement.getUserByPrivyId,
    user?.id ? { privyUserId: user.id } : "skip"
  );

  const syncUser = useMutation(api.userManagement.syncPrivyUser);

  // Sync user to Convex database when they login
  const syncUserToConvex = async (crossmintUser: any) => {
    try {
      const email = crossmintUser?.email;
      const fullName = email ? email.split('@')[0] : "User";

      // Try to get wallet address from all possible sources at sync time
      const walletAddress =
        crossmintWallet?.address ||
        crossmintWallet?.wallet?.address ||
        crossmintUser?.walletAddress ||
        crossmintUser?.wallets?.[0]?.address;

      console.log('[PrivyAuthContext] Syncing user to Convex:', crossmintUser.id, '| wallet:', walletAddress || 'none yet');

      await syncUser({
        privyUserId: crossmintUser.id,
        email: email || undefined,
        fullName: fullName || undefined,
        avatarUrl: undefined,
        walletAddress: walletAddress || undefined,
      });
    } catch (error) {
      console.error('[PrivyAuthContext] Error syncing user to Convex:', error);
    }
  };

  // Sync user data whenever user logs in
  useEffect(() => {
    if (user && authenticated && isClient) {
      console.log('[PrivyAuthContext] User authenticated, syncing to Convex:', user.id);
      syncUserToConvex(user);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, authenticated, isClient]);

  // ── Wallet address late-sync ──────────────────────────────────────────────
  // Crossmint creates the wallet async after login (may take a few seconds).
  // When the address appears, sync it to Convex if it isn't stored yet.
  useEffect(() => {
    const walletAddr = crossmintWallet?.address || crossmintWallet?.wallet?.address;

    if (
      walletAddr &&
      authenticated &&
      isClient &&
      user?.id &&
      userProfile !== undefined && // query has resolved
      !userProfile?.walletAddress  // not yet stored in Convex
    ) {
      console.log('[PrivyAuthContext] Wallet address available (late sync):', walletAddr);
      syncUser({
        privyUserId: user.id,
        walletAddress: walletAddr,
      }).catch((err: unknown) => console.error('[PrivyAuthContext] Error syncing wallet address:', err));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [crossmintWallet?.address, crossmintWallet?.wallet?.address, authenticated, isClient, userProfile?.walletAddress, user?.id]);

  const handleLogin = () => {
    if (login) login();
  };

  const handleLogout = () => {
    if (logout) logout();
  };

  return (
    <PrivyAuthContext.Provider value={{
      isAuthenticated: authenticated,
      userProfile: userProfile || null,
      privyUser: user || null,
      isLoading: !ready && !isClient,
      login: handleLogin,
      logout: handleLogout,
      signOut: handleLogout, // Alias for backward compatibility
    }}>
      {children}
    </PrivyAuthContext.Provider>
  );
}

export function usePrivyAuth() {
  const context = useContext(PrivyAuthContext);
  if (context === undefined) {
    throw new Error('usePrivyAuth must be used within a PrivyAuthProvider');
  }
  return context;
}

// Backward compatibility alias
export const useAuth = usePrivyAuth;
