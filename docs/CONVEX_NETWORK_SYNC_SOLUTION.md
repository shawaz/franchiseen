# 🔄 Convex + Solana Network Sync Solution

## ❌ The Problem

When user toggles Solana network:
```
Switch to Devnet:
├── Solana: ✅ Uses devnet RPC
├── Wallet: ✅ Fetches devnet balance  
└── Convex: ❌ Still uses PRODUCTION database

Result: User sees mainnet franchises but devnet wallet!
```

This causes:
- ❌ Data mismatch (mainnet data + devnet wallet)
- ❌ Wrong balances shown
- ❌ Wrong franchises displayed
- ❌ Broken functionality

---

## ✅ The Solution

### **Approach: Dynamic Convex Client Switching**

When network toggles, switch BOTH:
1. Solana RPC endpoint
2. Convex database URL

```
Mainnet Mode:
├── Solana: mainnet.helius-rpc.com
└── Convex: https://prod-xxx.convex.cloud

Devnet Mode:
├── Solana: devnet.helius-rpc.com
└── Convex: https://dev-yyy.convex.cloud
```

---

## 🔧 Implementation

### Step 1: Update ConvexClientProvider

**File:** `src/providers/convex-provider.tsx`

```typescript
"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ReactNode, useEffect, useState } from "react";
import { useNetwork } from "@/contexts/NetworkContext";

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  const { isDevnet, isLoading: networkLoading } = useNetwork();
  const [client, setClient] = useState<ConvexReactClient | null>(null);

  useEffect(() => {
    // Don't create client until network is determined
    if (networkLoading) return;

    // Get correct Convex URL based on network
    const convexUrl = isDevnet
      ? process.env.NEXT_PUBLIC_CONVEX_DEV_URL || process.env.NEXT_PUBLIC_CONVEX_URL
      : process.env.NEXT_PUBLIC_CONVEX_URL;

    if (!convexUrl) {
      console.error("Convex URL not configured");
      return;
    }

    console.log(`[Convex] Connecting to: ${isDevnet ? 'DEV' : 'PROD'} database`);
    console.log(`[Convex] URL: ${convexUrl}`);

    // Create new client for the selected network
    const newClient = new ConvexReactClient(convexUrl);
    setClient(newClient);

    // Cleanup function to close old client
    return () => {
      newClient.close();
    };
  }, [isDevnet, networkLoading]);

  // Show loading while determining network or creating client
  if (networkLoading || !client) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-gray-100 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            {networkLoading ? 'Detecting network...' : 'Connecting to database...'}
          </p>
        </div>
      </div>
    );
  }

  return <ConvexProvider client={client}>{children}</ConvexProvider>;
}
```

### Step 2: Update Environment Variables

Add both Convex URLs to your `.env.local`:

```env
# Production Convex (for mainnet)
NEXT_PUBLIC_CONVEX_URL=https://your-prod-deployment.convex.cloud

# Development Convex (for devnet)
NEXT_PUBLIC_CONVEX_DEV_URL=https://your-dev-deployment.convex.cloud
```

### Step 3: Set Up Two Convex Deployments

#### Create Production Deployment:
```bash
# Switch to main branch
git checkout main

# Deploy to production
npx convex deploy --prod

# Output will show:
# ✓ Deployment URL: https://sharp-unicorn-123.convex.cloud
# Copy this URL for NEXT_PUBLIC_CONVEX_URL
```

#### Create Dev Deployment:
```bash
# Switch to devnet branch
git checkout devnet

# Start dev deployment
npx convex dev

# Output will show:
# ✓ Dev URL: https://happy-lemur-456.convex.cloud
# Copy this URL for NEXT_PUBLIC_CONVEX_DEV_URL
```

### Step 4: Update Network Context to Trigger Reload

Make sure switching networks reloads the app to reinitialize Convex:

**File:** `src/contexts/NetworkContext.tsx`

```typescript
// This is already implemented correctly:
const switchNetwork = (newNetwork: NetworkType) => {
  // ... confirmation dialog ...
  
  localStorage.setItem('preferred_network', newNetwork);
  setNetwork(newNetwork);
  
  // Reload to reinitialize Convex client
  window.location.reload();  // ✅ This ensures Convex reconnects
};
```

---

## 📊 How It Works

### Initial Load:
```
1. NetworkContext loads first
   └── Determines network from localStorage or env

2. ConvexClientProvider waits for network
   └── Creates client with correct URL

3. App loads with matched network + database
   └── Everything synchronized!
```

