# Privy Integration - Quick Start Guide

✅ **Status**: Privy has been successfully integrated into your Franchiseen application!

## 🚀 Quick Start (3 Steps)

### Step 1: Get Your Privy App ID

1. Visit [Privy Dashboard](https://dashboard.privy.io)
2. Sign up or log in
3. Create a new app (or use existing)
4. Copy your **App ID**

### Step 2: Add Environment Variable

Create or edit `.env.local` in your project root:

```bash
NEXT_PUBLIC_PRIVY_APP_ID=your_app_id_here
```

### Step 3: Restart Your Development Server

```bash
# Stop the current server (Ctrl+C)
npm run dev
```

That's it! Privy is now integrated. 🎉

---

## 📦 What Was Installed

### NPM Packages
- `@privy-io/react-auth` - Privy React SDK
- `@privy-io/server-auth` - Privy server SDK
- `@solana-program/memo` - Solana memo program support
- `@solana-program/system` - Solana system program support
- `@solana-program/token` - Solana token program support
- `@scure/base` - Base encoding utilities

### Files Created
- `/src/providers/privy-provider.tsx` - Privy provider component
- `/src/hooks/usePrivyAuth.ts` - Custom authentication hook
- `/src/components/auth/PrivyAuthButton.tsx` - Example auth button
- `/src/examples/PrivyIntegrationExample.tsx` - Full example component

### Files Modified
- `/src/components/default/app-providers.tsx` - Added Privy to provider chain
- `/package.json` - Updated dependencies

---

## 💡 Usage Examples

### Basic Usage - Login/Logout

```tsx
import { usePrivyAuth } from '@/hooks/usePrivyAuth'

function MyComponent() {
  const { authenticated, login, logout, email } = usePrivyAuth()

  return (
    <div>
      {authenticated ? (
        <>
          <p>Welcome, {email}!</p>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <button onClick={login}>Login</button>
      )}
    </div>
  )
}
```

### Get User's Solana Wallet

```tsx
import { usePrivyAuth } from '@/hooks/usePrivyAuth'

function WalletDisplay() {
  const { primarySolanaWallet, hasSolanaWallet } = usePrivyAuth()

  if (!hasSolanaWallet) {
    return <p>No wallet connected</p>
  }

  return (
    <div>
      <p>Wallet Address: {primarySolanaWallet?.address}</p>
      <p>Type: {primarySolanaWallet?.walletClientType}</p>
    </div>
  )
}
```

### Check All Connected Wallets

```tsx
import { usePrivyAuth } from '@/hooks/usePrivyAuth'

function AllWallets() {
  const { wallets } = usePrivyAuth()

  return (
    <div>
      <h3>Connected Wallets ({wallets.length})</h3>
      {wallets.map((wallet) => (
        <div key={wallet.address}>
          <p>{wallet.walletClientType}: {wallet.address}</p>
        </div>
      ))}
    </div>
  )
}
```

### Full Example Component

See `/src/examples/PrivyIntegrationExample.tsx` for a complete example showing:
- Login/Logout flow
- User information display
- Wallet management
- Primary wallet detection

---

## 🎨 Customization

### Change Login Methods

Edit `/src/providers/privy-provider.tsx`:

```tsx
loginMethods: ['email', 'wallet', 'google', 'twitter', 'discord']
```

Available methods: `email`, `wallet`, `sms`, `google`, `twitter`, `discord`, `github`, `linkedin`, `apple`, `farcaster`

### Change Theme

```tsx
appearance: {
  theme: 'dark', // or 'light'
  accentColor: '#676FFF',
  logo: 'https://your-logo-url.com/logo.png',
}
```

### Configure Embedded Wallets

```tsx
embeddedWallets: {
  solana: {
    createOnLogin: 'all-users', // or 'users-without-wallets' or 'off'
  },
}
```

---

## 🔧 Build & Deployment

### Build Status
✅ Production build: **Successful**
✅ Development mode: **Working**

### Build Command
```bash
npm run build
```

### Deploy to Production
Make sure to set `NEXT_PUBLIC_PRIVY_APP_ID` in your production environment variables (Vercel, etc.)

---

## 📚 Additional Resources

- [Full Setup Documentation](./PRIVY_SETUP.md)
- [Privy React SDK Docs](https://docs.privy.io/guide/react)
- [Privy Solana Guide](https://docs.privy.io/guide/react/wallets/solana)
- [Privy Dashboard](https://dashboard.privy.io)

---

## 🆘 Troubleshooting

### "NEXT_PUBLIC_PRIVY_APP_ID is not set"
- Make sure you created `.env.local` in the project root
- Restart your development server after adding the variable

### Build Errors
```bash
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
npm run build
```

### Need Help?
Check the [full documentation](./PRIVY_SETUP.md) or visit [Privy Docs](https://docs.privy.io)

---

**Integration completed successfully!** 🎉

