# 🔄 Network Toggle Implementation - Step-by-Step Guide

## 🎯 What We're Building

A professional network toggle that lets users switch between:
- **Mainnet** (Production) - Real money, real balances
- **Devnet** (Testing) - Test money, safe to experiment

**End Result:**
```
Account Dropdown:
┌─────────────────────────────┐
│ 👤 User Name                │
│ wallet@example.com          │
├─────────────────────────────┤
│ 💰 Balance: $1,234.56       │
├─────────────────────────────┤
│ 🌐 NETWORK                  │
│                             │
│ Mainnet ⚫─────⚪ Devnet    │
│                             │
│ ℹ️  Currently: Mainnet      │
│    Real money & balances    │
├─────────────────────────────┤
│ Settings                    │
│ Logout                      │
└─────────────────────────────┘
```

---

## 📋 Prerequisites

Before starting:
- [ ] Code is committed and pushed
- [ ] Helius API keys ready (both mainnet & devnet)
- [ ] Understanding of React Context API
- [ ] ~2-3 hours of focused development time

---

## 🚀 Implementation Steps

### **STEP 1: Create Network Context** (15 mins)

Create the context that will manage network state across your app.

**File:** `src/contexts/NetworkContext.tsx`

```typescript
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type NetworkType = 'mainnet' | 'devnet';

interface NetworkContextType {
  network: NetworkType;
  switchNetwork: (network: NetworkType) => void;
  isDevnet: boolean;
  isMainnet: boolean;
  isLoading: boolean;
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

interface NetworkProviderProps {
  children: ReactNode;
}

export function NetworkProvider({ children }: NetworkProviderProps) {
  const [network, setNetwork] = useState<NetworkType>('mainnet');
  const [isLoading, setIsLoading] = useState(true);

  // Load network preference from localStorage on mount
  useEffect(() => {
    // Check if we're on devnet subdomain
    const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
    const isDevnetDomain = hostname.startsWith('devnet.');
    
    if (isDevnetDomain) {
      // Force devnet on devnet subdomain
      setNetwork('devnet');
      setIsLoading(false);
      return;
    }
    
    // Load from localStorage on main domain
    const saved = localStorage.getItem('preferred_network') as NetworkType;
    const envNetwork = process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'mainnet-beta';
    const defaultNetwork: NetworkType = envNetwork === 'devnet' ? 'devnet' : 'mainnet';
    
    setNetwork(saved || defaultNetwork);
    setIsLoading(false);
  }, []);

  const switchNetwork = (newNetwork: NetworkType) => {
    // Confirmation for switching to mainnet
    if (newNetwork === 'mainnet' && network === 'devnet') {
      const confirmed = window.confirm(
        '⚠️ Switch to MAINNET?\n\n' +
        'You will use REAL SOL and REAL MONEY.\n' +
        'Transactions cannot be reversed.\n\n' +
        'Are you sure?'
      );
      if (!confirmed) return;
    }
    
    // Save preference
    localStorage.setItem('preferred_network', newNetwork);
    setNetwork(newNetwork);
    
    // Reload to apply changes
    window.location.reload();
  };

  return (
    <NetworkContext.Provider
      value={{
        network,
        switchNetwork,
        isDevnet: network === 'devnet',
        isMainnet: network === 'mainnet',
        isLoading,
      }}
    >
      {children}
    </NetworkContext.Provider>
  );
}

export const useNetwork = () => {
  const context = useContext(NetworkContext);
  if (!context) {
    throw new Error('useNetwork must be used within NetworkProvider');
  }
  return context;
};
```

**✅ Checkpoint 1:** File created? Let's test it next step.

---

### **STEP 2: Update Root Layout** (5 mins)

Add the NetworkProvider to your app layout.

**File:** `src/app/layout.tsx`

Find the existing providers and wrap children with NetworkProvider:

```typescript
// Add import at top
import { NetworkProvider } from '@/contexts/NetworkContext';

// Inside the component, wrap your content:
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ConvexClientProvider>
          <AuthProvider>
            <NetworkProvider>  {/* Add this */}
              {children}
            </NetworkProvider>            {/* Add this */}
          </AuthProvider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
```

