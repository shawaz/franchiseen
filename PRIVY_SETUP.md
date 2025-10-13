# Privy Integration Setup

Privy has been successfully integrated into the Franchiseen application for Web3 authentication and wallet management.

## Dependencies Installed

The following packages were installed for Privy + Solana integration:
- `@privy-io/react-auth` - Privy React SDK
- `@privy-io/server-auth` - Privy server SDK
- `@solana-program/memo` - Solana memo program
- `@solana-program/system` - Solana system program
- `@solana-program/token` - Solana token program
- `@solana/kit` - Solana Web3 utilities
- `@scure/base` - Base encoding utilities

## Environment Variables Required

Add the following environment variable to your `.env.local` file:

```bash
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id_here
```

## Getting Your Privy App ID

1. Go to [Privy Dashboard](https://dashboard.privy.io)
2. Sign up or log in to your account
3. Create a new app or select an existing one
4. Copy your **App ID** from the dashboard
5. Add it to your `.env.local` file

## Features Enabled

- **Email Login**: Users can sign in with their email address
- **Wallet Connection**: Users can connect external Solana wallets (Phantom, Solflare, etc.)
- **Google OAuth**: Users can sign in with Google
- **Embedded Wallets**: Privy can create embedded wallets for users without external wallets
- **Solana Support**: Full Solana blockchain integration

## Configuration

The Privy provider is configured in `/src/providers/privy-provider.tsx` with:
- **Login methods**: Email, Wallet, and Google
- **Embedded Solana wallets**: Created automatically for users without wallets
- **Custom theme**: Light mode with accent color `#676FFF`

### Files Created/Modified

1. **`/src/providers/privy-provider.tsx`** - Main Privy provider component
2. **`/src/hooks/usePrivyAuth.ts`** - Custom hook for simplified Privy usage
3. **`/src/components/auth/PrivyAuthButton.tsx`** - Example authentication component
4. **`/src/components/default/app-providers.tsx`** - Updated to include Privy provider
5. **`/package.json`** - Updated with required dependencies

## Usage in Components

To use Privy in your components:

```tsx
import { usePrivy, useWallets } from '@privy-io/react-auth'

function MyComponent() {
  const { login, logout, authenticated, user } = usePrivy()
  const { wallets } = useWallets()

  // Check if user is authenticated
  if (authenticated) {
    console.log('User:', user)
    console.log('Wallets:', wallets)
  }

  return (
    <div>
      {authenticated ? (
        <button onClick={logout}>Logout</button>
      ) : (
        <button onClick={login}>Login</button>
      )}
    </div>
  )
}
```

## Solana Wallet Integration

To work with Solana wallets:

```tsx
import { useWallets } from '@privy-io/react-auth'

function SolanaComponent() {
  const { wallets } = useWallets()
  
  // Get Solana wallets
  const solanaWallets = wallets.filter(
    wallet => wallet.walletClientType === 'privy' && wallet.chainType === 'solana'
  )

  // Get the primary Solana wallet
  const primaryWallet = solanaWallets[0]
  
  if (primaryWallet) {
    console.log('Solana Address:', primaryWallet.address)
  }
}
```

## Next Steps

1. Add your Privy App ID to `.env.local`
2. Test the authentication flow
3. Customize the appearance and login methods in `/src/providers/privy-provider.tsx`
4. Integrate Privy authentication with your existing auth system if needed

## Build Status

✅ **Build Successful** - The application compiles successfully with Privy integration.

## Troubleshooting

### Build Errors

If you encounter dependency conflicts:
```bash
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

### Missing Privy App ID

If you see the error "NEXT_PUBLIC_PRIVY_APP_ID is not set":
1. Create a `.env.local` file in the project root
2. Add your Privy App ID: `NEXT_PUBLIC_PRIVY_APP_ID=your_app_id_here`
3. Restart the development server

## Documentation

- [Privy React SDK Documentation](https://docs.privy.io/guide/react)
- [Privy Solana Guide](https://docs.privy.io/guide/react/wallets/solana)
- [Privy Dashboard](https://dashboard.privy.io)
- [Privy API Reference](https://docs.privy.io/reference)

