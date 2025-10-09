# 🚀 Deploy to Vercel - Quick Action Guide

Follow this checklist to deploy both environments to Vercel.

---

## ✅ Pre-Deployment Checklist

- [ ] GitHub repository is up to date
- [ ] Both `main` and `devnet` branches exist
- [ ] Convex dev deployment is working
- [ ] Local development tested
- [ ] Vercel account created

---

## 📋 Part 1: Deploy Devnet (30 minutes)

### Step 1: Push Devnet Branch to GitHub

```bash
# Switch to devnet
git checkout devnet

# Merge latest from main
git merge main

# Push to GitHub
git push -u origin devnet
```

### Step 2: Create Vercel Project for Devnet

Go to: https://vercel.com/new

1. Click **"Add New"** → **"Project"**
2. Import your GitHub repository
3. Configure:
   - Project Name: `franchiseen-devnet`
   - Framework: Next.js (auto-detected)
   - **IMPORTANT:** Settings → Git → Production Branch: `devnet`

### Step 3: Add Devnet Environment Variables

In Vercel Dashboard → franchiseen-devnet → Settings → Environment Variables

```bash
# Get your Convex dev URL first:
npx convex env get NEXT_PUBLIC_CONVEX_URL
```

Add these variables (for **Production** scope):

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_CONVEX_URL` | Your dev Convex URL |
| `NEXT_PUBLIC_SOLANA_NETWORK` | `devnet` |
| `NEXT_PUBLIC_SOLANA_RPC_URL` | `https://api.devnet.solana.com` |
| `NEXT_PUBLIC_USE_REAL_WALLETS` | `true` |
| `NEXT_PUBLIC_APP_ENV` | `development` |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Your Google Maps key |
| `NEXT_PUBLIC_UPLOADCARE_PUBLIC_KEY` | Your Uploadcare key (if using) |

### Step 4: Deploy

Click **"Deploy"** button

Wait for deployment to complete (~2-3 minutes)

### Step 5: Test Devnet Deployment

Visit your deployment URL (shown in Vercel dashboard)

Check:
- [ ] Homepage loads
- [ ] Can navigate
- [ ] No console errors
- [ ] Convex connection works

### Step 6: (Optional) Add Custom Domain

If using `dev.franchiseen.com`:

1. Vercel → franchiseen-devnet → Settings → Domains
2. Add: `dev.franchiseen.com`
3. Update DNS:
   ```
   Type: CNAME
   Name: dev
   Value: cname.vercel-dns.com
   ```

---

## 📋 Part 2: Deploy Production (45 minutes)

### Step 1: Set Up Convex Production

```bash
# Create production environment
npx convex env add production

# Deploy to production
npx convex deploy --prod

# Get production URL (save this!)
npx convex env get NEXT_PUBLIC_CONVEX_URL --prod

# Set production secrets
npx convex env set AUTH_SECRET "$(openssl rand -hex 32)" --prod
npx convex env set WALLET_ENCRYPTION_KEY "$(openssl rand -hex 64)" --prod
npx convex env set RESEND_API_KEY "your-key" --prod
```

**⚠️ IMPORTANT:** Save your encryption key somewhere secure!

### Step 2: Push Main Branch to GitHub

```bash
# Switch to main
git checkout main

# Ensure it's up to date
git pull origin main

# Push
git push origin main
```

### Step 3: Create Vercel Project for Production

Go to: https://vercel.com/new

1. Click **"Add New"** → **"Project"**
2. Import your GitHub repository (same repo, new project)
3. Configure:
   - Project Name: `franchiseen`
   - Framework: Next.js (auto-detected)
   - **IMPORTANT:** Settings → Git → Production Branch: `main`

### Step 4: Add Production Environment Variables

In Vercel Dashboard → franchiseen → Settings → Environment Variables

