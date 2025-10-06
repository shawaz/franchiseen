"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Menu, X, Store, Building2, User, Power, Plus, Settings, Sun, Moon, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeSwitcher } from "../default/theme-switcher";
import { UnifiedAuth } from "../auth/UnifiedAuth";
import { useTheme } from "next-themes";
import { useAllFranchisersByUserId } from '@/hooks/useFranchises';
import { useConvexImageUrl } from '@/hooks/useConvexImageUrl';
import { Id } from '../../../convex/_generated/dataModel';
import Image from "next/image";
import Link from "next/link";
import { useRouter } from 'next/navigation';


// Custom theme switcher for hamburger menu
const HamburgerThemeSwitcher = () => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const themes = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Monitor }
  ];

  return (
    <div className="flex items-center gap-2">
      {themes.map((themeOption) => {
        const IconComponent = themeOption.icon;
        return (
          <button
            key={themeOption.value}
            onClick={() => setTheme(themeOption.value)}
            className={`p-2 rounded-lg text-sm transition-colors ${
              theme === themeOption.value
                ? 'bg-primary text-primary-foreground'
                : 'bg-stone-200 dark:bg-stone-700 hover:bg-stone-300 dark:hover:bg-stone-600'
            }`}
            title={themeOption.label}
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
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { isAuthenticated, userProfile, signOut } = useAuth();
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
    if (isMenuOpen || showAuthModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen, showAuthModal]);

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

  const renderSignedOutMenu = () => (
    <div className="space-y-6">
      {/* Authentication Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Get Started</h3>
        <div className="space-y-3">
          <Button 
            onClick={() => setShowAuthModal(true)}
            className="w-full"
          >
            Sign In / Sign Up
          </Button>
        </div>
      </div>

      {/* Theme Switcher */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Settings</h3>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">Theme</span>
          <ThemeSwitcher />
        </div>
      </div>

      {/* Footer Links */}
      <div className="space-y-6">
        {Object.entries(footerLinks).map(([category, links]) => (
          <div key={category} className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 capitalize">
              {category}
            </h3>
            <ul className="space-y-2">
              {links.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href}
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-600 transition-colors"
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
  const BrandItem = ({ franchiser, onClose }: { franchiser: { _id: string; name: string; slug: string; logoUrl?: Id<"_storage">; status: string }; onClose: () => void }) => {
    const logoUrl = useConvexImageUrl(franchiser.logoUrl as Id<"_storage"> | undefined);
    
    return (
      <Link
        href={`/${franchiser.slug}/account`}
        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-stone-800 transition-colors"
        onClick={onClose}
      >
        <div className="relative h-10 w-10 flex-shrink-0">
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt={franchiser.name}
              width={40}
              height={40}
              className="object-cover rounded-lg"
              unoptimized
            />
          ) : (
            <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
              <Store className="w-5 h-5 text-yellow-600" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium truncate text-gray-900 dark:text-gray-100">
            {franchiser.name}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {franchiser.status === 'approved' ? 'Franchiser' : 'Pending Approval'}
          </p>
        </div>
      </Link>
    );
  };

  const renderSignedInMenu = () => (
    <div className="space-y-6">

      {/* List of Brands Owned */}
      {franchisers === undefined ? (
        <div className="space-y-3">
          <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
            Loading brands...
          </div>
        </div>
      ) : franchisers && franchisers.length > 0 ? (
        <div className="space-y-3">
          <div className="space-y-2">
            {franchisers.map((franchiser) => (
              <BrandItem 
                key={franchiser._id} 
                franchiser={franchiser} 
                onClose={() => setIsMenuOpen(false)} 
              />
            ))}
          </div>
        </div>
      ) : null}

      {/* Register Brand - Always First */}
      <div className="space-y-3">
        <Link href="/register" onClick={() => setIsMenuOpen(false)}>
          <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors">
            <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900/20 rounded flex items-center justify-center">
              <Store className="w-4 h-4 text-yellow-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 dark:text-gray-100">Register Your Brand</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">Create and manage your franchise</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Quick Actions */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Quick Actions</h3>
        <div className="space-y-2">
          <Link href="/account" onClick={() => setIsMenuOpen(false)}>
            <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors">
              <div className="w-8 h-8 bg-stone-200 dark:bg-stone-700 rounded flex items-center justify-center">
                <User className="w-4 h-4 text-stone-600 dark:text-stone-400" />
              </div>
              <span className="text-sm text-gray-700 dark:text-gray-300">My Account</span>
            </div>
          </Link>
          <Link href="/create" onClick={() => setIsMenuOpen(false)}>
            <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors">
              <div className="w-8 h-8 bg-stone-200 dark:bg-stone-700 rounded flex items-center justify-center">
                <Plus className="w-4 h-4 text-stone-600 dark:text-stone-400" />
              </div>
              <span className="text-sm text-gray-700 dark:text-gray-300">Create Franchise</span>
            </div>
          </Link>
        </div>
      </div>

      {/* Company Menu - Only for franchiseen.com users */}
      {isCompanyUser && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Company</h3>
          <Link href="/admin/home/ai" onClick={() => setIsMenuOpen(false)}>
            <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors">
              <div className="w-8 h-8 bg-stone-200 dark:bg-stone-700 rounded flex items-center justify-center">
                <Building2 className="w-4 h-4 text-stone-600 dark:text-stone-400" />
              </div>
              <span className="text-sm text-gray-700 dark:text-gray-300">Company Dashboard</span>
            </div>
          </Link>
        </div>
      )}

      {/* Settings */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Settings</h3>
        <div className="p-3 rounded-lg bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-stone-200 dark:bg-stone-700 rounded flex items-center justify-center">
                <Settings className="w-4 h-4 text-stone-600 dark:text-stone-400" />
              </div>
              <span className="text-sm text-gray-700 dark:text-gray-300">Theme</span>
            </div>
            <HamburgerThemeSwitcher />
          </div>
        </div>
      </div>

      {/* Footer Links */}
      {Object.entries(footerLinks).map(([category, links]) => (
        <div key={category} className="space-y-3">
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 capitalize">{category}</h3>
          <ul className="space-y-2">
            {links.map((link) => (
              <li key={link.href}>
                <Link 
                  href={link.href} 
                  className="block text-sm text-stone-600 dark:text-stone-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}

      {/* Sign Out */}
      <div className="border-t border-stone-200 dark:border-stone-700 pt-4">
        <button 
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded flex items-center justify-center">
            <Power className="w-4 h-4 text-red-600 dark:text-red-400" />
          </div>
          <span className="text-sm text-red-600 dark:text-red-400 font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );

  const menuContent = (
    <>
      {/* Full Screen Menu Overlay */}
      {isMenuOpen && (
        <div 
          className="fixed top-0 left-0 right-0 bottom-0 w-full h-full z-[9999] bg-white dark:bg-stone-900 md:hidden"
          style={{ 
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 9999
          }}
        >
          <div className="w-full h-full flex flex-col">
            {/* Header */}
            <div className="flex-shrink-0 bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-700 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Menu
              </h2>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Menu Content */}
            <div className="flex-1 px-6 py-6 overflow-y-auto min-h-0">
              {isAuthenticated ? renderSignedInMenu() : renderSignedOutMenu()}
            </div>
          </div>
        </div>
      )}

      {/* Auth Full Screen */}
      {showAuthModal && (
        <div 
          className="fixed top-0 left-0 right-0 bottom-0 w-full h-full z-[9999] bg-white dark:bg-stone-900 md:hidden"
          style={{ 
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 9999
          }}
        >
          <div className="w-full h-full flex flex-col">
            {/* Header */}
            <div className="flex-shrink-0 bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-700 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Sign In
              </h2>
              <button
                onClick={() => setShowAuthModal(false)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Auth Content */}
            <div className="flex-1 px-6 py-6 overflow-y-auto min-h-0">
              <UnifiedAuth 
                onSuccess={() => {
                  setShowAuthModal(false);
                  setIsMenuOpen(false);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );

  return (
    <>
      {/* Hamburger Menu Button */}
      <button 
        className="p-2 rounded-full md:hidden hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        onClick={() => setIsMenuOpen(true)}
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Portal to render menu at document root */}
      {typeof document !== 'undefined' && createPortal(menuContent, document.body)}
    </>
  );
}
