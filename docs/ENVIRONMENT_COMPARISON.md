# Environment Comparison Guide

Quick reference for understanding the differences between Development (Devnet) and Production (Mainnet) environments.

---

## 🔄 Side-by-Side Comparison

| Aspect | Development (Devnet) | Production (Mainnet) |
|--------|---------------------|---------------------|
| **Frontend URL** | dev.franchiseen.com | franchiseen.com |
| **Convex Database** | Dev deployment | Production deployment |
| **Solana Network** | Devnet | Mainnet-beta |
| **SOL Currency** | Test SOL (FREE) | Real SOL ($$) |
| **Transaction Fees** | FREE | ~$0.00025/tx |
| **Explorer URL** | explorer.solana.com/?cluster=devnet | explorer.solana.com/ |
| **RPC Endpoint** | api.devnet.solana.com | api.mainnet-beta.solana.com |
| **Purpose** | Testing & demos | Live platform |
| **Users** | Test users | Real customers |
| **Data** | Test/seed data | Real business data |
| **Monitoring** | Optional | CRITICAL |
| **Backups** | Optional | Required |
| **Security** | Relaxed | Strict |
| **Wallet Encryption** | Can be simple | Must be AES-256+ |
| **Git Branch** | devnet | main |
| **Vercel Project** | franchiseen-devnet | franchiseen |

---

## 📊 Environment Variables Comparison

### Frontend Variables

| Variable | Devnet Value | Mainnet Value |
|----------|--------------|---------------|
| `NEXT_PUBLIC_APP_ENV` | `development` | `production` |
| `NEXT_PUBLIC_CONVEX_URL` | Dev deployment URL | Prod deployment URL |
| `NEXT_PUBLIC_SOLANA_NETWORK` | `devnet` | `mainnet-beta` |
| `NEXT_PUBLIC_SOLANA_RPC_URL` | `https://api.devnet.solana.com` | `https://api.mainnet-beta.solana.com` |
| `NEXT_PUBLIC_USE_REAL_WALLETS` | `true` | `true` |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Test key (optional) | Production key |
| `NEXT_PUBLIC_UPLOADCARE_PUBLIC_KEY` | Test key (optional) | Production key |

### Backend Variables (Convex)

| Variable | Devnet | Mainnet | Security Level |
|----------|--------|---------|----------------|
| `WALLET_ENCRYPTION_KEY` | Any test key | Strong 64-char hex | 🔴 CRITICAL |
| `AUTH_SECRET` | Any test key | Strong 32-char hex | 🔴 CRITICAL |
| `RESEND_API_KEY` | Test key | Production key | 🟡 Important |
| `OPENAI_API_KEY` | Shared key | Production key | 🟡 Important |

**Command to set:**
```bash
# Development
npx convex env set VARIABLE_NAME "value"

# Production
npx convex env set VARIABLE_NAME "value" --prod
```

---

## 💰 Cost Comparison

### Development (Devnet)

| Service | Cost |
|---------|------|
| Solana Transactions | **FREE** ⭐ |
| Test SOL | **FREE** (from faucet) |
| Convex Dev | **FREE** ⭐ |
| Vercel Preview | **FREE** (included) |
| **Total/month** | **$0** 💚 |

### Production (Mainnet)

| Service | Monthly Estimate | Notes |
|---------|------------------|-------|
| Solana Transactions | ~$2.50 | Based on 10,000 tx/month |
| Convex Pro | ~$25-50 | Usage-based |
| Vercel Pro | $20 | Fixed |
| RPC Provider (optional) | $0-50 | If using paid service |
| **Total/month** | **~$50-125** | Scales with usage |

---

## 🔐 Security Comparison

### Development (Devnet)

✅ **Acceptable:**
- Simple encryption (base64)
- Test API keys
- Relaxed rate limits
- Public error messages
- No transaction validation
- Minimal monitoring

⚠️ **Reason:** No real money at risk

### Production (Mainnet)

🔴 **Required:**
- AES-256 encryption
- Production API keys
- Strict rate limits
- Generic error messages
- Transaction validation
- 24/7 monitoring
- Regular backups
- Incident response plan

⚠️ **Reason:** Real money and user data at risk

---

## 🔄 Transaction Lifecycle Comparison

### Devnet Transaction Flow

```
User Action
  ↓
Database Update (Convex Dev)
  ↓
Scheduled Solana Transfer (Devnet)
  ↓
Transaction Executes (FREE)
  ↓
Visible in Explorer (devnet)
  ↓
No real value transferred
```

