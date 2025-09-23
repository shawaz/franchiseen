"use client";

import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Power,  Store, UserCircle } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useWalletUi } from '@wallet-ui/react';
import { useRouter } from 'next/navigation';

interface AccountDropdownProps {
  balance?: number;
}

const AccountDropdown = ({ balance }: AccountDropdownProps) => {
  const [mounted, setMounted] = useState(false);
  const { disconnect } = useWalletUi();
  const router = useRouter();

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSignOut = async () => {
    try {
      await disconnect();
      // Optional: Redirect to home page after sign out
      router.push('/');
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="hover:bg-gray-100 cursor-pointer dark:hover:bg-neutral-700 p-2  transition-colors duration-200">
          <UserCircle className="h-5 w-5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-56 mt-3 bg-white dark:bg-neutral-900 dark:border-neutral-600 dark:border-2 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border-0"
        align="end"
      >
          <Link href="/account">
            <div className="flex border-b items-center gap-3 px-5 py-2 text-gray-700 dark:text-gray-100 dark:hover:bg-stone-900/30 hover:bg-gray-50 transition-colors">
              <div className="relative h-8 w-8 flex-shrink-0 z-0">
                <Image
                  src= "/avatar/avatar-m-1.png"
                  alt="Profile"
                  width={32}
                  height={32}
                  loading="lazy"
                  className="object-cover rounded z-0"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium truncate">
                  {" "}
                  Shawaz Sharif
                </h3>
                <p className="text-xs text-gray-500 truncate">
                  {balance !== undefined ? `${balance.toFixed(2)} SOL` : 'Loading...'}
                </p>
              </div>
            </div>
          </Link>  
          <Link
            href= "/franchise/account"
            className="flex items-center gap-3 px-5 py-2 text-gray-700 dark:text-gray-100 dark:hover:bg-stone-900/30 hover:bg-gray-50 transition-colors"
          >
            <div className="relative h-8 w-8 flex-shrink-0 z-0">
              <Image
                src={ "/logo/logo-2.svg"}
                alt="Profile"
                width={32}
                height={32}
                loading="lazy"
                className="object-cover rounded z-0"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium truncate">
                Citymilana
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                Franchiser
              </p>
            </div>
          </Link>
          <Link
            href= "/franchise/franchise-1/account"
            className="flex items-center gap-3 px-5 py-2 text-gray-700 dark:text-gray-100 dark:hover:bg-stone-900/30 hover:bg-gray-50 transition-colors"
          >
            <div className="relative h-8 w-8 flex-shrink-0 z-0">
              <Image
                src={ "/logo/logo-2.svg"}
                alt="Profile"
                width={32}
                height={32}
                loading="lazy"
                className="object-cover rounded z-0"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium truncate">
                Citymilana - 01
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                Manager
              </p>
            </div>
          </Link>
          <Link
            href= "/franchise/franchise-1/pos"
            className="flex items-center gap-3 px-5 py-2 text-gray-700 dark:text-gray-100 dark:hover:bg-stone-900/30 hover:bg-gray-50 transition-colors"
          >
            <div className="relative h-8 w-8 flex-shrink-0 z-0">
              <Image
                src={ "/logo/logo-2.svg"}
                alt="Profile"
                width={32}
                height={32}
                loading="lazy"
                className="object-cover rounded z-0"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium truncate">
                Citymilana - 01
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                POS
              </p>
            </div>
          </Link>
          {/* Settings Menu */}
          <div className="border-t">
            <Link href="/register">
            <button
              className="w-full flex items-center gap-4 px-6 py-3 text-gray-700 dark:text-gray-100 dark:hover:bg-stone-900/30 hover:bg-gray-50 transition-colors"
            >
              <Store className="h-5 w-5 dark:text-gray-400 text-gray-400" />
              <span className="text-sm font-medium">
                Register Brand
              </span>
            </button>
            </Link>
          </div>
          <div className="border-t">

                            <button 
                              onClick={handleSignOut}
                              className="w-full flex items-center cursor-pointer gap-4 px-6 py-3 text-gray-700 dark:text-gray-100 dark:hover:bg-red-900/50 hover:bg-red-50 transition-colors"
                            >
                              <Power className="h-5 w-5 dark:text-red-400 text-red-400" />
                              <span className="text-sm text-red-600 dark:text-red-400 font-medium">
                                Sign Out
                              </span>
                            </button>

                        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export { AccountDropdown };