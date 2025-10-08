# ✅ NEW WALLET FLOW - Simple & Reliable

## 🔄 What Changed

**OLD (Broken) Flow:**
```
1. Franchise Approved → Token Created ❌ No Wallet
2. Users Buy Shares → Funds go nowhere
3. Reach 100% → Try to create wallet → FAILED
```

**NEW (Fixed) Flow:**
```
1. Franchise Approved → Token Created + Wallet Created with $0 ✅
2. Users Buy Shares → Funds added to wallet immediately ✅
3. Reach 100% → Transfer fees to brand wallet ✅
```

---

## 📋 Step-by-Step Flow

### **Step 1: Franchise Approval**
**File**: `convex/franchiseApproval.ts`

When admin approves a franchise:
1. ✅ Creates SPL token
2. ✅ **Creates franchise wallet with $0 balance**
3. ✅ Updates franchise status to "approved"
4. ✅ Updates franchise stage to "funding"

**Result**: Franchise wallet exists from day 1, ready to receive funds

---

### **Step 2: Each Share Purchase**
**File**: `convex/franchiseManagement.ts` → `purchaseSharesBySlug`

When someone buys shares:
1. ✅ Records the share purchase
2. ✅ **Adds purchase amount to franchise wallet balance**
3. ✅ **Records transaction in franchiseWalletTransactions**
4. ✅ Mints tokens for the investor
5. ✅ Updates investment totals

**Example**: User buys 100 shares @ $1 = $100
- Franchise wallet: $0 → $100 ✅
- Transaction logged: "Share purchase: 100 shares @ $1 = $100" ✅

---

### **Step 3: Reach 100% Funding**
**File**: `convex/franchiseManagement.ts` → `purchaseSharesBySlug`

When funding reaches 100%:
1. ✅ **Transfers franchise fee to brand wallet** (e.g., $25,000)
2. ✅ **Transfers setup cost to brand wallet** (e.g., $50,000)
3. ✅ **Deducts fees from franchise wallet** (leaves working capital)
4. ✅ Creates setup entry
5. ✅ Updates stage to "launching"

**Example Fund Distribution** (Total: $100,000):
```
Before 100%:
  Franchise Wallet: $100,000
  Brand Wallet: $0

After 100%:
  Franchise Wallet: $25,000 (working capital only)
  Brand Wallet: $75,000 (franchise fee + setup cost)
```

---

## 💰 Fund Flow Diagram

```
Investor Buys Shares
        ↓
  Solana Transaction ✅
        ↓
Add to Franchise Wallet ✅
        ↓
   [Accumulating funds...]
        ↓
  Reaches 100% Funding
        ↓
 Transfer to Brand Wallet:
   - Franchise Fee ($25K)
   - Setup Cost ($50K)
        ↓
Franchise Wallet keeps:
   - Working Capital ($25K)
        ↓
   Stage: "launching"
```

---

## 🎯 What You'll See Now

### **After Approval:**
- Franchise wallet appears immediately
- Balance: $0.00
- Status: Active
- Ready to receive funds

### **After Each Purchase:**
- Franchise wallet balance increases
- New transaction appears in history
- Funding progress bar updates

### **After 100% Funding:**
- Franchise wallet adjusted to working capital only
- Brand wallet shows 2 new transactions
- Stage changes to "launching"
- Setup timeline created (45 days)

---

## 🔍 How to Verify

### **1. Check Wallet Created on Approval**
```
Convex Dashboard → Data → franchiseWallets
Find: franchiseId = your franchise
Check: 
  - status = "active"
  - usdBalance = 0 (initially)
  - walletAddress = valid address
```

### **2. Check Balance Updates on Each Purchase**
```
Before purchase: usdBalance = $1,000
Buy $500 worth
After purchase: usdBalance = $1,500 ✅
```

### **3. Check Brand Wallet Gets Fees at 100%**
```
Convex Dashboard → Data → brandWalletTransactions
Find 2 transactions:
  1. type: "franchise_fee" (amount: $25,000)
  2. type: "setup_cost" (amount: $50,000)
Both status: "completed" ✅
```

---

## 🚀 Testing Instructions

### **For Existing Franchises in "launching" Without Wallet:**

Use the manual fix tool:
```
Convex Dashboard → Data → Run Mutation
Select: franchiseManagement.fixFranchiseWithoutWallet
Args: { "franchiseSlug": "nike-01" }
```

This will create the wallet with current investment balance.

### **For New Franchises (From Now On):**

1. **Create & Submit Franchise**
2. **Admin Approves** → Wallet created automatically ✅
3. **Users Buy Shares** → Balance grows ✅
4. **Reach 100%** → Fees transferred ✅

**No more wallet creation issues!**

---

## 📊 Database Schema Changes

### **franchiseWallets** (created at approval)
```typescript
{
  franchiseId: Id<"franchises">,
  walletAddress: string,
  walletName: string,
  balance: number,          // SOL balance
  usdBalance: number,       // USD balance (grows with each purchase)
  totalIncome: number,      // Tracks all incoming funds
  status: "active",
  createdAt: timestamp,
  // ... other fields
}
```

### **franchiseWalletTransactions** (one per purchase)
```typescript
{
  franchiseWalletId: Id<"franchiseWallets">,
  franchiseId: Id<"franchises">,
  transactionType: "funding",
  usdAmount: number,        // Purchase amount
  description: "Share purchase: X shares @ $Y = $Z",
  solanaTransactionHash: string,
  status: "confirmed",
  createdAt: timestamp,
}
```

### **brandWalletTransactions** (created at 100% funding)
```typescript
{
  franchiserId: Id<"franchiser">,
  franchiseId: Id<"franchises">,
  type: "franchise_fee" | "setup_cost",
  amount: number,
  status: "completed",
  createdAt: timestamp,
}
```

---

## ✅ Benefits of New Flow

1. **Simple**: Wallet exists from approval, no complex timing
2. **Transparent**: Users see balance grow in real-time
3. **Reliable**: No dependency on 100% funding trigger for wallet creation
4. **Auditable**: Every share purchase = 1 transaction record
5. **Flexible**: Can handle partial refunds, early closing, etc.

---

## 🐛 Debugging

### **If wallet balance not updating:**
Check Convex logs for:
```
✅ Added $X to franchise wallet. New balance: $Y
```

If you see:
```
⚠️ No franchise wallet found for nike-01. Funds not added to wallet.
```
→ Wallet wasn't created at approval. Use manual fix tool.

### **If brand wallet not showing fees:**
Check Convex logs for:
```
🎯 Funding complete for nike-01! Distributing funds...
✅ Franchise fee transferred to brand: $X
✅ Setup cost transferred to brand: $Y
```

If missing → Funding didn't reach 100% or distribution failed.

---

## 📝 Summary

**Key Changes:**
1. ✅ Wallet created at approval (not at 100% funding)
2. ✅ Balance updates on every purchase (not all at once)
3. ✅ Fees transferred to brand at 100% (deducted from franchise wallet)

**Files Modified:**
- `convex/franchiseApproval.ts` - Added wallet creation
- `convex/franchiseManagement.ts` - Added balance updates + simplified 100% logic

**Testing:**
- Approve a franchise → Check wallet exists
- Buy shares → Check balance increases
- Reach 100% → Check brand wallet receives fees

**No more wasted dev SOL!** 🎉
