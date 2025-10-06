"use client";

import {
  Compass,
  UserCircle,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState } from "react";
import { Button } from "../ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { UnifiedAuth } from "../auth/UnifiedAuth";

function FooterMobile() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  // Function to check if a path is active
  const isActive = (path: string) => {
    if (path === "/profile") {
      // For profile, check if current path starts with /profile
      return pathname.startsWith("/profile");
    }
    return pathname === path;
  };

  // Function to get icon classes based on active state
  const getIconClasses = (path: string) => {
    const baseClasses = "cursor-pointer transition-colors duration-200";
    const activeClasses = "text-neutral-800 dark:text-neutral-200"; // Active state - primary color
    const inactiveClasses =
      "text-gray-600 dark:text-gray-400 hover:text-primary"; // Inactive state with hover

    return `${baseClasses} ${isActive(path) ? activeClasses : inactiveClasses}`;
  };

  return (
    <>
      <div className="bg-white/50 dark:bg-stone-800/50 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden w-full fixed bottom-0  border-t border-stone-200 dark:border-stone-700">
         
        {isAuthenticated ? (
          <div className="justify-between max-w-7xl mx-auto px-6 sm:px-6 lg:px-8 py-4 flex items-center">
            <Link href={"/"}>
              <Compass className={getIconClasses("/")} color="currentColor" />
            </Link>
            <Link href={"/create"}>
              <Button variant="outline">
                CREATE FRANCHISE
              </Button>
            </Link>
            <Link href={"/account"}>
              <UserCircle className={getIconClasses("/account")} />
            </Link>
          </div>
        ) : (
          <div className="px-4 py-2">
            <Button 
              variant="default" 
              className="w-full"
              onClick={() => setShowAuthDialog(true)}
            >
              GET STARTED
            </Button>
          </div>
        )}
      </div>

      {/* Clean modal for mobile sign-in */}
      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent className="w-[95vw] max-w-md mx-auto my-4 p-0 rounded-xl border-0 shadow-2xl bg-white dark:bg-stone-900">
          <DialogTitle className="sr-only">Sign In</DialogTitle>
          <div className="p-6">
            <UnifiedAuth 
              onSuccess={() => setShowAuthDialog(false)}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default FooterMobile;
