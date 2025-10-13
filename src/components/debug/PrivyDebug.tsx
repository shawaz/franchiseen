'use client'

import { usePrivy } from '@privy-io/react-auth'
import { Button } from '@/components/ui/button'

export function PrivyDebug() {
  const { ready, authenticated, login, user } = usePrivy()

  return (
    <div className="fixed bottom-4 right-4 p-4 bg-white dark:bg-gray-800 border-2 border-blue-500 rounded-lg shadow-lg z-50 max-w-sm">
      <h3 className="font-bold mb-2">🔍 Privy Debug</h3>
      <div className="space-y-2 text-sm">
        <div>
          <strong>Ready:</strong> {ready ? '✅ Yes' : '❌ No'}
        </div>
        <div>
          <strong>Authenticated:</strong> {authenticated ? '✅ Yes' : '❌ No'}
        </div>
        <div>
          <strong>User:</strong> {user ? user.id : 'None'}
        </div>
        <div>
          <strong>App ID:</strong> {process.env.NEXT_PUBLIC_PRIVY_APP_ID ? '✅ Set' : '❌ Missing'}
        </div>
        <Button 
          onClick={() => {
            console.log('🔘 Login button clicked')
            console.log('📊 Privy state:', { ready, authenticated })
            login()
          }}
          className="w-full mt-2"
          size="sm"
        >
          Test Login
        </Button>
      </div>
    </div>
  )
}