**✅ Checkpoint 2:** Server should restart automatically. Check for errors.

---

### **STEP 3: Create Network Toggle Component** (20 mins)

Build the actual toggle UI component.

**File:** `src/components/NetworkToggle.tsx`

```typescript
"use client";

import React from 'react';
import { useNetwork } from '@/contexts/NetworkContext';
import { Switch } from '@/components/ui/switch';
import { Globe, AlertTriangle, CheckCircle } from 'lucide-react';

export function NetworkToggle() {
  const { network, switchNetwork, isDevnet, isMainnet, isLoading } = useNetwork();
  
  // Don't show during loading
  if (isLoading) return null;
  
  // Check if we're on devnet subdomain (locked mode)
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  const isDevnetDomain = hostname.startsWith('devnet.');
  const allowToggle = !isDevnetDomain && 
                      (process.env.NEXT_PUBLIC_ALLOW_NETWORK_TOGGLE === 'true' || 
                       process.env.NODE_ENV === 'development');
  
  const handleToggle = (checked: boolean) => {
    switchNetwork(checked ? 'devnet' : 'mainnet');
  };
  
  return (
    <div className="border-t border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
      <div className="p-3">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Solana Network
            </span>
          </div>
          {!allowToggle && (
            <div className="text-xs text-gray-500 flex items-center gap-1">
              🔒 Locked
            </div>
          )}
        </div>
        
        {/* Toggle Control */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className={`text-sm font-medium transition-colors ${
              isMainnet ? 'text-green-600 dark:text-green-400' : 'text-gray-400'
            }`}>
              {isMainnet && <CheckCircle className="h-4 w-4 inline mr-1" />}
              Mainnet
            </span>
            
            <Switch
              checked={isDevnet}
              onCheckedChange={handleToggle}
              disabled={!allowToggle}
              className={isDevnet ? 'bg-yellow-500' : 'bg-green-500'}
            />
            
            <span className={`text-sm font-medium transition-colors ${
              isDevnet ? 'text-yellow-600 dark:text-yellow-400' : 'text-gray-400'
            }`}>
              {isDevnet && <AlertTriangle className="h-4 w-4 inline mr-1" />}
              Devnet
            </span>
          </div>
        </div>
        
        {/* Network Info */}
        <div className={`mt-3 p-2 rounded text-xs ${
          isDevnet 
            ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800' 
            : 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800'
        }`}>
          {isDevnet ? (
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold">Test Network Active</div>
                <div className="mt-1">Using test SOL with no real value. Safe to experiment!</div>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold">Production Network Active</div>
                <div className="mt-1">Real SOL and real money. All transactions are permanent.</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

**✅ Checkpoint 3:** Component created. Now let's add it to the header.

---

### **STEP 4: Add Toggle to Header Dropdown** (10 mins)

Update your header to include the network toggle.

**File:** `src/components/app/Header.tsx`

Find your account dropdown (around line 700-800) and add the NetworkToggle:

```typescript
// Add import at top
import { NetworkToggle } from '@/components/NetworkToggle';

// Inside your DropdownMenuContent (account dropdown):
<DropdownMenuContent align="end" className="w-80">
  {/* User Info Section */}
  <div className="p-3 border-b">
    <div className="flex items-center gap-3">
      <Avatar>
        {/* ... existing avatar code ... */}
      </Avatar>
      <div>
        <div className="font-semibold">{userProfile?.firstName} {userProfile?.lastName}</div>
        <div className="text-xs text-gray-500">{userProfile?.email}</div>
      </div>
    </div>
  </div>
  
  {/* Wallet Balance Section */}
  <div className="p-3 border-b">
    {/* ... existing wallet display ... */}
  </div>
  
  {/* ADD NETWORK TOGGLE HERE */}
  <NetworkToggle />
  
  {/* Existing Menu Items */}
  <DropdownMenuItem>
    <Settings className="mr-2 h-4 w-4" />
    Settings
  </DropdownMenuItem>
  
  <DropdownMenuItem>
    <LogOut className="mr-2 h-4 w-4" />
    Logout
  </DropdownMenuItem>
