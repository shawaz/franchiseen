"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PlusSquare } from "lucide-react";
import { EmailAuth } from "./EmailAuth";
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
        <DialogContent className="sm:max-w-md">
          <DialogTitle className="sr-only">Sign In</DialogTitle>
          <EmailAuth onBack={() => setShowAuthDialog(false)} />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <div className="flex items-center gap-4">
      {/* Create Icon */}
      <Link href="/create" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors">
        <PlusSquare className="h-5 w-5" />
      </Link>
      
      {/* Account Dropdown */}
      <AccountDropdown />
    </div>
  );
}
