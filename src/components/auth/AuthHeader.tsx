"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/PrivyAuthContext";
import { AccountDropdown } from "../default/account-dropdown";
import Link from "next/link";

export function AuthHeader() {
  const { isAuthenticated, login } = useAuth();

  if (!isAuthenticated) {
    return (
      <Button variant="outline" onClick={login}>
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