### Network Toggle:
```
1. User toggles network
   └── Saves to localStorage

2. Page reloads
   └── NetworkContext loads new network

3. ConvexClientProvider creates new client
   └── Connects to correct database

4. All components refresh
   └── Data matches network!
```

---

## ✅ Benefits

### **Data Integrity:**
- ✅ Mainnet Solana ↔ Production Convex
- ✅ Devnet Solana ↔ Dev Convex
- ✅ No data mixing
- ✅ Consistent state

### **Testing Safety:**
- ✅ Test data stays in dev database
- ✅ Production data protected
- ✅ Can't accidentally affect prod

### **User Experience:**
- ✅ Everything just works
- ✅ No manual database switching
- ✅ Automatic synchronization

---

## 🎯 Comparison: Approaches

### Option 1: Same Database (Current - BAD ❌)
```
Mainnet Solana + Prod Convex ✅
Devnet Solana + Prod Convex ❌ MISMATCH
```

### Option 2: Dynamic Switching (Recommended - GOOD ✅)
```
Mainnet Solana + Prod Convex ✅
Devnet Solana + Dev Convex ✅
```

### Option 3: Separate Apps (Overkill - COMPLEX 🔴)
```
franchiseen.com → Only mainnet + prod
devnet.franchiseen.com → Only devnet + dev

Pros: Complete separation
Cons: Complex, expensive, harder to maintain
```

---

## 🚀 Quick Implementation

I'll implement Option 2 (Dynamic Switching) now. It requires:

1. **Update ConvexClientProvider** - Make it network-aware
2. **Add CONVEX_DEV_URL** - Set up dev deployment
3. **Test switching** - Verify data changes

**Estimated Time:** 20 minutes

---

## 📋 Environment Variables Needed

### Development (.env.local):
```env
# Convex URLs
NEXT_PUBLIC_CONVEX_URL=https://your-prod.convex.cloud
NEXT_PUBLIC_CONVEX_DEV_URL=https://your-dev.convex.cloud

# Solana Networks
NEXT_PUBLIC_SOLANA_NETWORK=mainnet-beta
NEXT_PUBLIC_ALLOW_NETWORK_TOGGLE=true

# Helius
NEXT_PUBLIC_HELIUS_API_KEY_MAINNET=your-key
NEXT_PUBLIC_HELIUS_API_KEY_DEVNET=your-key
```

### Vercel Production:
```env
NEXT_PUBLIC_CONVEX_URL=prod-url
NEXT_PUBLIC_CONVEX_DEV_URL=dev-url
# ... rest same as above
```

---

## ⚠️ Important Notes

### 1. **Data Isolation**

With dynamic switching:
- Production franchises only on prod Convex
- Test franchises only on dev Convex
- No cross-contamination

### 2. **User Accounts**

Users may have different data in each database:
```
Prod Convex:
└── User has 3 real franchises

Dev Convex:
└── User has 5 test franchises

When switching, they see different franchises!
```

### 3. **Wallet Addresses**

Consider using different wallets per network:
```typescript
const walletAddress = isDevnet 
  ? user.devnetWalletAddress 
  : user.mainnetWalletAddress;
```

Or same wallet but different balances:
```typescript
const walletAddress = user.walletAddress; // Same address
const balance = isDevnet 
  ? fetchFromDevnet(walletAddress)
  : fetchFromMainnet(walletAddress);
```

---

## 🔄 Migration Strategy

### If You Already Have Production Data:

**Don't worry!** Here's how to handle it:

1. **Production users** continue using mainnet + prod Convex
2. **Test users** use devnet + dev Convex
3. **Toggle users** see both (different data sets)

### Seed Dev Database:

```bash
# Copy structure (not data) from prod to dev
npx convex export --deployment prod:xxx
npx convex import --deployment dev:yyy --tables-only

# Or create fresh test data
npx convex run seedData:seedAll --deployment dev:yyy
```

---

## 🎯 Ready to Implement?

**Should I:**

1. ✅ Update ConvexClientProvider to be network-aware?
2. ✅ Test the dynamic switching?
3. ✅ Create testing guide?

This will complete the full network toggle with proper database switching!

**Estimated time:** 20 minutes  
**Risk:** Low (just adds network awareness)  
**Benefit:** Complete data isolation ✅

**Want me to implement this now?** 🚀

