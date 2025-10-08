# 💰 Franchise Payout System Guide

## **Overview**

The payout system manages revenue distribution for operational franchises, ensuring sustainable operations through a smart reserve-based distribution model.

---

## **🎯 Distribution Strategy**

### **Reserve-Based Tiers**

The system automatically adjusts distribution based on the franchise wallet's reserve balance:

| Reserve Level | To Token Holders | To Reserve | Purpose |
|--------------|------------------|------------|---------|
| **< 25%** (Critical) | 25% | 75% | Emergency recovery mode |
| **< 50%** (Low) | 50% | 50% | Rebuilding reserves |
| **< 75%** (Building) | 75% | 25% | Approaching target |
| **≥ 75%** (Full) | 100% | 0% | Optimal operations |

### **Reserve Calculation**

```javascript
Reserve % = (Current Wallet Balance / Working Capital Target) × 100
```

**Example:**
- Working Capital Target: $25,000
- Current Balance: $15,000
- Reserve %: 60% → Distribution: 75% holders / 25% reserve

---

## **💸 Payout Flow**

### **Step 1: Revenue Collection**
Daily or monthly revenue is entered (currently manual for testing)

### **Step 2: Fee Deductions**
```
Gross Revenue: $10,000
├─ Royalty (5%): $500 → Brand Wallet ✅
├─ Platform Fee (2%): $200 → Company Account ✅
└─ Net Revenue: $9,300 → For Distribution
```

### **Step 3: Distribution Calculation**

Based on reserve % (example: 60% reserve):
```
Net Revenue: $9,300
├─ To Token Holders (75%): $6,975
│   └─ Distributed proportionally by share ownership
└─ To Reserve (25%): $2,325
    └─ Added to franchise wallet
```

### **Step 4: Shareholder Distribution**

Each token holder receives proportional to their ownership:

**Example with 3 investors:**
- Total Shares: 100,000
- Distribution Pool: $6,975

| Investor | Shares | % Ownership | Payout |
|----------|--------|-------------|--------|
| Alice | 50,000 | 50% | $3,487.50 |
| Bob | 30,000 | 30% | $2,092.50 |
| Charlie | 20,000 | 20% | $1,395.00 |

---

## **📊 Database Structure**

### **franchisePayouts Table**
Stores each payout transaction:
```typescript
{
  franchiseId: Id<"franchises">,
  franchiserId: Id<"franchiser">,
  period: "2024-10-08", // Date
  payoutType: "daily" | "monthly",
  grossRevenue: 10000,
  royaltyAmount: 500,
  platformFeeAmount: 200,
  netRevenue: 9300,
  toTokenHolders: 6975,
  toReserve: 2325,
  reserveBalanceBefore: 15000,
  reserveBalanceAfter: 17325,
  reservePercentage: 60,
  distributionRule: "Building Reserve (< 75%)",
  totalShares: 100000,
  shareholderCount: 3,
  status: "completed"
}
```

### **shareholderPayouts Table**
Individual shareholder payouts:
```typescript
{
  payoutId: Id<"franchisePayouts">,
  franchiseId: Id<"franchises">,
  investorId: "wallet_address",
  shares: 50000,
  totalShares: 100000,
  sharePercentage: 50,
  payoutAmount: 3487.50,
  period: "2024-10-08",
  status: "completed"
}
```

---

## **🖥️ UI Components**

### **Finance Tab - Payout Section**

Located in: `FranchiseStore.tsx` → Finance Tab

**Features:**
1. **Reserve Status Cards**
   - Current Reserve Balance
   - Total Paid to Token Holders
   - Total Brand Royalty

2. **Distribution Rules Display**
   - Visual representation of all tiers
   - Current tier highlighted
   - Deduction percentages shown

3. **Manual Payout Button** (Testing)
   - Input revenue amount
   - Process payout instantly
   - See distribution breakdown

4. **Payout History**
   - Last 5 payouts
   - Revenue, distribution, reserve info

---

## **🔧 Testing the System**

### **Prerequisites:**
1. Franchise must be in `"ongoing"` stage
2. Franchise must have token holders
3. User must be logged in

### **Steps to Test:**

1. **Navigate to Franchise**
   ```
   Go to: /[brand]/[franchise-slug]
   Example: /nike/nike-01
   ```

2. **Switch to Finance Tab**
   ```
   Click "Finances" in the tab menu
   ```

3. **Scroll to Payout Section**
   ```
   Only visible if stage === "ongoing"
   ```

4. **Enter Revenue**
   ```
   Input: 5000 (represents $5,000 daily revenue)
   ```

5. **Click "Process Payout"**
   ```
   System calculates:
   - Deducts royalty and platform fee
   - Determines distribution split
   - Creates payout records
   - Updates reserve balance
   ```

6. **View Results**
   ```
   Toast notification shows:
   - Amount to token holders
   - Amount to reserve
   - Distribution rule applied
   ```

### **Test Scenarios:**

