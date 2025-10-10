# 🆘 Production Error - Troubleshooting Guide

Quick guide to diagnose and fix production deployment errors.

---

## 🔍 Step 1: Check Vercel Deployment Logs

### Option A: Vercel Dashboard (Easiest)

1. Go to: https://vercel.com/dashboard
2. Click on your `franchiseen` project
3. Click on the latest deployment
4. Check the **"Logs"** tab
5. Look for error messages (usually in red)

**Common Errors to Look For:**
- `NEXT_PUBLIC_CONVEX_URL is not defined`
- `Module not found`
- `Failed to compile`
- `Error: Cannot find module`
- Database connection errors

### Option B: Using Browser Console

1. Open your production site
2. Press `F12` or `Cmd+Option+I` (Mac) to open DevTools
3. Go to **Console** tab
4. Look for red error messages
5. Copy the full error message

---

## 🔍 Step 2: Most Common Issues & Fixes

### Issue #1: "Application Error" Generic Page

**This usually means:**
- Environment variables missing
- Build failed
- Convex URL not set
- Runtime error in the app

**Fix:**

1. **Check Environment Variables in Vercel:**
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Verify these are set:
     ```
     NEXT_PUBLIC_CONVEX_URL=https://your-prod-deployment.convex.cloud
     NEXT_PUBLIC_SOLANA_NETWORK=mainnet-beta
     NEXT_PUBLIC_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
     NEXT_PUBLIC_USE_REAL_WALLETS=true
     NEXT_PUBLIC_APP_ENV=production
     ```

2. **Redeploy after adding variables:**
   ```bash
   # In Vercel dashboard, click "Deployments" → "..." → "Redeploy"
   # Or push a commit:
   git commit --allow-empty -m "Trigger redeploy"
   git push origin main
   ```

### Issue #2: "NEXT_PUBLIC_CONVEX_URL is not defined"

**Fix:**

```bash
# 1. Get your production Convex URL
npx convex env get NEXT_PUBLIC_CONVEX_URL --prod

# 2. Copy the URL (something like: https://magnificent-shark-123.convex.cloud)

# 3. Add it to Vercel:
# - Go to Vercel → Settings → Environment Variables
# - Add: NEXT_PUBLIC_CONVEX_URL with your URL
# - Set for: Production
# - Save

# 4. Redeploy
```

### Issue #3: "Failed to Connect to Database"

**Possible causes:**
- Convex production not deployed
- Wrong Convex URL in environment variables
- Convex deployment is paused or deleted

**Fix:**

```bash
# Check if Convex production exists
npx convex env list --prod

# If it doesn't exist, create it:
npx convex env add production
npx convex deploy --prod

# Get the URL and update Vercel environment variables
npx convex env get NEXT_PUBLIC_CONVEX_URL --prod
```

### Issue #4: Build Fails with "Module not found"

**Fix:**

```bash
# Test build locally first
npm run build

# If it works locally, check:
# 1. package.json is committed to git
# 2. package-lock.json is committed
# 3. All dependencies are in dependencies (not devDependencies)

# If local build fails, fix the errors first
npm run lint
```

### Issue #5: "Cannot read property of undefined"

**This is usually:**
- Missing data in production database
- API calls failing
- Undefined checks missing in code

**Fix:**

```bash
# Seed your production database
npx convex run seedProduction:seedProductionDatabase --prod

# Or check if data exists:
# Go to: https://dashboard.convex.dev
# Select your production deployment
# Check if tables have data
```

---

## 🔍 Step 3: Check Production Convex

### Verify Convex is Running

```bash
# List all environments
npx convex env list --prod

# Check logs
npm run convex:logs:prod

# Or directly:
npx convex logs --prod --tail
```

### Verify Convex URL Matches

```bash
# Get Convex production URL
npx convex env get NEXT_PUBLIC_CONVEX_URL --prod

# This MUST match the URL in your Vercel environment variables
```

### Check Convex Dashboard

1. Go to: https://dashboard.convex.dev
2. Select your **production** deployment
3. Check:
   - [ ] Functions are deployed
   - [ ] No errors in logs
   - [ ] Tables exist
   - [ ] Data is present (if expected)

---

## 🔍 Step 4: Test Build Locally

```bash
# Switch to main branch
git checkout main

# Pull latest
git pull origin main

# Install dependencies
npm install

# Test production build
npm run build

# If build succeeds, test production mode locally
npm run start
# Visit: http://localhost:3000
```

If the build fails locally, you'll see the exact error. Fix it before deploying.

---

## 🔍 Step 5: Check Specific Error Messages

### Error: "crypto-js module not found"

**Fix:**
```bash
npm install crypto-js
npm install --save-dev @types/crypto-js
git add package.json package-lock.json
git commit -m "Add crypto-js dependency"
git push origin main
```

### Error: "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is not defined"

This is a warning, not critical unless you're using maps.

**Fix:**
Add to Vercel environment variables or set as empty string.

### Error: "Failed to fetch"

**This means:**
- Network error
- CORS issue
- API endpoint not responding

**Check:**
1. Convex deployment is running
2. NEXT_PUBLIC_CONVEX_URL is correct
3. No CORS configuration issues

---

## 🔍 Step 6: Compare Dev vs Production

### Check What Works on Devnet

If your devnet deployment works but production doesn't:

**Compare environment variables:**

