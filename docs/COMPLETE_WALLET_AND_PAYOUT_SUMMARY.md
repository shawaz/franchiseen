# ✅ Complete Wallet & Payout System - FINAL SUMMARY

## **🎯 Two Major Systems Implemented**

---

## **SYSTEM 1: Wallet Creation & Funding** 

### **What Was Fixed:**

**Problem**: Wallet not created, funds not transferred after 100% funding

**Solution**: Create wallet at approval, accumulate funds during funding

### **New Flow:**

```
Step 1: Franchise Approved
  ├─ Token created ✅
  ├─ Wallet created with $0 ✅
  └─ Status: "approved", Stage: "funding" ✅

Step 2: Users Buy Shares
  ├─ Funds added to franchise wallet ✅
  ├─ Balance grows: $0 → $1,000 → $10,000 → ... ✅
  └─ Transactions recorded ✅

Step 3: Reach 100% Funding
  ├─ Transfer franchise fee to brand wallet ✅
  ├─ Transfer setup cost to brand wallet ✅
  ├─ Keep working capital in franchise wallet ✅
  └─ Stage: "launching" ✅
```

### **Example ($100,000 total):**

```
After Approval:
  Franchise Wallet: $0

After Funding:
  Franchise Wallet: $100,000

After 100% Complete:
  Franchise Wallet: $25,000 (working capital)
  Brand Wallet: +$75,000 (fee $25K + setup $50K)
```

### **Files Modified:**
- `convex/franchiseApproval.ts` - Wallet creation on approval
- `convex/franchiseManagement.ts` - Balance updates + fund distribution

---

## **SYSTEM 2: Revenue Payout Distribution**

### **What Was Built:**

Smart payout system with reserve-based distribution for operational franchises

### **Distribution Logic:**

| Reserve Level | To Holders | To Reserve | Use Case |
|--------------|------------|------------|----------|
| < 25% | 25% | 75% | Critical - rebuild fund |
| < 50% | 50% | 50% | Low - recovery mode |
| < 75% | 75% | 25% | Building - approach target |
| ≥ 75% | 100% | 0% | Full - normal operations |

### **Payout Flow:**

```
Gross Revenue: $10,000
├─ Operating Expenses: -$3,000
└─ Net Revenue: $7,000
    ├─ Royalty (5%): -$350 → Brand Wallet ✅
    ├─ Platform Fee (2%): -$140 → Company ✅
    └─ Distributable: $6,510
        ├─ Distribution based on reserve %
        ├─ Example (60% reserve):
        │   ├─ To Token Holders (75%): $4,882.50
        │   └─ To Reserve Fund (25%): $1,627.50
        └─ Each holder gets proportional share ✅
```

### **UI Features:**

Located in: `FranchiseDashboard.tsx` → Payouts Tab

1. **Summary Cards:**
   - Total Earned (all-time revenue)
   - Reserve Fund (current vs target)
   - Royalty Paid (to brand)
   - Token Holders Paid (total distributions)

2. **Distribution Rules Display:**
   - Visual color-coded tiers
   - Current tier highlighted
   - Clear percentage breakdown

3. **Process Payout Form:**
   - Enter revenue & expenses
   - **Live preview shows:**
     - Net revenue
     - Royalty deduction
     - Platform fee deduction
     - Distribution split
     - New reserve balance
   - One-click processing

4. **Payout History:**
   - Last payouts with full breakdown
   - Status tracking
   - Reserve progression

### **Files Created/Modified:**
- `convex/payoutManagement.ts` - New file with payout logic
- `convex/schema.ts` - Added payout tables
- `src/components/app/franchise/FranchiseDashboard.tsx` - Complete payout UI

---

## **📊 Complete Database Schema**

### **franchiseWallets**
```typescript
{
  franchiseId: Id<"franchises">,
  walletAddress: string,
  balance: number,          // SOL
  usdBalance: number,       // USD (grows with funding, used for operations)
  status: "active",
  // Created at approval with $0
  // Grows as users buy shares
  // Adjusted at 100% funding (fees transferred out)
  // Used for operational expenses and payouts
}
```

### **franchisePayouts**
```typescript
{
  franchiseId: Id<"franchises">,
  period: "2024-10-08",
  payoutType: "daily" | "monthly",
  grossRevenue: number,     // Input revenue
  royaltyAmount: number,    // 5% to brand
  platformFeeAmount: number, // 2% to platform
  netRevenue: number,       // After fees
  toTokenHolders: number,   // Distributed amount
  toReserve: number,        // Added to wallet
  distributionRule: string, // Which tier applied
  status: "completed"
}
```

