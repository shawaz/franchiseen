"use client";

import { Search, Menu, X, ChevronDown, Home, Users, DollarSign, Megaphone, ShoppingCart, Code, HelpCircle, LayoutDashboard, Settings, Bell, LogOut, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { ThemeSwitcher } from "../default/theme-switcher";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";

function AdminHeader() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileSearchMode, setIsMobileSearchMode] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  // Navigation menu structure
  const navigationItems = [
    {
      name: "Home",
      icon: Home,
      href: "/admin",
      color: "bg-blue-500",
      children: [
        { name: "AI Assistant", href: "/admin/home/ai" },
        { name: "Tasks", href: "/admin/home/tasks" },
        { name: "Events", href: "/admin/home/events" },
        { name: "Travels", href: "/admin/home/travels" },
        { name: "News", href: "/admin/home/news" },
        { name: "Leave", href: "/admin/home/leave" },
        { name: "Handbook", href: "/admin/home/handbook" },
      ]
    },
    {
      name: "Operations",
      icon: LayoutDashboard,
      href: "/admin/operations",
      color: "bg-purple-500",
      children: [
        { name: "Office", href: "/admin/operations/office" },
        { name: "Brands", href: "/admin/operations/brand" },
        { name: "Property", href: "/admin/operations/property" },
        { name: "Franchise", href: "/admin/operations/franchise" },
        { name: "Budget", href: "/admin/operations/budget" },
        { name: "Setup", href: "/admin/operations/setup" },
        { name: "Product", href: "/admin/operations/product" },
        { name: "Team", href: "/admin/operations/team" },
        { name: "Marketing", href: "/admin/operations/marketing" },
      ]
    },
    {
      name: "Finance",
      icon: DollarSign,
      href: "/admin/finance",
      color: "bg-emerald-500",
      children: [
        { name: "Company", href: "/admin/finance/company" },
        { name: "User", href: "/admin/finance/user" },
        { name: "Brand", href: "/admin/finance/brand" },
        { name: "Funding", href: "/admin/finance/funding" },
        { name: "Franchise", href: "/admin/finance/franchise" },
        { name: "Invoices", href: "/admin/finance/invoices" },
        { name: "Payee", href: "/admin/finance/payee" },
        { name: "Accounts", href: "/admin/finance/accounts" },
        { name: "Investors", href: "/admin/finance/investors" },
      ]
    },
    {
      name: "People",
      icon: Users,
      href: "/admin/people",
      color: "bg-orange-500",
      children: [
        { name: "Users", href: "/admin/people/users" },
        { name: "Team", href: "/admin/people/team" },
        { name: "Attendance", href: "/admin/people/attendance" },
        { name: "Positions", href: "/admin/people/positions" },
        { name: "Openings", href: "/admin/people/openings" },
        { name: "Applications", href: "/admin/people/applications" },
      ]
    },
    {
      name: "Sales",
      icon: ShoppingCart,
      href: "/admin/sales",
      color: "bg-pink-500",
      children: [
        { name: "Clients", href: "/admin/sales/clients" },
        { name: "Leads", href: "/admin/sales/leads" },
        { name: "Competitions", href: "/admin/sales/competitions" },
      ]
    },
    {
      name: "Support",
      icon: HelpCircle,
      href: "/admin/support",
      color: "bg-cyan-500",
      children: [
        { name: "Helpdesk", href: "/admin/support/helpdesk" },
        { name: "Tickets", href: "/admin/support/tickets" },
      ]
    },
  ];

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleMobileSearchToggle = () => {
    setIsMobileSearchMode(!isMobileSearchMode);
    if (!isMobileSearchMode) {
      setSearchQuery("");
    }
  };

  const headerContent = (
    <header className="fixed w-full bg-white/80 dark:bg-stone-900/80 backdrop-blur-xl border-b border-stone-200/50 dark:border-stone-800/50 z-[1000] py-3 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {isMobileSearchMode ? (
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search resources..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full py-2.5 px-4 rounded-xl border border-stone-200 dark:border-stone-700 outline-none text-base bg-white dark:bg-stone-800 shadow-sm"
                autoFocus
              />
              <button
                onClick={handleMobileSearchToggle}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-6">
              <Link href="/admin" className="flex items-center group transition-transform hover:scale-105 active:scale-95">
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-tr from-stone-200 to-stone-100 dark:from-stone-700 dark:to-stone-800 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-300"></div>
                  <Image
                    src="/logo.svg"
                    alt="logo"
                    width={28}
                    height={28}
                    className="relative z-10"
                  />
                </div>
              </Link>

              {/* Desktop Navigation Menu */}
              <div className="hidden lg:flex items-center space-x-1">
                {navigationItems.map((item) => (
                  <DropdownMenu key={item.name}>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="flex items-center gap-1.5 text-stone-600 dark:text-stone-300 font-medium hover:bg-stone-100 dark:hover:bg-stone-800 transition-all">
                        {item.name}
                        <ChevronDown className="h-3.5 w-3.5 opacity-60" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-56 p-2 rounded-xl backdrop-blur-xl bg-white/95 dark:bg-stone-900/95 border-stone-200/50 dark:border-stone-800/50 shadow-2xl z-[1001]">
                      {item.children.map((child, index) => (
                        <DropdownMenuItem key={index} asChild className="rounded-lg focus:bg-stone-100 dark:focus:bg-stone-800 cursor-pointer">
                          <Link href={child.href} className="w-full py-1.5 px-2 text-stone-600 dark:text-stone-300">
                            {child.name}
                          </Link>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ))}
              </div>
            </div>

            {/* Right Navigation */}
            <div className="flex items-center gap-2 md:gap-4">
              <button
                className="p-2 rounded-full text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors lg:hidden"
                onClick={handleMobileSearchToggle}
              >
                <Search className="h-5 w-5" />
              </button>

              <div className="hidden sm:flex items-center gap-3">
                <ThemeSwitcher />
                <Link href="/">
                  <Button variant="outline" size="sm" className="rounded-full border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 font-medium">
                    View Platform
                  </Button>
                </Link>
              </div>

              <button
                className="p-2 rounded-xl text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors lg:hidden active:scale-95"
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );

  const mobileMenu = (
    <AnimatePresence>
      {isMobileMenuOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-[10000] lg:hidden"
          />

          {/* Menu Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-[85%] max-w-sm bg-stone-50 dark:bg-stone-950 z-[10001] shadow-2xl lg:hidden flex flex-col"
          >
            {/* Menu Header */}
            <div className="p-6 flex items-center justify-between border-b border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center">
                  <LayoutDashboard className="h-5 w-5 text-stone-600 dark:text-stone-300" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-stone-900 dark:text-white leading-none">Admin Center</h2>
                  <p className="text-xs text-stone-500 mt-1">Company Management</p>
                </div>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-500 active:scale-90 transition-all font-bold"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Menu Content */}
            <div className="flex-1 overflow-y-auto pt-4 pb-10">
              <div className="px-4 space-y-3">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const isOpen = activeCategory === item.name;

                  return (
                    <div key={item.name} className="overflow-hidden rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/50 shadow-sm">
                      <button
                        onClick={() => setActiveCategory(isOpen ? null : item.name)}
                        className={`w-full flex items-center justify-between p-4 transition-colors ${isOpen ? "bg-stone-50 dark:bg-stone-800/50" : ""
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.color.replace('500', '100')} dark:${item.color.replace('500', '900/20')}`}>
                            <Icon className={`h-4.5 w-4.5 ${item.color.replace('bg-', 'text-')}`} />
                          </div>
                          <span className="font-semibold text-stone-800 dark:text-stone-200">{item.name}</span>
                        </div>
                        <motion.div
                          animate={{ rotate: isOpen ? 180 : 0 }}
                          transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        >
                          <ChevronDown className={`h-4 w-4 ${isOpen ? "text-stone-900 dark:text-white" : "text-stone-400"}`} />
                        </motion.div>
                      </button>

                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden border-t border-stone-100 dark:border-stone-800"
                          >
                            <div className="p-2 grid grid-cols-1 gap-1">
                              {item.children.map((child, index) => (
                                <Link
                                  key={index}
                                  href={child.href}
                                  onClick={() => setIsMobileMenuOpen(false)}
                                  className="flex items-center justify-between p-3 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 transition-all group"
                                >
                                  <span className="text-sm text-stone-600 dark:text-stone-400 font-medium group-hover:text-stone-900 dark:group-hover:text-white transition-colors">{child.name}</span>
                                  <ChevronRight className="h-3.5 w-3.5 text-stone-300 dark:text-stone-700 group-hover:text-stone-900 dark:group-hover:text-white transform group-hover:translate-x-1 transition-all" />
                                </Link>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Actions */}
              <div className="mt-8 px-6 space-y-4">
                <div className="h-px bg-gradient-to-r from-transparent via-stone-200 dark:via-stone-800 to-transparent" />

                <div className="flex items-center justify-between py-2">
                  <span className="text-sm font-medium text-stone-500">Dark Mode</span>
                  <ThemeSwitcher />
                </div>

                <Link
                  href="/"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 p-4 rounded-2xl bg-stone-900 dark:bg-white text-white dark:text-stone-900 hover:opacity-90 active:scale-95 transition-all shadow-lg"
                >
                  <Home className="h-5 w-5" />
                  <span className="font-bold">Main Platform</span>
                  <ChevronRight className="h-4 w-4 ml-auto" />
                </Link>

                <button
                  className="w-full flex items-center gap-3 p-4 rounded-2xl border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 active:scale-95 transition-all"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="font-bold">Logout</span>
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return (
    <>
      {headerContent}
      {mounted && typeof document !== "undefined" && createPortal(mobileMenu, document.body)}
    </>
  );
}

export default AdminHeader;