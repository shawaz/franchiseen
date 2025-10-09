# 🚀 Getting Started - Your Next Steps

You now have everything set up for dual-environment deployment!

## ✅ What's Ready

- [x] Devnet branch created
- [x] Documentation organized in `/docs` folder  
- [x] README updated with correct links
- [x] npm scripts added to package.json
- [x] Setup script ready to use

---

## 🎯 Next Steps (In Order)

### 1️⃣ Set Up Your Local Environment (5 minutes)

```bash
# Make sure you're on main branch
git checkout main

# Run the interactive setup
npm run setup:env

# This will:
# - Check for required tools (Convex, Solana CLI)
# - Help you create .env.local
# - Guide you through configuration
```

### 2️⃣ Start Local Development (Now!)

```bash
# Terminal 1: Start Next.js frontend
npm run dev

# Terminal 2: Start Convex backend
npm run convex:dev
```

Visit: http://localhost:3000

### 3️⃣ Test Everything Locally (Today)

- [ ] User registration/login works
- [ ] Can view franchises
- [ ] Wallets display correctly
- [ ] All pages load without errors

### 4️⃣ Prepare Devnet Deployment (This Week)

```bash
# Switch to devnet branch
git checkout devnet

# Make sure it's up to date with main
git merge main

# Push to create remote branch
git push -u origin devnet
```

Then deploy to Vercel (you can create a separate project or use preview deployments)

### 5️⃣ Fund Your Devnet Wallets (When Testing)

```bash
# Fund wallets with test SOL (FREE)
npm run wallet:fund:devnet

# Or manually for specific wallet:
solana airdrop 2 <WALLET_ADDRESS> --url devnet
```

### 6️⃣ Test on Devnet (This Week)

Once devnet is deployed:
- Create test franchises
- Test funding flows
- Make test transactions
- Verify in Solana Explorer: https://explorer.solana.com/?cluster=devnet

### 7️⃣ Prepare for Production (Next Week)

Read and follow:
1. `docs/DEPLOYMENT_SUMMARY.md` - Overview
2. `docs/DUAL_ENVIRONMENT_DEPLOYMENT.md` - Complete guide
3. `docs/DEPLOYMENT_CHECKLIST.md` - Step-by-step

Key tasks:
- [ ] Create Convex production environment
- [ ] Upgrade wallet encryption to AES
- [ ] Set up monitoring
- [ ] Configure backups

### 8️⃣ Deploy to Production (When Ready)

```bash
# Switch to main branch
git checkout main

# Deploy Convex to production
npx convex deploy --prod

# Push to deploy frontend (auto-deploy from main)
git push origin main
```

Then monitor closely for 24-48 hours!

---

## 📚 Key Documentation

| What You Need | Read This |
|---------------|-----------|
| Quick setup | `docs/QUICK_START.md` |
| Understand environments | `docs/ENVIRONMENT_COMPARISON.md` |
| Executive overview | `docs/DEPLOYMENT_SUMMARY.md` |
| Complete deployment | `docs/DUAL_ENVIRONMENT_DEPLOYMENT.md` |
| Step-by-step checklist | `docs/DEPLOYMENT_CHECKLIST.md` |
| Command reference | Keep `docs/DEPLOYMENT_QUICK_REFERENCE.md` open |

---

## 🔧 Useful Commands

```bash
# Development
npm run dev                    # Start frontend
npm run convex:dev            # Start backend
npm run build                 # Test build

# Convex Management  
npm run convex:logs:dev       # Watch dev logs
npm run convex:logs:prod      # Watch prod logs
npm run convex:env:dev        # List dev vars
npm run convex:env:prod       # List prod vars

# Deployment
git checkout devnet && git push    # Deploy to devnet
git checkout main && git push      # Deploy to production
npx convex deploy --prod           # Deploy Convex to prod

# Wallets
npm run wallet:fund:devnet    # Fund devnet wallets
npm run wallet:verify         # Verify setup
solana balance <ADDRESS> --url devnet    # Check balance
```

---

## 🌍 Your Environment URLs

### Local Development
- Frontend: http://localhost:3000
- Convex: Will be shown when you run `npm run convex:dev`

### Devnet (Once Deployed)
- Frontend: https://your-preview-url.vercel.app (or dev.franchiseen.com)
- Convex: Your dev deployment URL
- Solana: https://explorer.solana.com/?cluster=devnet

### Production (When Ready)
- Frontend: https://franchiseen.com
- Convex: Your prod deployment URL  
- Solana: https://explorer.solana.com/

---

## ⚠️ Important Reminders

1. **Always test on devnet first** - Never skip this!
2. **Upgrade encryption before mainnet** - Current base64 is NOT secure for production
3. **Monitor production 24/7** - Set up alerts
4. **Backup regularly** - Especially before major changes
5. **Use different keys** - Dev and prod must have different encryption keys

---

## 💡 Pro Tips

✅ Keep `docs/DEPLOYMENT_QUICK_REFERENCE.md` open during deployment  
✅ Use devnet liberally - it's free!  
✅ Document all production changes  
✅ Have rollback plan ready  
✅ Start with small real transactions on mainnet  

---

## 🆘 Need Help?

### Can't find something?
- Check `docs/DEPLOYMENT_DOCUMENTATION_INDEX.md` for complete doc index

### Technical issues?
- Convex: https://convex.dev/community  
- Solana: https://solana.com/community
- Vercel: Check status at https://www.vercel-status.com/

### Deployment questions?
- Read `docs/DEPLOYMENT_SUMMARY.md` for overview
- Follow `docs/DEPLOYMENT_CHECKLIST.md` step by step

---

## ✅ Right Now, Do This:

1. Run: `npm run setup:env`
2. Start: `npm run dev` and `npm run convex:dev`
3. Test: Visit http://localhost:3000
4. Read: `docs/QUICK_START.md`

---

**You're all set! Happy coding! 🚀**

*Delete this file once you've completed the initial setup*