</DropdownMenuContent>
```

**✅ Checkpoint 4:** Check localhost:3002 - you should see the toggle in dropdown!

---

### **STEP 5: Create Network Banner** (15 mins)

Add a banner that shows when user is on devnet.

**File:** `src/components/NetworkBanner.tsx`

```typescript
"use client";

import React from 'react';
import { useNetwork } from '@/contexts/NetworkContext';
import { AlertTriangle, Info, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export function NetworkBanner() {
  const { isDevnet, isLoading } = useNetwork();
  
  if (isLoading) return null;
  
  // Check if we're on devnet subdomain
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  const isDevnetDomain = hostname.startsWith('devnet.');
  
  // Show prominent banner on devnet subdomain
  if (isDevnetDomain) {
    return (
      <div className="bg-yellow-500 text-yellow-900 px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 flex-shrink-0" />
          <div>
            <div className="font-bold">DEVNET ENVIRONMENT - TEST NETWORK ONLY</div>
            <div className="text-sm">All balances and transactions use test SOL with no real value</div>
          </div>
        </div>
        <Link 
          href="https://franchiseen.com" 
          className="text-yellow-900 hover:text-yellow-800 flex items-center gap-1 font-semibold whitespace-nowrap"
        >
          Go to Production
          <ExternalLink className="h-4 w-4" />
        </Link>
      </div>
    );
  }
  
  // Show info banner when user toggles to devnet on main site
  if (isDevnet && !isDevnetDomain) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800 px-4 py-2">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-yellow-700 dark:text-yellow-400 flex-shrink-0" />
            <span className="text-sm text-yellow-700 dark:text-yellow-400">
              <strong>Test Mode:</strong> You're viewing Devnet. Switch to Mainnet in account menu for real transactions.
            </span>
          </div>
          <button
            onClick={() => {
              const { switchNetwork } = useNetwork();
              switchNetwork('mainnet');
            }}
            className="text-xs text-yellow-700 dark:text-yellow-400 hover:underline whitespace-nowrap"
          >
            Switch to Mainnet →
          </button>
        </div>
      </div>
    );
  }
  
  return null;
}
```

**✅ Checkpoint 5:** File created. Let's add it to the layout.

---

### **STEP 6: Add Banner to Layout** (5 mins)

**File:** `src/app/layout.tsx`

```typescript
// Add import
import { NetworkBanner } from '@/components/NetworkBanner';

// Inside body, add banner before everything else:
<body className={cn('min-h-screen bg-background font-sans antialiased', fontSans.variable)}>
  <NetworkBanner />  {/* Add this line */}
  
  <ConvexClientProvider>
    <AuthProvider>
      <NetworkProvider>
        {children}
      </NetworkProvider>
    </AuthProvider>
  </ConvexClientProvider>
</body>
```

**✅ Checkpoint 6:** Toggle to devnet - you should see the yellow banner!

---

### **STEP 7: Update Network Config Utility** (20 mins)

Create a comprehensive network configuration helper.

**File:** `src/lib/networkConfig.ts`

```typescript
import { getSolanaRpcConfig, getNetworkFromEnv, getSolanaExplorerUrl, SolanaNetwork } from './solanaConfig';

export type NetworkType = 'mainnet' | 'devnet';

export interface NetworkConfig {
  network: NetworkType;
  isDevnet: boolean;
  isMainnet: boolean;
  isDevnetDomain: boolean;
  allowToggle: boolean;
  
  // RPC Configuration
  solanaRpcUrl: string;
  fallbackRpcUrls: string[];
  
  // Convex Configuration
  convexUrl: string | undefined;
  
  // Explorer
  explorerUrl: (hash: string, type?: 'tx' | 'address') => string;
  
  // Display
  clusterName: string;
  badgeColor: string;
  badgeIcon: string;
}

