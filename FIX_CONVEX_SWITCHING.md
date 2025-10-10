# 🔧 Fix: Convex Not Switching - Quick Solution

## 🔍 The Problem

Your `.env.local` currently has:
```env
NEXT_PUBLIC_CONVEX_URL=https://neat-raccoon-612.convex.cloud
```

But you need TWO separate Convex deployments:
```env
NEXT_PUBLIC_CONVEX_URL=https://prod-deployment.convex.cloud  # For mainnet
NEXT_PUBLIC_CONVEX_DEV_URL=https://dev-deployment.convex.cloud  # For devnet
```

**Current behavior:**
- Mainnet: Uses `NEXT_PUBLIC_CONVEX_URL` ✅
- Devnet: Looks for `NEXT_PUBLIC_CONVEX_DEV_URL`, doesn't find it, falls back to `NEXT_PUBLIC_CONVEX_URL` ❌
- **Result:** Both use same database!

---

## ✅ Quick Fix (5 minutes)

### Option 1: Use Current as Dev, Create New Prod (Recommended)

Since you're developing, your current database is probably dev data:

```bash
# 1. Your current deployment becomes "dev"
NEXT_PUBLIC_CONVEX_DEV_URL=https://neat-raccoon-612.convex.cloud

# 2. Create a NEW production deployment
git checkout main
npx convex deploy --prod

# Output will show new URL, example:
# ✓ Deployed to: https://sharp-unicorn-789.convex.cloud

# 3. Use that as prod
NEXT_PUBLIC_CONVEX_URL=https://sharp-unicorn-789.convex.cloud
```

### Option 2: Simple Same Database (Quick & Dirty)

For testing only, use same database for both:

```bash
# Just set both to same URL:
NEXT_PUBLIC_CONVEX_URL=https://neat-raccoon-612.convex.cloud
NEXT_PUBLIC_CONVEX_DEV_URL=https://neat-raccoon-612.convex.cloud

# Toggle will still work for Solana network
# But data will be the same (not ideal but works for testing)
```

---

## 🚀 Step-by-Step: Create Two Deployments

### Step 1: Deploy Production Convex (3 mins)

```bash
# Switch to main branch
cd /Users/shawaz/Developer/franchiseen
git checkout main

# Deploy to production
npx convex deploy --prod

# Copy the URL shown (example):
# Deployed to: https://wise-elephant-234.convex.cloud
```

### Step 2: Keep Dev Convex Running (already done)

```bash
# Switch back to devnet
git checkout devnet

# Your dev deployment is already running at:
# https://neat-raccoon-612.convex.cloud
```

### Step 3: Update .env.local

```bash
# Open .env.local
code .env.local
```

Update with BOTH URLs:

```env
# Production Convex (for mainnet)
NEXT_PUBLIC_CONVEX_URL=https://wise-elephant-234.convex.cloud

# Development Convex (for devnet)
NEXT_PUBLIC_CONVEX_DEV_URL=https://neat-raccoon-612.convex.cloud

# Allow network toggle
NEXT_PUBLIC_ALLOW_NETWORK_TOGGLE=true

# Solana default
NEXT_PUBLIC_SOLANA_NETWORK=mainnet-beta
```

### Step 4: Restart Server

```bash
# Kill server (Ctrl+C)
npm run dev
```

### Step 5: Test!

```bash
# Open browser
open http://localhost:3002

# Check console logs:
# On Mainnet: Should show wise-elephant-234.convex.cloud
# On Devnet: Should show neat-raccoon-612.convex.cloud
```

---

## 🎯 Verification

### Check Console Logs:

**On Mainnet:**
```
[Convex] Network: MAINNET
[Convex] Database: https://wise-elephant-234.convex.cloud
```

**On Devnet:**
```
[Convex] Network: DEVNET
[Convex] Database: https://neat-raccoon-612.convex.cloud
```

### Check Browser DevTools:

```javascript
// In browser console:
localStorage.getItem('preferred_network')
// Should return: "mainnet" or "devnet"

// Check which Convex URL is being used:
// Look at network tab → filter by "convex"
// Should see requests to correct URL
```

---

## 🐛 Quick Debug

### If still not switching:

```bash
# 1. Check .env.local has BOTH URLs
cat .env.local | grep CONVEX

# Should see BOTH lines:
# NEXT_PUBLIC_CONVEX_URL=...
# NEXT_PUBLIC_CONVEX_DEV_URL=...

# 2. Restart server (important!)
# 3. Hard refresh browser (Cmd+Shift+R)
# 4. Clear localStorage and try again:
localStorage.clear()
window.location.reload()
```

---

## ⚡ Temporary Workaround (If Urgent)

If you need to test NOW and don't have time for dual deployment:

**Use same database for both:**
```env
NEXT_PUBLIC_CONVEX_URL=https://neat-raccoon-612.convex.cloud
NEXT_PUBLIC_CONVEX_DEV_URL=https://neat-raccoon-612.convex.cloud
```

**Result:**
- ✅ Solana network switches (mainnet ↔ devnet)
- ✅ Wallet balances switch
- ❌ Convex data stays same (but won't break anything)

**Then later:**
- Create prod deployment when ready
- Update .env.local
- Restart server
- Full isolation achieved

---

## 📋 Final .env.local Example

```env
# Convex Databases (NEED BOTH!)
NEXT_PUBLIC_CONVEX_URL=https://wise-elephant-234.convex.cloud
NEXT_PUBLIC_CONVEX_DEV_URL=https://neat-raccoon-612.convex.cloud

# Helius RPC Keys
NEXT_PUBLIC_HELIUS_API_KEY_MAINNET=your-mainnet-key
NEXT_PUBLIC_HELIUS_API_KEY_DEVNET=your-devnet-key

# Solana Network
NEXT_PUBLIC_SOLANA_NETWORK=mainnet-beta
NEXT_PUBLIC_ALLOW_NETWORK_TOGGLE=true

# Other settings
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

---

## ✅ Quick Action Plan

**Do this now (5 mins):**

```bash
# 1. Create production Convex
git checkout main
npx convex deploy --prod
# Copy the URL

# 2. Update .env.local
# Add NEXT_PUBLIC_CONVEX_DEV_URL=https://neat-raccoon-612.convex.cloud
# Update NEXT_PUBLIC_CONVEX_URL=<new-prod-url>

# 3. Go back to devnet
git checkout devnet

# 4. Restart server
npm run dev

# 5. Test toggle
# Console should show DIFFERENT URLs for mainnet vs devnet
```

---

**Want me to help you deploy the production Convex now?** 🚀

