# Deployment Checklist

Use this checklist to ensure smooth deployment to both environments.

---

## 📋 Initial Setup (One Time)

### Convex Setup
- [ ] Create production Convex environment: `npx convex env add production`
- [ ] Deploy to production: `npx convex deploy --prod`
- [ ] Get production URL: `npx convex env get NEXT_PUBLIC_CONVEX_URL --prod`
- [ ] Set production environment variables (see below)

### Convex Environment Variables (Production)
```bash
# Generate and set authentication secret
npx convex env set AUTH_SECRET "$(openssl rand -hex 32)" --prod

# Set wallet encryption key (CRITICAL FOR SECURITY)
npx convex env set WALLET_ENCRYPTION_KEY "$(openssl rand -hex 64)" --prod

# Set email API key (if using Resend)
npx convex env set RESEND_API_KEY "your-production-resend-key" --prod

# Set OpenAI key (if using AI features)
npx convex env set OPENAI_API_KEY "your-production-openai-key" --prod
```

Verify variables:
```bash
npx convex env list --prod
```

### Vercel Setup (Option A: Two Projects)

#### Production Project
- [ ] Create project: `vercel --prod`
  - Project name: `franchiseen`
  - Connect to main branch
- [ ] Add domain: `franchiseen.com` and `www.franchiseen.com`
- [ ] Set environment variables (see `.env.mainnet.example`)
- [ ] Test build: Verify deployment succeeds
- [ ] Verify SSL certificate is active

#### Development Project
- [ ] Create branch: `git checkout -b devnet`
- [ ] Create project: `vercel --prod`
  - Project name: `franchiseen-devnet`
  - Connect to devnet branch
- [ ] Add domain: `dev.franchiseen.com`
- [ ] Set environment variables (see `.env.devnet.example`)
- [ ] Test build: Verify deployment succeeds

### DNS Configuration
- [ ] Configure production domain (franchiseen.com)
  ```
  Type    Name    Value
  A       @       76.76.21.21 (or Vercel IP)
  CNAME   www     cname.vercel-dns.com
  ```
- [ ] Configure dev domain (dev.franchiseen.com)
  ```
  Type    Name    Value
  CNAME   dev     cname.vercel-dns.com
  ```
- [ ] Wait for DNS propagation (can take 24-48 hours)
- [ ] Verify both domains resolve correctly

---

## 🔒 Security Hardening

### Wallet Encryption
- [ ] Implement AES encryption in `convex/walletKeypairs.ts`
- [ ] Install crypto-js: `npm install crypto-js @types/crypto-js`
- [ ] Update `encryptSecretKey` function
- [ ] Update `decryptSecretKey` function
- [ ] Test encryption/decryption locally
- [ ] Deploy to both environments

### Rate Limiting
- [ ] Implement rate limiting for sensitive mutations
- [ ] Test rate limits on devnet
- [ ] Deploy to production

### Transaction Validation
- [ ] Implement on-chain transaction verification
- [ ] Add validation before recording transactions
- [ ] Test on devnet
- [ ] Deploy to production

---

## 🗄️ Database Setup

### Development Database (Devnet)
- [ ] Already populated with test data
- [ ] Verify test franchises exist
- [ ] Verify test users can access

### Production Database (Mainnet)
- [ ] Create `convex/seedProduction.ts`
- [ ] Seed admin accounts
- [ ] Seed master data (categories, etc.)
- [ ] Seed initial brands (if applicable)
- [ ] Run seed: `npx convex run seedProduction:seedProductionDatabase --prod`
- [ ] Verify data in Convex dashboard

---

## 💰 Wallet Funding

### Development (Devnet - Free)
- [ ] Identify wallets that need funding
- [ ] Fund using faucet or CLI:
  ```bash
  solana airdrop 2 <WALLET_ADDRESS> --url devnet
  ```
- [ ] Verify balances in Solana Explorer (devnet)
- [ ] Test transactions

### Production (Mainnet - Real SOL)
- [ ] ⚠️ WARNING: Real money involved
- [ ] Create funding plan (which wallets, how much)
- [ ] Use secure wallet for transfers
- [ ] Fund incrementally (start with small amounts)
- [ ] Verify each transfer in Solana Explorer
- [ ] Document all funding transactions

---

## 🧪 Testing Before Launch

### Devnet Testing (Complete Before Production)
- [ ] User registration and login
- [ ] Brand registration and approval
- [ ] Franchise creation and approval
- [ ] Funding flow (PDA creation, token purchases)
- [ ] Wallet creation (franchise and brand wallets)
- [ ] Transaction execution (all three types)
- [ ] POS billing functionality
- [ ] Expense management
- [ ] Payout system
- [ ] Admin dashboard
- [ ] All user roles (admin, franchiser, franchise, investor)
- [ ] Error handling (network failures, insufficient funds, etc.)
- [ ] Verify transactions in Solana Explorer

