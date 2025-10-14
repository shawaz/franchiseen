# 🚀 Fix Privy Login Modal - Quick Guide

## Issue
Privy login modal not showing when clicking "Get Started", "Buy Token", or "Checkout".

## ✅ Solution

### Step 1: Get Your Privy App ID

1. Go to [https://dashboard.privy.io](https://dashboard.privy.io)
2. Sign up or log in
3. Create a new app or select existing app
4. Copy your **App ID** (starts with `cl...`)

### Step 2: Add to Environment Variables

Create or update `.env.local` in your project root:

```bash
NEXT_PUBLIC_PRIVY_APP_ID=clxxxxxxxxxxxxxxxxxxxxx
```

**Replace** `clxxxxxxxxxxxxxxxxxxxxx` with your actual Privy App ID.

### Step 3: Configure Privy Dashboard

In your Privy dashboard (https://dashboard.privy.io):

1. **Go to Settings → Configuration**

2. **Add Allowed Domains:**
   - Development: `http://localhost:3000`
   - Production: Your production URL

3. **Enable Login Methods:**
   - ✅ Email
   - ✅ Google
   - ✅ Wallet (Solana)

4. **Configure Embedded Wallets:**
   - Go to Settings → Embedded Wallets
   - Enable "Create embedded wallets for users"
   - Select Solana as the blockchain

5. **Customize Appearance (Optional):**
   - Theme: Light or Dark
   - Accent Color: `#676FFF`
   - Logo: Upload your logo

### Step 4: Restart Your Dev Server

```bash
# Stop current server (Ctrl+C)

# Start fresh
bun dev
# or
npm run dev
```

### Step 5: Test the Login

1. Open http://localhost:3000/auth
2. Click "Sign in with Email" or "Google"
3. **Privy modal should now appear!**

## 🐛 Debugging

### Check Browser Console

Open DevTools (F12) and look for:

```
✅ "Privy App ID configured: true"
✅ "Login button clicked, opening Privy modal"
```

### If you see errors:

**Error: "NEXT_PUBLIC_PRIVY_APP_ID is not set"**
- Solution: Add the env variable and restart server

**Error: "Invalid App ID"**
- Solution: Double-check App ID in Privy dashboard

**Error: "Domain not allowed"**
- Solution: Add `http://localhost:3000` to allowed domains in Privy

**Modal shows but login fails:**
- Solution: Check login methods are enabled in Privy dashboard

### Verify Environment Variable

In your terminal:
```bash
echo $NEXT_PUBLIC_PRIVY_APP_ID
```

Or add temporary logging to check:
```typescript
// In any component
console.log('Privy App ID:', process.env.NEXT_PUBLIC_PRIVY_APP_ID);
```

## 📝 Test Flow

1. **Go to `/auth` page**
   - Should see login buttons
   - Check console for "Privy App ID configured: true"

2. **Click "Sign in with Email"**
   - Privy modal opens
   - Enter email
   - Receive magic link
   - Click link → logged in ✅

3. **Click "Google"**
   - Privy modal opens
   - Google OAuth flow
   - Logged in ✅

4. **Click "Connect Wallet"**
   - Privy modal opens
   - Connect existing wallet or create embedded wallet
   - Logged in ✅

## 🔗 Helpful Links

- **Privy Dashboard**: https://dashboard.privy.io
- **Privy Docs**: https://docs.privy.io
- **Privy Discord**: https://discord.gg/privy

## 📱 Production Deployment

When deploying to production (Vercel, etc.):

1. **Add Environment Variable:**
   - Go to Vercel → Project Settings → Environment Variables
   - Add: `NEXT_PUBLIC_PRIVY_APP_ID` = Your App ID
   - Apply to: Production, Preview, Development

2. **Update Privy Allowed Domains:**
   - Add your production domain (e.g., `https://yourdomain.com`)
   - Add preview domains if using Vercel previews

3. **Redeploy**

## ✨ Features After Login

Once logged in, users get:
- ✅ Privy-managed authentication
- ✅ Embedded Solana wallet (auto-created)
- ✅ Secure session management
- ✅ User profile synced to Convex
- ✅ Access to all protected features

## 🆘 Still Not Working?

1. **Clear browser cache and cookies**
2. **Try incognito/private mode**
3. **Check Privy status page**: https://status.privy.io
4. **Review Privy logs in dashboard**
5. **Check browser console for specific errors**

---

**Quick Commands:**

```bash
# Start dev server
bun dev

# Check environment
echo $NEXT_PUBLIC_PRIVY_APP_ID

# Build to verify
bun run build

# View logs
# Check browser DevTools Console (F12)
```

