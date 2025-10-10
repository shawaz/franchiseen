"use client";

import React, { useEffect } from 'react';
import { UnifiedAuth } from '@/components/auth/UnifiedAuth';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';

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

  const handleSuccess = () => {
    // Redirect to the intended page or home
    router.push(redirectTo);
  };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-900 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <UnifiedAuth onSuccess={handleSuccess} />
      </div>
    </div>
  );
}

