"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useQuery } from 'convex/react';
import { usePrivy } from '@privy-io/react-auth';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';

interface UserProfile {
  _id: string;
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: number;
  avatar?: Id<"_storage">;
  walletAddress?: string;
  isWalletGenerated: boolean;
  createdAt: number;
  updatedAt: number;
}

interface AuthContextType {
  isAuthenticated: boolean;
  userProfile: UserProfile | null;
  userEmail: string | null;
  setUserEmail: (email: string | null) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Check Privy auth state
  const { authenticated: privyAuthenticated, user: privyUser, ready: privyReady } = usePrivy();

  // Get user profile using the email
  const userProfile = useQuery(
    api.userManagement.getCurrentUserProfile,
    userEmail ? { email: userEmail } : "skip"
  );

  // Check authentication state - either from localStorage OR from Privy
  useEffect(() => {
    const checkAuth = () => {
      const hasLocalSession = localStorage.getItem("isAuthenticated") === "true";
      const hasPrivySession = privyReady && privyAuthenticated;
      
      // User is authenticated if they have EITHER a local session OR Privy session
      setIsAuthenticated(hasLocalSession || hasPrivySession);
      
      // If authenticated via Privy but no email set, set it
      if (hasPrivySession && !userEmail && privyUser) {
        const email = privyUser.email?.address || privyUser.google?.email || null;
        if (email) {
          setUserEmail(email);
          localStorage.setItem('userEmail', email);
          localStorage.setItem('isAuthenticated', 'true');
        }
      }
    };
    
    checkAuth();
  }, [userProfile, privyAuthenticated, privyUser, privyReady, userEmail]);

  // Load user email from localStorage on mount
  useEffect(() => {
    const email = localStorage.getItem("userEmail");
    if (email) {
      setUserEmail(email);
    }
  }, []);

  const signOut = () => {
    // Clear local storage
    localStorage.removeItem("userEmail");
    localStorage.removeItem("isAuthenticated");
    setUserEmail(null);
    setIsAuthenticated(false);
    
    // Note: Privy logout should be handled separately via Privy UI
    if (privyAuthenticated && privyReady) {
      console.log('Note: To fully logout from Privy, use the Privy logout option');
    }
    
    window.location.href = "/";
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      userProfile: userProfile || null,
      userEmail,
      setUserEmail,
      signOut
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
