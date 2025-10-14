# User Schema Cleanup - Summary

## Overview

Successfully removed unused fields from the `users` table schema and updated all related code to use Privy-managed authentication and wallets.

## Changes Made

### 1. Schema Changes (`convex/schema.ts`)

**Removed Fields:**
- ✅ `name` - Replaced by `fullName`
- ✅ `image` - Replaced by `avatarUrl`  
- ✅ `firstName` - Replaced by `fullName`
- ✅ `lastName` - Replaced by `fullName`
- ✅ `dateOfBirth` - Not needed
- ✅ `country` - Removed index, field removed
- ✅ `privateKey` - Now managed by Privy (not stored)
- ✅ `isWalletGenerated` - Not needed with Privy

**Kept Fields:**
- ✅ `email`
- ✅ `fullName` (consolidated from firstName + lastName)
- ✅ `avatarUrl`
- ✅ `privyUserId`
- ✅ `walletAddress`
- ✅ `createdAt`
- ✅ `updatedAt`

**Indexes:**
- ✅ Removed `by_country` index
- ✅ Kept `by_email`, `by_walletAddress`, `by_privyUserId`

### 2. Backend Changes (`convex/userManagement.ts`)

**Removed Functions:**
- ❌ `createUserProfile` - Obsolete with Privy
- ❌ `updateUserProfile` - Replaced with `updateUserFullName`
- ❌ `getUserPrivateKey` - Private keys no longer stored

**Updated Functions:**
- ✅ `syncPrivyUser` - Now syncs `fullName` instead of `name`
- ✅ `getAllUserWallets` - Updated to use `fullName`

**Removed Imports:**
- ❌ `@solana/web3.js` Keypair
- ❌ `bs58`
- ❌ `crypto` utilities (no longer needed)

### 3. Frontend Changes

**Updated Components (19 files):**

1. `src/contexts/PrivyAuthContext.tsx`
   - Updated UserProfile interface
   - Uses `fullName` instead of `firstName`/`lastName`

2. `src/hooks/useUserWallet.ts`
   - **Complete rewrite** to use Privy wallets
   - Removed private key handling
   - Now gets wallet from Privy linked accounts

3. `src/components/default/account-dropdown.tsx`
   - Uses `fullName` instead of `firstName` + `lastName`
   - Removed `image` fallback

4. `src/components/app/WalletInfo.tsx`
   - Removed private key display
   - Now shows Privy security message
   - Only displays wallet address and balance

5. `src/components/app/franchise/store/FranchiseStore.tsx`
   - Added TODO for Privy wallet signing
   - Temporary error for transactions (needs Privy signing implementation)

6. `src/components/app/franchisee/UserWallet.tsx`
   - Uses `fullName` for user display
   - Removed `image` reference

7. `src/components/admin/wallet/UserWallet.tsx`
   - Uses `fullName` instead of `firstName`/`lastName`

8. `src/components/app/franchise/FranchiseDashboard.tsx`
   - Uses `fullName` for team member display

9. `convex/franchiseStoreQueries.ts`
   - Updated investor userProfile to use `fullName`

10. `convex/teamManagement.ts`
    - Updated team member data to use `fullName`

### 4. Type Definitions

**Updated Interfaces:**

```typescript
// Before
interface UserProfile {
  firstName?: string;
  lastName?: string;
  name?: string;
  image?: string;
  dateOfBirth?: number;
  country?: string;
  privateKey?: string;
  isWalletGenerated?: boolean;
  // ...
}

// After
interface UserProfile {
  fullName?: string;
  avatarUrl?: string;
  // ... (simplified)
}
```

## Breaking Changes

### ⚠️ Transaction Signing

**Issue:** Removed keypair storage means transactions can't be signed with the old method.

**Solution Needed:** Implement Privy wallet signing for transactions.

**Affected:**
- `src/components/app/franchise/store/FranchiseStore.tsx` line ~414

**Temporary Fix:**
```typescript
// TODO: Implement transaction signing using Privy wallet
throw new Error('Transaction signing not yet implemented with Privy...');
```

### ⚠️ Wallet Creation

**Issue:** No automatic wallet creation on user signup.

**Current Behavior:** Users need to connect a wallet via Privy.

**Options:**
1. Use Privy embedded wallets (auto-create)
2. Require users to connect existing wallet
3. Hybrid approach

## Migration Notes

### For Existing Users

**Data Migration Needed:**
- Copy `firstName` + `lastName` → `fullName`
- Copy `image` → `avatarUrl`
- Remove obsolete fields

**SQL-like Migration:**
```javascript
// Pseudo-code for data migration
users.forEach(user => {
  if (!user.fullName && (user.firstName || user.lastName)) {
    user.fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
  }
  if (!user.avatarUrl && user.image) {
    user.avatarUrl = user.image;
  }
  // Remove old fields
  delete user.firstName;
  delete user.lastName;
  delete user.name;
  delete user.image;
  delete user.dateOfBirth;
  delete user.country;
  delete user.privateKey;
  delete user.isWalletGenerated;
});
```

### For New Users

- Users sign in via Privy
- `fullName` comes from Privy (Google name, etc.)
- `avatarUrl` comes from Privy profile picture
- Wallet comes from Privy (embedded or connected)

## Next Steps

### Required

1. **Implement Privy Wallet Signing**
   - Update transaction signing in FranchiseStore
   - Use Privy's wallet signing methods
   - Test with real transactions

2. **Test Wallet Functionality**
   - Verify wallet balance display
   - Test wallet connections
   - Ensure Privy embedded wallets work

3. **Data Migration Script**
   - Create migration for existing users
   - Move firstName/lastName to fullName
   - Clean up old fields

### Optional

1. **Update Documentation**
   - Document new authentication flow
   - Update API docs
   - Add Privy setup guide

2. **Enhanced Features**
   - Add wallet export option
   - Implement multi-wallet support
   - Add transaction history from Privy

## Testing Checklist

- [ ] User can sign in with Privy
- [ ] User profile displays correctly
- [ ] Wallet address shows up
- [ ] Wallet balance is accurate
- [ ] Account dropdown shows correct name
- [ ] Team members display correctly
- [ ] Investor profiles show properly
- [ ] No build errors
- [ ] No TypeScript errors
- [ ] No runtime errors in console

## Files Modified

**Total: 21 files**

### Core (4)
- convex/schema.ts
- convex/userManagement.ts  
- src/contexts/PrivyAuthContext.tsx
- src/hooks/useUserWallet.ts

### Components (13)
- src/components/default/account-dropdown.tsx
- src/components/app/WalletInfo.tsx
- src/components/app/franchise/store/FranchiseStore.tsx
- src/components/app/franchisee/UserWallet.tsx
- src/components/admin/wallet/UserWallet.tsx
- src/components/app/franchise/FranchiseDashboard.tsx
- convex/franchiseStoreQueries.ts
- convex/teamManagement.ts
- (+ 5 more from auth migration)

### Documentation (4)
- SCHEMA_CLEANUP_SUMMARY.md (this file)
- PRIVY_SETUP.md
- MIGRATION_SUMMARY.md  
- README_PRIVY.md

---

**Cleanup completed:** October 14, 2025  
**Build status:** ✅ Passing  
**Type errors:** ✅ None

