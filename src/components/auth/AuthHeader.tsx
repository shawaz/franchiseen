"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { AccountDropdown } from "../default/account-dropdown";
import Link from "next/link";

export function AuthHeader() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <Link href="/auth">
        <Button variant="outline">
          Get Started
        </Button>
      </Link>
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