### Production Smoke Tests (After Deployment)
- [ ] Homepage loads correctly
- [ ] SSL certificate valid
- [ ] Can create account
- [ ] Can login
- [ ] Can view franchises
- [ ] Can view brands
- [ ] Wallet displays correctly
- [ ] All navigation works
- [ ] No console errors
- [ ] Convex functions responding
- [ ] Solana connection working

### Performance Testing
- [ ] Page load times acceptable
- [ ] Database queries optimized
- [ ] Transaction execution times reasonable
- [ ] No memory leaks
- [ ] Mobile responsive

---

## 📊 Monitoring Setup

### Convex Monitoring
- [ ] Access dev dashboard: https://dashboard.convex.dev/d/your-dev-deployment
- [ ] Access prod dashboard: https://dashboard.convex.dev/d/your-prod-deployment
- [ ] Set up alerts for errors
- [ ] Set up alerts for function timeouts
- [ ] Monitor database usage

### Vercel Monitoring
- [ ] Enable Web Analytics (both projects)
- [ ] Enable Speed Insights (both projects)
- [ ] Set up error alerts
- [ ] Monitor build times
- [ ] Monitor bandwidth usage

### Solana Monitoring
- [ ] Create monitoring dashboard (use `convex/monitoring.ts`)
- [ ] Track failed transactions
- [ ] Track pending transactions
- [ ] Monitor wallet balances
- [ ] Set up alerts for low balances

---

## 🚀 Launch Day

### T-24 Hours
- [ ] Final code review
- [ ] All tests passing
- [ ] Security audit complete
- [ ] Backup production database
- [ ] Team briefing
- [ ] Support channels ready

### T-4 Hours
- [ ] Deploy to production
- [ ] Verify deployment
- [ ] Run smoke tests
- [ ] Check monitoring dashboards
- [ ] Test with small real transaction

### T-1 Hour
- [ ] Final verification of all systems
- [ ] Prepare rollback plan
- [ ] Team on standby

### Go Live
- [ ] Make announcement
- [ ] Monitor closely for first hour
- [ ] Monitor closely for first 24 hours
- [ ] Be ready to address issues immediately

---

## 📝 Post-Launch

### First 24 Hours
- [ ] Monitor all transactions
- [ ] Track user signups
- [ ] Watch for errors
- [ ] Respond to support requests
- [ ] Document any issues

### First Week
- [ ] Daily monitoring
- [ ] Performance optimization if needed
- [ ] User feedback collection
- [ ] Feature requests documentation

### Ongoing
- [ ] Weekly database backups
- [ ] Monthly security review
- [ ] Quarterly key rotation
- [ ] Regular dependency updates

---

## 🔄 Regular Maintenance

### Weekly
- [ ] Check monitoring dashboards
- [ ] Review error logs
- [ ] Verify backups
- [ ] Check wallet balances

### Monthly
- [ ] Database backup and export
- [ ] Security review
- [ ] Performance audit
- [ ] Dependency updates
- [ ] Cost analysis

### Quarterly
- [ ] Rotate encryption keys
- [ ] Full security audit
- [ ] Disaster recovery drill
- [ ] Team training update

---

## 🆘 Emergency Procedures

### If Production Goes Down
1. [ ] Check Vercel status page
2. [ ] Check Convex dashboard
3. [ ] Check Solana network status
4. [ ] Attempt rollback if needed
5. [ ] Communicate with users
6. [ ] Document incident
7. [ ] Post-mortem analysis

### If Wallets Compromised
1. [ ] Immediately pause all transactions
2. [ ] Rotate encryption keys
3. [ ] Transfer funds to new wallets
4. [ ] Investigate breach
5. [ ] Report to authorities if needed
6. [ ] Notify affected users
7. [ ] Implement additional security

### Contact Information
- Convex Support: Discord or dashboard
- Vercel Support: support@vercel.com
- Solana Support: Discord community
- Security Issues: security@yourcompany.com

---

## ✅ Quick Launch Command Reference

```bash
# Deploy to development
git checkout devnet
git push origin devnet
npx convex dev

# Deploy to production
git checkout main
git push origin main
npx convex deploy --prod

# Check production status
npx convex env list --prod
npx convex logs --prod --tail

# Rollback if needed
vercel rollback
npx convex deploy --prod --from-snapshot <previous-snapshot>
```

---

**Last Updated:** [Date]  
**Reviewed By:** [Name]  
**Next Review:** [Date]


