# Quick Start Guide - Dual Environment Setup

## 🚀 TL;DR - Get Started in 5 Minutes

```bash
# 1. Install dependencies
npm install

# 2. Setup environment
npm run setup:env

# 3. Start development
npm run dev
npm run convex:dev
```

---

## 📋 Complete Setup

### 1️⃣ Local Development Setup

```bash
# Clone and install
git clone <your-repo>
cd franchiseen
npm install

# Setup environment variables
npm run setup:env
# Choose option 1 (Development)

# Edit .env.local with your API keys
# - Get Convex URL from: npx convex dev
# - Add Google Maps API key
# - Add other API keys as needed

# Start development
npm run dev              # Start Next.js (http://localhost:3000)
npm run convex:dev       # Start Convex backend
```

Your development environment is now running on:
- Frontend: http://localhost:3000
- Convex: Displayed in terminal
- Solana: Devnet

### 2️⃣ Production Setup (When Ready)

```bash
# Create production Convex environment
npm run setup:env
# Choose option 2 (Production)

# Deploy to production
npm run convex:deploy:prod

# Deploy to Vercel
# - Push to main branch (auto-deploy)
# - Or run: npm run deploy:mainnet
```

---

## 🛠️ Common Commands

### Development

```bash
# Start local dev
npm run dev                    # Next.js dev server
npm run convex:dev            # Convex backend

# Check Convex logs
npm run convex:logs:dev       # Development logs
npm run convex:logs:prod      # Production logs

# Check environment variables
npm run convex:env:dev        # Dev environment vars
npm run convex:env:prod       # Prod environment vars
```

### Testing & Building

```bash
npm run build                 # Build for production
npm run lint                  # Run linter
npm run format                # Format code
npm run ci                    # Run all checks
```

### Wallet Management

```bash
# Fund devnet wallets (test SOL)
npm run wallet:fund:devnet

# Verify wallet setup
npm run wallet:verify

# Fund specific wallet (devnet)
solana airdrop 2 <WALLET_ADDRESS> --url devnet

# Check wallet balance
solana balance <WALLET_ADDRESS> --url devnet
```

### Deployment

```bash
# Deploy to devnet (testing environment)
git checkout devnet
git push origin devnet
npm run deploy:devnet

# Deploy to mainnet (production)
git checkout main
git push origin main
npm run deploy:mainnet
```

---

## 📁 Project Structure

```
franchiseen/
├── convex/                    # Backend (Convex functions)
│   ├── franchiseManagement.ts # Franchise operations
│   ├── walletKeypairs.ts     # Wallet management
│   ├── solanaTransactions.ts # Blockchain transactions
│   └── schema.ts             # Database schema
├── src/
│   ├── app/                  # Next.js app router
│   ├── components/           # React components
│   ├── lib/                  # Utilities
│   └── hooks/                # Custom hooks
├── scripts/                  # Utility scripts
│   ├── setup-environment.sh  # Environment setup
│   ├── fundWallets.js       # Wallet funding
│   └── verifyWallets.js     # Wallet verification
├── .env.local               # Local environment vars (create this)
└── DUAL_ENVIRONMENT_DEPLOYMENT.md # Full deployment guide
```

---

## 🌍 Environments Overview

### Development (Devnet)
- **Frontend:** http://localhost:3000 or dev.franchiseen.com
- **Backend:** Convex dev deployment
- **Blockchain:** Solana devnet (test SOL)
- **Purpose:** Testing, demos, development

### Production (Mainnet)
- **Frontend:** franchiseen.com
- **Backend:** Convex production deployment
- **Blockchain:** Solana mainnet (real SOL)
- **Purpose:** Live platform, real users

---

## ⚙️ Environment Variables

### Frontend Variables (NEXT_PUBLIC_*)

Required in `.env.local` or Vercel:

```bash
# Convex
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud

# Solana
NEXT_PUBLIC_SOLANA_NETWORK=devnet  # or mainnet-beta
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_USE_REAL_WALLETS=true

# Environment
NEXT_PUBLIC_APP_ENV=development  # or production

# APIs
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key
NEXT_PUBLIC_UPLOADCARE_PUBLIC_KEY=your_key
```

### Backend Variables (Convex)

Set using `npx convex env set`:

