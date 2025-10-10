"use client";

import {
  Compass,
  UserCircle,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React from "react";
import { Button } from "../ui/button";
import { useAuth } from "@/contexts/AuthContext";

function FooterMobile() {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated } = useAuth();

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
          <div className="p-6">
            <Button 
              variant="default" 
              className="w-full"
              onClick={() => router.push('/auth')}
            >
              GET STARTED
            </Button>
          </div>
        )}
      </div>
    </>
  );
}

export default FooterMobile;
