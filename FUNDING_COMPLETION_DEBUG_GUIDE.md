# Funding Completion & Wallet Creation Debug Guide

## What Should Happen When Funding Reaches 100%

When a franchise reaches 100% funding, the system automatically:

1. ✅ Creates a franchise wallet with working capital
2. ✅ Transfers franchise fee to brand wallet
3. ✅ Transfers setup cost to brand wallet  
4. ✅ Updates franchise stage to "launching"
5. ✅ Creates setup timeline (45 days)
6. ✅ Creates franchise stages tracking

## Fund Distribution Breakdown

When `$100,000` is fully funded:

```
Total Investment: $100,000
├─ Franchise Fee: $25,000 → Brand Wallet ✅
├─ Setup Cost: $50,000 → Brand Wallet ✅
└─ Working Capital: $25,000 → Franchise Wallet ✅
```

## How to Debug

### Step 1: Check Console Logs

When you buy the final tokens that complete funding, look for these logs in your **Convex Dashboard** or browser console:

```bash
🎯 Funding complete for nike-01! Starting transition to launching stage...
📊 Investment details: { totalInvestment, totalInvested, franchiseFee, setupCost, workingCapital }
🚀 transitionToLaunchingStage called for franchiseId: ...
✅ Franchise found: { franchiseSlug: 'nike-01', currentStage: 'funding' }
✅ Investment found: { totalInvestment: 100000, ... }
✅ Funding verified as complete: 100.00%
📝 No existing wallet found, will create new one
🔍 Funding PDA search result: None found
💰 Creating franchise wallet with working capital: $25,000
✅ Franchise wallet created successfully: [ID]
💵 Creating brand wallet transaction for franchise fee: $25,000
✅ Franchise fee transaction created: [ID]
💵 Creating brand wallet transaction for setup cost: $50,000
✅ Setup cost transaction created: [ID]
✅ Transition successful!
```

### Step 2: Check Convex Dashboard

1. Go to https://dashboard.convex.dev
2. Select your project
3. Go to "Data" tab
4. Check these tables:

#### A. `franchiseWallets` Table
Look for a wallet where:
- `franchiseId` = your franchise ID
- `status` = "active"
- `usdBalance` = working capital amount (e.g., 25000)

#### B. `brandWalletTransactions` Table
Look for transactions where:
- `franchiseId` = your franchise ID
- `type` = "franchise_fee" (should show franchise fee amount)
- `type` = "setup_cost" (should show setup cost amount)
- `status` = "completed"

#### C. `franchises` Table
Check your franchise:
- `stage` should be "launching" (not "funding")

### Step 3: If No Wallet Was Created

If the stage changed to "launching" but no wallet exists, you have 2 options:

#### Option A: Manual Fix (Recommended)

Open your browser console on any franchise page and run:

```javascript
// Get your Convex client
const convex = window.convex; // Or however you access it

// Get the franchise ID (replace with your actual franchise ID)
const franchiseId = "your-franchise-id-here";

// Call the fix mutation
const result = await convex.mutation(
  api.franchiseManagement.fixFranchiseWithoutWallet,
  { franchiseId }
);

console.log("Fix result:", result);
```

#### Option B: Buy One More Token

If the franchise is still showing as "funding" stage (not "launching"), just buy one more token. The system will check again and create the wallet.

If it's already in "launching" stage, you'll need to use Option A or wait for an admin to manually trigger the wallet creation.

## Common Issues & Solutions

### Issue 1: Stage Changed to "Launching" But No Wallet

**Cause**: The `transitionToLaunchingStage` mutation failed after updating the stage

**Solution**: Use the `fixFranchiseWithoutWallet` mutation (see Option A above)

**Check logs for error message** - it will show exactly what failed

### Issue 2: Brand Wallet Not Showing Balance

**Cause**: Brand wallet balance is calculated from transactions

**Solution**: 
1. Check `brandWalletTransactions` table in Convex Dashboard
2. Verify transactions exist with `status: "completed"`
3. Brand wallet balance = sum of all `completed` transactions

**Query to check**:
```typescript
// In Convex Dashboard Data tab, run this query:
db.query("brandWalletTransactions")
  .withIndex("by_franchiser", q => q.eq("franchiserId", "YOUR_FRANCHISER_ID"))
  .filter(q => q.eq(q.field("status"), "completed"))
  .collect()
```

### Issue 3: No Console Logs Appearing

**Where to Look**:

1. **Convex Logs**: Go to Convex Dashboard → Logs tab
2. **Browser Console**: Open DevTools → Console tab
3. **Backend Logs**: Check your terminal if running Convex dev mode

## Testing the Fix

### Test 1: Check Current Franchise Status

```typescript
// In browser console or Convex Dashboard
const debugInfo = await convex.query(
  api.franchiseManagement.debugFranchiseStatus,
  { franchiseSlug: "nike-01" }
);

console.log("Franchise Debug Info:", debugInfo);
// Should show: currentStage, fundingProgress, shouldTransition, etc.
```

### Test 2: Check If Wallet Exists