```bash
# Security (CRITICAL)
npx convex env set WALLET_ENCRYPTION_KEY "$(openssl rand -hex 64)" --prod
npx convex env set AUTH_SECRET "$(openssl rand -hex 32)" --prod

# APIs
npx convex env set RESEND_API_KEY "your-key" --prod
npx convex env set OPENAI_API_KEY "your-key" --prod
```

---

## 🔐 Security Checklist

Before going to production:

- [ ] Implement proper wallet encryption (replace base64 with AES)
- [ ] Use strong, unique encryption keys
- [ ] Never commit `.env.local` to git
- [ ] Use different keys for dev and prod
- [ ] Enable rate limiting
- [ ] Implement transaction validation
- [ ] Set up monitoring and alerts
- [ ] Test thoroughly on devnet first

---

## 🧪 Testing Flow

### 1. Local Testing

```bash
# Start dev servers
npm run dev
npm run convex:dev

# Test in browser
open http://localhost:3000
```

### 2. Devnet Testing

```bash
# Deploy to devnet
git checkout devnet
git push origin devnet

# Test on dev.franchiseen.com
# - Create test franchise
# - Test funding flow
# - Verify transactions in Solana Explorer (devnet)
```

### 3. Production Testing

```bash
# Deploy to production
git checkout main
git push origin main

# Initial smoke test
# - Homepage loads
# - Can login
# - Basic navigation works

# Gradual rollout
# - Start with internal testing
# - Beta users
# - Full launch
```

---

## 📊 Monitoring

### Convex Dashboard

```bash
# Development
open https://dashboard.convex.dev/d/your-dev-deployment

# Production
open https://dashboard.convex.dev/d/your-prod-deployment
```

Monitor:
- Function calls
- Errors
- Database queries
- Performance

### Solana Explorer

```bash
# Devnet
open https://explorer.solana.com/?cluster=devnet

# Mainnet
open https://explorer.solana.com/?cluster=mainnet-beta
```

Monitor:
- Transaction status
- Wallet balances
- Transaction fees
- Network health

### Vercel Dashboard

Monitor:
- Deployment status
- Build logs
- Analytics
- Performance

---

## 🆘 Troubleshooting

### Issue: Convex URL not found

```bash
# Check if Convex is running
npm run convex:logs:dev

# Verify environment variable
echo $NEXT_PUBLIC_CONVEX_URL

# Restart dev server
npm run dev
```

### Issue: Wallet has no SOL (devnet)

```bash
# Fund with faucet
solana airdrop 2 <WALLET_ADDRESS> --url devnet

# Or use script
npm run wallet:fund:devnet

# Check balance
solana balance <WALLET_ADDRESS> --url devnet
```

### Issue: Transaction not showing in Explorer

**Check:**
1. Is it an off-chain transaction? (starts with `off_chain_`)
2. Did the transaction execute? (check Convex logs)
3. Correct network? (devnet vs mainnet)
4. Transaction signature correct?

### Issue: Build fails on Vercel

```bash
# Test build locally
npm run build

# Check for TypeScript errors
npm run lint

# Check environment variables in Vercel
# Make sure all required vars are set
```

---

## 📚 Additional Resources

- **Full Deployment Guide:** `DUAL_ENVIRONMENT_DEPLOYMENT.md`
- **Deployment Checklist:** `DEPLOYMENT_CHECKLIST.md`
- **Wallet Funding Guide:** `WALLET_FUNDING_GUIDE.md`
- **Solana Transactions Guide:** `SOLANA_TRANSACTIONS_GUIDE.md`
- **Payout System Guide:** `PAYOUT_SYSTEM_GUIDE.md`

### External Documentation

- [Convex Docs](https://docs.convex.dev)
- [Next.js Docs](https://nextjs.org/docs)
- [Solana Docs](https://docs.solana.com)
- [Vercel Docs](https://vercel.com/docs)

---

## 🎯 Next Steps

1. ✅ Complete local setup
2. ✅ Test all features locally
3. ✅ Deploy to devnet
4. ✅ Test on devnet thoroughly
5. ✅ Set up production environment
6. ✅ Deploy to production
7. ✅ Monitor and iterate

---

## 💡 Tips

- Always test on devnet before production
- Use meaningful commit messages
- Keep documentation updated
- Monitor logs regularly
- Backup production database weekly
- Use different API keys for dev and prod
- Start small, scale gradually

---

**Need Help?** See `TROUBLESHOOTING.md` or check the docs above.

**Ready to Deploy?** Follow `DEPLOYMENT_CHECKLIST.md` step by step.

Happy coding! 🚀

