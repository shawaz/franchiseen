"use client";

import { useAuth } from '@/contexts/AuthContext';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface RouteGuardProps {
  children: React.ReactNode;
}

export function RouteGuard({ children }: RouteGuardProps) {
  const { isAuthenticated } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {

    // Check if current path is a brand/franchise route (pattern: /[brandSlug]/[franchiseSlug] or /[brandSlug]/[franchiseSlug]/[subroute])
    // Exclude protected route segments like account, admin, create, register, notify
    const protectedSegments = ['account', 'admin', 'create', 'register', 'notify'];
    const isBrandFranchiseRoute = pathname.match(/^\/[^\/]+\/[^\/]+(\/[^\/]+)*$/) && 
      !protectedSegments.some(segment => pathname.includes(`/${segment}`));
    
    // Check if current path is under company routes
    const isCompanyRoute = pathname.startsWith('/company');

    // Check if route contains any protected segments
    const containsProtectedSegment = protectedSegments.some(segment => pathname.includes(`/${segment}`));

    // If user is not authenticated
    if (!isAuthenticated) {
      // Allow access to home page, company routes (except those with protected segments), and brand/franchise routes
      if (pathname === '/' || (isCompanyRoute && !containsProtectedSegment) || isBrandFranchiseRoute) {
        return; // Allow access
      } else {
        // Redirect to home page for all other routes
        router.push('/');
      }
    }
  }, [isAuthenticated, pathname, router]);

  // Show loading state while checking authentication
  const protectedSegments = ['account', 'admin', 'create', 'register', 'notify'];
  const isBrandFranchiseRoute = pathname.match(/^\/[^\/]+\/[^\/]+(\/[^\/]+)*$/) && 
    !protectedSegments.some(segment => pathname.includes(`/${segment}`));
  const containsProtectedSegment = protectedSegments.some(segment => pathname.includes(`/${segment}`));
  const isCompanyRoute = pathname.startsWith('/company');
    
  if (!isAuthenticated && pathname !== '/' && !(isCompanyRoute && !containsProtectedSegment) && !isBrandFranchiseRoute) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600"></div>
      </div>
    );
  }

  return <>{children}</>;
}
