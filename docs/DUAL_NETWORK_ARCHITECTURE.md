# Dual Network Architecture: Devnet vs Mainnet

## Your Question: Should we add devnet and mainnet with toggle switch?

**Short Answer:** YES! This is an excellent approach for a Web3 platform. ✅

---

## 🎯 Recommended Architecture

### **Option 1: Dual Environment with Network Toggle (RECOMMENDED)** ⭐

This is what successful crypto platforms like Phantom, MetaMask, and Uniswap do.

#### Structure:
```
franchiseen/
├── main (branch) → Production + Mainnet
└── devnet (branch) → Development + Devnet
```

#### Data Sources:
```
Mainnet Environment:
├── Convex: Production deployment
├── Solana: mainnet-beta
└── Users see: Real money, real balances

Devnet Environment:
├── Convex: Development deployment  
├── Solana: devnet
└── Users see: Test money, test balances
```

#### User Interface:
```
Account Dropdown:
┌──────────────────────┐
│ [Avatar] User Name   │
│ ─────────────────── │
│ 🌐 Network:          │
│ ⚫ Mainnet [Toggle]  │
│ 🔄 Switch to Devnet  │
│ ─────────────────── │
│ Settings             │
│ Logout               │
└──────────────────────┘
```

---

## ✅ Benefits of Dual Network Architecture

### 1. **Developer Testing** 🔧
- Test new features on devnet without risk
- Debug issues with fake money
- Verify transactions before mainnet

### 2. **User Education** 📚
- New users can learn on devnet
- Practice buying/selling with no risk
- Understand platform before real money

### 3. **Demo & Presentations** 🎬
- Show platform functionality instantly
- No need to spend real money for demos
- Perfect for investor presentations

### 4. **Quality Assurance** ✅
- Test edge cases safely
- Verify smart contracts
- Catch bugs before production

### 5. **Regulatory Compliance** ⚖️
- Keep test transactions separate
- Clear audit trail
- No mixing test/real money

---

## 🏗️ Implementation Plan

### Phase 1: Infrastructure Setup (Week 1)

#### 1.1 Convex Deployments
```bash
# Development (Devnet)
npx convex dev
# Deployment URL: https://xxx.convex.cloud (dev)

# Production (Mainnet)  
npx convex deploy --prod
# Deployment URL: https://xxx.convex.cloud (prod)
```

#### 1.2 Environment Variables
```env
# .env.local (Development)
CONVEX_DEPLOYMENT=dev:xxx
NEXT_PUBLIC_CONVEX_URL=https://xxx.convex.cloud
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com

# .env.production (Production)
CONVEX_DEPLOYMENT=prod:yyy
NEXT_PUBLIC_CONVEX_URL=https://yyy.convex.cloud
NEXT_PUBLIC_SOLANA_NETWORK=mainnet-beta
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
```

### Phase 2: Network Toggle Component (Week 1)

#### 2.1 Create Network Context
```typescript
// src/contexts/NetworkContext.tsx
import { createContext, useContext, useState, useEffect } from 'react';

type Network = 'mainnet' | 'devnet';

interface NetworkContextType {
  network: Network;
  switchNetwork: (network: Network) => void;
  isDevnet: boolean;
  isMainnet: boolean;
}

export const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

export function NetworkProvider({ children }: { children: React.ReactNode }) {
  const [network, setNetwork] = useState<Network>('mainnet');

  useEffect(() => {
    // Load from localStorage
    const saved = localStorage.getItem('preferred_network') as Network;
    if (saved) setNetwork(saved);
  }, []);

  const switchNetwork = (newNetwork: Network) => {
    setNetwork(newNetwork);
    localStorage.setItem('preferred_network', newNetwork);
    
    // Reload to apply new network settings
    window.location.reload();
  };

  return (
    <NetworkContext.Provider value={{
      network,
      switchNetwork,
      isDevnet: network === 'devnet',
      isMainnet: network === 'mainnet',
    }}>
      {children}
    </NetworkContext.Provider>
  );
}

export const useNetwork = () => {
  const context = useContext(NetworkContext);
  if (!context) throw new Error('useNetwork must be used within NetworkProvider');
  return context;
};
```