**Testing Example:**
- User buys $1000 worth of tokens
- PDA receives test SOL
- Funds distributed to wallets
- All visible in explorer
- **Cost: $0**
- **Risk: None**

### Mainnet Transaction Flow

```
User Action
  ↓
Validation & Fraud Check
  ↓
Database Update (Convex Prod)
  ↓
On-Chain Transaction Verification
  ↓
Scheduled Solana Transfer (Mainnet)
  ↓
Transaction Executes (Real SOL)
  ↓
Confirmation Monitoring
  ↓
Visible in Explorer (mainnet)
  ↓
Real value transferred
```

**Production Example:**
- User buys $1000 worth of tokens
- PDA receives real SOL (~6.67 SOL @ $150)
- Funds distributed to wallets
- All visible in explorer
- **Cost: ~$0.00075 in tx fees**
- **Risk: High - real money**

---

## 🗄️ Database Comparison

### Devnet Database (Convex Dev)

**Contents:**
- Test franchises
- Test users (test@example.com)
- Dummy transactions
- Seed data
- Test wallets

**Characteristics:**
- Can be reset anytime
- Populated with seed scripts
- Used for development
- No backup required

**Example Data:**
```json
{
  "franchise": "nike-test-01",
  "owner": "test-user@example.com",
  "fundingTarget": 50000,
  "status": "approved"
}
```

### Mainnet Database (Convex Prod)

**Contents:**
- Real franchises
- Real users (john@company.com)
- Real transactions
- Production data
- Production wallets

**Characteristics:**
- Must never be reset
- Carefully managed
- Business critical
- Regular backups required

**Example Data:**
```json
{
  "franchise": "starbucks-nyc-01",
  "owner": "john.smith@starbucks.com",
  "fundingTarget": 500000,
  "status": "launching"
}
```

---

## 🔍 Testing Strategy by Environment

### What to Test on Devnet ✅

- [ ] All new features
- [ ] UI/UX changes
- [ ] Database migrations
- [ ] Wallet creation
- [ ] Token purchases
- [ ] Transaction flows
- [ ] POS billing
- [ ] Expense management
- [ ] Payout calculations
- [ ] Error handling
- [ ] Performance testing
- [ ] Load testing
- [ ] Integration testing
- [ ] E2E testing

**Goal:** Catch ALL bugs before production

### What to Test on Mainnet ⚠️

- [ ] Smoke test (basic functionality)
- [ ] Critical path (signup → login → view)
- [ ] Small real transaction (to verify)
- [ ] Monitoring systems
- [ ] Backup systems
- [ ] Rollback procedures

**Goal:** Verify production infrastructure works

---

## 🚀 Deployment Process Comparison

### Deploying to Devnet

```bash
# 1. Make changes
git checkout devnet
# ... make changes ...

# 2. Test locally
npm run dev
npm run convex:dev

# 3. Deploy
git push origin devnet
# Vercel auto-deploys

# 4. Verify
# Check dev.franchiseen.com
# Test all features

# Time: ~5 minutes
# Risk: Low
# Can rollback: Yes
```

### Deploying to Mainnet

```bash
# 1. Ensure devnet testing complete
# All features tested and working

# 2. Prepare production
git checkout main
git merge devnet

# 3. Pre-deployment checks
npm run build      # Verify build
npm run lint       # Check for issues
npm run ci         # Run all checks

# 4. Deploy
git push origin main
npx convex deploy --prod

# 5. Monitor closely
# Watch Convex logs
# Watch Vercel logs
# Monitor Solana transactions
# Check error rates

# 6. Smoke test
# Verify critical paths work

# Time: ~30 minutes (including monitoring)
# Risk: High
# Can rollback: Yes (but with care)
```

---

## 📊 Monitoring Dashboard Access

### Devnet Monitoring

**Convex Dashboard:**
```
https://dashboard.convex.dev/d/your-dev-deployment
```

**What to Monitor:**
- Function calls (for debugging)
- Errors (fix before prod)
- Performance (optimize)

**Frequency:** When developing

---

**Solana Explorer:**
```
https://explorer.solana.com/?cluster=devnet
```

**What to Monitor:**
- Test transactions
- Wallet balances
- Transaction signatures

**Frequency:** When testing transactions

---

**Vercel Dashboard:**
```
https://vercel.com/your-account/franchiseen-devnet
```

**What to Monitor:**
- Build status
- Deployment logs
- Preview URLs

**Frequency:** After each deployment

### Mainnet Monitoring

**Convex Dashboard:**
```
https://dashboard.convex.dev/d/your-prod-deployment
```

