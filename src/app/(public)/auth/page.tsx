"use client";

import React, { useEffect } from 'react';
import { usePrivyAuth } from '@/contexts/PrivyAuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Mail, Wallet } from 'lucide-react';
import Image from 'next/image';

export default function AuthPage() {
  const { isAuthenticated, isLoading, login } = usePrivyAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/';

  // Check if Privy is configured
  const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, router, redirectTo]);

  // Debug: Log Privy configuration
  useEffect(() => {
    console.log('Privy App ID configured:', !!privyAppId);
    console.log('Is loading:', isLoading);
    console.log('Is authenticated:', isAuthenticated);
  }, [privyAppId, isLoading, isAuthenticated]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-50 dark:bg-stone-900 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show error if Privy not configured
  if (!privyAppId) {
    return (
      <div className="min-h-screen bg-stone-50 dark:bg-stone-900 flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Configuration Error</CardTitle>
            <CardDescription>
              Privy authentication is not configured
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Please add <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">NEXT_PUBLIC_PRIVY_APP_ID</code> to your environment variables.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-900 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Image 
            src="/logo.svg" 
            alt="Franchiseen" 
            width={180} 
            height={60}
            className="dark:invert"
          />
        </div>
        
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Welcome Back</CardTitle>
            <CardDescription className="text-center">
              Sign in to your Franchiseen account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={login}
              className="w-full h-11 text-base"
              size="lg"
            >
              <Mail className="mr-2 h-5 w-5" />
              Sign in with Email
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            <Button 
              onClick={login}
              variant="outline"
              className="w-full h-11 text-base"
              size="lg"
            >
              <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Google
            </Button>

            <Button 
              onClick={login}
              variant="outline"
              className="w-full h-11 text-base"
              size="lg"
            >
              <Wallet className="mr-2 h-5 w-5" />
              Connect Wallet
            </Button>

            <p className="text-xs text-center text-muted-foreground mt-4">
              By signing in, you agree to our Terms of Service and Privacy Policy
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

