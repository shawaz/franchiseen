# 🔄 Dual Convex Database Setup - Complete Guide

## ✅ What's Already Done

Your code now supports dynamic database switching:
- **Mainnet** → Production Convex database
- **Devnet** → Development Convex database

When user toggles network, they switch BOTH:
- ✅ Solana RPC (mainnet/devnet)
- ✅ Convex Database (prod/dev)

---

## 🚀 Quick Setup (15 minutes)

### Step 1: Create Dev Convex Deployment (5 mins)

```bash
# Make sure you're on devnet branch
git checkout devnet

# Start dev deployment (keep this running in a terminal)
npx convex dev

# Output will show:
# ✓ Deployment URL: https://happy-lemur-456.convex.cloud
# COPY THIS URL ↑
```

### Step 2: Get Production Convex URL (2 mins)

```bash
# Check your current production deployment
npx convex deploy --dry-run

# Or check .env.local:
cat .env.local | grep CONVEX_URL

# Your production URL should be something like:
# https://sharp-unicorn-123.convex.cloud
```

### Step 3: Update .env.local (3 mins)

```bash
# Add both URLs to .env.local
code .env.local
```

Add these lines:

```env
# Production Convex (for mainnet)
NEXT_PUBLIC_CONVEX_URL=https://sharp-unicorn-123.convex.cloud

# Development Convex (for devnet)
NEXT_PUBLIC_CONVEX_DEV_URL=https://happy-lemur-456.convex.cloud

# Allow network toggle
NEXT_PUBLIC_ALLOW_NETWORK_TOGGLE=true

# Solana network (default)
NEXT_PUBLIC_SOLANA_NETWORK=mainnet-beta
```

### Step 4: Restart Dev Server (2 mins)

```bash
# Kill current server (Ctrl+C)
# Start fresh
npm run dev
```

### Step 5: Test It! (3 mins)

```bash
# 1. Open browser
open http://localhost:3002

# 2. Login to your account

# 3. Check console logs:
# Should see:
[Convex] Network: MAINNET
[Convex] Database: https://sharp-unicorn-123.convex.cloud
[Solana] Using RPC: mainnet.helius-rpc.com

# 4. Toggle to Devnet in account dropdown

# 5. After reload, check console:
[Convex] Network: DEVNET
[Convex] Database: https://happy-lemur-456.convex.cloud
[Solana] Using RPC: devnet.helius-rpc.com

# ✅ Both Convex and Solana switched!
```

---

## 📊 How It Works

### On Page Load:

```
1. ConvexClientProvider reads network preference
   ├── Check hostname (devnet subdomain?)
   ├── Check localStorage (user preference)
   └── Check environment (default)

2. Selects correct Convex URL
   ├── Devnet → NEXT_PUBLIC_CONVEX_DEV_URL
   └── Mainnet → NEXT_PUBLIC_CONVEX_URL

3. Creates ConvexReactClient with URL
   └── All queries/mutations use this client

4. App loads with synchronized data
   └── Solana network matches Convex database ✅
```

### On Network Toggle:

```
1. User clicks toggle
   └── Saves preference to localStorage

2. Page reloads (window.location.reload())

3. ConvexClientProvider re-runs
   ├── Reads new network from localStorage
   ├── Selects new Convex URL
   └── Creates new client

4. App loads with new network
   └── Everything synchronized ✅
```

---

## 🎯 What You'll See

### On Mainnet:
```
✅ Convex: Production database
✅ Franchises: Real franchises
✅ Wallets: Real balances
✅ Transactions: Real history
✅ Users: Production users
```

### On Devnet:
```
✅ Convex: Development database
✅ Franchises: Test franchises
✅ Wallets: Test balances
✅ Transactions: Test history
✅ Users: Test users (may be empty)
```

---

## 📝 Seeding Dev Database

Your dev database might be empty. Seed it:

```bash
# Make sure Convex dev is running
npx convex dev

# In another terminal:
npx convex run seedData:seedAll

# This will create test data:
# - Sample franchises
# - Test users
# - Mock transactions
# - Sample news articles
```

---

## 🔍 Verification Checklist

### Test 1: Database Switching

```bash
# On Mainnet:
1. Login
2. Check console: [Convex] Database: prod URL
3. See production franchises

# Toggle to Devnet:
4. Page reloads
5. Check console: [Convex] Database: dev URL
6. See different franchises (or none if not seeded)
```

### Test 2: Data Isolation

```bash
# On Mainnet:
1. Create a test franchise
2. Note its name

# Toggle to Devnet:
3. That franchise should NOT appear
4. Different database = different data ✅
```

### Test 3: Wallet Balance

```bash
# Mainnet:
- Wallet balance from mainnet Solana
- Franchises from prod Convex
- Everything matches ✅

# Devnet:
- Wallet balance from devnet Solana
- Franchises from dev Convex
- Everything matches ✅
```

---

## ⚙️ For Vercel Production

When deploying to Vercel, add both URLs as environment variables:

### Vercel Dashboard → Settings → Environment Variables:

```
Production Environment:
NEXT_PUBLIC_CONVEX_URL = https://prod-xxx.convex.cloud
NEXT_PUBLIC_CONVEX_DEV_URL = https://dev-yyy.convex.cloud
NEXT_PUBLIC_ALLOW_NETWORK_TOGGLE = true

Staging Environment (devnet.franchiseen.com):
NEXT_PUBLIC_CONVEX_URL = https://dev-yyy.convex.cloud
NEXT_PUBLIC_CONVEX_DEV_URL = https://dev-yyy.convex.cloud
NEXT_PUBLIC_ALLOW_NETWORK_TOGGLE = false
```

---

## 🎉 Benefits

### Complete Isolation:
```
Production (Mainnet):
├── Real money
├── Real franchises
├── Real users
└── Production Convex ✅

Testing (Devnet):
├── Test money
├── Test franchises
├── Test users
└── Dev Convex ✅

No cross-contamination!
```

### Flexible Development:
- Test features on devnet safely
- Switch back to see real data
- One app, two environments

### Professional UX:
- Industry standard (like MetaMask, Phantom)
- Clear network indicators
- Safe testing for users

---

## 🐛 Troubleshooting

### Issue: "Convex URL not configured"

**Solution:**
```bash
# Check .env.local has both URLs
cat .env.local | grep CONVEX

# Should see:
NEXT_PUBLIC_CONVEX_URL=...
NEXT_PUBLIC_CONVEX_DEV_URL=...
```

### Issue: Same data on both networks

**Solution:**
```bash
# Verify URLs are different
echo $NEXT_PUBLIC_CONVEX_URL
echo $NEXT_PUBLIC_CONVEX_DEV_URL

# Should be two different URLs!
```

### Issue: Loading forever

**Solution:**
```bash
# Check console for errors
# Make sure Convex URLs are valid
# Try: npx convex dev (for dev URL)
```

---

## ✅ Success Criteria

Network toggle is fully working when:

✅ Console shows different Convex URLs per network
✅ Mainnet shows production franchises
✅ Devnet shows dev franchises (or empty if not seeded)
✅ Balances match the network
✅ No data mixing between networks
✅ Toggle is seamless

---

## 📊 Current Status

✅ **Code:** Fully implemented
✅ **Build:** Successful  
✅ **Ready for:** Testing

**Next Steps:**
1. Get your dev Convex URL (`npx convex dev`)
2. Add to `.env.local` as `NEXT_PUBLIC_CONVEX_DEV_URL`
3. Restart server
4. Test network toggle
5. See different databases! 🎉

---

**Status:** Ready for you to test!  
**Time to test:** 5 minutes  
**Complexity:** Low (just add env var and restart)

