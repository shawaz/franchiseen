# Dual Environment Deployment Strategy

## 🎯 Overview

Your franchise platform will run on **two completely separate environments**:

| Environment | Purpose | Convex | Solana Network | Users |
|-------------|---------|--------|----------------|-------|
| **Development** | Testing & demos | Convex Dev Database | Solana Devnet | Test users |
| **Production** | Live platform | Convex Prod Database | Solana Mainnet | Real users |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     DEVELOPMENT ENVIRONMENT                  │
├─────────────────────────────────────────────────────────────┤
│  Vercel (dev.franchiseen.com)                              │
│    ↓                                                         │
│  Convex Dev Database                                        │
│    ↓                                                         │
│  Solana Devnet (Test SOL)                                  │
│    ↓                                                         │
│  Test Wallets & Transactions                                │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    PRODUCTION ENVIRONMENT                    │
├─────────────────────────────────────────────────────────────┤
│  Vercel (franchiseen.com)                                   │
│    ↓                                                         │
│  Convex Production Database                                 │
│    ↓                                                         │
│  Solana Mainnet (Real SOL)                                 │
│    ↓                                                         │
│  Real Wallets & Transactions                                │
└─────────────────────────────────────────────────────────────┘
```

---

## 📋 Phase 1: Setup Convex Environments

### Step 1.1: Create Production Convex Environment

```bash
# Navigate to your project
cd /Users/shawaz/Developer/franchiseen

# Create production environment
npx convex env add production

# Deploy to production
npx convex deploy --prod
```

This creates a completely separate Convex deployment with its own:
- Database (empty, clean slate)
- API endpoints
- Authentication system
- Environment variables

### Step 1.2: Get Production Convex URL

```bash
# Get your production URL
npx convex env get NEXT_PUBLIC_CONVEX_URL --prod
```

You'll get something like: `https://magnificent-shark-123.convex.cloud`

Save this URL - you'll need it for Vercel configuration.

### Step 1.3: Configure Production Environment Variables

```bash
# Set authentication secret (generate a strong one)
npx convex env set AUTH_SECRET "$(openssl rand -hex 32)" --prod

# Set Resend API key for emails (if using)
npx convex env set RESEND_API_KEY "your-production-resend-key" --prod

# Set any other backend secrets
npx convex env set OPENAI_API_KEY "your-openai-key" --prod
```

### Step 1.4: Keep Dev Environment Active

Your current dev environment continues to work as-is:

```bash
# Deploy to dev (default)
npx convex dev

# Or explicitly
npx convex deploy --dev
```

---

## 📋 Phase 2: Setup Vercel Deployments

You'll create **two separate Vercel projects**:

### Option A: Two Separate Vercel Projects (Recommended)

#### Project 1: Production (franchiseen.com)

```bash
# In your project directory
vercel --prod

# Follow prompts:
# - Project name: franchiseen
# - Domain: franchiseen.com
```

**Set Production Environment Variables:**

Go to Vercel Dashboard → `franchiseen` → Settings → Environment Variables

```bash
# Convex
NEXT_PUBLIC_CONVEX_URL=https://magnificent-shark-123.convex.cloud

# Solana Mainnet
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
NEXT_PUBLIC_SOLANA_NETWORK=mainnet-beta
NEXT_PUBLIC_USE_REAL_WALLETS=true

# Environment
NEXT_PUBLIC_APP_ENV=production

# Other APIs
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_maps_key
NEXT_PUBLIC_UPLOADCARE_PUBLIC_KEY=your_uploadcare_key
```

#### Project 2: Development (dev.franchiseen.com)

```bash
# Create a new branch for dev
git checkout -b devnet

# Deploy to a separate Vercel project
vercel --prod

# Follow prompts:
# - Project name: franchiseen-devnet
# - Domain: dev.franchiseen.com
```

**Set Development Environment Variables:**

Go to Vercel Dashboard → `franchiseen-devnet` → Settings → Environment Variables

```bash
# Convex Dev
NEXT_PUBLIC_CONVEX_URL=https://your-dev-deployment.convex.cloud

# Solana Devnet
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_USE_REAL_WALLETS=true

# Environment
NEXT_PUBLIC_APP_ENV=development

# Other APIs (can use test keys)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_test_maps_key
NEXT_PUBLIC_UPLOADCARE_PUBLIC_KEY=your_test_uploadcare_key
```

### Option B: Single Vercel Project with Preview Branches

If you prefer a single project:

1. **Main branch** → Production (mainnet)
2. **devnet branch** → Preview URL (devnet)

Set environment variables differently for Production vs Preview in Vercel settings.

---

## 📋 Phase 3: Domain Configuration

### Production Domain (franchiseen.com)

**In Vercel:**
1. Go to `franchiseen` project → Settings → Domains
2. Add `franchiseen.com`
3. Add `www.franchiseen.com`
4. Follow DNS configuration instructions

