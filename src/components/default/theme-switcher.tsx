"use client";

import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Laptop, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const ThemeSwitcher = () => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="hover:bg-gray-100 cursor-pointer dark:hover:bg-neutral-700 p-2  transition-colors duration-200">
          {theme === "light" ? (
            <Sun className="h-5 w-5" />
          ) : theme === "dark" ? (
            <Moon className="h-5 w-5" />
          ) : (
            <Laptop className="h-5 w-5" />
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-56 mt-3 p-4 bg-white dark:bg-neutral-900 dark:border-neutral-600 dark:border-2  shadow-[0_8px_30px_rgb(0,0,0,0.12)] border-0"
        align="end"
      >
        <div className="mb-3">
          <h3 className="text-lg font-semibold dark:text-gray-100 text-gray-900">
            Theme
          </h3>
        </div>
        <DropdownMenuRadioGroup
          value={theme}
          onValueChange={(e) => setTheme(e)}
          className="space-y-1"
        >
          <DropdownMenuRadioItem
            className="group flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700  cursor-pointer relative data-[state=checked]:bg-neutral/5 data-[state=checked]:text-neutral hover:bg-gray-50 transition-colors"
            value="light"
          >
            <div className="p-2  dark:bg-neutral-700 bg-gray-100 group-data-[state=checked]:bg-neutral/10">
              <Sun className="h-4 w-4 group-data-[state=checked]:text-neutral dark:text-neutral-100" />
            </div>
            <div className="flex-1">
              <p className="font-medium dark:text-neutral-100">Light</p>
              <p className="text-xs dark:text-gray-400 text-gray-600 mt-0.5">
                Use light theme
              </p>
            </div>
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem
            className="group flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700  cursor-pointer relative data-[state=checked]:bg-neutral/5 data-[state=checked]:text-neutral hover:bg-gray-50 transition-colors"
            value="dark"
          >
            <div className="p-2  dark:bg-neutral-700 bg-gray-100 group-data-[state=checked]:bg-neutral/10">
              <Moon className="h-4 w-4 group-data-[state=checked]:text-neutral-100 dark:text-neutral-100" />
            </div>
            <div className="flex-1">
              <p className="font-medium dark:text-neutral-100">Dark</p>
              <p className="text-xs dark:text-gray-400 text-gray-600 mt-0.5">
                Use dark theme
              </p>
            </div>
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem
            className="group flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700  cursor-pointer relative data-[state=checked]:bg-neutral/5 data-[state=checked]:text-neutral hover:bg-gray-50 transition-colors"
            value="system"
          >
            <div className="p-2  dark:bg-neutral-700 bg-gray-100 group-data-[state=checked]:bg-neutral/10">
              <Laptop className="h-4 w-4 group-data-[state=checked]:text-neutral dark:text-neutral-100" />
            </div>
            <div className="flex-1">
              <p className="font-medium dark:text-neutral-100">System</p>
              <p className="text-xs dark:text-gray-400 text-gray-600 mt-0.5">
                Match system theme
              </p>
            </div>
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export { ThemeSwitcher };