export const getNetworkConfig = (): NetworkConfig => {
  // Check if we're on the devnet subdomain
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  const isDevnetDomain = hostname.startsWith('devnet.');
  
  // Get user preference from localStorage (only on main domain)
  let userPreference: NetworkType | null = null;
  if (typeof window !== 'undefined' && !isDevnetDomain) {
    userPreference = localStorage.getItem('preferred_network') as NetworkType;
  }
  
  // Get environment default
  const envNetwork = getNetworkFromEnv();
  const defaultIsDevnet = envNetwork === 'devnet';
  
  // Determine final network
  let network: NetworkType;
  if (isDevnetDomain) {
    // Force devnet on devnet subdomain
    network = 'devnet';
  } else if (userPreference) {
    // Use user preference on main domain
    network = userPreference;
  } else {
    // Use environment default
    network = defaultIsDevnet ? 'devnet' : 'mainnet';
  }
  
  const isDevnet = network === 'devnet';
  const isMainnet = !isDevnet;
  
  // Get RPC configuration with Helius
  const solanaNetwork: SolanaNetwork = isDevnet ? 'devnet' : 'mainnet-beta';
  const rpcConfig = getSolanaRpcConfig(solanaNetwork);
  
  // Can toggle only on main domain and if allowed
  const allowToggle = !isDevnetDomain && 
                      (process.env.NEXT_PUBLIC_ALLOW_NETWORK_TOGGLE === 'true' ||
                       process.env.NODE_ENV === 'development');
  
  return {
    network,
    isDevnet,
    isMainnet,
    isDevnetDomain,
    allowToggle,
    
    // RPC Configuration (Helius + Fallbacks)
    solanaRpcUrl: rpcConfig.primary,
    fallbackRpcUrls: rpcConfig.fallbacks,
    
    // Convex URLs
    convexUrl: isDevnet
      ? process.env.NEXT_PUBLIC_CONVEX_DEV_URL || process.env.NEXT_PUBLIC_CONVEX_URL
      : process.env.NEXT_PUBLIC_CONVEX_URL,
    
    // Explorer URL generator
    explorerUrl: (hash: string, type: 'tx' | 'address' = 'tx') => 
      getSolanaExplorerUrl(hash, type, solanaNetwork),
    
    // Display info
    clusterName: isDevnet ? 'Devnet' : 'Mainnet',
    badgeColor: isDevnet 
      ? 'bg-yellow-500 text-yellow-900' 
      : 'bg-green-500 text-green-900',
    badgeIcon: isDevnet ? '🧪' : '💎',
  };
};
```

**✅ Checkpoint 7:** Utility created. Now components can use it.

---

### **STEP 8: Update UserWallet to Use Network Context** (15 mins)

Make the wallet network-aware.

**File:** `src/components/app/franchisee/UserWallet.tsx`

```typescript
// Add imports at top
import { useNetwork } from '@/contexts/NetworkContext';
import { getNetworkConfig } from '@/lib/networkConfig';

// Inside component, replace the isDevnet state:
const UserWallet: React.FC<WalletProps> = ({ onAddMoney, className = '' }) => {
  // ... existing code ...
  
  // REMOVE this old code:
  // const [isDevnet, setIsDevnet] = useState<boolean>(true);
  // useEffect(() => {
  //   const network = process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'devnet';
  //   setIsDevnet(network === 'devnet');
  // }, []);
  
  // REPLACE with:
  const { isDevnet } = useNetwork();
  const networkConfig = getNetworkConfig();
  
  // ... rest of existing code stays the same ...
  
  // The fetchBalance function will now automatically use correct network!
};
```

**✅ Checkpoint 8:** Wallet now responds to network toggle!

---

### **STEP 9: Update Environment Variables** (10 mins)

Add the necessary environment variables.

**File:** `.env.local` (you may need to create this)

```env
# Network Configuration
NEXT_PUBLIC_SOLANA_NETWORK=mainnet-beta
NEXT_PUBLIC_ALLOW_NETWORK_TOGGLE=true

# Helius RPC (sign up at helius.dev for free keys)
NEXT_PUBLIC_HELIUS_API_KEY_MAINNET=your-mainnet-key-here
NEXT_PUBLIC_HELIUS_API_KEY_DEVNET=your-devnet-key-here

