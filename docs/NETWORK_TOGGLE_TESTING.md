# ✅ Network Toggle - Testing Checklist

## 🎯 What Was Implemented

### Files Created:
1. ✅ `src/contexts/NetworkContext.tsx` - Network state management
2. ✅ `src/components/NetworkToggle.tsx` - Toggle UI component  
3. ✅ `src/components/NetworkBanner.tsx` - Warning banner
4. ✅ `src/lib/networkConfig.ts` - Configuration utility

### Files Updated:
1. ✅ `src/components/default/app-providers.tsx` - Added NetworkProvider
2. ✅ `src/components/default/app-layout.tsx` - Added NetworkBanner
3. ✅ `src/components/default/account-dropdown.tsx` - Added NetworkToggle
4. ✅ `src/components/app/franchisee/UserWallet.tsx` - Uses network context

### Features:
- ✅ Toggle between Mainnet and Devnet
- ✅ Persistent network preference (localStorage)
- ✅ Confirmation dialog when switching to mainnet
- ✅ Network banner shows current mode
- ✅ Wallet fetches from correct network
- ✅ "Get Dev Sol" button only shows on devnet
- ✅ Explorer links use correct cluster
- ✅ Build successful (0 errors)

---

## 🧪 Testing Steps

### Test 1: Initial Load (Mainnet Default)

```bash
# 1. Clear localStorage
localStorage.clear();

# 2. Refresh page
# Expected: Mainnet is active by default

# 3. Check UI
✅ No yellow banner
✅ Wallet shows green "MAINNET" badge
✅ No "Get Dev Sol" button
✅ Balance shows from mainnet RPC
```

### Test 2: Switch to Devnet

```bash
# 1. Click account dropdown (user icon)
# 2. See network toggle section
# 3. Toggle to Devnet
# Expected: Confirmation dialog appears

# 4. Click OK
# Expected: Page reloads

# 5. After reload:
✅ Yellow banner appears at top
✅ Wallet shows yellow "DEVNET" badge
✅ "Get Dev Sol" button appears
✅ Balance shows from devnet RPC
✅ localStorage: preferred_network = "devnet"
```

### Test 3: Switch Back to Mainnet

```bash
# 1. Click account dropdown
# 2. Toggle to Mainnet
# Expected: Confirmation dialog appears with warning

# 3. Click OK
# Expected: Page reloads

# 4. After reload:
✅ No yellow banner
✅ Wallet shows green "MAINNET" badge
✅ No "Get Dev Sol" button
✅ localStorage: preferred_network = "mainnet"
```

### Test 4: Persistence

```bash
# 1. Set to Devnet
# 2. Close browser completely
# 3. Reopen and navigate to site
# Expected: Still on Devnet

# 4. Check console:
✅ "[NetworkContext] Loaded network from localStorage: devnet"
```

### Test 5: Explorer Links

```bash
# On Devnet:
✅ Links should be: explorer.solana.com/tx/HASH?cluster=devnet

# On Mainnet:
✅ Links should be: explorer.solana.com/tx/HASH
```

### Test 6: Balance Fetching

```bash
# On Devnet:
✅ Console shows: "[Solana] Using RPC: devnet.helius-rpc.com"
✅ Fetches devnet balance

# On Mainnet:
✅ Console shows: "[Solana] Using RPC: mainnet.helius-rpc.com"
✅ Fetches mainnet balance
```

---

## 🔍 Visual Checks

### Account Dropdown Should Show:

#### On Mainnet:
```
┌─────────────────────────────┐
│ 👤 User Name                │
│ 0x1234...5678 (0.5678 SOL)  │
├─────────────────────────────┤
│ 🌐 Solana Network           │
│ ✅ Mainnet  ⚫──⚪ Devnet   │
│ ✅ Production Network Active│
│    Real SOL and real money  │
├─────────────────────────────┤
│ Register Franchise          │
│ Sign Out                    │
└─────────────────────────────┘
```

#### On Devnet:
```
┌─────────────────────────────┐
│ 👤 User Name                │
│ 0x1234...5678 (100.0 SOL)   │
├─────────────────────────────┤
│ 🌐 Solana Network           │
│ Mainnet  ⚪──⚫ Devnet ⚠️   │
│ ⚠️  Test Network Active     │
│    Test SOL - no real value │
├─────────────────────────────┤
│ Register Franchise          │
│ Sign Out                    │
└─────────────────────────────┘
```

