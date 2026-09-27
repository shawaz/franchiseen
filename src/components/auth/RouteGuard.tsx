'use client'

import { useAuth } from '@/contexts/PrivyAuthContext'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'

interface RouteGuardProps {
  children: React.ReactNode
}

const PROTECTED_SEGMENTS = ['account', 'admin', 'create', 'register', 'notify']

/** Route prefixes readable without signing in. */
const PUBLIC_PREFIXES = ['/company', '/docs']

/**
 * Decides whether a path is readable by a signed-out visitor.
 * Kept as a pure function so both the redirect effect and the loading
 * fallback below make the identical decision.
 */
function isPublicPath(pathname: string): boolean {
  if (pathname === '/') return true

  const containsProtectedSegment = PROTECTED_SEGMENTS.some((segment) => pathname.includes(`/${segment}`))
  if (containsProtectedSegment) return false

  if (PUBLIC_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))) {
    return true
  }

  // Brand/franchise listings: /[brandSlug]/[franchiseSlug] and deeper.
  return /^\/[^/]+\/[^/]+(\/[^/]+)*$/.test(pathname)
}

export function RouteGuard({ children }: RouteGuardProps) {
  const { isAuthenticated } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  const allowed = isAuthenticated || isPublicPath(pathname)

  useEffect(() => {
    if (!allowed) {
      router.push('/')
    }
  }, [allowed, router])

  // Show loading state while redirecting away from a protected route
  if (!allowed) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600"></div>
      </div>
    )
  }

  return <>{children}</>
}
