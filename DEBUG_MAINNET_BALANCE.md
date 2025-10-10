# 🔍 Debug Mainnet Balance Not Loading

## 🎯 Quick Diagnosis

Your mainnet balance might be 0 or not loading for these reasons:

### 1. **Wallet Has 0 Balance on Mainnet** (Most Likely)
This is EXPECTED if:
- ✅ Wallet was just generated
- ✅ You've only tested on devnet
- ✅ No one has sent SOL to this mainnet address

**Solution:** This is normal! Mainnet SOL costs real money.

### 2. **RPC Connection Issue**
Helius might be rate-limited or having issues.

### 3. **Wrong Wallet Address**
Different address being used for mainnet vs devnet.

---

## 🧪 Debugging Steps

### Step 1: Check Console Logs

Open browser console (F12) and look for these logs:

```javascript
// When on Mainnet, you should see:
[Account Dropdown] Fetching balance for wallet: ABC123DE...
[Account Dropdown] Network: mainnet-beta
[Account Dropdown] Using RPC: https://mainnet.helius-rpc.com/?api-key=...
[Account Dropdown] ✅ Balance fetched: 0.0000 SOL on mainnet-beta

// If balance is 0, this is NORMAL for a new wallet
// If you see errors, note what they say
```

### Step 2: Check Your Wallet Address

```javascript
// In browser console:
localStorage.getItem('userWalletAddress')
// Or check from userProfile

// Copy the wallet address
```

### Step 3: Check Balance on Solana Explorer

```bash
# Go to:
https://explorer.solana.com/address/YOUR_WALLET_ADDRESS

# (No cluster parameter for mainnet)

# What to look for:
# - Does wallet exist? YES = good
# - What's the balance? 0 SOL = expected if new
# - Any transactions? Probably none if new
```

### Step 4: Check Helius Dashboard

```bash
# Go to: https://dashboard.helius.dev/
# Check:
# - API key status: Active?
# - Request count: Are requests going through?
# - Error rate: Any errors?
```

---

## 💡 Expected Behavior for New Wallet

### **On Devnet:**
```
Balance: 100+ SOL ✅
Reason: You can get free devnet SOL from faucet
Status: Normal and expected
```

### **On Mainnet:**
```
Balance: 0.0000 SOL ✅
Reason: No one has sent SOL to this address yet
Status: Normal and expected
```

**This is CORRECT behavior!** Mainnet SOL costs real money.

---

## 🔧 Solutions Based on Issue

### If Balance is 0 (Expected):

**Option 1: Add Real SOL** (Production)
```bash
# Transfer mainnet SOL from exchange:
# 1. Buy SOL on Coinbase/Binance/Kraken
# 2. Withdraw to your wallet address
# 3. Wait for confirmation (~30 seconds)
# 4. Refresh balance

# Minimum: ~0.1 SOL ($16 at $160/SOL)
```

**Option 2: Use Devnet** (Testing)
```bash
# Just toggle to devnet:
# 1. Click account dropdown
# 2. Switch to Paper Money mode
# 3. Click "Get Dev Sol" button
# 4. Free test SOL! 🎉
```

**Option 3: Keep 0 Balance** (Fine for Demo)
```bash
# It's OK to have 0 on mainnet!
# - Platform still works
# - Can browse franchises
# - Can see data
# - Just can't make transactions yet
```

### If Balance is NOT 0 but Shows 0:

**Debug with these console commands:**

```javascript
// In browser console:

// 1. Check network
localStorage.getItem('preferred_network')
// Should show: "mainnet" or "devnet"

// 2. Check Convex URL
console.log(process.env.NEXT_PUBLIC_CONVEX_URL)
// Should show production URL

// 3. Manually fetch balance
const { getSolanaConnection } = await import('./src/lib/solanaConnection.ts');
const connection = getSolanaConnection('mainnet-beta');
const balance = await connection.getBalance('YOUR_WALLET_ADDRESS');
console.log('Direct balance check:', balance);
```

### If Getting RPC Errors:

