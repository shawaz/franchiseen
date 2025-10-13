'use client'

import { useEffect } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { useAuth } from '@/contexts/AuthContext'

/**
 * This component syncs Privy authentication state with the existing AuthContext
 * It runs silently in the background and updates localStorage when Privy auth changes
 */
export function PrivyAuthSync() {
  const { authenticated, user, ready } = usePrivy()
  const { setUserEmail } = useAuth()

  useEffect(() => {
    if (!ready) return

    console.log('🔄 Privy Auth Sync:', { authenticated, user: user?.id })

    if (authenticated && user) {
      // User is authenticated with Privy
      const email = user.email?.address || user.google?.email || user.twitter?.username || null
      
      if (email) {
        console.log('✅ Syncing Privy auth to AuthContext:', email)
        
        // Update localStorage (what AuthContext checks)
        localStorage.setItem('isAuthenticated', 'true')
        localStorage.setItem('userEmail', email)
        
        // Update AuthContext state
        setUserEmail(email)
      } else {
        console.warn('⚠️ Privy user has no email:', user)
      }
    } else if (!authenticated) {
      // User is not authenticated with Privy
      console.log('❌ User not authenticated with Privy')
      
      // Only clear if there's no existing session
      const hasExistingSession = localStorage.getItem('isAuthenticated') === 'true'
      if (!hasExistingSession) {
        // No existing session, can safely clear
        localStorage.removeItem('isAuthenticated')
        localStorage.removeItem('userEmail')
        setUserEmail(null)
      }
    }
  }, [authenticated, user, ready, setUserEmail])

  // This component renders nothing
  return null
}

