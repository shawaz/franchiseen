# Vercel Deployment Guide

## Issues Fixed

✅ **Build Errors Fixed:**
- Added missing `convex.json` configuration file
- Removed conflicting CORS headers from Next.js config
- Fixed TypeScript errors in components
- Cleaned up unused imports and variables

## Why Use Helius RPC?

🚀 **Helius RPC Benefits:**
- **10x faster** than default Solana RPC endpoints
- **Higher rate limits** (1000+ requests/second)
- **Enhanced APIs** (getAsset, getAssetProof, etc.)
- **Webhook support** for real-time updates
- **Better reliability** with 99.9% uptime
- **Advanced features** like compressed NFTs support

## Required Environment Variables

You need to set these environment variables in your Vercel dashboard:

### 🔑 **Required Variables:**

1. **Convex Configuration:**
   ```
   NEXT_PUBLIC_CONVEX_URL=https://your-convex-deployment.convex.cloud
   ```

2. **Google Maps API:**
   ```
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   ```

3. **Uploadcare (Optional):**
   ```
   NEXT_PUBLIC_UPLOADCARE_PUBLIC_KEY=your_uploadcare_public_key
   ```

4. **Solana Configuration (Helius RPC Recommended):**
   ```
   # Helius RPC (Recommended for better performance)
   NEXT_PUBLIC_HELIUS_RPC_URL=https://mainnet.helius-rpc.com/?api-key=YOUR_HELIUS_API_KEY
   NEXT_PUBLIC_HELIUS_DEVNET_RPC_URL=https://devnet.helius-rpc.com/?api-key=YOUR_HELIUS_API_KEY
   
   # Fallback RPC endpoints
   NEXT_PUBLIC_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
   NEXT_PUBLIC_SOLANA_DEVNET_RPC_URL=https://api.devnet.solana.com
   NEXT_PUBLIC_USE_REAL_WALLETS=false
   ```

5. **Environment:**
   ```
   NEXT_PUBLIC_APP_ENV=production
   ```

## How to Get Helius API Key

1. **Sign up at [Helius](https://helius.dev/)**
2. **Create a new project**
3. **Copy your API key** from the dashboard
4. **Use the RPC URLs** provided by Helius

**Example Helius RPC URLs:**
```
Mainnet: https://mainnet.helius-rpc.com/?api-key=YOUR_API_KEY
Devnet: https://devnet.helius-rpc.com/?api-key=YOUR_API_KEY
```

## How to Set Environment Variables in Vercel

1. Go to your Vercel dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add each variable with the correct value
5. Make sure to set them for **Production**, **Preview**, and **Development** environments

## Deployment Steps

1. **Push to GitHub:**
   ```bash
   git push origin main
   ```

2. **Vercel will automatically deploy** when you push to the main branch

3. **Check deployment logs** in Vercel dashboard if there are issues

## Common Issues & Solutions

### ❌ **"Convex URL not found"**
- Make sure `NEXT_PUBLIC_CONVEX_URL` is set correctly
- Verify your Convex deployment is running

### ❌ **"Google Maps API key not found"**
- Set `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` in Vercel
- Make sure the API key has the correct permissions

### ❌ **Build fails with TypeScript errors**
- All TypeScript errors have been fixed
- If new errors appear, run `npm run build` locally first

### ❌ **CORS errors**
- CORS headers are now handled by Vercel automatically
- Removed conflicting custom CORS configuration

## Verification

After deployment, check:
- ✅ Homepage loads correctly
- ✅ Authentication works
- ✅ Maps functionality works (if API key is set)
- ✅ Database connections work (Convex)

## Support

If you still encounter issues:
1. Check Vercel deployment logs
2. Verify all environment variables are set
3. Test the build locally with `npm run build`
4. Check Convex dashboard for database status
