"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { usePrivy, useWallets, User } from '@privy-io/react-auth';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';

interface UserProfile {
  _id: string;
  email?: string;
  fullName?: string;
  avatarUrl?: string;
  privyUserId?: string;
  walletAddress?: string;
  createdAt?: number;
  updatedAt?: number;
}

interface PrivyAuthContextType {
  isAuthenticated: boolean;
  userProfile: UserProfile | null;
  privyUser: User | null;
  isLoading: boolean;
  login: () => void;
  logout: () => Promise<void>;
  signOut: () => Promise<void>; // Alias for logout (backward compatibility)
}

const PrivyAuthContext = createContext<PrivyAuthContextType | undefined>(undefined);

export function PrivyAuthProvider({ children }: { children: React.ReactNode }) {
  const { 
    ready, 
    authenticated, 
    user, 
    logout: privyLogout,
    login: privyLogin,
  } = usePrivy();

  // Track if we're on client side to avoid SSR issues
  const [isClient, setIsClient] = useState(false);
  
  // Get wallets from Privy (only runs on client)
  const { wallets, ready: walletsReady } = useWallets();

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Get user profile from Convex using Privy user ID
  const userProfile = useQuery(
    api.userManagement.getUserByPrivyId,
    user?.id ? { privyUserId: user.id } : "skip"
  );

  const syncUser = useMutation(api.userManagement.syncPrivyUser);

  // Sync user to Convex database when they login
  const syncUserToConvex = async (privyUser: User) => {
    try {
      const email = privyUser.email?.address || 
                    privyUser.google?.email;
      
      const fullName = privyUser.google?.name || 
                       privyUser.twitter?.name || 
                       privyUser.discord?.username;

      // Get avatar from any available source
      let avatarUrl: string | undefined;
      if (privyUser.google && 'pictureUrl' in privyUser.google) {
        avatarUrl = (privyUser.google as unknown as { pictureUrl?: string }).pictureUrl;
      } else if (privyUser.twitter && 'profilePictureUrl' in privyUser.twitter) {
        avatarUrl = (privyUser.twitter as unknown as { profilePictureUrl?: string }).profilePictureUrl;
      } else if (privyUser.discord && 'avatarUrl' in privyUser.discord) {
        avatarUrl = (privyUser.discord as unknown as { avatarUrl?: string }).avatarUrl;
      }

      // Get embedded wallet address from Privy wallets
      let walletAddress: string | undefined;
      
      // Only access wallets on client side when ready
      if (isClient && walletsReady && wallets.length > 0) {
        // Find the Solana wallet created by Privy
        const solanaWallet = wallets.find(
          (w) => w.walletClientType === 'privy'
        );
        
        if (solanaWallet) {
          walletAddress = solanaWallet.address;
          console.log('✅ Privy Solana wallet found from wallets array:', walletAddress);
        }
      }
      
      // Fallback: Check for embedded wallet in the user object
      if (!walletAddress && privyUser.wallet) {
        walletAddress = privyUser.wallet.address;
        console.log('✅ Privy embedded wallet found from user object:', walletAddress);
      } 
      
      // Fallback: Check linked accounts
      if (!walletAddress && privyUser.linkedAccounts && privyUser.linkedAccounts.length > 0) {
        const linkedWallet = privyUser.linkedAccounts.find(
          (account) => account.type === 'wallet'
        );
        if (linkedWallet && 'address' in linkedWallet) {
          walletAddress = linkedWallet.address as string;
          console.log('✅ Privy linked wallet found:', walletAddress);
        }
      }

      if (!walletAddress) {
        console.log('⚠️ No wallet found yet. Wallets ready:', walletsReady, 'Wallets count:', wallets.length);
      }

      console.log('Syncing user to Convex with wallet:', walletAddress);

      await syncUser({
        privyUserId: privyUser.id,
        email: email || undefined,
        fullName: fullName || undefined,
        avatarUrl: avatarUrl || undefined,
        walletAddress: walletAddress || undefined,
      });
    } catch (error) {
      console.error('Error syncing user to Convex:', error);
    }
  };

  // Sync user data whenever Privy user changes or wallets become ready
  useEffect(() => {
    if (user && authenticated && isClient) {
      console.log('User authenticated, syncing to Convex:', user);
      console.log('Wallets ready:', walletsReady, 'Wallets:', wallets);
      syncUserToConvex(user);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, authenticated, isClient, walletsReady, wallets.length]);

  // Handle login
  const handleLogin = () => {
    console.log('Login button clicked, opening Privy modal');
    privyLogin();
  };

  const handleLogout = async () => {
    try {
      await privyLogout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <PrivyAuthContext.Provider value={{
      isAuthenticated: authenticated,
      userProfile: userProfile || null,
      privyUser: user || null,
      isLoading: !ready,
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

