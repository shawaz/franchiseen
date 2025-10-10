# Vercel Dual Network Setup Guide

## 🎯 Recommended Architecture: Hybrid Approach

### **Best Solution: Same Domain + Separate Staging Subdomain** ⭐

This gives you the best of both worlds:

```
Production (franchiseen.com):
├── Default: Mainnet
├── Can toggle to: Devnet (for testing/learning)
└── Uses: Convex Production

Staging (devnet.franchiseen.com):
├── Always: Devnet only
├── No mainnet access
└── Uses: Convex Dev
```

**Why This Is Best:**

1. ✅ **User-Friendly**: Main site supports both networks with toggle
2. ✅ **Safe Testing**: Dedicated devnet site for development
3. ✅ **Clear Separation**: No confusion about which environment
4. ✅ **Flexible**: Users can test on main site before committing real money
5. ✅ **SEO-Friendly**: One main domain for production
6. ✅ **Team Collaboration**: Developers use devnet.franchiseen.com

---

## 🏗️ Complete Vercel Setup

### Part 1: Domain Structure

```
franchiseen.com (Production)
├── Environment: Production
├── Branch: main
├── Default Network: Mainnet
├── Toggle: ✅ Can switch to Devnet
├── Convex: Production deployment
└── Users: General public

devnet.franchiseen.com (Staging)
├── Environment: Development
├── Branch: devnet
├── Network: Devnet only
├── Toggle: ❌ No mainnet access
├── Convex: Dev deployment
└── Users: Developers & testers
```

---

## 📋 Step-by-Step Vercel Configuration

### Step 1: Set Up Two Deployments in Vercel

#### Deployment 1: Production (franchiseen.com)

```bash
# In Vercel Dashboard:
Project: franchiseen
Domain: franchiseen.com
Branch: main
Framework: Next.js
```

**Environment Variables (Production):**
```env
# Convex
CONVEX_DEPLOYMENT=prod:your-prod-id
NEXT_PUBLIC_CONVEX_URL=https://your-prod.convex.cloud

# Solana - Default to Mainnet
NEXT_PUBLIC_SOLANA_NETWORK=mainnet-beta
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
NEXT_PUBLIC_SOLANA_MAINNET_RPC_URL=https://api.mainnet-beta.solana.com

# Solana - Allow Devnet Toggle
NEXT_PUBLIC_SOLANA_DEVNET_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_ALLOW_NETWORK_TOGGLE=true

# Convex - For toggle support
NEXT_PUBLIC_CONVEX_DEV_URL=https://your-dev.convex.cloud

# Other
NEXT_PUBLIC_APP_URL=https://franchiseen.com
NODE_ENV=production
```

#### Deployment 2: Staging (devnet.franchiseen.com)

```bash
# In Vercel Dashboard:
Project: franchiseen (same project)
Domain: devnet.franchiseen.com
Branch: devnet
Framework: Next.js
```

**Environment Variables (Staging):**
```env
# Convex
CONVEX_DEPLOYMENT=dev:your-dev-id
NEXT_PUBLIC_CONVEX_URL=https://your-dev.convex.cloud

# Solana - Force Devnet
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_SOLANA_DEVNET_RPC_URL=https://api.devnet.solana.com

# Disable mainnet toggle on staging
NEXT_PUBLIC_ALLOW_NETWORK_TOGGLE=false

# Other
NEXT_PUBLIC_APP_URL=https://devnet.franchiseen.com
NODE_ENV=development
```

---

### Step 2: Vercel Project Settings

#### In Vercel Dashboard → Settings → Git

```yaml
Production Branch: main
  └── Deploys to: franchiseen.com

Branch Deployments:
  devnet:
    └── Deploys to: devnet.franchiseen.com
```

#### Build & Development Settings

```yaml
Framework Preset: Next.js
Build Command: npm run build
Output Directory: .next
Install Command: npm install
Development Command: npm run dev

Root Directory: ./
Node Version: 20.x
```

#### Domain Configuration

```yaml
Domains:
  1. franchiseen.com (Primary)
     └── Git Branch: main
     
  2. www.franchiseen.com (Redirect)
     └── Redirect to: franchiseen.com
     
  3. devnet.franchiseen.com
     └── Git Branch: devnet
```

---

