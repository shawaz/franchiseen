# 🚀 QUICK FIX: Wallet Creation Not Working

## **Immediate Solution** (Manual Fix)

### **Step 1: Go to Admin Fix Page**
Navigate to: `http://localhost:3000/admin/operations/fix-wallets`

### **Step 2: You'll See:**
- ⚠️ **Yellow Alert Box** showing franchises without wallets
- 📋 **List of all franchises** with their status

### **Step 3: Click "Fix Now"**
- Find your franchise in the yellow alert box (e.g., "nike-01")
- Click the yellow **"Fix Now"** button
- Wait for success message

### **Step 4: Verify**
- Franchise should now show **green "Has Wallet" badge**
- Brand wallet should show the transferred funds
- Franchise wallet should show working capital

---

## **Alternative: Use Convex Dashboard**

If the admin page doesn't work, use Convex directly:

### **Step 1: Open Convex Dashboard**
Go to: https://dashboard.convex.dev

### **Step 2: Select Your Project**

### **Step 3: Run Mutation**
1. Click **"Data"** tab
2. Click **"Run Mutation"** button
3. Select: `franchiseManagement.fixFranchiseWithoutWallet`
4. Enter:
```json
{
  "franchiseSlug": "nike-01"
}
```
5. Click **"Run"**

### **Step 4: Check Result**
You should see:
```json
{
  "success": true,
  "message": "Wallet created successfully! Franchise wallet: $25,000, Brand wallet received: $75,000",
  "franchiseWallet": "...",
  "franchiseFeeTransferred": 25000,
  "setupCostTransferred": 50000,
  "workingCapitalTransferred": 25000,
  "totalTransferred": 100000
}
```

### **Step 5: Verify in Data Tab**
Click **"franchiseWallets"** table and find your franchise's wallet

---

## **Why Isn't Auto-Creation Working?**

Let's debug together:

### **Check Convex Logs**
1. Go to Convex Dashboard
2. Click **"Logs"** tab
3. Filter by: `franchiseManagement`
4. Look for these logs when you buy the final tokens:
   - `🎯 Funding complete...`
   - `🚀 transitionToLaunchingStage called...`
   - `❌ Error...` (if there's an error)

### **Common Issues:**

#### **Issue 1: No Logs Appearing**
**Meaning**: The funding completion code isn't being reached

**Check**:
```javascript
// In browser console
const debugInfo = await convex.query(
  api.franchiseManagement.debugFranchiseStatus,
  { franchiseSlug: "nike-01" }
);
console.log(debugInfo);
```

Look for: `shouldTransition: true` - if false, funding isn't at 100%

#### **Issue 2: Error Logs in Convex**
**Look for**: `❌ Error transitioning to launching stage`

**Action**: 
- Copy the full error message
- Check what step failed
- Use manual fix mutation

#### **Issue 3: Stage Changes But No Wallet**
**Meaning**: The transaction succeeded but wallet creation failed

**Action**: Use the manual fix tool immediately

---

## **Test With New Franchise**

To test if auto-creation works with a fresh franchise:

### **Step 1: Create Test Franchise**
```javascript
// In Convex Dashboard → Run Mutation
api.franchiseManagement.createTestFranchise({
  franchiserId: "YOUR_FRANCHISER_ID"
})
```

### **Step 2: Approve It**
```javascript
api.franchiseApproval.approveFranchiseAndCreateToken({
  franchiseId: "THE_NEW_FRANCHISE_ID",
  approvedBy: "admin"
})
```

### **Step 3: Buy Shares to 100%**
```javascript
// Buy enough to reach 100%
api.franchiseManagement.purchaseSharesBySlug({
  franchiseSlug: "test-franchise-...",
  investorId: "YOUR_WALLET_ADDRESS",
  sharesPurchased: 1000, // Buy all shares
  sharePrice: 1.0,
  totalAmount: 100000
})
```

### **Step 4: Watch Logs**
In Convex Dashboard → Logs, you should see the entire wallet creation flow with emoji indicators

---

## **Expected Fund Distribution**

For a $100,000 franchise:

```
Total Investment: $100,000
│
├─ Franchise Fee: $25,000 
│  └─> Goes to Brand Wallet ✅
│
├─ Setup Cost: $50,000
│  └─> Goes to Brand Wallet ✅
│
└─ Working Capital: $25,000
   └─> Goes to Franchise Wallet ✅
```

**Brand Wallet Balance**: $75,000 (Fee + Setup)  
**Franchise Wallet Balance**: $25,000 (Working Capital)

---

## **Verification Commands**

### Check if wallet exists:
```javascript
const wallet = await convex.query(
  api.franchiseManagement.getFranchiseWallet,
  { franchiseId: "YOUR_FRANCHISE_ID" }
);
console.log("Wallet:", wallet);
```

### Check brand transactions:
```javascript
const transactions = await convex.query(
  api.brandWallet.getBrandWalletTransactions,
  { franchiserId: "YOUR_FRANCHISER_ID" }
);
console.log("Brand Transactions:", transactions);
```

### Check brand wallet balance:
```javascript
const balance = await convex.query(
  api.brandWallet.getBrandWalletBalance,
  { franchiserId: "YOUR_FRANCHISER_ID" }
);
console.log("Brand Balance:", balance);
```

---

## **Quick Summary**

**Problem**: Funding reaches 100% but no wallet created

**Solution Options**:
1. ✅ **Use Admin Fix Page**: `/admin/operations/fix-wallets`
2. ✅ **Use Convex Dashboard**: Run `fixFranchiseWithoutWallet` mutation
3. ✅ **Check Logs**: Find the error in Convex Dashboard → Logs

**After Fix**:
- Franchise wallet: Shows working capital
- Brand wallet: Shows franchise fee + setup cost
- Stage: "launching"

---

## **Next Steps for You:**

1. **Navigate to**: `http://localhost:3000/admin/operations/fix-wallets`
2. **Click "Fix Now"** on any franchise showing in the yellow alert
3. **Check the result** - should show success message with amounts
4. **Verify** in franchise page - wallet should now display

**If this doesn't work, check Convex Dashboard → Logs for error messages and share them with me!** 📋
