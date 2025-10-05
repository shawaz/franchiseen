"use client";

import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

export function AuthStatus() {
  const { isAuthenticated, userProfile, signOut } = useAuth();

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4 m-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-green-800">
            Welcome back, {userProfile?.firstName}!
          </h3>
        </div>
        <Button
          onClick={signOut}
          variant="outline"
          size="sm"
          className="border-green-300 text-green-700 hover:bg-green-100"
        >
          Sign Out
        </Button>
      </div>
    </div>
  );
}