| Variable | Devnet | Production | Should Be Different? |
|----------|--------|------------|---------------------|
| `NEXT_PUBLIC_CONVEX_URL` | Dev URL | Prod URL | ✅ YES |
| `NEXT_PUBLIC_SOLANA_NETWORK` | devnet | mainnet-beta | ✅ YES |
| `NEXT_PUBLIC_SOLANA_RPC_URL` | devnet URL | mainnet URL | ✅ YES |
| `NEXT_PUBLIC_APP_ENV` | development | production | ✅ YES |
| All other vars | Same or different keys | Same or different keys | Optional |

---

## 🛠️ Quick Fixes to Try

### Fix #1: Redeploy with Environment Variables

1. **Verify all environment variables are set in Vercel**
2. **Redeploy:**
   ```bash
   git commit --allow-empty -m "Redeploy with env vars"
   git push origin main
   ```

### Fix #2: Clear Build Cache

In Vercel Dashboard:
1. Go to Settings → General
2. Scroll to "Build & Development Settings"
3. Toggle "Automatically enable Turbo" or clear cache
4. Redeploy

### Fix #3: Check Node Version

Make sure your `vercel.json` has the correct Node version:

```json
{
  "node": {
    "18": true
  }
}
```

### Fix #4: Test with Preview Deployment

```bash
# Create a test branch from main
git checkout -b test-prod
git push origin test-prod

# Vercel will create a preview deployment
# Test it before promoting to production
```

---

## 📋 Complete Environment Variables Checklist

Copy this checklist and verify in Vercel Dashboard → Settings → Environment Variables:

### Required (Frontend)
- [ ] `NEXT_PUBLIC_CONVEX_URL` = Your production Convex URL
- [ ] `NEXT_PUBLIC_SOLANA_NETWORK` = `mainnet-beta`
- [ ] `NEXT_PUBLIC_SOLANA_RPC_URL` = `https://api.mainnet-beta.solana.com`
- [ ] `NEXT_PUBLIC_USE_REAL_WALLETS` = `true`
- [ ] `NEXT_PUBLIC_APP_ENV` = `production`

### Optional (Frontend)
- [ ] `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` = Your Google Maps key
- [ ] `NEXT_PUBLIC_UPLOADCARE_PUBLIC_KEY` = Your Uploadcare key

### Required (Backend - Set in Convex)
```bash
# Verify these are set:
npx convex env list --prod

# Should show:
# - WALLET_ENCRYPTION_KEY
# - AUTH_SECRET
# - RESEND_API_KEY (if using email)
# - OPENAI_API_KEY (if using AI)
```

---

## 🔄 Step-by-Step Recovery

### If Everything is Broken:

1. **Check Vercel Deployment Status:**
   - Go to Vercel Dashboard
   - Look at the latest deployment
   - Check if it says "Ready" or "Error"

2. **If Status is "Error":**
   ```bash
   # Check what failed in the build
   # - Go to deployment
   # - Click "Building" or "Error" section
   # - Read the error message
   # - Fix the issue in code
   # - Redeploy
   ```

3. **If Status is "Ready" but site shows error:**
   ```bash
   # This is a runtime error
   # Check browser console
   # Check Vercel Function logs
   # Usually environment variable issue
   ```

4. **Nuclear Option - Rollback:**
   - Go to Vercel Dashboard → Deployments
   - Find a working deployment
   - Click "..." → "Promote to Production"

---

## 📞 Get Help Fast

### Send Me This Information:

1. **Error message from browser console** (F12 → Console tab)
2. **Vercel deployment URL** (from dashboard)
3. **Build status** (Ready/Error/Building)
4. **Screenshot of the error** (if visible)

### Check These URLs:

1. **Your Production Site:** [Your Vercel URL]
2. **Vercel Dashboard:** https://vercel.com/dashboard
3. **Convex Dashboard:** https://dashboard.convex.dev
4. **Vercel Status:** https://www.vercel-status.com/

---

## 🎯 Most Likely Cause

Based on common deployment issues, **90% of the time it's one of these:**

1. ❌ **Missing NEXT_PUBLIC_CONVEX_URL** (most common)
2. ❌ **Wrong Convex URL** (dev instead of prod)
3. ❌ **Convex production not deployed**
4. ❌ **Missing dependency in package.json**
5. ❌ **Build fails but wasn't tested locally**

---

## ✅ Quick Verification Checklist

Run through this quickly:

```bash
# 1. Is Convex production deployed?
npx convex env list --prod
# Should show: production environment

# 2. Get production URL
npx convex env get NEXT_PUBLIC_CONVEX_URL --prod
# Copy this URL

# 3. Does it match Vercel?
# Go to Vercel → Settings → Environment Variables
# Check if NEXT_PUBLIC_CONVEX_URL matches

# 4. Test build locally
npm run build
# Should complete without errors

# 5. Check Vercel deployment
# Dashboard → Latest deployment → Should say "Ready"
```

---

## 🆘 Emergency Commands

```bash
# Test production build locally
npm run build && npm run start

# Check Convex production
npm run convex:logs:prod

# Redeploy to Vercel
git commit --allow-empty -m "Fix production error"
git push origin main

# Rollback (if needed)
# Do this from Vercel dashboard by promoting previous deployment
```

---

## 📸 What I Need to Help You

Please provide:

1. **Screenshot of the error page**
2. **Browser console errors** (press F12)
3. **Vercel deployment status** (Error/Ready?)
4. **Which deployment URL** (vercel.app or custom domain?)

Then I can give you specific fix!

---

**Right now, please:**

1. Open https://vercel.com/dashboard
2. Click your `franchiseen` project
3. Look at the latest deployment
4. Tell me what status it shows (Building/Error/Ready)
5. If there's an error, click on it and share the message

This will help me give you the exact fix! 🚀