### Step 3: Configure DNS (in your domain provider)

#### Add these DNS records:

```dns
# Production
Type: A
Name: @
Value: 76.76.21.21 (Vercel IP)

Type: CNAME
Name: www
Value: cname.vercel-dns.com

# Staging/Devnet
Type: CNAME
Name: devnet
Value: cname.vercel-dns.com
```

---

### Step 4: Update Convex Deployments

#### Set up two Convex deployments:

```bash
# 1. Production Deployment
cd /Users/shawaz/Developer/franchiseen
git checkout main
npx convex deploy --prod

# Note the deployment URL and ID
# Example: https://sharp-unicorn-123.convex.cloud
# ID: prod:sharp-unicorn-123

# 2. Development Deployment
git checkout devnet
npx convex dev --once

# Note the deployment URL and ID
# Example: https://happy-lemur-456.convex.cloud
# ID: dev:happy-lemur-456
```

#### Configure Convex Environment Variables:

In your Vercel environment variables (as shown in Step 1):
- Production uses `CONVEX_DEPLOYMENT=prod:sharp-unicorn-123`
- Staging uses `CONVEX_DEPLOYMENT=dev:happy-lemur-456`

---

### Step 5: Update Application Code

#### Create Network Configuration Utility

```typescript
// src/lib/networkConfig.ts
export type NetworkType = 'mainnet' | 'devnet';

export const getNetworkConfig = () => {
  // Check if we're on the devnet subdomain
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  const isDevnetDomain = hostname.startsWith('devnet.');
  
  // Get environment default
  const envNetwork = process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'mainnet-beta';
  const defaultIsDevnet = envNetwork === 'devnet';
  
  // Check localStorage for user preference (only on main domain)
  let userPreference: NetworkType | null = null;
  if (typeof window !== 'undefined' && !isDevnetDomain) {
    userPreference = localStorage.getItem('preferred_network') as NetworkType;
  }
  
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
  
  // Can toggle only on main domain and if allowed
  const allowToggle = !isDevnetDomain && 
                      process.env.NEXT_PUBLIC_ALLOW_NETWORK_TOGGLE === 'true';
  
  return {
    network,
    isDevnet,
    isMainnet,
    isDevnetDomain,
    allowToggle,
    
    // RPC URLs
    solanaRpcUrl: isDevnet 
      ? process.env.NEXT_PUBLIC_SOLANA_DEVNET_RPC_URL || 'https://api.devnet.solana.com'
      : process.env.NEXT_PUBLIC_SOLANA_MAINNET_RPC_URL || 'https://api.mainnet-beta.solana.com',
    
    // Convex URLs
    convexUrl: isDevnet
      ? process.env.NEXT_PUBLIC_CONVEX_DEV_URL
      : process.env.NEXT_PUBLIC_CONVEX_URL,
    
    // Explorer URL generator
    explorerUrl: (hash: string, type: 'tx' | 'address' = 'tx') => {
      const base = `https://explorer.solana.com/${type}/${hash}`;
      return isDevnet ? `${base}?cluster=devnet` : base;
    },
    
    // Cluster name for display
    clusterName: isDevnet ? 'Devnet' : 'Mainnet',
    
    // Badge color
    badgeColor: isDevnet 
      ? 'bg-yellow-500 text-yellow-900' 
      : 'bg-green-500 text-green-900',
  };
};
```

#### Create Network Banner Component

```typescript
// src/components/NetworkBanner.tsx
'use client';

import { getNetworkConfig } from '@/lib/networkConfig';
import { AlertTriangle, Info } from 'lucide-react';
import Link from 'next/link';

export function NetworkBanner() {
  const { isDevnet, isDevnetDomain, isMainnet } = getNetworkConfig();
  
  // Show banner on devnet subdomain
  if (isDevnetDomain) {
    return (
      <div className="bg-yellow-500 text-yellow-900 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          <span className="font-bold">
            DEVNET ENVIRONMENT - Test Network Only
          </span>
        </div>
        <Link 
          href="https://franchiseen.com" 
          className="text-yellow-900 underline hover:text-yellow-800"
        >
          Go to Production →
        </Link>
      </div>
    );
  }
  
  // Show info banner when user toggles to devnet on main site
  if (isDevnet && !isDevnetDomain) {
    return (
      <div className="bg-yellow-100 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 text-yellow-700 dark:text-yellow-400" />
          <span className="text-sm text-yellow-700 dark:text-yellow-400">
            You're viewing Devnet (test network). Switch to Mainnet for real transactions.
          </span>
        </div>
      </div>
    );
  }
  
  return null;
}
```

#### Update Root Layout

```typescript
// src/app/layout.tsx
import { NetworkBanner } from '@/components/NetworkBanner';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <NetworkBanner />
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
```

#### Update Network Toggle Component

```typescript
// src/components/NetworkToggle.tsx
'use client';

