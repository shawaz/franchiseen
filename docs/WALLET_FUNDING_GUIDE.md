# Franchise Wallet Funding & Real Transactions Guide

## 🎯 The Problem

**Why transactions aren't showing in Solana Explorer:**

Your current flow only updates database balances, but doesn't execute real on-chain Solana transactions because:

1. **No real SOL in wallets** - Wallets have 0 SOL on-chain
2. **Investor purchases are database-only** - They don't send real SOL
3. **Scheduled transfers fail** - Can't transfer SOL that doesn't exist

## 📊 Current vs Desired Flow

### ❌ Current (Database Only)
```
Investor clicks "Buy Tokens"
  ↓
Database balance updated (+$1000)
  ↓
Funding completes → transitionToLaunchingStage()
  ↓
Schedules Solana transfer (PDA → Franchise Wallet)
  ↓
❌ FAILS: PDA has 0 SOL on-chain
  ↓
Transaction shows in DB but NOT in Solana Explorer
```

### ✅ Desired (Real On-Chain)
```
Investor sends real SOL to PDA address
  ↓
SOL arrives on-chain (visible in Explorer)
  ↓
Database records the transaction
  ↓
Funding completes → transitionToLaunchingStage()
  ↓
Real Solana transfer: PDA → Franchise Wallet
  ↓
Real Solana transfer: PDA → Brand Wallet
  ↓
✅ All transfers visible in Solana Explorer
```

## 🔧 Quick Fix: Fund Wallets Manually

For testing, you need to add real devnet SOL to your wallets.

### Your Current Wallets:

1. **nike-01:** `HXaPamkyeugGTmfgfWyZwfMwVzV9sAAzp5heeDd95Cy2`
2. **nike-03:** `FtkgX64cj4Nj5eUHbbgVgkK9Cf3qSbjq4ravDbCU6L7c`
3. **nike-04:** `HLwn9AE2jSrSAGjp82S42P6PVRMsHgpjtNmisTxbVDgN`
4. **nike-05:** `7y1jmd2DHvNVgehSuEoqzykjAmHp8sP53fzsTbWupMxZ`
5. **nike-06:** `JDqeodgL9mCXWc7DEyjCBY3qtN2dkRnBT7xbPP6Jozfg`

### Option 1: Use Solana CLI (Fastest)

```bash
# Install Solana CLI if you haven't
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"

# Fund each wallet with 2 SOL
solana airdrop 2 HXaPamkyeugGTmfgfWyZwfMwVzV9sAAzp5heeDd95Cy2 --url devnet
solana airdrop 2 FtkgX64cj4Nj5eUHbbgVgkK9Cf3qSbjq4ravDbCU6L7c --url devnet
solana airdrop 2 HLwn9AE2jSrSAGjp82S42P6PVRMsHgpjtNmisTxbVDgN --url devnet
solana airdrop 2 7y1jmd2DHvNVgehSuEoqzykjAmHp8sP53fzsTbWupMxZ --url devnet
solana airdrop 2 JDqeodgL9mCXWc7DEyjCBY3qtN2dkRnBT7xbPP6Jozfg --url devnet

# Check balances
solana balance HXaPamkyeugGTmfgfWyZwfMwVzV9sAAzp5heeDd95Cy2 --url devnet
```

### Option 2: Use Solana Devnet Faucet (Web)

Visit: https://faucet.solana.com/

1. Select "Devnet"
2. Paste each wallet address
3. Request 2 SOL
4. Wait for confirmation

### Option 3: Use QuickNode Faucet

Visit: https://faucet.quicknode.com/solana/devnet

- Faster than official faucet
- Can request multiple times

## 🚀 Full Production Flow

For production, here's how the real flow should work:

### 1. Investor Purchase (Frontend)

When an investor clicks "Buy Tokens":

