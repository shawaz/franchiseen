"use client";

import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Power,  Store, UserCircle, Building2 } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useWalletUi } from '@wallet-ui/react';
import { useRouter } from 'next/navigation';
import { useAllFranchisersByWallet } from '@/hooks/useFranchises';
import { useConvexImageUrl } from '@/hooks/useConvexImageUrl';
import { Id } from '../../../convex/_generated/dataModel';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';

interface AccountDropdownProps {
  balance?: number;
}

interface FranchiserDropdownItemProps {
  franchiser: {
    _id: string;
    name: string;
    slug: string;
    logoUrl?: string;
    status: 'draft' | 'pending' | 'approved' | 'rejected';
  };
}

const FranchiserDropdownItem = ({ franchiser }: FranchiserDropdownItemProps) => {
  const logoUrl = useConvexImageUrl(franchiser.logoUrl as Id<"_storage"> | undefined);
  
  return (
    <Link
      href={`/${franchiser.slug}/account`}
      className="flex items-center gap-3 px-5 py-2 text-gray-700 dark:text-gray-100 dark:hover:bg-stone-900/30 hover:bg-gray-50 transition-colors"
    >
      <div className="relative h-8 w-8 flex-shrink-0 z-0">
        {logoUrl ? (
          <Image
            src={logoUrl}
            alt={franchiser.name}
            width={32}
            height={32}
            loading="lazy"
            className="object-cover rounded z-0"
            unoptimized
          />
        ) : (
          <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900/20 rounded flex items-center justify-center">
            <Store className="w-4 h-4 text-yellow-600" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-medium truncate">
          {franchiser.name}
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
          {franchiser.status === 'approved' ? 'Franchiser' : 'Pending Approval'}
        </p>
      </div>
    </Link>
  );
};

const AccountDropdown = ({ balance }: AccountDropdownProps) => {
  const [mounted, setMounted] = useState(false);
  const { disconnect, account } = useWalletUi();
  const router = useRouter();
  
  // Get user's franchiser data
  const franchisers = useAllFranchisersByWallet(account?.address || '');
  
  // Check if user is a team member
  const teamMember = useQuery(api.adminManagement.getTeamMemberByWallet, 
    account?.address ? { walletAddress: account.address } : "skip"
  );
  
  // Debug logging
  console.log('Account dropdown - account:', account?.address);
  console.log('Account dropdown - franchisers:', franchisers);
  console.log('Account dropdown - team member:', teamMember);
  console.log('Account dropdown - franchisers loading:', franchisers === undefined);
  console.log('Account dropdown - franchisers length:', franchisers?.length || 0);

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
          
          

          {/* User's Registered Brands */}
          {franchisers === undefined ? (
            <div className="px-5 py-2 text-xs text-gray-500">
              Loading brands...
            </div>
          ) : franchisers && franchisers.length > 0 ? (
            franchisers.map((franchiser) => (
              <FranchiserDropdownItem key={franchiser._id} franchiser={franchiser} />
            ))
          ) : null}
          
          {/* <Link
            href= "/franchise/account"
            className="flex items-center gap-3 px-5 py-2 text-gray-700 dark:text-gray-100 dark:hover:bg-stone-900/30 hover:bg-gray-50 transition-colors"
          >
            <div className="relative h-8 w-8 flex-shrink-0 z-0">
              <Image
                src={ "/logo/logo-2.svg"}
                unoptimized
                alt="Profile"
                width={32}
                height={32}
                loading="lazy"
                className="object-cover rounded z-0"
                unoptimized
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
                unoptimized
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
                unoptimized
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
          </Link> */}
          {/* Company Dashboard - Only for team members */}
          {teamMember && (
           <Link href="/admin/home/ai">
           <button
             className="w-full border-t flex items-center gap-4 px-6 py-3 text-gray-700 dark:text-gray-100 dark:hover:bg-stone-900/30 hover:bg-gray-50 transition-colors"
           >
             <Building2 className="h-5 w-5 dark:text-gray-400 text-gray-400" />
             <span className="text-sm font-medium">
               Company
             </span>
           </button>
           </Link>
          )}
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