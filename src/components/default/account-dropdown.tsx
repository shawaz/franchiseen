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
import { useRouter } from 'next/navigation';
import { useAllFranchisersByUserId } from '@/hooks/useFranchises';
import { useConvexImageUrl } from '@/hooks/useConvexImageUrl';
import { useUserWallet } from '@/hooks/useUserWallet';
import { Id } from '../../../convex/_generated/dataModel';
import { useAuth } from '@/contexts/AuthContext';
import { NetworkToggle } from '@/components/NetworkToggle';
import { useNetwork } from '@/contexts/NetworkContext';
import { getSolanaConnection } from '@/lib/solanaConnection';

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

const AccountDropdown = ({}: AccountDropdownProps) => {
  const [mounted, setMounted] = useState(false);
  const { isAuthenticated, userProfile, signOut } = useAuth();
  const router = useRouter();
  const { isDevnet } = useNetwork();
  
  // Get user's wallet balance
  const { wallet, updateWalletBalance } = useUserWallet({ userId: userProfile?.userId as Id<"users"> });
  const walletBalance = wallet.balance;
  const balanceLoading = wallet.isLoading;
  
  // Listen for balance updates and refresh the wallet
  useEffect(() => {
    const handleBalanceUpdate = (event: Event) => {
      const customEvent = event as CustomEvent;
      console.log('Account dropdown received walletBalanceUpdated event:', customEvent.detail);
      
      // Refresh the wallet balance from the hook
      if (customEvent.detail?.newBalance !== undefined) {
        updateWalletBalance(customEvent.detail.newBalance);
      } else {
        // If no specific balance provided, trigger a refresh
        // This will fetch the latest balance from the blockchain
        const currentWallet = localStorage.getItem('userWalletAddress');
        if (currentWallet) {
          import('@/lib/solanaWalletUtils').then(({ getWalletBalance }) => {
            getWalletBalance(currentWallet).then((newBalance) => {
              updateWalletBalance(newBalance);
            }).catch((error) => {
              console.error('Error fetching updated balance:', error);
            });
          });
        }
      }
    };
    
    window.addEventListener('walletBalanceUpdated', handleBalanceUpdate);
    
    return () => {
      window.removeEventListener('walletBalanceUpdated', handleBalanceUpdate);
    };
  }, [updateWalletBalance]);

  // Periodic balance refresh (every 30 seconds) to ensure balance stays current
  // Also refresh when network changes
  useEffect(() => {
    if (!wallet.publicKey) return;

    const refreshBalance = async () => {
      try {
        // Use the robust connection that's network-aware
        const network = isDevnet ? 'devnet' : 'mainnet-beta';
        const connection = getSolanaConnection(network);
        const currentBalance = await connection.getBalance(wallet.publicKey);
        
        // Update balance
        console.log(`Account dropdown: Balance for ${isDevnet ? 'devnet' : 'mainnet'}: ${currentBalance} SOL`);
        updateWalletBalance(currentBalance);
      } catch (error) {
        console.error('Error refreshing balance in account dropdown:', error);
      }
    };

    // Refresh immediately when wallet is loaded or network changes
    refreshBalance();

    // Set up interval for periodic refresh
    const intervalId = setInterval(refreshBalance, 30000); // 30 seconds

    return () => clearInterval(intervalId);
  }, [wallet.publicKey, isDevnet, updateWalletBalance]);
  
  // Get user's franchiser data using user ID from user profile
  const franchisers = useAllFranchisersByUserId(userProfile?._id || '');
  
  // Check if user has franchiseen.com email address
  const isCompanyUser = userProfile?.email?.endsWith('@franchiseen.com') || false;
  
  // Get user avatar URL
  const avatarUrl = useConvexImageUrl(userProfile?.avatar);
  
  // Debug logging
  console.log('Account dropdown - userProfile:', userProfile);
  console.log('Account dropdown - walletBalance:', walletBalance);
  console.log('Account dropdown - franchisers:', franchisers);
  console.log('Account dropdown - isCompanyUser:', isCompanyUser);
  console.log('Account dropdown - franchisers loading:', franchisers === undefined);
  console.log('Account dropdown - franchisers length:', franchisers?.length || 0);

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      // Optional: Redirect to home page after sign out
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (!mounted || !isAuthenticated) {
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
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt="Profile"
                    width={32}
                    height={32}
                    loading="lazy"
                    className="object-cover rounded z-0"
                  />
                ) : (
                  <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
                    <UserCircle className="w-5 h-5 text-gray-400" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium truncate">
                  {userProfile?.firstName && userProfile?.lastName 
                    ? `${userProfile.firstName} ${userProfile.lastName}`
                    : userProfile?.email || 'User'
                  }
                </h3>
                <p className="text-xs text-gray-500 truncate">
                  {balanceLoading ? 'Loading...' : `${walletBalance.toFixed(4)} SOL`}
                </p>
              </div>
            </div>
          </Link>  
          
          {/* Network Toggle */}
          <NetworkToggle />

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

          {/* Register Brand Menu */}
          <div className="border-t">
            <Link href="/register">
            <button
              className="w-full flex items-center gap-4 px-6 py-3 text-gray-700 dark:text-gray-100 dark:hover:bg-stone-900/30 hover:bg-gray-50 transition-colors"
            >
              <Store className="h-5 w-5 dark:text-gray-400 text-gray-400" />
              <span className="text-sm font-medium">
                Register Franchise
              </span>
            </button>
            </Link>
          </div>
           {/* Company Dashboard - Only for franchiseen.com email users */}
           {isCompanyUser && (
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