**Check Helius API Key:**
```bash
# Verify key in .env.local
cat .env.local | grep HELIUS_API_KEY_MAINNET

# Test key manually:
curl "https://mainnet.helius-rpc.com/?api-key=YOUR_KEY" \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"getHealth"}'

# Should return: {"jsonrpc":"2.0","result":"ok","id":1}
```

---

## 📊 Visual Indicators

### What You Should See:

**Account Dropdown on Mainnet:**
```
┌──────────────────────────┐
│ 👤 User Name             │
│ ABC1...DEF2  0.0000 SOL 💵│ ← Green money icon
└──────────────────────────┘
```

**Account Dropdown on Devnet:**
```
┌──────────────────────────┐
│ 👤 User Name             │
│ ABC1...DEF2  100.0 SOL 📄│ ← Yellow paper icon
└──────────────────────────┘
```

**Network Toggle:**
```
Real Money ⚫──⚪ Paper
            ↑
      Currently on Real Money
```

---

## ✅ Verification Checklist

Run through these checks:

- [ ] Console shows `[Account Dropdown]` logs
- [ ] Console shows `Network: mainnet-beta` when on mainnet
- [ ] Console shows correct RPC URL with Helius
- [ ] Console shows balance (even if 0)
- [ ] Green 💵 icon shows in dropdown on mainnet
- [ ] Yellow 📄 icon shows in dropdown on devnet
- [ ] Balance changes when toggling networks
- [ ] No red errors in console

---

## 🎯 Most Likely Scenario

**Your mainnet balance is actually 0, which is correct!**

Here's what's happening:
1. ✅ Helius is configured correctly
2. ✅ RPC is fetching successfully
3. ✅ Balance returns: 0.0000 SOL
4. ✅ This is EXPECTED for a new mainnet wallet

**What to do:**
- **For Production:** Buy SOL and transfer to wallet
- **For Testing:** Use devnet (paper money mode)
- **For Demo:** 0 balance is fine, platform still works!

---

## 📝 Console Log Examples

### Successful Fetch (0 balance):
```
[Account Dropdown] Fetching balance for wallet: ABC123DE...
[Account Dropdown] Network: mainnet-beta
[Account Dropdown] Using RPC: https://mainnet.helius-rpc.com/?api-key=bcfb50a9...
[Account Dropdown] ✅ Balance fetched: 0.0000 SOL on mainnet-beta
```

### RPC Error:
```
[Account Dropdown] ❌ Error fetching balance: Error: RPC timeout
[Account Dropdown] Error details: {
  wallet: "ABC123...",
  network: "mainnet",
  error: "RPC timeout"
}
```

### Invalid Wallet:
```
[Account Dropdown] ❌ Error fetching balance: Error: Invalid public key
```

---

## 🚀 Next Steps

1. **Check browser console** - What logs do you see?
2. **Share the logs** - I can help diagnose
3. **Check wallet on explorer** - Does it exist?
4. **Confirm Helius working** - Check dashboard

**Most likely:** Balance is 0, which is correct! Your setup is working fine.

To get SOL on mainnet, you'd need to:
- Buy on exchange (Coinbase, Binance, etc.)
- Send to your wallet address
- Or use devnet for free testing

---

## ⚡ Quick Test Script

Run this in browser console to test directly:

```javascript
// Test mainnet balance fetch
const testMainnetBalance = async () => {
  try {
    const { getSolanaConnection } = await import('./src/lib/solanaConnection');
    const connection = getSolanaConnection('mainnet-beta');
    
    console.log('RPC URL:', connection.getCurrentRpcUrl());
    
    const walletAddress = localStorage.getItem('userWalletAddress');
    console.log('Wallet:', walletAddress);
    
    const balance = await connection.getBalance(walletAddress);
    console.log('Balance:', balance, 'SOL');
    
    return { success: true, balance };
  } catch (error) {
    console.error('Error:', error);
    return { success: false, error };
  }
};

testMainnetBalance();
```

---

**Question:** What do you see in the browser console when on mainnet? Share the logs and I can help! 🔍

