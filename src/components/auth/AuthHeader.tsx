"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { AccountDropdown } from "../default/account-dropdown";
import { usePrivy } from "@privy-io/react-auth";
import Link from "next/link";

export function AuthHeader() {
  const { isAuthenticated } = useAuth();
  const { login, ready } = usePrivy();

  const handleLogin = () => {
    console.log('🔘 AuthHeader: Get Started clicked');
    console.log('📊 Privy ready:', ready);
    console.log('🔑 Login function:', typeof login);
    if (typeof login === 'function') {
      login();
    } else {
      console.error('❌ login is not a function!', login);
    }
  };

  if (!isAuthenticated) {
    return (
      <Button variant="outline" onClick={handleLogin}>
        Get Started
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-4">
      {/* Account Dropdown */}
      <AccountDropdown />
      {/* Create Icon */}
      <Link href="/create">
        <Button variant="outline">
          Create Franchise
        </Button>
      </Link>
      
      
    </div>
  );
}
