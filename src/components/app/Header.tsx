"use client";

import { Search, Menu, X, PlusSquare } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { ThemeSwitcher } from "../default/theme-switcher";
import { AccountDropdown } from "../default/account-dropdown";
import { WalletDropdown } from "../default/wallet-dropdown";
import { useWalletUi } from "@wallet-ui/react";
import { Connection, PublicKey, LAMPORTS_PER_SOL, clusterApiUrl } from '@solana/web3.js';

function Header() {
  const { connected, account } = useWalletUi();
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileSearchMode, setIsMobileSearchMode] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);

  // Fetch balance effect
  useEffect(() => {
    let isMounted = true;

    const fetchBalance = async () => {
      if (!connected || !account?.address) {
        if (isMounted) setBalance(null);
        return;
      }

      try {
        const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
        const publicKey = new PublicKey(account.address);
        const balanceInLamports = await connection.getBalance(publicKey);
        if (isMounted) {
          setBalance(balanceInLamports / LAMPORTS_PER_SOL);
        }
      } catch (error) {
        console.error('Error fetching balance:', error);
        if (isMounted) setBalance(null);
      }
    };

    // Initial fetch
    fetchBalance();
    
    // Set up refresh interval
    const intervalId = setInterval(fetchBalance, 30000);

    // Cleanup function
    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [connected, account?.address]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleMobileSearchToggle = () => {
    setIsMobileSearchMode(!isMobileSearchMode);
    if (!isMobileSearchMode) {
      setSearchQuery("");
    }
  };

  return (
    <header className="fixed w-full bg-white dark:bg-stone-800/50 backdrop-blur border-b border-stone-200 dark:border-stone-700 z-50 py-3">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {isMobileSearchMode ? (
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search businesses..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full py-2 px-4 border-2 border-stone-200 dark:border-stone-600 outline-none text-base bg-white dark:bg-stone-700"
                autoFocus
              />
              <button
                onClick={handleMobileSearchToggle}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1"
              >
                <X className="h-5 w-5 text-stone-500" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center">
                <Image
                  src="/logo.svg"
                  alt="logo"
                  width={28}
                  height={28}
                  className="z-0"
                />
                <span className="text-xl ml-4 font-bold">FRANCHISEEN</span>
              </Link>
            </div>

            {/* Desktop Search */}
            {/* <div className="hidden md:flex items-center">
              <div className="relative">
                <div className="relative flex items-center">
                  <input
                    type="text"
                    placeholder="Search Brands"
                    className="w-64 py-1.5 pl-4 pr-10 bg-white dark:bg-stone-800 outline-none text-sm"
                  />
                  <button className="absolute right-1.5 p-2">
                    <Filter className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div> */}

            {/* Right Navigation */}
            <div className="flex items-center gap-4">
              {/* Mobile Search Toggle */}
              <button
                className="p-2 rounded-full md:hidden"
                onClick={handleMobileSearchToggle}
              >
                <Search className="h-5 w-5" />
              </button>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center gap-4">
                <ThemeSwitcher />
                {connected ? (
                  <>
                    {/* <Link href="/" className="p-2">
                      <Compass className="h-5 w-5" />
                    </Link>
                    <Link href="/saved" className="p-2">
                      <Heart className="h-5 w-5" />
                    </Link> */}
                    <Link href="/create" className="p-2">
                      <PlusSquare className="h-5 w-5" />
                    </Link>
                    {/* <Link href="/updates" className="p-2">
                      <Bell className="h-5 w-5" />
                    </Link> */}
                    <AccountDropdown balance={balance ?? undefined} />
                  </>
                ) : (
                  <WalletDropdown />
                )}
              </div>

              {/* Mobile Menu Toggle */}
              <button className="p-2 rounded-full md:hidden">
                <Menu className="h-6 w-6" />
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;