**What to Monitor:**
- Function call volume
- Error rates (should be <1%)
- Response times
- Failed transactions

**Frequency:** Daily minimum, 24/7 alerts recommended

---

**Solana Explorer:**
```
https://explorer.solana.com/
```

**What to Monitor:**
- All real transactions
- Wallet balances
- Failed transactions
- Unusual activity

**Frequency:** Multiple times daily

---

**Vercel Dashboard:**
```
https://vercel.com/your-account/franchiseen
```

**What to Monitor:**
- Uptime (should be 99.9%+)
- Build status
- Analytics
- Performance metrics

**Frequency:** Daily + alerts

---

## 🔄 Wallet Management Comparison

### Devnet Wallets

**Funding:**
```bash
# Free SOL from faucet
solana airdrop 5 <WALLET_ADDRESS> --url devnet

# Or
npm run wallet:fund:devnet
```

**Monitoring:**
```bash
# Check balance
solana balance <WALLET_ADDRESS> --url devnet

# View in explorer
open "https://explorer.solana.com/address/<WALLET>?cluster=devnet"
```

**Characteristics:**
- Unlimited free SOL
- Can reset anytime
- No real value
- Use for testing

### Mainnet Wallets

**Funding:**
```bash
# Must purchase real SOL
# Transfer from exchange or another wallet
solana transfer <FRANCHISE_WALLET> 10 \
  --from ~/.config/solana/id.json \
  --url mainnet-beta

# Cost: ~$1500 for 10 SOL (@ $150/SOL)
```

**Monitoring:**
```bash
# Check balance
solana balance <WALLET_ADDRESS> --url mainnet-beta

# View in explorer
open "https://explorer.solana.com/address/<WALLET>"

# Set up low balance alerts
# Monitor for unusual activity
```

**Characteristics:**
- Real SOL costs real money
- Must be carefully managed
- Real value at risk
- Requires backup strategy
- Needs security audit

---

## 🎯 When to Use Each Environment

### Use Devnet When:

✅ Developing new features  
✅ Testing changes  
✅ Experimenting with ideas  
✅ Training new team members  
✅ Demonstrating to stakeholders  
✅ Running QA tests  
✅ Debugging issues  
✅ Performance testing  
✅ Load testing  
✅ Trying different configurations  

**Rule:** Always test on devnet first!

### Use Mainnet When:

✅ Launching to real users  
✅ Processing real transactions  
✅ Handling real money  
✅ Production operations  

**Rule:** Only after thorough devnet testing!

---

## 📞 Support & Help

### Development Issues

**Convex:**
- Dev Dashboard: https://dashboard.convex.dev
- Discord: https://convex.dev/community
- Response: Best effort

**Solana:**
- Devnet Explorer: https://explorer.solana.com/?cluster=devnet
- Discord: https://solana.com/community
- Response: Community support

### Production Issues (URGENT)

**Convex:**
- Prod Dashboard: https://dashboard.convex.dev
- Support Email: support@convex.dev
- Discord: https://convex.dev/community
- Response: Priority support

**Solana:**
- Mainnet Explorer: https://explorer.solana.com/
- Discord: https://solana.com/community
- Status: https://status.solana.com/
- Response: Monitor status page

**Vercel:**
- Dashboard: https://vercel.com/dashboard
- Support: support@vercel.com
- Status: https://www.vercel-status.com/
- Response: Based on plan level

---

## ✅ Quick Checklist

### Before Switching to Mainnet

- [ ] All features tested on devnet
- [ ] Security audit completed
- [ ] Monitoring set up
- [ ] Backups configured
- [ ] Team trained
- [ ] Documentation updated
- [ ] Rollback plan ready
- [ ] Support channels ready
- [ ] Budget allocated
- [ ] Legal/compliance reviewed

---

## 🎓 Learning Resources

**Start Here:**
1. `QUICK_START.md` - Get up and running
2. `DUAL_ENVIRONMENT_DEPLOYMENT.md` - Full deployment guide
3. This file - Understand differences

**When Deploying:**
4. `DEPLOYMENT_CHECKLIST.md` - Step-by-step checklist
5. `WALLET_FUNDING_GUIDE.md` - Fund wallets correctly
6. `SOLANA_TRANSACTIONS_GUIDE.md` - Understand transactions

**For Operations:**
7. Convex Dashboard - Monitor backend
8. Solana Explorer - Monitor blockchain
9. Vercel Dashboard - Monitor frontend

---

**Remember:** Devnet is for testing. Mainnet is for production. Always test thoroughly on devnet before deploying to mainnet! 🚀