### **shareholderPayouts**
```typescript
{
  payoutId: Id<"franchisePayouts">,
  investorId: string,
  shares: number,
  sharePercentage: number,
  payoutAmount: number,     // Individual payout
  status: "completed"
}
```

### **brandWalletTransactions**
```typescript
{
  franchiserId: Id<"franchiser">,
  franchiseId: Id<"franchises">,
  type: "franchise_fee" | "setup_cost" | "royalty",
  amount: number,
  status: "completed"
}
```

---

## **🧪 HOW TO TEST**

### **Test 1: Wallet Creation (FIXED)**

1. **Create a franchise**
2. **Admin approves it**
   - ✅ Wallet created immediately with $0
   - ✅ Check in Convex Dashboard → franchiseWallets

3. **Buy shares**
   - ✅ Balance increases with each purchase
   - ✅ Transactions logged in franchiseWalletTransactions

4. **Reach 100%**
   - ✅ Franchise fee transferred to brand
   - ✅ Setup cost transferred to brand
   - ✅ Working capital stays in franchise wallet
   - ✅ Stage changes to "launching"

### **Test 2: Payout System (NEW)**

**Prerequisites:**
- Franchise must be in "ongoing" stage
- Must have token holders

**Steps:**

1. **Navigate to franchise account page**
   ```
   /nike/nike-01/account
   ```

2. **Click "Payouts" tab**

3. **Enter data:**
   - Revenue: $10,000
   - Expenses: $3,000

4. **See live preview:**
   - Net: $7,000
   - Royalty: -$350
   - Platform: -$140
   - After fees: $6,510
   - Distribution split (based on reserve %)
   - New balances

5. **Click "Process Payout"**

6. **Verify in Convex Dashboard:**
   - `franchisePayouts` - New payout record
   - `shareholderPayouts` - Individual distributions
   - `brandWalletTransactions` - Royalty payment
   - `companyIncome` - Platform fee
   - `franchiseWallets` - Updated balance

---

## **🔍 Verification Checklist**

### **After Franchise Approval:**
- [ ] franchiseWallets table has new entry
- [ ] usdBalance = 0
- [ ] status = "active"
- [ ] franchiseTokens table has token

### **After Each Share Purchase:**
- [ ] franchiseWallets.usdBalance increases
- [ ] franchiseWalletTransactions has new entry
- [ ] franchiseShares has purchase record
- [ ] Solana transaction confirmed

### **After 100% Funding:**
- [ ] franchise.stage = "launching"
- [ ] franchiseWallets.usdBalance = working capital only
- [ ] brandWalletTransactions has 2 entries (fee + setup)
- [ ] franchiseSetup created

### **After Processing Payout:**
- [ ] franchisePayouts created
- [ ] shareholderPayouts created for each holder
- [ ] brandWalletTransactions has royalty entry
- [ ] companyIncome has platform fee entry
- [ ] franchiseWallets.usdBalance updated with reserve addition

---

## **💰 Money Flow Summary**

### **During Funding Stage:**
```
Investor → Solana Transaction → Franchise Wallet
$100 → Confirmed on blockchain → Wallet balance: +$100
```

### **At 100% Funding:**
```
Franchise Wallet: $100,000
├─ Transfer to Brand: $75,000
│   ├─ Franchise Fee: $25,000
│   └─ Setup Cost: $50,000
└─ Keep in Franchise: $25,000 (working capital)
```

### **During Operations (Payouts):**
```
Daily Revenue: $10,000
├─ Expenses: -$3,000
└─ Net: $7,000
    ├─ Royalty (5%): -$350 → Brand Wallet
    ├─ Platform (2%): -$140 → Company
    └─ Distributable: $6,510
        ├─ Based on reserve % (e.g., 60%):
        │   ├─ To Token Holders (75%): $4,882.50
        │   │   ├─ Investor A (50%): $2,441.25
        │   │   ├─ Investor B (30%): $1,464.75
        │   │   └─ Investor C (20%): $976.50
        │   └─ To Reserve (25%): $1,627.50
        └─ New Reserve: $26,627.50 (was $25,000)
```

---

## **🚀 What to Do Next**

### **To Fix Existing Franchises:**

Run manual fix in Convex Dashboard:

```json
Mutation: franchiseManagement.fixFranchiseWithoutWallet
Args: { "franchiseSlug": "nike-01" }
```

This will:
- Create the wallet
- Set balance to current funding amount
- Transfer fees if 100% funded

### **To Test Payouts:**

