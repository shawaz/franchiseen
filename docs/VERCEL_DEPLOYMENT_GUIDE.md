# Vercel Deployment Guide - Devnet & Mainnet

Complete guide to deploy both environments to Vercel.

---

## 🎯 Overview

You'll create **two separate Vercel projects**:

| Project | Branch | Domain | Purpose |
|---------|--------|--------|---------|
| **franchiseen-devnet** | devnet | dev.franchiseen.com | Testing with Solana devnet |
| **franchiseen** | main | franchiseen.com | Production with Solana mainnet |

---

## 📋 Prerequisites

Before starting:

- [ ] GitHub repository with both `main` and `devnet` branches
- [ ] Vercel account (sign up at https://vercel.com)
- [ ] Convex deployments ready (dev and prod)
- [ ] Domain names configured (if using custom domains)

---

## 🚀 Part 1: Deploy Devnet Environment

### Step 1.1: Install Vercel CLI (Optional)

```bash
npm install -g vercel
```

### Step 1.2: Prepare Devnet Branch

```bash
# Switch to devnet branch
git checkout devnet

# Make sure it's up to date with main
git merge main

# Commit any changes
git add .
git commit -m "Prepare devnet for deployment"

# Push to GitHub
git push -u origin devnet
```

### Step 1.3: Create Devnet Project in Vercel

**Option A: Using Vercel Dashboard (Recommended for first deployment)**

1. Go to https://vercel.com/dashboard
2. Click **"Add New"** → **"Project"**
3. Import your GitHub repository
4. Configure:
   - **Project Name:** `franchiseen-devnet`
   - **Framework Preset:** Next.js (auto-detected)
   - **Root Directory:** `./` (leave as default)
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next` (auto-filled)
   - **Install Command:** `npm install`

5. **IMPORTANT:** Before deploying, go to **Settings** → **Git**
   - Set **Production Branch** to: `devnet`

6. Configure Environment Variables (see section below)

7. Click **"Deploy"**

**Option B: Using Vercel CLI**

```bash
# Make sure you're on devnet branch
git checkout devnet

# Deploy
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? [Your account]
# - Link to existing project? No
# - Project name? franchiseen-devnet
# - Directory? ./ (press Enter)
# - Override settings? No

# After first deployment, set production branch:
vercel git connect [your-repo-url]
```

### Step 1.4: Configure Devnet Environment Variables

In Vercel Dashboard → `franchiseen-devnet` → Settings → Environment Variables

Add these variables for **Production** environment:

```bash
# Convex Configuration
NEXT_PUBLIC_CONVEX_URL=https://your-dev-deployment.convex.cloud

# Solana Devnet Configuration
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_SOLANA_DEVNET_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_USE_REAL_WALLETS=true

# Environment
NEXT_PUBLIC_APP_ENV=development

# Google Maps (Optional - can use test key)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_test_google_maps_api_key

# Uploadcare (Optional)
NEXT_PUBLIC_UPLOADCARE_PUBLIC_KEY=your_test_uploadcare_key
```

**How to get Convex Dev URL:**
```bash
npx convex env get NEXT_PUBLIC_CONVEX_URL
```

### Step 1.5: Set Custom Domain (Optional)

If using custom domain:

1. Go to **Settings** → **Domains**
2. Add domain: `dev.franchiseen.com`
3. Configure DNS with your provider:
   ```
   Type: CNAME
   Name: dev
   Value: cname.vercel-dns.com
   ```

### Step 1.6: Verify Devnet Deployment

```bash
# Your devnet project will be at:
# https://franchiseen-devnet.vercel.app
# or https://dev.franchiseen.com (if custom domain)
```

Visit the URL and verify:
- [ ] Homepage loads
- [ ] Can navigate pages
- [ ] Convex connection works
- [ ] No console errors

---

## 🚀 Part 2: Deploy Mainnet Environment

### Step 2.1: Create Convex Production Environment

```bash
# Create production environment
npx convex env add production

# Deploy to production
npx convex deploy --prod

# Get production URL
npx convex env get NEXT_PUBLIC_CONVEX_URL --prod
```

Save this URL - you'll need it for Vercel environment variables.

### Step 2.2: Set Convex Production Secrets

```bash
# Generate and set authentication secret
npx convex env set AUTH_SECRET "$(openssl rand -hex 32)" --prod

# Generate and set wallet encryption key
npx convex env set WALLET_ENCRYPTION_KEY "$(openssl rand -hex 64)" --prod

# Set other API keys
npx convex env set RESEND_API_KEY "your-production-resend-key" --prod
npx convex env set OPENAI_API_KEY "your-production-openai-key" --prod

# Verify
npx convex env list --prod
```

### Step 2.3: Prepare Main Branch

```bash
# Switch to main branch
git checkout main

# Make sure it's up to date
git pull origin main

# Commit any final changes
git add .
git commit -m "Prepare for production deployment"

# Push to GitHub
git push origin main
```

### Step 2.4: Create Production Project in Vercel

**Option A: Using Vercel Dashboard**

1. Go to https://vercel.com/dashboard
2. Click **"Add New"** → **"Project"**
3. Import your GitHub repository (same repo, different project)
4. Configure:
   - **Project Name:** `franchiseen`
   - **Framework Preset:** Next.js
   - **Root Directory:** `./`
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next`
   - **Install Command:** `npm install`

5. **IMPORTANT:** Before deploying, go to **Settings** → **Git**
   - Set **Production Branch** to: `main`

6. Configure Environment Variables (see section below)

7. Click **"Deploy"**

**Option B: Using Vercel CLI**

```bash
# Make sure you're on main branch
git checkout main

# Deploy
vercel --prod

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? [Your account]
# - Link to existing project? No
# - Project name? franchiseen
# - Directory? ./ (press Enter)
# - Override settings? No
```

### Step 2.5: Configure Production Environment Variables

In Vercel Dashboard → `franchiseen` → Settings → Environment Variables

Add these variables for **Production** environment:

```bash
# Convex Production Configuration
NEXT_PUBLIC_CONVEX_URL=https://your-production-deployment.convex.cloud

# Solana Mainnet Configuration
NEXT_PUBLIC_SOLANA_NETWORK=mainnet-beta
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
NEXT_PUBLIC_SOLANA_MAINNET_RPC_URL=https://api.mainnet-beta.solana.com
NEXT_PUBLIC_USE_REAL_WALLETS=true

# Environment
NEXT_PUBLIC_APP_ENV=production

# Google Maps (Production key)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_production_google_maps_api_key

# Uploadcare (Production key)
NEXT_PUBLIC_UPLOADCARE_PUBLIC_KEY=your_production_uploadcare_key
```

### Step 2.6: Set Custom Domain (Optional)

If using custom domain:

1. Go to **Settings** → **Domains**
2. Add domains:
   - `franchiseen.com`
   - `www.franchiseen.com`
3. Configure DNS with your provider:
   ```
   Type: A
   Name: @
   Value: 76.76.21.21

   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

### Step 2.7: Verify Production Deployment

```bash
# Your production project will be at:
# https://franchiseen.vercel.app
# or https://franchiseen.com (if custom domain)
```

Visit the URL and verify:
- [ ] Homepage loads
- [ ] Can navigate pages
- [ ] Convex connection works (production database)
- [ ] SSL certificate is valid
- [ ] No console errors

---

## 📊 Your Deployment Architecture

```
GitHub Repository
├── main branch → Vercel Project "franchiseen" → franchiseen.com
│                 └── Convex Production → Solana Mainnet
│
└── devnet branch → Vercel Project "franchiseen-devnet" → dev.franchiseen.com
                    └── Convex Dev → Solana Devnet
```

---

## 🔄 Deployment Workflow

### Deploy Changes to Devnet

```bash
# 1. Make changes on a feature branch
git checkout -b feature/new-feature

# 2. Commit and push
git add .
git commit -m "Add new feature"
git push origin feature/new-feature

# 3. Merge to devnet
git checkout devnet
git merge feature/new-feature
git push origin devnet

# 4. Vercel automatically deploys!
# Visit: https://franchiseen-devnet.vercel.app
```

### Deploy Changes to Production

```bash
# 1. After testing on devnet, merge to main
git checkout main
git merge devnet
git push origin main

# 2. Deploy Convex changes (if any)
npx convex deploy --prod

# 3. Vercel automatically deploys!
# Visit: https://franchiseen.vercel.app
```

---

## 🔍 Environment Variable Checklist

### Devnet Variables ✅

```bash
NEXT_PUBLIC_CONVEX_URL=https://[dev-id].convex.cloud
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_USE_REAL_WALLETS=true
NEXT_PUBLIC_APP_ENV=development
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key
NEXT_PUBLIC_UPLOADCARE_PUBLIC_KEY=your_key
```

### Production Variables ✅

```bash
NEXT_PUBLIC_CONVEX_URL=https://[prod-id].convex.cloud
NEXT_PUBLIC_SOLANA_NETWORK=mainnet-beta
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
NEXT_PUBLIC_USE_REAL_WALLETS=true
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_production_key
NEXT_PUBLIC_UPLOADCARE_PUBLIC_KEY=your_production_key
```

### Convex Backend Variables (Set via CLI)

**Development:**
```bash
npx convex env set WALLET_ENCRYPTION_KEY "test-key-for-dev"
npx convex env set AUTH_SECRET "test-auth-secret"
```

**Production:**
```bash
npx convex env set WALLET_ENCRYPTION_KEY "$(openssl rand -hex 64)" --prod
npx convex env set AUTH_SECRET "$(openssl rand -hex 32)" --prod
npx convex env set RESEND_API_KEY "your-key" --prod
npx convex env set OPENAI_API_KEY "your-key" --prod
```

---

## 🧪 Testing After Deployment

### Test Devnet Deployment

1. **Smoke Test:**
   ```bash
   # Visit your devnet URL
   open https://franchiseen-devnet.vercel.app
   ```

2. **Verify:**
   - [ ] Homepage loads
   - [ ] Can sign up/login
   - [ ] Can view franchises
   - [ ] Wallet displays correctly
   - [ ] Convex data loads
   - [ ] Check browser console for errors

3. **Test Transactions:**
   - Fund a devnet wallet
   - Create test franchise
   - Verify transactions in Solana Explorer (devnet)

### Test Production Deployment

1. **Smoke Test:**
   ```bash
   # Visit your production URL
   open https://franchiseen.vercel.app
   ```

2. **Verify:**
   - [ ] SSL certificate valid
   - [ ] Homepage loads
   - [ ] Can sign up/login
   - [ ] Basic navigation works
   - [ ] Convex production database connected
   - [ ] No devnet transactions visible

3. **Monitor Closely:**
   - Watch Vercel logs
   - Watch Convex logs: `npm run convex:logs:prod`
   - Check for errors in first hour

---

## 📊 Monitoring Your Deployments

### Vercel Dashboard

**Devnet:**
- URL: https://vercel.com/[your-account]/franchiseen-devnet
- Monitor: Deployments, Analytics, Logs

**Production:**
- URL: https://vercel.com/[your-account]/franchiseen
- Monitor: Deployments, Analytics, Logs, Speed Insights

### Convex Dashboard

**Dev:**
```bash
npm run convex:logs:dev
# Or visit: https://dashboard.convex.dev/d/[dev-id]
```

**Production:**
```bash
npm run convex:logs:prod
# Or visit: https://dashboard.convex.dev/d/[prod-id]
```

### Useful Commands

```bash
# Check deployment status
vercel ls

# View logs for specific project
vercel logs [project-name]

# Rollback if needed
vercel rollback
```

---

## 🆘 Troubleshooting

### Build Fails on Vercel

**Error: "Module not found"**
```bash
# Test build locally first
npm run build

# If it works locally, check:
# 1. All dependencies in package.json
# 2. Node version matches (check vercel.json)
# 3. Environment variables set correctly
```

**Error: "NEXT_PUBLIC_CONVEX_URL is not defined"**
- Go to Vercel Dashboard → Settings → Environment Variables
- Make sure all NEXT_PUBLIC_* variables are set
- Redeploy after adding variables

### Site Loads But Shows Errors

**"Failed to connect to Convex"**
- Verify NEXT_PUBLIC_CONVEX_URL is correct
- Check Convex deployment is running
- Verify network request isn't blocked

**"Wallet not showing"**
- Check NEXT_PUBLIC_SOLANA_RPC_URL is set
- Verify network (devnet vs mainnet-beta)
- Check browser console for errors

### Deployment Succeeds But Site is Broken

```bash
# 1. Check Vercel logs
vercel logs [project-name] --follow

# 2. Check Convex logs
npm run convex:logs:prod

# 3. Check browser console
# Open DevTools → Console tab

# 4. Verify environment variables
# Vercel Dashboard → Settings → Environment Variables

# 5. Try redeploying
vercel --prod --force
```

---

## 🔐 Security Checklist

Before going live with production:

- [ ] All environment variables set correctly
- [ ] Different API keys for dev and prod
- [ ] WALLET_ENCRYPTION_KEY is strong (64-char hex)
- [ ] AUTH_SECRET is strong (32-char hex)
- [ ] SSL certificate is active
- [ ] Custom domain configured
- [ ] Rate limiting enabled (in Convex)
- [ ] Monitoring set up
- [ ] Backup strategy in place

---

## 💰 Cost Breakdown

### Vercel Costs

| Plan | Cost | Includes |
|------|------|----------|
| **Hobby** | Free | 1 team member, 100GB bandwidth/month |
| **Pro** | $20/month | Unlimited team, 1TB bandwidth, Priority support |

**Recommendation:**
- Start with **Hobby** for both projects
- Upgrade production to **Pro** when launching

### Total Monthly Costs

| Service | Dev | Prod | Total |
|---------|-----|------|-------|
| Vercel | $0 | $20 | $20 |
| Convex | $0 | $25-50 | $25-50 |
| Solana | $0 | ~$2.50 | $2.50 |
| **Total** | **$0** | **~$50-75** | **~$50-75** |

---

## 📞 Support

### Vercel Issues
- Status: https://www.vercel-status.com/
- Docs: https://vercel.com/docs
- Support: support@vercel.com

### Convex Issues
- Dashboard: https://dashboard.convex.dev
- Discord: https://convex.dev/community
- Docs: https://docs.convex.dev

---

## ✅ Deployment Complete!

Once both environments are deployed, you'll have:

✅ **Devnet Environment** for testing (FREE)  
✅ **Production Environment** for live users  
✅ **Automatic deployments** from GitHub  
✅ **Separate databases** for each environment  
✅ **Different Solana networks** (devnet/mainnet)  
✅ **Professional workflow** with branch-based deployments  

---

## 🎯 Quick Commands Reference

```bash
# Deploy devnet
git checkout devnet
git push origin devnet
# Vercel auto-deploys

# Deploy production
git checkout main
git push origin main
npx convex deploy --prod
# Vercel auto-deploys

# View logs
vercel logs franchiseen-devnet
vercel logs franchiseen

# Rollback if needed
vercel rollback

# Check status
vercel ls
```

---

**Ready to deploy?** Start with Part 1 (Devnet) and test thoroughly before Part 2 (Production)! 🚀