**In your DNS provider:**
```
Type    Name    Value
A       @       76.76.21.21 (Vercel IP)
CNAME   www     cname.vercel-dns.com
```

### Development Domain (dev.franchiseen.com)

**In Vercel:**
1. Go to `franchiseen-devnet` project → Settings → Domains
2. Add `dev.franchiseen.com`

**In your DNS provider:**
```
Type    Name    Value
CNAME   dev     cname.vercel-dns.com
```

---

## 📋 Phase 4: Database Migration Strategy

### 4.1 Seed Production Database

Your production database starts empty. You need to populate it with:

**Essential Data:**
- Admin accounts
- Master data (categories, etc.)
- Brand information
- Products (if any pre-loaded)

**Create a seed script:**

```typescript
// convex/seedProduction.ts
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const seedProductionDatabase = mutation({
  args: {},
  handler: async (ctx) => {
    // 1. Create admin account
    await ctx.db.insert("users", {
      email: "admin@franchiseen.com",
      name: "System Admin",
      role: "admin",
      createdAt: Date.now(),
    });

    // 2. Seed master data
    const categories = ["Retail", "Food & Beverage", "Services", "Technology"];
    for (const category of categories) {
      await ctx.db.insert("categories", {
        name: category,
        active: true,
      });
    }

    // 3. Seed initial brands (if applicable)
    // ...

    console.log("✅ Production database seeded");
  },
});
```

**Run the seed:**

```bash
# Deploy the seed function
npx convex deploy --prod

# Run it (you can trigger from dashboard or create a script)
npx convex run seedProduction:seedProductionDatabase --prod
```

### 4.2 Data Migration (If Moving from Dev to Prod)

If you have existing franchises/data in dev that you want in production:

**Option 1: Export/Import (Manual)**

```typescript
// convex/exportData.ts (run on dev)
export const exportAllData = query({
  handler: async (ctx) => {
    const franchises = await ctx.db.query("franchises").collect();
    const brands = await ctx.db.query("brands").collect();
    // ... export other tables
    
    return {
      franchises,
      brands,
      // ...
    };
  },
});

// convex/importData.ts (run on prod)
export const importData = mutation({
  args: {
    data: v.object({
      franchises: v.array(v.any()),
      brands: v.array(v.any()),
    }),
  },
  handler: async (ctx, args) => {
    // Import with new IDs
    for (const franchise of args.data.franchises) {
      await ctx.db.insert("franchises", franchise);
    }
    // ...
  },
});
```

**Option 2: Start Fresh (Recommended)**

Production should start with:
- No test data
- No test transactions
- Only essential configuration
- Real brands/franchises added through the UI

---

## 📋 Phase 5: Wallet Management

### 5.1 Separate Wallet Encryption Keys

**Critical:** Use different encryption keys for each environment!

**Development (.env.local):**
```bash
WALLET_ENCRYPTION_KEY="dev_key_only_for_testing_12345"
```

**Production (Vercel Environment Variables):**
```bash
WALLET_ENCRYPTION_KEY="$(openssl rand -hex 64)"
```

Set this in:
- Convex: `npx convex env set WALLET_ENCRYPTION_KEY "..." --prod`
- Vercel: Production environment variables

### 5.2 Wallet Funding Strategy

**Development (Devnet):**
```bash
# Free test SOL from faucet
solana airdrop 5 <WALLET_ADDRESS> --url devnet

# Or use your funding script
node scripts/fundWallets.js devnet
```

**Production (Mainnet):**
```bash
# You need to fund with real SOL
# DO NOT use airdrops (mainnet has no faucet)

# Transfer from your main wallet
solana transfer <FRANCHISE_WALLET> 10 \
  --from ~/.config/solana/id.json \
  --url mainnet-beta

# Or use a centralized exchange withdrawal
```

---

## 📋 Phase 6: Security Hardening

### 6.1 Update Wallet Encryption (CRITICAL)

**Before production launch**, replace the placeholder encryption:

```typescript
// convex/walletKeypairs.ts - CURRENT (INSECURE)
export function encryptSecretKey(secretKey: Uint8Array): string {
  return Buffer.from(secretKey).toString('base64');
}

// PRODUCTION (SECURE)
import CryptoJS from 'crypto-js';

export function encryptSecretKey(secretKey: Uint8Array): string {
  const encryptionKey = process.env.WALLET_ENCRYPTION_KEY;
  if (!encryptionKey) {
    throw new Error("WALLET_ENCRYPTION_KEY not set");
  }
  
  const secretKeyHex = Buffer.from(secretKey).toString('hex');
  const encrypted = CryptoJS.AES.encrypt(secretKeyHex, encryptionKey);
  return encrypted.toString();
}

export function decryptSecretKey(encryptedKey: string): Uint8Array {
  const encryptionKey = process.env.WALLET_ENCRYPTION_KEY;
  if (!encryptionKey) {
    throw new Error("WALLET_ENCRYPTION_KEY not set");
  }
  
  const decrypted = CryptoJS.AES.decrypt(encryptedKey, encryptionKey);
  const secretKeyHex = decrypted.toString(CryptoJS.enc.Utf8);
  return new Uint8Array(Buffer.from(secretKeyHex, 'hex'));
}
```