#### 2.2 Network Toggle UI Component
```typescript
// src/components/NetworkToggle.tsx
import { useNetwork } from '@/contexts/NetworkContext';
import { Switch } from '@/components/ui/switch';
import { Globe } from 'lucide-react';

export function NetworkToggle() {
  const { network, switchNetwork, isDevnet } = useNetwork();

  return (
    <div className="flex items-center justify-between p-3 border-t border-b">
      <div className="flex items-center gap-2">
        <Globe className="h-4 w-4" />
        <span className="text-sm font-medium">Network</span>
      </div>
      <div className="flex items-center gap-2">
        <span className={`text-xs ${isDevnet ? 'text-gray-500' : 'text-green-600 font-bold'}`}>
          Mainnet
        </span>
        <Switch
          checked={isDevnet}
          onCheckedChange={(checked) => switchNetwork(checked ? 'devnet' : 'mainnet')}
        />
        <span className={`text-xs ${isDevnet ? 'text-yellow-600 font-bold' : 'text-gray-500'}`}>
          Devnet
        </span>
      </div>
    </div>
  );
}
```

#### 2.3 Add to Header Dropdown
```typescript
// In your Header.tsx account dropdown
import { NetworkToggle } from '@/components/NetworkToggle';

// Inside dropdown menu:
<DropdownMenuContent>
  <DropdownMenuItem>Profile</DropdownMenuItem>
  <DropdownMenuItem>Settings</DropdownMenuItem>
  
  <NetworkToggle />  {/* Add this */}
  
  <DropdownMenuItem>Logout</DropdownMenuItem>
</DropdownMenuContent>
```

### Phase 3: Dynamic Configuration (Week 1-2)

#### 3.1 Network Config Utility
```typescript
// src/lib/networkConfig.ts
export const getNetworkConfig = () => {
  const network = localStorage.getItem('preferred_network') || 
                  process.env.NEXT_PUBLIC_SOLANA_NETWORK || 
                  'mainnet';

  const isDevnet = network === 'devnet';

  return {
    network,
    isDevnet,
    isMainnet: !isDevnet,
    solanaRpcUrl: isDevnet 
      ? 'https://api.devnet.solana.com'
      : 'https://api.mainnet-beta.solana.com',
    convexUrl: isDevnet
      ? process.env.NEXT_PUBLIC_CONVEX_DEV_URL
      : process.env.NEXT_PUBLIC_CONVEX_URL,
    explorerUrl: (hash: string) => 
      `https://explorer.solana.com/tx/${hash}${isDevnet ? '?cluster=devnet' : ''}`,
  };
};
```

#### 3.2 Update Components
```typescript
// In any component that needs network awareness
import { getNetworkConfig } from '@/lib/networkConfig';

const MyComponent = () => {
  const { isDevnet, solanaRpcUrl, explorerUrl } = getNetworkConfig();
  
  // Use correct RPC
  const connection = new Connection(solanaRpcUrl);
  
  // Use correct explorer
  const txLink = explorerUrl(transactionHash);
  
  return (
    <div>
      {isDevnet && (
        <div className="bg-yellow-100 p-2">
          ⚠️ You are on Devnet (Test Network)
        </div>
      )}
    </div>
  );
};
```

### Phase 4: Convex Data Separation (Week 2)

#### 4.1 Two Separate Convex Deployments

**Devnet Deployment:**
```bash
# Uses dev data, test wallets, fake transactions
npx convex dev
```

**Mainnet Deployment:**
```bash
# Uses production data, real wallets, real transactions
npx convex deploy --prod
```

#### 4.2 Environment-Specific URLs
```typescript
// .env.local
NEXT_PUBLIC_CONVEX_DEV_URL=https://dev-xxx.convex.cloud
NEXT_PUBLIC_CONVEX_URL=https://prod-yyy.convex.cloud

// In app
const convexUrl = isDevnet 
  ? process.env.NEXT_PUBLIC_CONVEX_DEV_URL
  : process.env.NEXT_PUBLIC_CONVEX_URL;
```

### Phase 5: UI Indicators (Week 2)

#### 5.1 Network Banner
```typescript
// src/components/NetworkBanner.tsx
export function NetworkBanner() {
  const { isDevnet } = useNetwork();
  
  if (!isDevnet) return null;
  
  return (
    <div className="bg-yellow-500 text-yellow-900 px-4 py-2 text-center text-sm font-bold">
      ⚠️ DEVNET MODE - You are using test network with fake money
    </div>
  );
}
```

#### 5.2 Wallet Badge Update
```typescript
// Show clear network indicator
<Badge className={isDevnet ? 'bg-yellow-500' : 'bg-green-500'}>
  {isDevnet ? '🧪 DEVNET' : '💎 MAINNET'}
