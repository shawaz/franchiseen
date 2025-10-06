"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { UnifiedAuth } from "./UnifiedAuth";
import { useAuth } from "@/contexts/AuthContext";
import { AccountDropdown } from "../default/account-dropdown";
import Link from "next/link";

export function AuthHeader() {
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogTrigger asChild>
          <Button variant="outline">
            Sign In
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogTitle className="sr-only">Sign In</DialogTitle>
          <div className="p-6">
            <UnifiedAuth 
              onSuccess={() => setShowAuthDialog(false)}
            />
          </div>
        </DialogContent>
      </Dialog>
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