**Install dependency:**
```bash
npm install crypto-js
npm install --save-dev @types/crypto-js
```

### 6.2 Rate Limiting

Add rate limiting for sensitive operations:

```typescript
// convex/franchiseManagement.ts
import { rateLimitMutation } from "./rateLimit";

export const purchaseSharesBySlug = rateLimitMutation({
  // Limit to 5 purchases per minute per user
  rateLimit: { kind: "per-user", limit: 5, period: 60 },
  args: { /* ... */ },
  handler: async (ctx, args) => {
    // ...
  },
});
```

### 6.3 Transaction Validation

Verify on-chain transactions before recording:

```typescript
// convex/solanaTransactions.ts
export const verifyTransactionOnChain = action({
  args: {
    signature: v.string(),
    expectedAmount: v.number(),
    expectedRecipient: v.string(),
  },
  handler: async (ctx, args) => {
    const connection = new Connection(SOLANA_RPC_URL);
    const tx = await connection.getTransaction(args.signature);
    
    if (!tx || !tx.meta?.postBalances) {
      throw new Error("Transaction not found");
    }
    
    // Verify amount and recipient
    // ...
    
    return { verified: true };
  },
});
```

---

## 📋 Phase 7: Monitoring & Logging

### 7.1 Convex Dashboard Monitoring

**Development:**
- Convex Dashboard: https://dashboard.convex.dev/d/your-dev-deployment
- Monitor: Function calls, errors, database queries

**Production:**
- Convex Dashboard: https://dashboard.convex.dev/d/your-prod-deployment
- Monitor: All activity, set up alerts

### 7.2 Vercel Analytics

Enable for both environments:
1. Go to Vercel Dashboard → Project → Analytics
2. Enable Web Analytics
3. Enable Speed Insights
4. Monitor performance and errors

### 7.3 Solana Transaction Monitoring

**Create a monitoring dashboard:**

```typescript
// convex/monitoring.ts
export const getRecentTransactions = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit || 100;
    
    const transactions = await ctx.db
      .query("franchiseWalletTransactions")
      .order("desc")
      .take(limit);
    
    const failed = transactions.filter(t => t.status === "failed");
    const pending = transactions.filter(t => t.status === "pending");
    
    return {
      total: transactions.length,
      failed: failed.length,
      pending: pending.length,
      transactions,
    };
  },
});
```

---

## 📋 Phase 8: Deployment Workflow

### 8.1 Git Branch Strategy

```bash
main          → Production (mainnet)
  ↓
devnet        → Development (devnet)
  ↓
feature/*     → Local development
```

### 8.2 Making Changes

**For features affecting both environments:**

```bash
# 1. Create feature branch
git checkout -b feature/new-dashboard

# 2. Make changes and test locally
npm run dev
npx convex dev

# 3. Merge to devnet first
git checkout devnet
git merge feature/new-dashboard
git push origin devnet

# 4. Test on dev.franchiseen.com
# ... verify everything works ...

# 5. Merge to main for production
git checkout main
git merge devnet
git push origin main

# 6. Verify on franchiseen.com
```

### 8.3 Hotfix Workflow

**For urgent production fixes:**

```bash
# 1. Create hotfix from main
git checkout main
git checkout -b hotfix/urgent-fix

# 2. Fix and test
# ...

# 3. Merge to main immediately
git checkout main
git merge hotfix/urgent-fix
git push origin main

# 4. Backport to devnet
git checkout devnet
git merge main
git push origin devnet
```

---

## 📋 Phase 9: Testing Strategy

### 9.1 Development Environment Testing

**What to test on dev.franchiseen.com:**
- ✅ All new features
- ✅ Wallet creation and funding
- ✅ Token purchases (with test SOL)
- ✅ Transaction flows
- ✅ UI/UX changes
- ✅ Integration with Solana devnet
- ✅ Performance testing

### 9.2 Production Checklist

**Before deploying to production:**

- [ ] All features tested on devnet
- [ ] Security audit completed
- [ ] Wallet encryption implemented
- [ ] Rate limiting enabled
- [ ] Transaction validation in place
- [ ] Error handling robust
- [ ] Monitoring configured
- [ ] Backup strategy defined
- [ ] Rollback plan documented
- [ ] Team trained on production access