</Badge>
```

---

## 📊 Comparison: Approaches

| Feature | Current | With Toggle | Separate Apps |
|---------|---------|-------------|---------------|
| **Setup Complexity** | ✅ Simple | 🟡 Medium | 🔴 Complex |
| **User Experience** | 🔴 Confusing | ✅ Clear | 🟡 OK |
| **Developer Testing** | 🔴 Risky | ✅ Safe | ✅ Safe |
| **Data Separation** | 🔴 Mixed | ✅ Separated | ✅ Separated |
| **Cost** | ✅ Low | 🟡 Medium | 🔴 High (2x infra) |
| **Maintenance** | ✅ Easy | 🟡 Medium | 🔴 Hard (2 codebases) |

**Winner:** With Toggle ⭐

---

## 🎨 Visual Design Mockup

### Account Dropdown with Network Toggle:
```
┌─────────────────────────────┐
│ 👤 Shawaz Sharif           │
│ shawaz@example.com          │
├─────────────────────────────┤
│ 💰 Balance: $1,234.56       │
│ 📍 0x1234...5678            │
├─────────────────────────────┤
│ 🌐 NETWORK                  │
│                             │
│ Mainnet ⚫─────⚪ Devnet    │
│                             │
│ ℹ️  Currently on: Mainnet   │
│    Real money & balances    │
├─────────────────────────────┤
│ ⚙️  Settings                │
│ 📊 Activity                 │
│ 🚪 Logout                   │
└─────────────────────────────┘
```

When switched to Devnet:
```
┌─────────────────────────────┐
│ ⚠️  DEVNET MODE ACTIVE      │
│ You're using test network   │
├─────────────────────────────┤
│ 👤 Shawaz Sharif           │
│ shawaz@example.com          │
├─────────────────────────────┤
│ 💰 Balance: 100.00 SOL      │
│    (Test tokens)            │
│ 📍 0x1234...5678            │
├─────────────────────────────┤
│ 🌐 NETWORK                  │
│                             │
│ Mainnet ⚪─────⚫ Devnet    │
│                             │
│ ℹ️  Currently on: Devnet    │
│    Test money - Not real    │
├─────────────────────────────┤
│ 🪂 Get Test SOL            │
│ ⚙️  Settings                │
│ 🚪 Logout                   │
└─────────────────────────────┘
```

---

## 🚦 Migration Path

### Week 1: Foundation
- [ ] Set up two Convex deployments (dev & prod)
- [ ] Create NetworkContext
- [ ] Build NetworkToggle component
- [ ] Add network indicators to UI

### Week 2: Integration
- [ ] Update all components to use network context
- [ ] Fix balance fetching per network
- [ ] Update explorer links dynamically
- [ ] Add network-specific warnings

### Week 3: Testing
- [ ] Test switching between networks
- [ ] Verify data separation
- [ ] Test all features on both networks
- [ ] QA and bug fixes

### Week 4: Launch
- [ ] Deploy to production
- [ ] User documentation
- [ ] Monitor for issues
- [ ] Gather feedback

---

## 💡 Best Practices

### 1. **Always Show Network Indicator**
Users must know which network they're on at all times.

### 2. **Confirm Network Switches**
```typescript
const switchNetwork = (network: Network) => {
  if (network === 'mainnet') {
    if (!confirm('Switch to MAINNET? You will use real money.')) {
      return;
    }
  }
  // proceed with switch
};
```

### 3. **Separate Wallets**
Different wallet addresses for devnet vs mainnet:
```typescript
const walletAddress = isDevnet 
  ? user.devnetWallet 
  : user.mainnetWallet;
```

### 4. **Visual Distinction**
Use colors consistently:
- Mainnet: Green/Blue (professional, money)
- Devnet: Yellow/Orange (warning, test)

### 5. **Clear Warnings**
```typescript
{isDevnet && (
  <Alert variant="warning">
    <AlertTriangle className="h-4 w-4" />
    <AlertDescription>
      You're on Devnet. Balances shown are test tokens with no real value.
    </AlertDescription>
  </Alert>
)}
```

---

## 🎯 Recommendation Summary

### ✅ **YES, Implement Dual Network with Toggle**

**Why:**
1. ✅ Industry standard (Phantom, MetaMask do this)
2. ✅ Better user experience
3. ✅ Safer development
4. ✅ Clear data separation
5. ✅ Easy testing
6. ✅ Professional appearance

**Timeline:** 2-4 weeks for full implementation

**Cost:** Minimal (just Convex dev deployment, ~$0-25/month)

**Complexity:** Medium (but worth it!)

---

## 📝 Next Steps

1. **Immediate:** Fix balance fetching (already done above ✅)
2. **This Week:** Set up two Convex deployments
3. **Next Week:** Implement network toggle
4. **Following Week:** Test and refine

---

**Question for you:**
- Do you want me to start implementing the NetworkContext and toggle component now?
- Should we add any specific features to the devnet mode (like unlimited test SOL)?

Let me know and I can build this out step by step! 🚀

