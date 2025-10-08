# Solana Transactions & Token Creation Guide

## 1. Viewing Transactions in Solana Explorer

### Current Implementation (Enhanced ✨)

Your application now has **multiple ways** to view transactions on Solana Explorer:

#### A. Success Toast with Clickable Link
When a user buys tokens, they see a success toast with a direct link:

```tsx
// File: src/components/app/franchise/store/FranchiseStore.tsx (line 1694-1710)

toast.success(
  <div className="flex flex-col gap-2">
    <div>Successfully purchased {tokensToBuy} tokens for ${totalCost.toFixed(2)}!</div>
    <a 
      href={explorerUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-600 hover:text-blue-800 underline text-sm flex items-center gap-1"
    >
      View on Solana Explorer
      <ExternalLink className="h-3 w-3" />
    </a>
  </div>,
  { duration: 10000 }
);
```

#### B. Transactions Tab with Clickable Hashes
In the Transactions tab, each transaction hash is now **clickable** and **filtered by current franchise**:

```tsx
// File: src/components/app/franchise/store/FranchiseStore.tsx (line 566-576)

// Get transactions and FILTER by current franchise only
const getTransactions = () => {
  if (!userWalletAddress) return [];
  
  try {
    const transactionsData = localStorage.getItem(`transactions_${userWalletAddress}`);
    const allTransactions = transactionsData ? JSON.parse(transactionsData) : [];
    
    // ✅ Filter transactions to only show those for the current franchise
    return allTransactions.filter((tx: { franchiseSlug?: string }) => 
      tx.franchiseSlug === franchiseId
    );
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }
};
```

**What This Means:**
- ✅ NIKE01 page shows only NIKE01 transactions
- ✅ NIKE02 page shows only NIKE02 transactions  
- ✅ Each franchise has its own transaction history
- ✅ User's global transactions are stored centrally but filtered per franchise

#### C. Console Logs for Debugging
Transaction details are also logged to console:

```typescript
console.log(`Transaction signature: ${signature}`);
console.log(`View on Solscan: https://explorer.solana.com/tx/${signature}?cluster=devnet`);
```

### Utility Functions Available

You have helper functions in `src/lib/franchiseWalletUtils.ts`:

```typescript
// Get transaction explorer URL
export function getSolanaExplorerTransactionUrl(
  transactionHash: string,
  cluster: 'mainnet-beta' | 'devnet' | 'testnet' = 'mainnet-beta'
): string {
  const baseUrl = cluster === 'mainnet-beta'
    ? 'https://explorer.solana.com'
    : `https://explorer.solana.com/?cluster=${cluster}`;
  
  return `${baseUrl}/tx/${transactionHash}`;
}

// Get wallet/address explorer URL
export function getSolanaExplorerUrl(
  walletAddress: string, 
  cluster: 'mainnet-beta' | 'devnet' | 'testnet' = 'mainnet-beta'
): string {
  const baseUrl = cluster === 'mainnet-beta' 
    ? 'https://explorer.solana.com'
    : `https://explorer.solana.com/?cluster=${cluster}`;
  
  return `${baseUrl}/address/${walletAddress}`;
}
```

### Current Network Configuration

Your app is currently using **Solana Devnet**:

```typescript
const SOLANA_RPC_URL = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com';
```

**Explorer URLs:**
- Devnet: `https://explorer.solana.com/tx/{signature}?cluster=devnet`
- Mainnet: `https://explorer.solana.com/tx/{signature}`

---

## 2. Do Users Need a Wallet to Create a Token?

### Short Answer: **NO** ❌

Users **do NOT need a wallet** to create a franchise token. Here's how it works:

### Token Creation Flow

#### Stage 1: Franchise Approval (No User Wallet Required)
```typescript
// File: convex/franchiseApproval.ts (line 59-145)

export const approveFranchiseAndCreateToken = mutation({
  args: {
    franchiseId: v.id("franchises"),
    approvedBy: v.string(), // Admin who approves
  },
  handler: async (ctx, { franchiseId, approvedBy }) => {
    // ... approval logic ...
    
    // Token is created by the BACKEND/ADMIN, not by the user
    await ctx.db.insert("franchiseTokens", {
      franchiseId: franchiseId,
      tokenMint: tokenMint,
      tokenName: tokenName,
      tokenSymbol: tokenSymbol,
      tokenDecimals: 6,
      totalSupply: investment.sharesIssued,
      circulatingSupply: 0,
      sharePrice: 1.00,
      status: "created",
      createdAt: now,
      updatedAt: now,
    });
    
    return {
      success: true,
      message: "Franchise approved and token created successfully. Wallet will be created when funding is complete.",
      tokenCreated: true,
      walletCreated: false,
    };
  },
});
```

**Key Points:**
- ✅ Token is created **automatically** by the backend when admin approves the franchise
- ✅ No user interaction required for token creation
- ✅ Token creation happens in the `approveFranchiseAndCreateToken` mutation
- ✅ Token symbol is auto-generated (e.g., `NIKE09`, `MCD15`)

#### Stage 2: Token Purchase (User Wallet Required)
```typescript
// File: src/components/app/franchise/store/FranchiseStore.tsx (line 318-416)

const handleSolanaPayment = async (amountInSOL: number, destinationAddress: string) => {
  if (!isWalletLoaded || !userWallet.publicKey) {
    throw new Error('User wallet not found. Please complete your profile setup first.');
  }

  // Check if user has sufficient balance
  if (userWallet.balance < amountInSOL) {
    throw new Error(`Insufficient balance...`);
  }

  // Create real Solana transaction
  // ... transaction creation ...
};
```

