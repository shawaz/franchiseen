# Mainnet Deployment Guide

## 🚀 **Deploying from Testnet to Mainnet**

Your project has two main components to deploy:
1. **Convex Backend** (Database & API)
2. **Next.js Frontend** (Vercel)

---

## 📊 **Step 1: Deploy Convex to Production**

### Create Production Environment:
```bash
# Create a new production environment
npx convex env add production

# Deploy your functions to production
npx convex deploy --prod

# Set production environment variables
npx convex env set AUTH_SECRET "your-production-auth-secret" --prod
npx convex env set RESEND_API_KEY "your-production-resend-key" --prod
```

### Get Production Convex URL:
```bash
# Get your production Convex deployment URL
npx convex env get NEXT_PUBLIC_CONVEX_URL --prod
```

---

## 🌐 **Step 2: Deploy Frontend to Vercel**

### Update Environment Variables in Vercel:

1. **Go to Vercel Dashboard** → Your Project → Settings → Environment Variables

2. **Add/Update these variables:**

```bash
# Convex Production URL
NEXT_PUBLIC_CONVEX_URL=https://your-production-deployment.convex.cloud

# Solana Mainnet Configuration
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
NEXT_PUBLIC_USE_REAL_WALLETS=true

# Google Maps (if using)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_production_maps_key

# Uploadcare (if using)
NEXT_PUBLIC_UPLOADCARE_PUBLIC_KEY=your_production_uploadcare_key

# Environment
NEXT_PUBLIC_APP_ENV=production
```

### Deploy to Vercel:
```bash
# Push to main branch to trigger deployment
git push origin main

# Or deploy manually
vercel --prod
```

---

## 🔧 **Step 3: Update Solana Configuration**

### Update Solana CLI for Mainnet:
```bash
# Set Solana CLI to mainnet
solana config set --url https://api.mainnet-beta.solana.com

# Verify configuration
solana config get
```

### Update Your Application:
Your app will automatically use mainnet when you set:
```bash
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
NEXT_PUBLIC_USE_REAL_WALLETS=true
```

---

## ✅ **Step 4: Verification Checklist**

### Convex Backend:
- [ ] Production environment created
- [ ] Functions deployed to production
- [ ] Environment variables set
- [ ] Database accessible
- [ ] API endpoints working

### Vercel Frontend:
- [ ] Environment variables updated
- [ ] Build successful
- [ ] Deployment live
- [ ] Mainnet RPC configured
- [ ] Real wallets enabled

### Testing:
- [ ] User authentication works
- [ ] Database operations work
- [ ] Solana wallet connections work
- [ ] All features functional

---

## 🎯 **Important Notes**

### **Real Money vs Test Money:**
- **Testnet**: Uses test SOL (no real value)
- **Mainnet**: Uses real SOL (real money)

### **Security Considerations:**
- Use production-ready API keys
- Ensure all secrets are properly configured
- Test thoroughly before going live
- Monitor for any issues

### **Rollback Plan:**
- Keep testnet deployment as backup
- Document all environment variables
- Have rollback procedure ready

---

## 🆘 **Troubleshooting**

### Common Issues:
1. **Convex URL mismatch**: Ensure production URL is set correctly
2. **Environment variables**: Double-check all variables are set
3. **Build failures**: Check for missing dependencies
4. **Wallet connections**: Verify RPC endpoints are correct

### Support:
- Convex: [docs.convex.dev](https://docs.convex.dev)
- Vercel: [vercel.com/docs](https://vercel.com/docs)
- Solana: [docs.solana.com](https://docs.solana.com)

