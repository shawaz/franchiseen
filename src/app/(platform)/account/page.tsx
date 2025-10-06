"use client";

import React, { useEffect, useState } from 'react';
import ProfileDashboard from '@/components/app/franchisee/ProfileDashboard';
import { SignupCompletion } from '@/components/auth/SignupCompletion';
import { useAuth } from '@/contexts/AuthContext';

export default function ProfilePage() {
  const { userProfile, isAuthenticated, userEmail } = useAuth();
  const [showSignupCompletion, setShowSignupCompletion] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user needs to complete signup
    const signupUserId = localStorage.getItem("signupUserId");
    const hasSession = localStorage.getItem("isAuthenticated") === "true";
    
    console.log("Account page debug:", {
      signupUserId,
      hasSession,
      isAuthenticated,
      userEmail,
      userProfile,
      userProfileLoading: userProfile === undefined
    });
    
    // Show signup completion if:
    // 1. User has a signup session (signupUserId exists)
    // 2. User is authenticated (has session)
    // 3. User doesn't have a complete profile yet (userProfile is null, not undefined)
    const hasIncompleteSignup = signupUserId && hasSession && userProfile === null;
    
    console.log("Has incomplete signup:", hasIncompleteSignup);
    
    setShowSignupCompletion(!!hasIncompleteSignup);
    
    // Set loading to false once we have determined the state
    if (userProfile !== undefined || !hasSession) {
      setIsLoading(false);
    }
  }, [userProfile, isAuthenticated, userEmail]);

  // Show loading state while determining what to display
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading account...</p>
        </div>
      </div>
    );
  }

  // Show signup completion if needed
  if (showSignupCompletion) {
    return (
      <div className="p-6">
        <SignupCompletion />
      </div>
    );
  }

  // Show profile dashboard for complete profiles
  return (
      <ProfileDashboard />
  );
}