1. **Manually set a franchise to "ongoing"** in Convex Dashboard:
   ```
   franchises table → Find your franchise → Edit stage to "ongoing"
   ```

2. **Navigate to `/[brand]/[franchise]/account`**

3. **Click "Payouts" tab**

4. **Process test payout:**
   - Revenue: 10000
   - Expenses: 3000
   - Click "Process Payout"

5. **Check results in Convex Dashboard**

---

## **📱 Where to Access**

### **Public View** (Funding Stage):
```
URL: /nike/nike-01
Tab: Franchise (default)
Shows: Funding progress, wallet balance growing
```

### **Franchise Owner Dashboard** (All Stages):
```
URL: /nike/nike-01/account
Tabs:
  - Overview: Summary
  - Budget: Expenses
  - Stock: Inventory
  - Team: Employees
  - Payouts: Revenue distribution ⭐
  - Transactions: All movements
```

---

## **🎨 UI Components**

### **Wallet Display (All Pages):**
- Current balance
- Funding progress
- Buy tokens button
- Stage indicator

### **Payout Interface (Dashboard):**
- Reserve status badge (color-coded)
- Summary cards (earned, reserve, royalty, holders)
- Distribution rules (visual guide)
- Input form (revenue + expenses)
- Live preview (real-time calculation)
- Payout history (last transactions)

---

## **🔐 Security & Business Logic**

### **Wallet Creation:**
- ✅ One wallet per franchise
- ✅ Created at approval (not at 100%)
- ✅ Prevents duplicates
- ✅ Secure address generation

### **Fund Transfers:**
- ✅ Immutable transaction records
- ✅ Complete audit trail
- ✅ Automatic on 100% funding
- ✅ Manual fix available if needed

### **Payout Distribution:**
- ✅ Only for "ongoing" franchises
- ✅ Proportional to shareholding
- ✅ Smart reserve management
- ✅ Automatic fee deductions
- ✅ Complete distribution records

---

## **📈 Key Metrics Tracked**

### **Franchise Level:**
- Total raised
- Current reserve
- Total payouts processed
- Royalties paid
- Platform fees collected

### **Token Holder Level:**
- Total invested
- Total earned
- Payout history
- Share percentage

### **Brand Level:**
- Fees collected (per franchise)
- Royalties received (per franchise)
- Total across all franchises

### **Platform Level:**
- Total fees from share purchases
- Total fees from payouts
- Revenue by franchise
- Growth metrics

---

## **🚦 Status Indicators**

### **Wallet Status:**
- 🟢 Active: Normal operations
- 🟡 Pending: Waiting for creation
- 🔴 Inactive: Closed franchise

### **Reserve Status:**
- 🟢 ≥ 75%: Full reserve (100% to holders)
- 🔵 50-75%: Building (75% to holders)
- 🟡 25-50%: Low (50% to holders)
- 🔴 < 25%: Critical (25% to holders)

### **Payout Status:**
- ✅ Completed: Funds distributed
- ⏳ Processing: In progress
- ❌ Failed: Error occurred

---

## **🎓 Business Logic Examples**

### **Example 1: Early Stage (Low Reserve)**

```
Franchise just launched:
- Working Capital: $25,000 (target)
- Current Reserve: $5,000 (20%)
- Status: Critical (< 25%)

Daily Revenue: $5,000
Expenses: $2,000
Net: $3,000

Deductions:
- Royalty (5%): -$150
- Platform (2%): -$60
After Fees: $2,790

Distribution (20% reserve = 25%/75% split):
- To Token Holders (25%): $697.50
- To Reserve Fund (75%): $2,092.50

New Reserve: $7,092.50 (28.4%)
Next payout will use 50%/50% split ✅
```

### **Example 2: Healthy Operations (Full Reserve)**

```
Established franchise:
- Working Capital: $25,000 (target)
- Current Reserve: $22,000 (88%)
- Status: Full (≥ 75%)

Daily Revenue: $8,000
Expenses: $3,500
Net: $4,500

Deductions:
- Royalty (5%): -$225
- Platform (2%): -$90
After Fees: $4,185

Distribution (88% reserve = 100%/0% split):
- To Token Holders (100%): $4,185
- To Reserve Fund (0%): $0

Reserve stays at: $22,000 (88%)
Maximum returns to investors! 🎉
```

### **Example 3: Shareholder Distribution**

```
3 Investors with different shares:

Total Shares: 100,000
Distribution Pool: $4,185

Investor A: 50,000 shares (50%)
  → Payout: $2,092.50

Investor B: 30,000 shares (30%)
  → Payout: $1,255.50

Investor C: 20,000 shares (20%)
  → Payout: $837.00

All payouts recorded in shareholderPayouts table ✅
```