Add these variables (for **Production** scope):

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_CONVEX_URL` | Your prod Convex URL (from Step 1) |
| `NEXT_PUBLIC_SOLANA_NETWORK` | `mainnet-beta` |
| `NEXT_PUBLIC_SOLANA_RPC_URL` | `https://api.mainnet-beta.solana.com` |
| `NEXT_PUBLIC_USE_REAL_WALLETS` | `true` |
| `NEXT_PUBLIC_APP_ENV` | `production` |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Your production Google Maps key |
| `NEXT_PUBLIC_UPLOADCARE_PUBLIC_KEY` | Your production Uploadcare key |

### Step 5: Deploy

Click **"Deploy"** button

Wait for deployment to complete (~2-3 minutes)

### Step 6: Test Production Deployment

Visit your deployment URL (shown in Vercel dashboard)

Check:
- [ ] SSL certificate valid
- [ ] Homepage loads
- [ ] Can navigate
- [ ] No console errors
- [ ] Convex production database connected
- [ ] Different data from devnet

### Step 7: (Optional) Add Custom Domain

If using `franchiseen.com`:

1. Vercel → franchiseen → Settings → Domains
2. Add: `franchiseen.com` and `www.franchiseen.com`
3. Update DNS:
   ```
   Type: A
   Name: @
   Value: 76.76.21.21
   
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

---

## ✅ Post-Deployment Checklist

### Devnet Environment
- [ ] Deployed successfully
- [ ] All environment variables set
- [ ] Can access via URL
- [ ] Convex dev connection working
- [ ] Solana devnet transactions work
- [ ] Custom domain configured (if using)

### Production Environment
- [ ] Deployed successfully
- [ ] All environment variables set
- [ ] Can access via URL
- [ ] Convex production connection working
- [ ] SSL certificate valid
- [ ] Custom domain configured (if using)
- [ ] Monitoring set up

---

## 🔄 Future Deployments

### To Deploy Changes to Devnet:
```bash
git checkout devnet
git add .
git commit -m "Your changes"
git push origin devnet
# Vercel auto-deploys!
```

### To Deploy Changes to Production:
```bash
# Test on devnet first!
git checkout devnet
# ... test thoroughly ...

# Then deploy to production
git checkout main
git merge devnet
git push origin main
npx convex deploy --prod
# Vercel auto-deploys!
```

---

## 🌍 Your Deployment URLs

After deployment, you'll have:

**Devnet:**
- Vercel URL: `https://franchiseen-devnet.vercel.app`
- Custom Domain: `https://dev.franchiseen.com` (if configured)
- Convex: Your dev deployment
- Solana: Devnet

**Production:**
- Vercel URL: `https://franchiseen.vercel.app`
- Custom Domain: `https://franchiseen.com` (if configured)
- Convex: Your prod deployment
- Solana: Mainnet

---

## 🆘 Quick Troubleshooting

### Build Fails
```bash
# Test locally first
npm run build

# Check package.json has all dependencies
# Check environment variables are set
```

### Environment Variables Not Working
- Make sure variables are set for "Production" scope
- Redeploy after adding variables
- Check for typos in variable names

### Convex Connection Issues
```bash
# Verify URL is correct
npx convex env get NEXT_PUBLIC_CONVEX_URL --prod

# Check Convex deployment is running
# Visit dashboard.convex.dev
```

---

## 📞 Need Help?

- **Detailed Guide:** See `docs/VERCEL_DEPLOYMENT_GUIDE.md`
- **Vercel Docs:** https://vercel.com/docs
- **Vercel Status:** https://www.vercel-status.com/
- **Support:** support@vercel.com

---

## 🎯 Success Criteria

You've successfully deployed when:

✅ Both Vercel projects exist  
✅ Devnet uses devnet branch and Solana devnet  
✅ Production uses main branch and Solana mainnet  
✅ Both sites load without errors  
✅ Convex connections work  
✅ Automatic deployments from GitHub work  

---

**Ready to deploy?** Start with Part 1 (Devnet), test thoroughly, then proceed to Part 2 (Production)! 🚀

**Estimated Time:**
- Devnet: 30 minutes
- Production: 45 minutes
- Total: ~1.5 hours

