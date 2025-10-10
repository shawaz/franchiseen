"use client";

import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CreditCard, Gamepad2 } from "lucide-react";
import { useNetwork } from "@/contexts/NetworkContext";
import { useEffect, useState } from "react";

const NetworkSwitcher = () => {
  const [mounted, setMounted] = useState(false);
  const { network, switchNetwork, isMainnet } = useNetwork();

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const handleNetworkChange = (newNetwork: string) => {
    switchNetwork(newNetwork as 'mainnet' | 'devnet');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="hover:bg-gray-100 cursor-pointer dark:hover:bg-neutral-700 p-2 transition-colors duration-200 relative">
          {isMainnet ? (
            <CreditCard className="h-5 w-5" />
          ) : (
            <Gamepad2 className="h-5 w-5" />
          )}
          {/* Network indicator badge */}
          <span className={`absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ${
            isMainnet ? 'bg-green-500' : 'bg-yellow-500'
          }`}></span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-56 mt-3 p-4 bg-white dark:bg-neutral-900 dark:border-neutral-600 dark:border-2 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border-0"
        align="end"
      >
        <div className="mb-3">
          <h3 className="text-lg font-semibold dark:text-gray-100 text-gray-900">
            Network
          </h3>
        </div>
        <DropdownMenuRadioGroup
          value={network}
          onValueChange={handleNetworkChange}
          className="space-y-1"
        >
          <DropdownMenuRadioItem
            className="group flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 cursor-pointer relative data-[state=checked]:bg-green-50 dark:data-[state=checked]:bg-green-900/20 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors rounded-md"
            value="mainnet"
          >
            <div className="p-2 dark:bg-neutral-700 bg-gray-100 group-data-[state=checked]:bg-green-100 dark:group-data-[state=checked]:bg-green-900/40 rounded">
              <CreditCard className="h-4 w-4 group-data-[state=checked]:text-green-600 dark:group-data-[state=checked]:text-green-400 dark:text-neutral-100" />
            </div>
            <div className="flex-1">
              <p className="font-medium dark:text-neutral-100 group-data-[state=checked]:text-green-600 dark:group-data-[state=checked]:text-green-400">
                Real Money
              </p>
              <p className="text-xs dark:text-gray-400 text-gray-600 mt-0.5">
                Mainnet transactions
              </p>
            </div>
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem
            className="group flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 cursor-pointer relative data-[state=checked]:bg-yellow-50 dark:data-[state=checked]:bg-yellow-900/20 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors rounded-md"
            value="devnet"
          >
            <div className="p-2 dark:bg-neutral-700 bg-gray-100 group-data-[state=checked]:bg-yellow-100 dark:group-data-[state=checked]:bg-yellow-900/40 rounded">
              <Gamepad2 className="h-4 w-4 group-data-[state=checked]:text-yellow-600 dark:group-data-[state=checked]:text-yellow-400 dark:text-neutral-100" />
            </div>
            <div className="flex-1">
              <p className="font-medium dark:text-neutral-100 group-data-[state=checked]:text-yellow-600 dark:group-data-[state-checked]:text-yellow-400">
                Game Money
              </p>
              <p className="text-xs dark:text-gray-400 text-gray-600 mt-0.5">
                Devnet transactions
              </p>
            </div>
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export { NetworkSwitcher };