```typescript
// In your invest page/component
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';

async function purchaseTokens(pdaAddress: string, amountUSD: number) {
  // Connect to user's wallet (Phantom, Solflare, etc.)
  const provider = window.solana;
  await provider.connect();
  
  // Convert USD to SOL
  const solPrice = 150; // Get from oracle in production
  const amountSOL = amountUSD / solPrice;
  
  // Create transfer to PDA
  const connection = new Connection(clusterApiUrl('devnet'));
  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: provider.publicKey,
      toPubkey: new PublicKey(pdaAddress),
      lamports: amountSOL * LAMPORTS_PER_SOL,
    })
  );
  
  // Send transaction
  const signature = await provider.signAndSendTransaction(transaction);
  await connection.confirmTransaction(signature);
  
  // Record in database
  await convex.mutation(api.franchiseManagement.purchaseSharesBySlug, {
    franchiseSlug: "nike-01",
    investorId: provider.publicKey.toBase58(),
    sharesPurchased: 100,
    sharePrice: amountUSD / 100,
    totalAmount: amountUSD,
    transactionHash: signature, // REAL Solana signature
  });
  
  console.log(`✅ Purchase successful! Signature: ${signature}`);
  console.log(`🔗 https://explorer.solana.com/tx/${signature}?cluster=devnet`);
}
```

### 2. Backend Validation

Update `purchaseSharesBySlug` to verify the transaction:

```typescript
// In convex/franchiseManagement.ts
export const purchaseSharesBySlug = mutation({
  args: {
    // ... existing args
    transactionHash: v.string(), // Make required
  },
  handler: async (ctx, args) => {
    // Validate transaction on-chain (optional but recommended)
    // This ensures the SOL was actually sent
    
    // Then record the purchase...
  },
});
```

### 3. Funding Completion

When funding reaches 100%, `transitionToLaunchingStage()` will:

1. Check that PDA has real SOL
2. Execute real on-chain transfers:
   - PDA → Franchise Wallet (working capital)
   - PDA → Brand Wallet (franchise fee)
   - PDA → Brand Wallet (setup cost)
3. All transfers visible in Solana Explorer ✅

## 🧪 Testing the Flow

### Step 1: Fund a PDA Wallet

Let's use **nike-01** as an example:

```bash
# Fund the nike-01 wallet
solana airdrop 10 HXaPamkyeugGTmfgfWyZwfMwVzV9sAAzp5heeDd95Cy2 --url devnet

# Verify it received the funds
solana balance HXaPamkyeugGTmfgfWyZwfMwVzV9sAAzp5heeDd95Cy2 --url devnet
# Should show: 10 SOL

# Check in Explorer
open "https://explorer.solana.com/address/HXaPamkyeugGTmfgfWyZwfMwVzV9sAAzp5heeDd95Cy2?cluster=devnet"
```

### Step 2: Trigger Funding Completion

If your franchise is already at 100% funding:

```typescript
// In your dashboard or admin panel
await convex.mutation(api.franchiseManagement.transitionToLaunchingStage, {
  franchiseId: "your-franchise-id",
});
```

Or manually complete funding by simulating investor purchases until 100%.

### Step 3: Verify On-Chain Transfers

After `transitionToLaunchingStage()` executes:

1. Check the PDA wallet in Explorer - balance should decrease
2. Check the franchise wallet - should receive working capital
3. Check the brand wallet - should receive fees

All transactions will have real signatures visible in Explorer!

## 📝 Key Files Modified

### Solana Transaction Execution
- `convex/solanaTransactions.ts` - Executes real on-chain transfers
- `convex/walletKeypairs.ts` - Manages wallet keypairs
- `convex/franchiseManagement.ts` - Schedules transfers when funding completes

### Wallet Management
- `convex/migrateWallets.ts` - Migrates old mock wallets to real ones
- `convex/walletFunding.ts` - Checks balances and requests airdrops
- `scripts/fundWallets.js` - CLI tool to fund wallets

## 🔐 Security Notes

**Current Status:**
- ✅ Real Solana keypairs generated
- ✅ Secret keys stored (unencrypted for now)
- ⚠️ Encryption is placeholder (just returns key as-is)

**Before Production:**
1. Implement proper encryption (AWS KMS, HashiCorp Vault, or at minimum crypto-js)
2. Never expose secret keys to frontend
3. Use hardware security modules (HSM) for high-value wallets
4. Implement multi-sig for brand wallets

## 🎯 Summary

**Current State:**
- ✅ Real Solana wallets created
- ✅ Secret keys stored
- ✅ Visible in Solana Explorer
- ❌ No SOL in wallets (0 balance)
- ❌ Transactions fail silently

**To Fix:**
1. **Quick Fix:** Fund wallets manually with devnet SOL
2. **Proper Fix:** Update frontend to send real SOL during purchases
3. **Production:** Validate transactions on-chain before recording

**Fund wallets now:**
```bash
# Copy-paste this entire block
solana airdrop 2 HXaPamkyeugGTmfgfWyZwfMwVzV9sAAzp5heeDd95Cy2 --url devnet && \
solana airdrop 2 FtkgX64cj4Nj5eUHbbgVgkK9Cf3qSbjq4ravDbCU6L7c --url devnet && \
solana airdrop 2 HLwn9AE2jSrSAGjp82S42P6PVRMsHgpjtNmisTxbVDgN --url devnet && \
solana airdrop 2 7y1jmd2DHvNVgehSuEoqzykjAmHp8sP53fzsTbWupMxZ --url devnet && \
solana airdrop 2 JDqeodgL9mCXWc7DEyjCBY3qtN2dkRnBT7xbPP6Jozfg --url devnet
```

Then trigger a funding completion and watch the transactions execute in Solana Explorer! 🚀