---

## **📁 Complete File Structure**

### **Backend (Convex):**
```
convex/
├── franchiseApproval.ts      (Wallet creation on approval)
├── franchiseManagement.ts    (Fund accumulation & distribution)
├── payoutManagement.ts       (Revenue payout processing) ⭐
├── brandWallet.ts            (Brand transactions)
└── schema.ts                 (All table definitions)
```

### **Frontend (Components):**
```
src/components/app/franchise/
├── FranchiseWallet.tsx       (Wallet display)
├── FranchiseDashboard.tsx    (Owner dashboard with payouts) ⭐
└── store/FranchiseStore.tsx  (Public franchise page)
```

### **Admin Tools:**
```
src/app/(admin)/admin/operations/
└── fix-wallets/page.tsx      (Manual wallet creation tool)
```

---

## **🎯 Testing Guide**

### **Test Scenario 1: New Franchise End-to-End**

1. **Create franchise as franchiser**
2. **Admin approves** → Wallet created ✅
3. **Buy 50% of shares** → Balance at $50,000 ✅
4. **Buy remaining 50%** → Balance at $100,000 ✅
5. **Reaches 100%:**
   - Fees transferred to brand ✅
   - Working capital stays ✅
   - Stage → "launching" ✅

### **Test Scenario 2: Fix Existing Franchise**

1. **Go to Convex Dashboard**
2. **Run Mutation**: `fixFranchiseWithoutWallet`
3. **Args**: `{ "franchiseSlug": "your-franchise" }`
4. **Verify**: Wallet created, fees transferred ✅

### **Test Scenario 3: Process Payout**

1. **Set franchise stage to "ongoing"** (in Convex)
2. **Navigate to**: `/nike/nike-01/account`
3. **Click "Payouts" tab**
4. **Enter:**
   - Revenue: 10000
   - Expenses: 3000
5. **Review live preview**
6. **Click "Process Payout"**
7. **Verify:**
   - Toast shows breakdown ✅
   - History updates ✅
   - Reserve balance changes ✅
   - Convex tables updated ✅

---

## **💡 Key Insights**

### **Why Wallet at Approval?**
- ✅ Simpler logic
- ✅ Real-time balance visible
- ✅ No timing issues
- ✅ Transparent to users

### **Why Reserve-Based Distribution?**
- ✅ Protects franchise sustainability
- ✅ Automatic recovery mode
- ✅ Fair to all stakeholders
- ✅ Adapts to financial health

### **Why Separate Tables?**
- ✅ Complete audit trail
- ✅ Easy reporting
- ✅ Individual tracking
- ✅ Scalable architecture

---

## **🚀 Production Readiness**

### **Current State:**
- ✅ Manual payout button (testing)
- ✅ Complete transaction logging
- ✅ Full audit trail
- ✅ Error handling
- ✅ User feedback (toasts)

### **For Production:**
- [ ] Convert to automatic daily/monthly cron
- [ ] Integrate with POS for real-time revenue
- [ ] Add email notifications to token holders
- [ ] Generate PDF payout statements
- [ ] Add payout scheduling UI

---

## **📞 Support & Debugging**

### **If Wallet Not Created:**
1. Check Convex logs for errors
2. Use manual fix: `fixFranchiseWithoutWallet`
3. Verify franchise is approved

### **If Payout Fails:**
1. Check franchise stage = "ongoing"
2. Verify token holders exist
3. Check Convex logs for specific error
4. Ensure wallet has sufficient balance

### **If Balance Not Updating:**
1. Check share purchase logs
2. Verify wallet exists
3. Check franchiseWalletTransactions table
4. Look for errors in purchase flow

---

## **📝 Final Summary**

**What Works Now:**
1. ✅ Wallet created at approval
2. ✅ Funds accumulate during funding
3. ✅ Automatic fee distribution at 100%
4. ✅ Smart payout system with reserve management
5. ✅ Complete transaction tracking
6. ✅ User-friendly interfaces
7. ✅ Manual fix tools for recovery

**What's Next:**
1. Test with real franchises
2. Monitor for edge cases
3. Convert payouts to automatic
4. Add advanced reporting
5. Deploy to production

---

**The complete wallet and payout system is now fully operational! 🎉**

Access the payout system at: `/[brand]/[franchise]/account` → Payouts tab

For testing, manually set a franchise to "ongoing" stage in Convex Dashboard.
