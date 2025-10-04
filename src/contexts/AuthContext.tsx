"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useQuery } from 'convex/react';
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

  // Get user profile using the email
  const userProfile = useQuery(
    api.userManagement.getCurrentUserProfile,
    userEmail ? { email: userEmail } : "skip"
  );

  // Check authentication state on mount and when userProfile changes
  useEffect(() => {
    const checkAuth = () => {
      const hasSession = localStorage.getItem("isAuthenticated") === "true";
      const hasProfile = !!userProfile;
      setIsAuthenticated(hasSession && hasProfile);
    };
    
    checkAuth();
  }, [userProfile]);

  // Load user email from localStorage on mount
  useEffect(() => {
    const email = localStorage.getItem("userEmail");
    if (email) {
      setUserEmail(email);
    }
  }, []);

  const signOut = () => {
    localStorage.removeItem("userEmail");
    localStorage.removeItem("isAuthenticated");
    setUserEmail(null);
    setIsAuthenticated(false);
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