### 9.3 Smoke Tests After Production Deploy

```bash
# Manual checklist
- [ ] Homepage loads
- [ ] User can sign up/login
- [ ] Can view franchises
- [ ] Can view brands
- [ ] Wallet displays correctly
- [ ] Can navigate all pages
- [ ] No console errors
- [ ] Convex functions responding
```

---

## 📋 Phase 10: Launch Preparation

### 10.1 Pre-Launch Checklist

**Convex Production:**
- [ ] Production environment created
- [ ] All functions deployed
- [ ] Environment variables set
- [ ] Database seeded with initial data
- [ ] Backups configured

**Vercel Production:**
- [ ] Domain configured (franchiseen.com)
- [ ] SSL certificate active
- [ ] Environment variables set
- [ ] Build successful
- [ ] Analytics enabled

**Solana Mainnet:**
- [ ] RPC endpoint configured
- [ ] Wallet encryption upgraded
- [ ] Initial wallets funded
- [ ] Explorer links working
- [ ] Transaction monitoring active

**Security:**
- [ ] Encryption keys rotated
- [ ] Secrets not exposed
- [ ] Rate limiting active
- [ ] CORS configured correctly
- [ ] Security headers set

### 10.2 Go-Live Steps

**Day -7:**
- Complete all testing on devnet
- Perform security audit
- Document all processes

**Day -3:**
- Deploy to production
- Seed production database
- Configure monitoring
- Test with real mainnet transactions (small amounts)

**Day -1:**
- Final smoke tests
- Backup verification
- Team briefing
- Support channels ready

**Launch Day:**
- Monitor closely for first 24 hours
- Be ready to rollback if needed
- Track all transactions
- Respond to issues immediately

---

## 📋 Phase 11: Cost Management

### Devnet (Free)
- Solana devnet: FREE
- Convex dev: FREE (generous limits)
- Vercel preview: FREE (included in plan)

### Mainnet (Paid)
- Solana mainnet transactions: ~$0.00025 per transaction
- Convex production: Starts free, scales with usage
- Vercel production: Included in Pro plan ($20/month)
- RPC provider (optional): Consider Helius/QuickNode for reliability

**Estimated Monthly Costs (100 franchises, 10k transactions):**
- Solana fees: ~$2.50
- Convex: ~$25-50
- Vercel: $20
- RPC: $0-50 (if using paid provider)
- **Total: ~$50-125/month**

---

## 📋 Phase 12: Disaster Recovery

### 12.1 Backup Strategy

**Convex:**
```bash
# Regular exports (automate this)
npx convex export --prod > backup-$(date +%Y%m%d).json
```

**Wallets:**
- Store encryption keys in multiple secure locations
- Use hardware security modules for high-value wallets
- Implement multi-sig for brand wallets

### 12.2 Rollback Plan

**If production has critical issues:**

```bash
# 1. Revert Vercel deployment
vercel rollback

# 2. Revert Convex deployment
npx convex deploy --prod --from-snapshot <previous-snapshot>

# 3. Announce downtime
# 4. Fix issue on devnet
# 5. Test thoroughly
# 6. Redeploy to production
```

---

## 🎯 Quick Reference

### Development URLs
- Frontend: https://dev.franchiseen.com
- Convex: https://dashboard.convex.dev/d/your-dev-deployment
- Solana: https://explorer.solana.com/?cluster=devnet

### Production URLs
- Frontend: https://franchiseen.com
- Convex: https://dashboard.convex.dev/d/your-prod-deployment
- Solana: https://explorer.solana.com/

### Essential Commands

```bash
# Deploy to dev
npx convex dev
vercel --prod (on devnet branch)

# Deploy to production
npx convex deploy --prod
vercel --prod (on main branch)

# Check Convex logs
npx convex logs --prod --tail

# Check Vercel logs
vercel logs franchiseen --prod

# Fund wallet (devnet)
solana airdrop 2 <ADDRESS> --url devnet

# Check balance (mainnet)
solana balance <ADDRESS> --url mainnet-beta
```

---

## 📞 Support Contacts

**Convex:**
- Dashboard: https://dashboard.convex.dev
- Discord: https://convex.dev/community

**Vercel:**
- Dashboard: https://vercel.com/dashboard
- Support: support@vercel.com

**Solana:**
- Explorer: https://explorer.solana.com
- Discord: https://solana.com/community

---

## ✅ Next Steps

1. [ ] Create Convex production environment
2. [ ] Set up Vercel projects (both environments)
3. [ ] Configure domains
4. [ ] Upgrade wallet encryption
5. [ ] Seed production database
6. [ ] Test thoroughly on devnet
7. [ ] Soft launch on production
8. [ ] Monitor and iterate

---

**Ready to deploy?** Follow this guide step by step, and you'll have a robust dual-environment setup! 🚀

