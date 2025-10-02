"use client";

import { Search, Menu, X, ChevronDown, Home, Users, DollarSign, Megaphone, ShoppingCart, Code, HelpCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import { ThemeSwitcher } from "../default/theme-switcher";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

function AdminHeader() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileSearchMode, setIsMobileSearchMode] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Navigation menu structure
  const navigationItems = [
    {
      name: "Home",
      icon: Home,
      href: "/admin",
      children: [
        { name: "AI", href: "/admin/home/ai" },
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
      icon: Users,
      href: "/admin/operations",
      children: [
        { name: "Office", href: "/admin/operation/office" },
        { name: "Brands", href: "/admin/operation/brands" },
        { name: "Property", href: "/admin/operation/properties" },
        { name: "Franchise", href: "/admin/operation/franchise" },
        { name: "Finance", href: "/admin/operation/finance" },
        { name: "Setup", href: "/admin/operation/setup" },
        { name: "Product", href: "/admin/operation/products" },
        { name: "Team", href: "/admin/operation/team" },
        { name: "Marketing", href: "/admin/operation/marketing" },
      ]
    },
    {
      name: "Management",
      icon: Users,
      href: "/admin/management",
      children: [
        { name: "Plan", href: "/admin/management/plan" },
        { name: "Strategy", href: "/admin/management/strategy" },
        { name: "Activities", href: "/admin/management/activities" },
        { name: "Resources", href: "/admin/management/resources" },
        { name: "Relations", href: "/admin/management/relations" },
        { name: "Partners", href: "/admin/management/partners" },
      ]
    },
    {
      name: "Finance",
      icon: DollarSign,
      href: "/admin/finance",
      children: [
        { name: "Company", href: "/admin/finance/company" },
        { name: "User", href: "/admin/finance/user" },
        { name: "Brand", href: "/admin/finance/brand" },
        { name: "Funding", href: "/admin/finance/funding" },
        { name: "Franchise", href: "/admin/finance/franchise" },
        { name: "Invoices", href: "/admin/finance/invoices" },
        { name: "Payee", href: "/admin/finance/payee" },
        { name: "Budgets", href: "/admin/finance/budgets" },
        { name: "Accounts", href: "/admin/finance/accounts" },
        { name: "Shareholders", href: "/admin/finance/shareholders" },
        { name: "Investors", href: "/admin/finance/investors" },
      ]
    },
    {
      name: "People",
      icon: Users,
      href: "/admin/people",
      children: [
        { name: "Users", href: "/admin/people/users" },
        { name: "Team", href: "/admin/people/team" },
        { name: "Attendance", href: "/admin/people/attendance" },
        { name: "Positions", href: "/admin/people/positions" },
        { name: "Openings", href: "/admin/people/openings" },
        { name: "Applications", href: "/admin/people/applications" },
        { name: "Onboarding", href: "/admin/people/onboarding" },
        { name: "Training", href: "/admin/people/training" },
        { name: "Offboarding", href: "/admin/people/offboarding" },
      ]
    },
    {
      name: "Marketing",
      icon: Megaphone,
      href: "/admin/marketing",
      children: [
        { name: "Segments", href: "/admin/marketing/segments" },
        { name: "Campaigns", href: "/admin/marketing/campaigns" },
        { name: "Content", href: "/admin/marketing/content" },
        { name: "Channels", href: "/admin/marketing/channels" },
        { name: "Traction", href: "/admin/marketing/traction" },
      ]
    },
    {
      name: "Sales",
      icon: ShoppingCart,
      href: "/admin/sales",
      children: [
        { name: "Clients", href: "/admin/sales/clients" },
        { name: "Leads", href: "/admin/sales/leads" },
        { name: "Competitions", href: "/admin/sales/competitions" },
      ]
    },
    {
      name: "Software",
      icon: Code,
      href: "/admin/software",
      children: [
        { name: "Features", href: "/admin/software/features" },
        { name: "Bugs", href: "/admin/software/bugs" },
        { name: "Security", href: "/admin/software/security" },
        { name: "Backups", href: "/admin/software/backups" },
        { name: "Databases", href: "/admin/software/databases" },
      ]
    },
    {
      name: "Support",
      icon: HelpCircle,
      href: "/admin/support",
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
              <Link href="/admin" className="flex items-center">
                <Image
                  src="/logo.svg"
                  alt="logo"
                  width={28}
                  height={28}
                  className="z-0"
                />
              </Link>
              {/* Desktop Navigation Menu */}
            <div className="hidden md:flex items-center space-x-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <DropdownMenu key={item.name}>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="flex items-center gap-1">
                        {/* <Icon className="h-4 w-4" /> */}
                        {item.name}
                        <ChevronDown className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-48">
                      {item.children.map((child, index) => (
                        <DropdownMenuItem key={index} asChild>
                          <Link href={child.href} className="w-full">
                            {child.name}
                          </Link>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                );
              })}
            </div>
            </div>

            

            {/* Right Navigation */}
            <div className="flex items-center gap-4">
              {/* Mobile Search Toggle */}
              <button
                className="p-2 rounded-full md:hidden"
                onClick={handleMobileSearchToggle}
              >
                <Search className="h-5 w-5" />
              </button>

              {/* Desktop Actions */}
              <div className="hidden md:flex items-center gap-4">
                <ThemeSwitcher />
                <Link href="/">
                  <Button variant="outline" size="sm">
                    View Platform
                  </Button>
                </Link>
              </div>

              {/* Mobile Menu Toggle */}
              <button 
                className="p-2 rounded-full md:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>
          </div>
        )}

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 border-t border-stone-200 dark:border-stone-700">
            <div className="grid grid-cols-2 gap-2 pt-4">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.name} className="space-y-1">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white">
                      <Icon className="h-4 w-4" />
                      {item.name}
                    </div>
                    <div className="space-y-1 ml-6">
                      {item.children.map((child, index) => (
                        <Link
                          key={index}
                          href={child.href}
                          className="block text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

export default AdminHeader;