### Network Banner:

#### On Mainnet:
```
(No banner shown)
```

#### On Devnet:
```
┌──────────────────────────────────────────────────────┐
│ ℹ️  Test Mode: You're viewing Devnet. Switch to     │
│ Mainnet in account menu for real transactions.      │
└──────────────────────────────────────────────────────┘
```

---

## 🐛 Troubleshooting

### Issue: Toggle not appearing

**Solution:**
```bash
# Check environment variable
cat .env.local | grep ALLOW_NETWORK_TOGGLE

# Should see:
NEXT_PUBLIC_ALLOW_NETWORK_TOGGLE=true

# If missing, add it and restart
```

### Issue: Page not reloading after toggle

**Solution:**
```typescript
// Check browser console for errors
// Make sure localStorage is accessible
```

### Issue: Still showing wrong network after toggle

**Solution:**
```bash
# Clear browser cache
# Clear localStorage
localStorage.clear();

# Hard refresh
Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
```

### Issue: Balance not changing

**Solution:**
```typescript
// Check console logs:
// Should see different RPC URLs for each network
console.log("[Solana] Using RPC:", rpcUrl);
```

---

## 📝 Environment Variables Needed

Make sure these are in your `.env.local`:

```env
# Allow network toggle
NEXT_PUBLIC_ALLOW_NETWORK_TOGGLE=true

# Helius API Keys (get from helius.dev)
NEXT_PUBLIC_HELIUS_API_KEY_MAINNET=your-mainnet-key
NEXT_PUBLIC_HELIUS_API_KEY_DEVNET=your-devnet-key

# Convex URLs (optional - for dual database support)
NEXT_PUBLIC_CONVEX_URL=https://your-prod.convex.cloud
NEXT_PUBLIC_CONVEX_DEV_URL=https://your-dev.convex.cloud

# Default network
NEXT_PUBLIC_SOLANA_NETWORK=mainnet-beta
```

---

## ✅ Final Checklist

Before marking as complete:

- [ ] All files created
- [ ] Build passes (npm run build)
- [ ] No TypeScript errors
- [ ] Toggle appears in account dropdown
- [ ] Toggle switches between networks
- [ ] Banner appears on devnet
- [ ] Wallet badge shows correct network
- [ ] "Get Dev Sol" only on devnet
- [ ] Balance fetches from correct network
- [ ] Explorer links have correct cluster
- [ ] Network preference persists
- [ ] Confirmation dialog shows
- [ ] Console logs show correct RPC
- [ ] Helius keys configured

---

## 🚀 Next Steps After Testing

### 1. Local Testing (Today)
- Test all scenarios above
- Fix any issues
- Verify performance

### 2. Deploy to Vercel (This Week)
- Add env vars to Vercel
- Deploy to production
- Test on live site

### 3. Set Up Devnet Subdomain (Next Week)
- Configure devnet.franchiseen.com
- Test subdomain locking
- Update DNS

### 4. User Documentation (Next Week)
- Create user guide
- Add tooltips
- Update help section

---

## 📊 Expected Performance

### Mainnet:
- **Balance Load**: 50-200ms (with Helius)
- **Network**: 99%+ uptime
- **Accuracy**: Real-time

### Devnet:
- **Balance Load**: 100-300ms
- **Network**: 95%+ uptime (devnet less reliable)
- **Accuracy**: Test data

---

## 🎉 Success Criteria

Network toggle is successful if:

✅ Users can switch networks seamlessly
✅ Clear visual distinction between networks
✅ No confusion about which network is active
✅ Balances match the selected network
✅ Proper warnings before mainnet switch
✅ Preference persists across sessions

---

## 📱 How to Test Right Now

```bash
# 1. Open your dev server
http://localhost:3002

# 2. Login to your account
# 3. Click user icon (top right)
# 4. See the network toggle section
# 5. Try switching between networks
# 6. Verify everything works!
```

---

**Status:** ✅ Implementation Complete  
**Build:** ✅ Successful  
**Ready for:** Testing & Deployment

Go ahead and test it now! 🚀

