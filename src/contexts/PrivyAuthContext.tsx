"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth as useCrossmintAuth } from '@crossmint/client-sdk-react-ui';
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

      let avatarUrl: string | undefined;
      let walletAddress = crossmintUser?.walletAddress || crossmintUser?.wallets?.[0]?.address;

      console.log('Syncing user to Convex with crossmint ID:', crossmintUser.id);

      await syncUser({
        privyUserId: crossmintUser.id,
        email: email || undefined,
        fullName: fullName || undefined,
        avatarUrl: avatarUrl || undefined,
        walletAddress: walletAddress || undefined,
      });
    } catch (error) {
      console.error('Error syncing user to Convex:', error);
    }
  };

  // Sync user data whenever user changes
  useEffect(() => {
    if (user && authenticated && isClient) {
      console.log('User authenticated, syncing to Convex:', user);
      syncUserToConvex(user);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, authenticated, isClient]);

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