import { getNetworkConfig } from '@/lib/networkConfig';
import { Switch } from '@/components/ui/switch';
import { Globe, Lock } from 'lucide-react';
import { useState } from 'react';

export function NetworkToggle() {
  const config = getNetworkConfig();
  const [isDevnet, setIsDevnet] = useState(config.isDevnet);
  
  // Don't show toggle if not allowed
  if (!config.allowToggle) {
    return (
      <div className="flex items-center gap-2 p-3 border-t border-b bg-gray-50 dark:bg-gray-900">
        <Lock className="h-4 w-4 text-gray-400" />
        <div className="flex-1">
          <div className="text-sm font-medium">Network: {config.clusterName}</div>
          <div className="text-xs text-gray-500">
            {config.isDevnetDomain 
              ? 'Devnet only on this domain' 
              : 'Network locked in production'}
          </div>
        </div>
      </div>
    );
  }
  
  const handleToggle = (checked: boolean) => {
    const newNetwork = checked ? 'devnet' : 'mainnet';
    
    // Show confirmation when switching to mainnet
    if (!checked) {
      const confirmed = window.confirm(
        'Switch to MAINNET?\n\nYou will use real SOL and real money. Transactions cannot be reversed.\n\nAre you sure?'
      );
      if (!confirmed) return;
    }
    
    // Save preference
    localStorage.setItem('preferred_network', newNetwork);
    
    // Reload to apply changes
    window.location.reload();
  };
  
  return (
    <div className="p-3 border-t border-b">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4" />
          <span className="text-sm font-medium">Network</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-medium ${!isDevnet ? 'text-green-600' : 'text-gray-400'}`}>
            Mainnet
          </span>
          <Switch
            checked={isDevnet}
            onCheckedChange={handleToggle}
          />
          <span className={`text-xs font-medium ${isDevnet ? 'text-yellow-600' : 'text-gray-400'}`}>
            Devnet
          </span>
        </div>
      </div>
      <div className="text-xs text-gray-500">
        {isDevnet 
          ? '🧪 Test network - No real money' 
          : '💎 Live network - Real transactions'}
      </div>
    </div>
  );
}
```

---

### Step 6: Update Package.json Scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "dev:devnet": "NEXT_PUBLIC_SOLANA_NETWORK=devnet next dev",
    "dev:mainnet": "NEXT_PUBLIC_SOLANA_NETWORK=mainnet-beta next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    
    "convex:dev": "npx convex dev",
    "convex:deploy": "npx convex deploy --prod",
    
    "deploy:staging": "vercel --prod --scope=your-team",
    "deploy:production": "vercel --prod --scope=your-team"
  }
}
```

---

## 🚀 Deployment Workflow

### Initial Setup (One-time)

```bash
# 1. Set up Vercel project
vercel

# 2. Link to Git (main branch)
vercel git connect

# 3. Add devnet domain
vercel domains add devnet.franchiseen.com

# 4. Configure DNS as shown in Step 3

# 5. Deploy Convex production
git checkout main
npx convex deploy --prod

# 6. Deploy Convex dev
git checkout devnet
npx convex dev --once
```

### Regular Development Workflow

```bash
# Working on features (devnet)
git checkout devnet
npm run dev:devnet

# Make changes, test locally
# ...

# Commit and push (auto-deploys to devnet.franchiseen.com)
git add .
git commit -m "feat: new feature"
git push origin devnet

