# 🚀 Deployment Quick Reference Card

**Print this or keep it open while deploying!**

---

## 📋 Pre-Deployment Checklist

```
[ ] All features tested on devnet
[ ] Security audit complete
[ ] Encryption upgraded to AES
[ ] Rate limiting implemented
[ ] Monitoring configured
[ ] Backups set up
[ ] Team trained
[ ] Rollback plan ready
```

---

## 🔧 Essential Commands

### Setup
```bash
npm install
npm run setup:env
```

### Development
```bash
npm run dev                    # Frontend
npm run convex:dev            # Backend
```

### Deployment - Devnet
```bash
git checkout devnet
git push origin devnet
```

### Deployment - Mainnet
```bash
git checkout main
git push origin main
npx convex deploy --prod
```

### Monitoring
```bash
npm run convex:logs:dev
npm run convex:logs:prod
```

### Wallet Funding
```bash
# Devnet (FREE)
solana airdrop 2 <ADDRESS> --url devnet

# Mainnet (REAL MONEY)
solana transfer <ADDRESS> 10 --url mainnet-beta
```

---

## 🌍 Environment URLs

### Devnet (Testing)
- Frontend: https://dev.franchiseen.com
- Convex: https://dashboard.convex.dev/d/[DEV-ID]
- Solana: https://explorer.solana.com/?cluster=devnet

### Mainnet (Production)
- Frontend: https://franchiseen.com
- Convex: https://dashboard.convex.dev/d/[PROD-ID]
- Solana: https://explorer.solana.com/

---

## 🔑 Environment Variables

### Devnet
```bash
NEXT_PUBLIC_CONVEX_URL=https://[dev].convex.cloud
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_APP_ENV=development
```

### Mainnet
```bash
NEXT_PUBLIC_CONVEX_URL=https://[prod].convex.cloud
NEXT_PUBLIC_SOLANA_NETWORK=mainnet-beta
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
NEXT_PUBLIC_APP_ENV=production
```

### Convex Secrets (Backend)
```bash
# Generate and set
npx convex env set WALLET_ENCRYPTION_KEY "$(openssl rand -hex 64)" --prod
npx convex env set AUTH_SECRET "$(openssl rand -hex 32)" --prod
npx convex env set RESEND_API_KEY "your-key" --prod
```

---

## 🆘 Emergency Procedures

### If Build Fails
```bash
npm run build         # Test locally
npm run lint          # Check for errors
```

### If Production Down
```bash
vercel rollback       # Rollback frontend
# Check Convex dashboard for backend
# Check Solana status page
```

### If Transactions Fail
1. Check wallet balance
2. Check Solana network status
3. Check Convex logs
4. Verify RPC endpoint

---

## 📊 What to Monitor

### Daily
- [ ] Convex dashboard (errors, performance)
- [ ] Solana Explorer (transactions)
- [ ] Vercel analytics (uptime, traffic)

### Weekly
- [ ] Database backup
- [ ] Review logs
- [ ] Check costs
- [ ] Security review

### Monthly
- [ ] Full audit
- [ ] Performance review
- [ ] Cost analysis
- [ ] Key rotation

---

## 💰 Cost Reference

### Devnet (Testing)
- Everything: **$0/month**

### Mainnet (Production)
- Convex: ~$25-50/month
- Vercel: $20/month
- Solana: ~$2.50/month
- Total: **~$50-125/month**

---

## 🔐 Security Checklist

```
[ ] Encryption: AES-256 (not base64)
[ ] Keys: Unique per environment
[ ] Rate limiting: Enabled
[ ] Transaction validation: Active
[ ] Monitoring: 24/7
[ ] Backups: Daily
[ ] 2FA: Enabled
[ ] Secrets: Not in code
```

---

## 📞 Quick Links

### Documentation
- Quick Start: `QUICK_START.md`
- Full Guide: `DUAL_ENVIRONMENT_DEPLOYMENT.md`
- Checklist: `DEPLOYMENT_CHECKLIST.md`
- Comparison: `ENVIRONMENT_COMPARISON.md`

### Dashboards
- Convex: https://dashboard.convex.dev
- Vercel: https://vercel.com/dashboard
- Solana: https://explorer.solana.com

### Support
- Convex: https://convex.dev/community
- Vercel: support@vercel.com
- Solana: https://solana.com/community

---

## 🎯 Deployment Flow

```
1. Test locally
   ↓
2. Deploy to devnet
   ↓
3. Test on devnet
   ↓
4. Security audit
   ↓
5. Deploy to mainnet
   ↓
6. Monitor closely
   ↓
7. Gradual rollout
```

---

## ⚡ Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Build fails | `npm run build` locally |
| Convex URL missing | Check `.env.local` |
| No SOL in wallet | `solana airdrop` (devnet) |
| Transaction pending | Check Convex logs |
| Site down | Check Vercel status |
| 404 errors | Clear cache, check routes |

---

## 📈 Success Metrics

### Targets
- Uptime: **99.9%+**
- Transaction success: **>99%**
- Response time: **<2s**
- Error rate: **<1%**

### Monitor In
- Convex dashboard
- Vercel analytics
- Solana Explorer

---

## 🔄 Git Workflow

```bash
# New feature
git checkout devnet
git checkout -b feature/new-thing
# ... develop ...
git push origin feature/new-thing
# ... merge to devnet ...
# ... test ...
# ... merge to main ...

# Hotfix
git checkout main
git checkout -b hotfix/urgent
# ... fix ...
git push origin hotfix/urgent
# ... merge to main ...
# ... backport to devnet ...
```

---

## 💡 Pro Tips

✅ **Always** test on devnet first  
✅ **Monitor** closely after deployment  
✅ **Start small** with mainnet (low volume)  
✅ **Have rollback** plan ready  
✅ **Document** all changes  
✅ **Backup** before major changes  
✅ **Use different keys** per environment  
✅ **Set up alerts** for errors  

---

## 🎬 Quick Start Commands

```bash
# First time setup
git clone <repo>
cd franchiseen
npm install
npm run setup:env

# Daily development
npm run dev & npm run convex:dev

# Deploy to devnet
git checkout devnet && git push

# Deploy to mainnet
git checkout main && git push
npx convex deploy --prod
```

---

## 📱 Contact for Emergencies

- **Technical Lead:** [Your contact]
- **DevOps:** [Your contact]
- **Security:** security@franchiseen.com
- **On-Call:** [Phone number]

---

**Keep this card handy during deployment!**

📚 Full documentation: See all `*.md` files in project root

🚀 **Good luck with your deployment!**