```typescript
const wallet = await convex.query(
  api.franchiseManagement.getFranchiseWallet,
  { franchiseId: "YOUR_FRANCHISE_ID" }
);

console.log("Franchise Wallet:", wallet);
// null = no wallet
// object = wallet exists
```

### Test 3: Check Brand Wallet Balance

```typescript
const brandBalance = await convex.query(
  api.brandWallet.getBrandWalletBalance,
  { franchiserId: "YOUR_FRANCHISER_ID" }
);

console.log("Brand Wallet Balance:", brandBalance);
```

## Manual Wallet Creation Script

If automated creation doesn't work, create this script:

```typescript
// File: scripts/createFranchiseWalletManually.ts

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

async function createWalletForFranchise(franchiseId: string) {
  try {
    console.log("Creating wallet for franchise:", franchiseId);
    
    const result = await client.mutation(
      api.franchiseManagement.fixFranchiseWithoutWallet,
      { franchiseId }
    );
    
    console.log("Success!", result);
  } catch (error) {
    console.error("Error:", error);
  }
}

// Usage:
// createWalletForFranchise("YOUR_FRANCHISE_ID");
```

## Expected Results After Fix

### Franchise Wallet
- **Balance**: Working capital amount (e.g., $25,000)
- **USD Balance**: Same as balance
- **Status**: "active"
- **Address**: `franchise_{franchiseId}_{timestamp}`

### Brand Wallet Transactions
- **Transaction 1**: Franchise Fee (e.g., $25,000)
- **Transaction 2**: Setup Cost (e.g., $50,000)
- **Total in Brand Wallet**: Franchise Fee + Setup Cost (e.g., $75,000)

### Franchise Stage
- **Current Stage**: "launching" (changed from "funding")
- **Progress**: 25% (setup phase)
- **Estimated Launch**: 45 days from completion

## Verification Checklist

After funding completes, verify:

- [ ] Franchise stage = "launching"
- [ ] Franchise wallet exists in `franchiseWallets` table
- [ ] Franchise wallet has correct working capital balance
- [ ] Brand wallet has 2 new transactions (franchise fee + setup cost)
- [ ] Franchise setup entry created in `franchiseSetup` table
- [ ] Franchise stages entry created in `franchiseStages` table

## Next Steps

1. **Buy tokens until 100% funded**
2. **Check console logs** in Convex Dashboard → Logs
3. **Verify wallet created** in Convex Dashboard → Data → franchiseWallets
4. **Check brand wallet** in Convex Dashboard → Data → brandWalletTransactions
5. **If issues persist**, use `fixFranchiseWithoutWallet` mutation

---

## Quick Fix Commands

### Check Franchise Status
```bash
# In Convex Dashboard → Data → Run Query
api.franchiseManagement.debugFranchiseStatus({ franchiseSlug: "nike-01" })
```

### List All Franchises
```bash
api.franchiseManagement.getAllFranchisesDebug({})
```

### Manual Fix
```bash
# In Convex Dashboard → Data → Run Mutation
api.franchiseManagement.fixFranchiseWithoutWallet({ 
  franchiseId: "YOUR_FRANCHISE_ID" 
})
```

---

## Important Notes

### Current Implementation
- ✅ Fully automated wallet creation on funding completion
- ✅ Detailed console logging for debugging
- ✅ Manual fix mutation available if auto-creation fails
- ✅ Prevents duplicate wallet creation
- ✅ Handles cases where funding PDA doesn't exist

### Testing Mode
The system is currently using **Solana Devnet** (test network):
- Transactions are real but using test SOL
- Explorer URL: `https://explorer.solana.com/tx/{signature}?cluster=devnet`
- No real money involved

### Production Considerations
When moving to mainnet:
1. Switch RPC URLs from devnet to mainnet
2. Update all explorer URLs to remove `?cluster=devnet`
3. Test thoroughly on devnet first
4. Consider adding admin approval for fund transfers

---

## Troubleshooting

### The wallet was not created
**Check**: Look for error logs starting with `❌` in Convex logs

**Common causes**:
1. `transitionToLaunchingStage` threw an error
2. Database write permission issue
3. Circular dependency (now fixed)

### The brand wallet shows $0
**Check**: Query `brandWalletTransactions` table

**Common causes**:
1. Transactions created but `status` not set to "completed"
2. Wrong `franchiserId` in transactions
3. Balance calculation query filtering incorrectly

### The franchise wallet shows $0  
**Check**: Wallet record in `franchiseWallets` table

**Common causes**:
1. `usdBalance` field not set correctly
2. Wallet created but balance calculation failed
3. Wrong conversion rate (USD to SOL)

---

## Summary

With the latest fix:
- ✅ Added extensive logging to track every step
- ✅ Made funding PDA optional (not required)
- ✅ Added `fixFranchiseWithoutWallet` mutation for manual recovery
- ✅ Improved error handling and reporting
- ✅ Transaction filtering by franchise (NIKE01 shows only NIKE01 transactions)

**Next time you buy tokens to reach 100% funding, check the Convex logs for detailed step-by-step progress!**