# When ready for production
git checkout main
git merge devnet
git push origin main  # Auto-deploys to franchiseen.com
```

---

## 📊 Architecture Comparison

| Aspect | Same Domain Only | Separate Subdomains | Hybrid (Recommended) |
|--------|------------------|---------------------|---------------------|
| **User Experience** | 🟡 Good | 🔴 Requires navigation | ✅ Best of both |
| **Data Separation** | 🟡 Toggle-based | ✅ Complete | ✅ Complete |
| **Testing Safety** | 🟡 Medium | ✅ High | ✅ High |
| **SEO** | ✅ Single domain | 🟡 Split traffic | ✅ Main domain focus |
| **Setup Complexity** | ✅ Simple | 🔴 Complex | 🟡 Medium |
| **Flexibility** | ✅ High | 🔴 Low | ✅ High |
| **Cost** | ✅ One deployment | 🔴 Two deployments | 🟡 One project, two branches |

---

## 🎯 Production URLs

After setup, you'll have:

```
Main Application:
├── https://franchiseen.com
│   ├── Default: Mainnet (production data)
│   ├── Toggle: Can switch to Devnet
│   └── Convex: Production deployment
│
└── https://devnet.franchiseen.com
    ├── Network: Devnet only (test data)
    ├── Toggle: Disabled
    └── Convex: Dev deployment
```

---

## 🔒 Security Considerations

### 1. Environment Isolation

```typescript
// Prevent devnet data leaks to mainnet
if (process.env.NODE_ENV === 'production' && isDevnet) {
  // Extra validation
  console.warn('Using devnet on production domain - verify this is intentional');
}
```

### 2. Transaction Guards

```typescript
// Before any transaction
if (isMainnet) {
  const confirmed = await showConfirmationDialog(
    'This transaction will use REAL SOL',
    `Amount: ${amount} SOL ($${usdValue})`
  );
  if (!confirmed) return;
}
```

### 3. Wallet Separation

```typescript
// Use different wallet addresses per network
const walletAddress = isDevnet 
  ? user.devnetWalletAddress 
  : user.mainnetWalletAddress;
```

---

## 📈 Monitoring & Analytics

### Vercel Analytics

```typescript
// Track network usage
import { track } from '@vercel/analytics';

track('network_toggle', {
  from: prevNetwork,
  to: newNetwork,
  domain: window.location.hostname,
});
```

### Custom Logging

```typescript
// Log network state on each page load
useEffect(() => {
  const config = getNetworkConfig();
  console.log('Network Config:', {
    network: config.network,
    domain: window.location.hostname,
    allowToggle: config.allowToggle,
  });
}, []);
```

---

## 🐛 Troubleshooting

### Issue: Wrong network after deployment

**Solution:**
```bash
# Clear Vercel cache
vercel env pull
vercel build

# Verify environment variables
vercel env ls
```

### Issue: Toggle not working

**Solution:**
```typescript
// Check browser console for:
console.log('Allow toggle:', process.env.NEXT_PUBLIC_ALLOW_NETWORK_TOGGLE);
console.log('Hostname:', window.location.hostname);
```

### Issue: Convex connection fails

**Solution:**
```bash
# Verify Convex URLs
npx convex dev --once
# Check output URLs match environment variables
```

---

## ✅ Checklist

### Before Going Live:

- [ ] DNS records configured
- [ ] Both Convex deployments created
- [ ] Vercel environment variables set
- [ ] Domains linked in Vercel
- [ ] Network banner tested
- [ ] Toggle functionality tested
- [ ] Transaction confirmations working
- [ ] Wallet addresses separated per network
- [ ] Analytics tracking enabled
- [ ] Error logging configured
- [ ] User documentation created
- [ ] Team trained on dual environment

---

## 📚 Additional Resources

- Vercel Domains: https://vercel.com/docs/concepts/projects/domains
- Vercel Environment Variables: https://vercel.com/docs/concepts/projects/environment-variables
- Convex Deployments: https://docs.convex.dev/production
- Next.js Environment Variables: https://nextjs.org/docs/basic-features/environment-variables

---

## 🎉 Result

After implementation, you'll have:

✅ **franchiseen.com** - Production site with mainnet default + devnet toggle  
✅ **devnet.franchiseen.com** - Staging site with devnet only  
✅ **Seamless switching** - Users can test safely before mainnet  
✅ **Clear separation** - No data mixing between environments  
✅ **Professional UX** - Industry-standard approach  

---

**Next Step:** Should I start implementing the NetworkConfig and components now?

