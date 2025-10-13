"use client";

import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AuthPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/';

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, router, redirectTo]);

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-900 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Authentication</CardTitle>
            <CardDescription>
              Sign in to your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Authentication system is being configured.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

