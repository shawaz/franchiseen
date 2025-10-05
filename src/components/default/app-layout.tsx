'use client'

import { ThemeProvider } from './theme-provider'
import { Toaster } from '../ui/sonner'
import React from 'react'
import { ClusterUiChecker } from '@/features/cluster/ui/cluster-ui-checker'
import { AccountUiChecker } from '@/features/account/ui/account-ui-checker'
import { useGoogleMapsPreload } from '@/hooks/useGoogleMapsPreload'
import { RouteGuard } from '../auth/RouteGuard'

export function AppLayout({
  children,
}: {
  children: React.ReactNode
  links: { label: string; path: string }[]
}) {
  // Preload Google Maps for better performance
  useGoogleMapsPreload();

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <div className="flex flex-col min-h-screen">
        {/* <AppHeader links={links} /> */}
        <main className="min-h-screen bg-stone-100 dark:bg-stone-900">
          <ClusterUiChecker>
            <AccountUiChecker />
          </ClusterUiChecker>
          <RouteGuard>
            {children}
          </RouteGuard>
        </main>
      </div>
      <Toaster closeButton />
    </ThemeProvider>
  )
}