# Convex URLs (you already have these)
NEXT_PUBLIC_CONVEX_URL=https://your-prod.convex.cloud
NEXT_PUBLIC_CONVEX_DEV_URL=https://your-dev.convex.cloud
```

**✅ Checkpoint 9:** Restart dev server to load new env vars.

---

### **STEP 10: Testing** (15 mins)

Test the complete flow:

#### Test 1: Toggle Functionality
```
1. Open app: http://localhost:3002
2. Click account dropdown
3. See network toggle
4. Current state: Mainnet (default)
5. Toggle to Devnet
6. Confirm dialog appears
7. Page reloads
8. Yellow banner shows "Test Mode"
9. Wallet badge shows "DEVNET"
```

#### Test 2: Persistence
```
1. Toggle to Devnet
2. Refresh page (F5)
3. Should stay on Devnet
4. Check localStorage: preferred_network = "devnet"
```

#### Test 3: Balance Fetching
```
1. On Mainnet: Should fetch from Helius mainnet RPC
2. On Devnet: Should fetch from Helius devnet RPC
3. Check console: "[Solana] Using RPC: mainnet.helius-rpc.com"
```

#### Test 4: Explorer Links
```
1. Make a transaction (or check existing)
2. Click explorer link
3. On Mainnet: Should open explorer.solana.com/tx/HASH
4. On Devnet: Should open explorer.solana.com/tx/HASH?cluster=devnet
```

**✅ Checkpoint 10:** All tests passing? You're done!

---

## 🐛 Troubleshooting

### Issue: "useNetwork must be used within NetworkProvider"

**Solution:**
```typescript
// Make sure NetworkProvider is in layout.tsx
// above all components that use useNetwork
<NetworkProvider>
  {children}
</NetworkProvider>
```

### Issue: Toggle not appearing

**Solution:**
```typescript
// Check environment variable:
console.log('Allow toggle:', process.env.NEXT_PUBLIC_ALLOW_NETWORK_TOGGLE);

// Make sure it's set to 'true' (string, not boolean)
NEXT_PUBLIC_ALLOW_NETWORK_TOGGLE=true
```

### Issue: Reload loop

**Solution:**
```typescript
// Check if localStorage is accessible:
if (typeof window !== 'undefined') {
  localStorage.setItem('preferred_network', network);
}
```

### Issue: Wrong RPC used

**Solution:**
```typescript
// Add logging to verify:
console.log('Network:', network);
console.log('RPC URL:', rpcConfig.primary);
```

---

## 📝 File Checklist

Create/Update these files:

- [ ] `src/contexts/NetworkContext.tsx` - Context provider
- [ ] `src/components/NetworkToggle.tsx` - Toggle UI
- [ ] `src/components/NetworkBanner.tsx` - Warning banner
- [ ] `src/lib/networkConfig.ts` - Config utility
- [ ] `src/app/layout.tsx` - Add NetworkProvider
- [ ] `src/components/app/Header.tsx` - Add toggle to dropdown
- [ ] `src/components/app/franchisee/UserWallet.tsx` - Use network context
- [ ] `.env.local` - Add ALLOW_NETWORK_TOGGLE

---

## 🎯 Expected Results

After implementation:

### **On Mainnet (Default):**
```
✅ Green "Mainnet" badge
✅ Real SOL balances
✅ No devnet features
✅ Production Convex data
✅ Explorer links to mainnet
```

### **On Devnet (After Toggle):**
```
✅ Yellow "Devnet" badge
✅ Test SOL balances
✅ "Get Dev Sol" button appears
✅ Dev Convex data (if configured)
✅ Explorer links to devnet
✅ Yellow warning banner
```

---

## ⏱️ Total Implementation Time

- **Minimum:** 1.5 hours (basic toggle)
- **Complete:** 2-3 hours (with testing)
- **Perfect:** 4 hours (with polish and docs)

---

## 🚀 Let's Start!

I'll help you implement this step by step. Here's what we'll do:

### **Right Now:**
1. I'll create all the component files
2. Update the necessary imports
3. Add to your layout

### **You Test:**
1. Check the toggle appears
2. Try switching networks
3. Verify it persists

### **Then:**
1. Fix any issues together
2. Test thoroughly
3. Deploy to production

**Ready? Let's start with Step 1!** 🎯

Should I create all the files now?

