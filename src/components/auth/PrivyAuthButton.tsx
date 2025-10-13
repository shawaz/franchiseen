'use client'

import { usePrivyAuth } from '@/hooks/usePrivyAuth'
import { Button } from '@/components/ui/button'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { User, Wallet, LogOut } from 'lucide-react'

/**
 * Example component showing Privy authentication integration
 * Use this as a reference for implementing Privy auth in your app
 */
export function PrivyAuthButton() {
  const { 
    authenticated, 
    ready, 
    login, 
    logout, 
    email,
    primarySolanaWallet,
    hasSolanaWallet 
  } = usePrivyAuth()

  if (!ready) {
    return (
      <Button variant="outline" disabled>
        Loading...
      </Button>
    )
  }

  if (!authenticated) {
    return (
      <Button onClick={login}>
        Connect Wallet
      </Button>
    )
  }

  const shortenAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <User className="mr-2 h-4 w-4" />
          {email || (primarySolanaWallet ? shortenAddress(primarySolanaWallet.address) : 'Account')}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {email && (
          <DropdownMenuItem disabled>
            {email}
          </DropdownMenuItem>
        )}
        {hasSolanaWallet && primarySolanaWallet && (
          <DropdownMenuItem disabled>
            <Wallet className="mr-2 h-4 w-4" />
            {shortenAddress(primarySolanaWallet.address)}
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