#### **Scenario 1: Critical Reserve (< 25%)**
```
Starting Balance: $5,000 (20% of $25,000)
Revenue: $10,000
Royalty (5%): -$500
Platform (2%): -$200
Net: $9,300

Distribution:
- To Holders (25%): $2,325
- To Reserve (75%): $6,975

New Balance: $11,975 (47.9%)
```

#### **Scenario 2: Building Reserve (60%)**
```
Starting Balance: $15,000 (60% of $25,000)
Revenue: $10,000
Net: $9,300

Distribution:
- To Holders (75%): $6,975
- To Reserve (25%): $2,325

New Balance: $17,325 (69.3%)
```

#### **Scenario 3: Full Reserve (80%)**
```
Starting Balance: $20,000 (80% of $25,000)
Revenue: $10,000
Net: $9,300

Distribution:
- To Holders (100%): $9,300
- To Reserve (0%): $0

New Balance: $20,000 (still 80%)
```

---

## **🚀 Production Deployment**

### **Automatic Payouts**

For production, convert to automatic:

```typescript
// Option 1: Daily Cron (recommended)
// Run at end of business day (e.g., 11:59 PM)
// Trigger: Convex cron job or external scheduler

// Option 2: Monthly Cron
// Run on 1st of each month
// Trigger: Convex scheduled function

// Option 3: Real-time (advanced)
// Process after each sale
// Requires POS integration
```

### **Implementation:**

1. **Create Scheduled Function** (`convex/crons.ts`):
```typescript
import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.daily(
  "process-daily-payouts",
  {
    hourUTC: 23, // 11 PM UTC
    minuteUTC: 59,
  },
  internal.payoutManagement.processAllDailyPayouts
);

export default crons;
```

2. **Create Batch Processor**:
```typescript
// convex/payoutManagement.ts
export const processAllDailyPayouts = internalMutation({
  handler: async (ctx) => {
    // Get all ongoing franchises
    const franchises = await ctx.db
      .query("franchises")
      .filter(q => q.eq(q.field("stage"), "ongoing"))
      .collect();
    
    for (const franchise of franchises) {
      // Get today's revenue (from POS or revenue table)
      const revenue = await getDailyRevenue(franchise._id);
      
      if (revenue > 0) {
        await ctx.runMutation(
          internal.payoutManagement.processFranchisePayout,
          {
            franchiseId: franchise._id,
            revenue,
            period: new Date().toISOString().split('T')[0],
            payoutType: "daily"
          }
        );
      }
    }
  }
});
```

---

## **📈 Analytics & Reporting**

### **Brand Owner Dashboard**

See in `/admin/finance/franchise`:
- Total revenue across all franchises
- Total royalties received
- Franchise performance comparison

### **Token Holder Dashboard**

See in `/account`:
- Total earnings across all investments
- Per-franchise breakdown
- Historical payout chart

### **Franchise Performance**

See in Finance Tab:
- Reserve fund health
- Payout consistency
- Growth trends

---

## **🛡️ Security & Validation**

### **Safeguards:**

1. **Minimum Revenue**: $0.01 (prevents spam)
2. **Stage Check**: Only `"ongoing"` franchises
3. **Shareholder Validation**: Must have confirmed shares
4. **Duplicate Prevention**: One payout per period
5. **Balance Verification**: Reserve can't go negative

### **Audit Trail:**

Every payout creates:
- ✅ Main payout record
- ✅ Individual shareholder records
- ✅ Brand wallet transaction
- ✅ Company income record
- ✅ Updated franchise wallet balance

---

## **💡 Key Benefits**

### **For Franchise Sustainability:**
- ✅ Automatic reserve rebuilding
- ✅ Protection during slow periods
- ✅ Prevents operational bankruptcy

### **For Token Holders:**
- ✅ Fair proportional distribution
- ✅ Transparent calculation
- ✅ Regular income stream

### **For Brand Owners:**
- ✅ Consistent royalty payments
- ✅ Franchise health monitoring
- ✅ Performance insights

### **For Platform:**
- ✅ Revenue generation (2% fee)
- ✅ Transaction tracking
- ✅ Ecosystem growth

---

## **📝 Summary**

The payout system provides:

1. **Smart Distribution**: Adapts to franchise financial health
2. **Fair Sharing**: Proportional to share ownership
3. **Sustainable Operations**: Reserve fund protection
4. **Transparent Tracking**: Complete audit trail
5. **Easy Testing**: Manual button for validation
6. **Production Ready**: Easy conversion to automatic

**Current Status:** Manual testing mode  
**Next Step:** Deploy to production with automatic scheduling  
**Estimated Timeline:** 2-4 weeks for real-world validation

---

## **🔗 Related Files**

- `convex/payoutManagement.ts` - Backend logic
- `convex/schema.ts` - Database tables
- `src/components/app/franchise/store/FranchiseStore.tsx` - UI (Finance tab)
- `PAYOUT_SYSTEM_GUIDE.md` - This guide

---

**Questions?** Check the inline comments in the code or test with the manual button! 🚀
