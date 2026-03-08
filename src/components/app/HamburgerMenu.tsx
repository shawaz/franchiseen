"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Menu,
  X,
  Store,
  Building2,
  User,
  Power,
  Plus,
  Settings,
  Sun,
  Moon,
  Monitor,
  Banknote,
  Receipt,
  ChevronRight,
  ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/PrivyAuthContext";
import { ThemeSwitcher } from "../default/theme-switcher";
import { useTheme } from "next-themes";
import { useAllFranchisersByUserId } from '@/hooks/useFranchises';
import { useConvexImageUrl } from '@/hooks/useConvexImageUrl';
import { Id } from '../../../convex/_generated/dataModel';
import Image from "next/image";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from "framer-motion";



// Custom theme switcher for hamburger menu
const HamburgerThemeSwitcher = () => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const themes = [
    { value: "light", icon: Sun },
    { value: "dark", icon: Moon },
    { value: "system", icon: Monitor }
  ];

  return (
    <div className="flex items-center gap-1.5 p-1 bg-stone-100 dark:bg-stone-800/50 rounded-xl border border-stone-200 dark:border-stone-700">
      {themes.map((themeOption) => {
        const IconComponent = themeOption.icon;
        const isActive = theme === themeOption.value;
        return (
          <button
            key={themeOption.value}
            onClick={() => setTheme(themeOption.value)}
            className={`p-2 rounded-lg transition-all ${isActive
              ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-sm border border-stone-200/50 dark:border-stone-600'
              : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
          >
            <IconComponent className="w-4 h-4" />
          </button>
        );
      })}
    </div>
  );
};

export function HamburgerMenu() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, userProfile, signOut, login } = useAuth();
  const router = useRouter();


  // Get user's franchiser data using user ID from user profile
  const franchisers = useAllFranchisersByUserId(userProfile?._id || '');

  // Check if user has franchiseen.com email address
  const isCompanyUser = userProfile?.email?.endsWith('@franchiseen.com') || false;


  const handleSignOut = async () => {
    try {
      await signOut();
      setIsMenuOpen(false);
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  const footerLinks = {
    services: [
      { label: "Franchisee", href: "/company/services/franchisee" },
      { label: "Franchiser", href: "/company/services/franchiser" },
      { label: "Franchise", href: "/company/services/agent" },
      { label: "Agents", href: "/company/services/training" },
    ],
    company: [
      { label: "How it Works", href: "/company/how" },
      { label: "About Us", href: "/company/about" },
      { label: "Careers", href: "/company/careers" },
      { label: "Blog", href: "/company/blog" },
    ],
    resources: [
      { label: "Help Center", href: "/company/help" },
      { label: "Documentation", href: "/company/doc" },
      { label: "Support", href: "/company/support" },
      { label: "FAQs", href: "/company/faq" },
    ],
    legal: [
      { label: "Franchise Policy", href: "/company/legal/franchise" },
      { label: "Investment Policy", href: "/company/legal/funds" },
      { label: "Terms of Service", href: "/company/legal/terms" },
      { label: "Privacy Policy", href: "/company/legal/privacy" },
    ],
  };

  const menuVariants = {
    closed: { x: "100%", transition: { type: "spring", stiffness: 300, damping: 30 } },
    open: { x: 0, transition: { type: "spring", stiffness: 300, damping: 30 } }
  };

  const overlayVariants = {
    closed: { opacity: 0 },
    open: { opacity: 1 }
  };

  const renderSignedOutMenu = () => (
    <div className="space-y-8 py-4">
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 px-1">Get Started</h3>
        <Button
          onClick={() => { setIsMenuOpen(false); login(); }}
          className="w-full h-14 text-lg font-semibold rounded-2xl bg-stone-900 dark:bg-white text-white dark:text-stone-900 hover:scale-[0.98] transition-transform"
        >
          Sign In / Sign Up
        </Button>
      </div>

      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 px-1">Settings</h3>
        <div className="flex items-center justify-between p-4 bg-stone-50 dark:bg-stone-800/40 rounded-2xl border border-stone-200/50 dark:border-stone-700/50">
          <span className="text-sm font-medium text-stone-700 dark:text-stone-300">Appearance</span>
          <HamburgerThemeSwitcher />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8 pt-4">
        {Object.entries(footerLinks).map(([category, links]) => (
          <div key={category} className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 capitalize px-1">
              {category}
            </h3>
            <ul className="space-y-3">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm font-medium text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );

  // Brand Item Component
  const BrandItem = ({ franchiser, onClose }: { franchiser: any; onClose: () => void }) => {
    const logoUrl = useConvexImageUrl(franchiser.logoUrl as Id<"_storage"> | undefined);

    return (
      <Link
        href={`/${franchiser.slug}/account`}
        className="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-stone-800/50 border border-stone-100 dark:border-stone-700/50 hover:bg-stone-50 dark:hover:bg-stone-800 transition-all active:scale-[0.98]"
        onClick={onClose}
      >
        <div className="relative h-12 w-12 flex-shrink-0 shadow-sm rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-800">
          {logoUrl ? (
            <Image src={logoUrl} alt={franchiser.name} fill className="object-cover" unoptimized />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Store className="w-6 h-6 text-stone-400" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold truncate text-stone-900 dark:text-stone-100">
            {franchiser.name}
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-500 font-medium">
            {franchiser.status === 'approved' ? 'Franchiser Account' : 'Pending Approval'}
          </p>
        </div>
        <ChevronRight className="w-4 h-4 text-stone-300 dark:text-stone-600" />
      </Link>
    );
  };

  const renderSignedInMenu = () => (
    <div className="space-y-8 py-2">
      {/* Brands Owned */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 px-1">Your Brands</h3>
        <div className="space-y-3">
          {franchisers === undefined ? (
            <div className="p-4 text-sm text-stone-400 animate-pulse">Loading brands...</div>
          ) : franchisers?.length > 0 ? (
            franchisers.map((f) => <BrandItem key={f._id} franchiser={f} onClose={() => setIsMenuOpen(false)} />)
          ) : (
            <div className="p-8 rounded-2xl border-2 border-dashed border-stone-200 dark:border-stone-800 text-center">
              <p className="text-sm text-stone-500 font-medium">No brands registered yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Primary Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/register" onClick={() => setIsMenuOpen(false)} className="col-span-2">
          <div className="bg-yellow-400 dark:bg-yellow-500 p-5 rounded-2xl flex items-center gap-4 group active:scale-[0.98] transition-all">
            <div className="w-12 h-12 bg-white/30 rounded-xl flex items-center justify-center backdrop-blur-md">
              <Store className="w-6 h-6 text-stone-900" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-stone-900">Register Brand</h4>
              <p className="text-xs text-stone-900/70 font-medium">Launch your franchise</p>
            </div>
          </div>
        </Link>
        <Link href="/account" onClick={() => setIsMenuOpen(false)}>
          <div className="bg-stone-100 dark:bg-stone-800/60 p-4 rounded-2xl flex flex-col gap-3 active:scale-[0.98] transition-all border border-stone-200/50 dark:border-stone-700/50">
            <User className="w-5 h-5 text-stone-600 dark:text-stone-400" />
            <span className="text-sm font-bold text-stone-900 dark:text-stone-100">Profile</span>
          </div>
        </Link>
        <Link href="/create" onClick={() => setIsMenuOpen(false)}>
          <div className="bg-stone-100 dark:bg-stone-800/60 p-4 rounded-2xl flex flex-col gap-3 active:scale-[0.98] transition-all border border-stone-200/50 dark:border-stone-700/50">
            <Plus className="w-5 h-5 text-stone-600 dark:text-stone-400" />
            <span className="text-sm font-bold text-stone-900 dark:text-stone-100">Create</span>
          </div>
        </Link>
      </div>

      {isCompanyUser && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 px-1">Internal</h3>
          <Link href="/admin/home/ai" onClick={() => setIsMenuOpen(false)}>
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/20 border border-indigo-500/20">
              <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span className="text-sm font-bold text-indigo-900 dark:text-indigo-100">Company Dashboard</span>
            </div>
          </Link>
        </div>
      )}

      {/* Settings Panel */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 px-1">Settings</h3>
        <div className="p-4 rounded-3xl bg-stone-50 dark:bg-stone-800/30 border border-stone-200/50 dark:border-stone-700/50 space-y-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Settings className="w-4 h-4 text-stone-400" />
              <span className="text-sm font-semibold text-stone-700 dark:text-stone-300">Appearance</span>
            </div>
            <HamburgerThemeSwitcher />
          </div>
        </div>
      </div>

      {/* Sign Out */}
      <button
        onClick={handleSignOut}
        className="w-full flex items-center justify-center gap-3 p-5 rounded-2xl border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 font-bold hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
      >
        <Power className="w-5 h-5" />
        Sign Out
      </button>
    </div>
  );

  return (
    <>
      {/* Hamburger Menu Button */}
      <button
        className="p-2.5 rounded-full md:hidden bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700 hover:scale-105 active:scale-95 transition-all shadow-sm"
        onClick={() => setIsMenuOpen(true)}
      >
        <Menu className="h-5 w-5 text-stone-600 dark:text-stone-400" />
      </button>

      {/* Portal to render menu at document root */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {isMenuOpen && (
            <div className="fixed inset-0 z-[9999] md:hidden pointer-events-none">
              <motion.div
                initial="closed" animate="open" exit="closed" variants={overlayVariants}
                onClick={() => setIsMenuOpen(false)}
                className="absolute inset-0 bg-stone-900/40 dark:bg-black/60 backdrop-blur-sm pointer-events-auto"
              />
              <motion.div
                initial="closed" animate="open" exit="closed" variants={menuVariants}
                className="absolute top-0 right-0 w-[85%] max-w-[400px] h-full bg-white dark:bg-stone-900 shadow-2xl pointer-events-auto flex flex-col"
              >
                <div className="flex-shrink-0 flex items-center justify-between px-6 py-5 border-b border-stone-100 dark:border-stone-800">
                  <span className="text-lg font-bold tracking-tight text-stone-900 dark:text-stone-100">Menu</span>
                  <button
                    onClick={() => setIsMenuOpen(false)}
                    className="p-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:rotate-90 transition-all duration-300"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="flex-1 px-6 py-6 overflow-y-auto scrollbar-hide">
                  {isAuthenticated ? renderSignedInMenu() : renderSignedOutMenu()}

                  {/* Subtle Footer */}
                  <div className="mt-12 mb-8 text-center">
                    <p className="text-[10px] font-bold tracking-widest text-stone-300 dark:text-stone-600 uppercase">
                      Franchisee &copy; 2026
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