**Key Points:**
- ✅ Users **DO need a wallet** to **BUY/PURCHASE** tokens
- ✅ Wallet is used to pay for the token purchase
- ✅ Balance is deducted from user's wallet
- ✅ Transaction is recorded on Solana blockchain

---

## Complete Workflow

### 1. Brand Registration (No Wallet Needed)
- Franchiser registers a brand
- No wallet required at this stage

### 2. Franchise Creation (No Wallet Needed)
- Franchiser creates franchise locations
- Status: `pending`
- Stage: N/A (not set yet)

### 3. **Admin Approval** → Token Creation (No User Wallet)
```
Admin clicks "Approve" → Backend automatically:
  ✅ Updates franchise status to "approved"
  ✅ Sets stage to "funding"
  ✅ Creates franchise token (SPL token record)
  ✅ NO wallet created yet
```

### 4. **Token Purchase** → Requires User Wallet
```
User clicks "Buy Tokens" → System checks:
  ✅ User must have a wallet (created during profile setup)
  ✅ User must have sufficient SOL balance
  ✅ Transaction is sent to Solana blockchain
  ✅ User can view transaction on Solana Explorer
  ✅ Shares are recorded in database
```

### 5. Funding Complete → Franchise Wallet Created
```
When 100% funded → Backend:
  ✅ Creates franchise wallet
  ✅ Changes stage to "launching"
  ✅ Transfers funds from escrow to franchise wallet
```

---

## Wallet Requirements Summary

| Action | User Wallet Required? | Who Creates? |
|--------|----------------------|--------------|
| Register Brand | ❌ No | N/A |
| Create Franchise | ❌ No | N/A |
| **Create Token** | ❌ **No** | **Backend/Admin (automatic)** |
| Buy Tokens | ✅ **Yes** | User (during registration) |
| View Transactions | ✅ Yes | User |
| Sell Tokens | ✅ Yes | User |

---

## How to Test Transaction Explorer Links

### 1. Buy Tokens
1. Navigate to a franchise page (approved, in funding stage)
2. Click "Buy Tokens" button
3. Select number of tokens
4. Click "Buy Tokens" in the modal
5. **See success toast with "View on Solana Explorer" link** ✨

### 2. View in Transactions Tab
1. Click on "Transactions" tab in franchise page
2. Find your transaction
3. **Click on the transaction hash** (blue, underlined) ✨
4. Opens Solana Explorer in new tab

### 3. What You'll See in Solana Explorer
- Transaction signature
- Block height
- Timestamp
- From/To addresses
- Amount transferred
- Transaction fee
- Success/Failure status
- Full transaction details

---

## Network Configuration

### Current Setup: Devnet
```typescript
const SOLANA_RPC_URL = 'https://api.devnet.solana.com';
```

### Switching to Mainnet (Production)
Update `.env.local`:
```bash
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
```

Update cluster parameter in URLs:
```typescript
// Change from:
?cluster=devnet

// To:
// (no cluster parameter needed for mainnet)
```

---

## Transaction Storage

Transactions are stored in two places:

### 1. Local Storage (Client-Side)
```typescript
localStorage.setItem(`transactions_${userWallet.publicKey}`, JSON.stringify(transactions));
```

### 2. Convex Database (Server-Side)
```typescript
await purchaseShares({
  franchiseId: franchiseData._id,
  investorId: userWallet.publicKey,
  sharesPurchased,
  sharePrice,
  totalAmount,
  transactionHash
});
```

---

## Additional Features You Can Add

### 1. Copy Transaction Hash Button
```tsx
<button onClick={() => {
  navigator.clipboard.writeText(transaction.transactionHash);
  toast.success('Transaction hash copied!');
}}>
  <Copy className="h-4 w-4" />
</button>
```

### 2. Transaction Status Polling
```typescript
// Poll Solana network for transaction confirmation status
const checkTransactionStatus = async (signature: string) => {
  const connection = new Connection(SOLANA_RPC_URL);
  const status = await connection.getSignatureStatus(signature);
  return status.value?.confirmationStatus;
};
```

### 3. Transaction Details Modal
Show full transaction details in a modal with:
- Full signature
- Block explorer link
- From/To addresses
- Amount breakdown
- Timestamp
- Confirmation status

---

## Important Notes

### Devnet vs Mainnet
- **Devnet**: Test network, fake SOL, free transactions
- **Mainnet**: Production network, real SOL, real money

### Current Implementation
- ✅ Real blockchain transactions (Solana devnet)
- ✅ Real wallet balances deducted
- ✅ Transaction signatures are valid
- ✅ Can be viewed on Solana Explorer
- ⚠️ Using devnet (test network)

### When Moving to Production
1. Switch RPC URL to mainnet
2. Update all `?cluster=devnet` references
3. Use real SOL in wallets
4. Consider transaction fees (real cost)
5. Add proper error handling for mainnet

---

## Quick Reference

### View a Transaction
```typescript
const explorerUrl = `https://explorer.solana.com/tx/${transactionHash}?cluster=devnet`;
window.open(explorerUrl, '_blank');
```

### View a Wallet
```typescript
const explorerUrl = `https://explorer.solana.com/address/${walletAddress}?cluster=devnet`;
window.open(explorerUrl, '_blank');
```

### Import Utility Functions
```typescript
import { 
  getSolanaExplorerTransactionUrl, 
  getSolanaExplorerUrl 
} from '@/lib/franchiseWalletUtils';
```

---

## Summary

1. **Viewing Transactions**: ✅ Now enhanced with clickable links in both toast messages and transactions tab
2. **Token Creation**: ❌ No user wallet needed - tokens are created automatically by the backend when admin approves
3. **Token Purchase**: ✅ User wallet IS required to buy tokens
4. **Network**: Currently using Solana Devnet (test network)

All transaction signatures are real and can be viewed on Solana Explorer!
