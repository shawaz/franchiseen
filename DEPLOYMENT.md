# Franchiseen Platform - Netlify Deployment Guide

This guide will help you deploy all three Franchiseen frontend applications to Netlify.

## 🚀 Quick Deployment Overview

We'll deploy three separate applications:
1. **Admin Dashboard** - Platform administration
2. **Franchise Dashboard** - Franchise owner operations  
3. **Client Portal** - End-user financial services

## 📋 Prerequisites

- [Netlify account](https://netlify.com) (free tier works)
- [GitHub account](https://github.com) with your code repository
- [Git](https://git-scm.com/) installed locally

## 🔧 Step 1: Prepare Your Repository

### 1.1 Push to GitHub
```bash
# Initialize git repository (if not already done)
git init
git add .
git commit -m "Initial commit: Franchiseen platform"

# Add your GitHub repository as remote
git remote add origin https://github.com/yourusername/franchiseen.git
git branch -M main
git push -u origin main
```

### 1.2 Verify File Structure
Ensure your repository has this structure:
```
franchiseen/
├── apps/
│   ├── admin-dashboard/
│   │   ├── netlify.toml
│   │   ├── package.json
│   │   └── src/
│   ├── franchise-dashboard/
│   │   ├── netlify.toml
│   │   ├── package.json
│   │   └── src/
│   └── client-portal/
│       ├── netlify.toml
│       ├── package.json
│       └── src/
└── packages/
    └── shared/
```

## 🌐 Step 2: Deploy to Netlify

### 2.1 Deploy Admin Dashboard

1. **Go to [Netlify Dashboard](https://app.netlify.com/)**
2. **Click "Add new site" → "Import an existing project"**
3. **Connect to GitHub** and select your repository
4. **Configure build settings:**
   - **Base directory:** `apps/admin-dashboard`
   - **Build command:** `npm run build`
   - **Publish directory:** `apps/admin-dashboard/dist`
   - **Production branch:** `main`

5. **Set environment variables:**
   ```
   VITE_API_URL=https://your-api-domain.com/api/v1
   VITE_APP_NAME=Franchiseen Admin Dashboard
   VITE_APP_VERSION=1.0.0
   ```

6. **Deploy!** Netlify will automatically build and deploy your app.

### 2.2 Deploy Franchise Dashboard

1. **Create a new site** (repeat the process)
2. **Configure build settings:**
   - **Base directory:** `apps/franchise-dashboard`
   - **Build command:** `npm run build`
   - **Publish directory:** `apps/franchise-dashboard/dist`

3. **Set environment variables:**
   ```
   VITE_API_URL=https://your-api-domain.com/api/v1
   VITE_APP_NAME=Franchiseen Franchise Dashboard
   VITE_APP_VERSION=1.0.0
   ```

### 2.3 Deploy Client Portal

1. **Create a new site** (repeat the process)
2. **Configure build settings:**
   - **Base directory:** `apps/client-portal`
   - **Build command:** `npm run build`
   - **Publish directory:** `apps/client-portal/dist`

3. **Set environment variables:**
   ```
   VITE_API_URL=https://your-api-domain.com/api/v1
   VITE_APP_NAME=Franchiseen Client Portal
   VITE_APP_VERSION=1.0.0
   ```

## 🎯 Step 3: Configure Custom Domains (Optional)

### 3.1 Set Up Custom Domains
For each application, you can set up custom domains:

- **Admin Dashboard:** `admin.franchiseen.com`
- **Franchise Dashboard:** `dashboard.franchiseen.com`
- **Client Portal:** `portal.franchiseen.com`

### 3.2 Configure DNS
Add these DNS records to your domain provider:
```
admin.franchiseen.com    CNAME    your-admin-site.netlify.app
dashboard.franchiseen.com CNAME   your-franchise-site.netlify.app
portal.franchiseen.com   CNAME    your-client-site.netlify.app
```

## 🔒 Step 4: Enable HTTPS & Security

Netlify automatically provides:
- ✅ **Free SSL certificates**
- ✅ **HTTPS redirects**
- ✅ **Security headers** (configured in netlify.toml)
- ✅ **DDoS protection**

## 📊 Step 5: Monitor Deployments

### 5.1 Build Status
Monitor your deployments at:
- Admin: `https://app.netlify.com/sites/your-admin-site`
- Franchise: `https://app.netlify.com/sites/your-franchise-site`
- Client: `https://app.netlify.com/sites/your-client-site`

### 5.2 Analytics
Enable Netlify Analytics for traffic insights:
1. Go to your site dashboard
2. Click "Analytics" tab
3. Enable analytics ($9/month per site)

## 🚀 Step 6: Continuous Deployment

### 6.1 Automatic Deployments
Netlify automatically deploys when you push to your main branch:
```bash
git add .
git commit -m "Update: New features"
git push origin main
```

### 6.2 Deploy Previews
Netlify creates preview deployments for pull requests:
- Each PR gets a unique preview URL
- Perfect for testing before merging

## 🔧 Troubleshooting

### Common Issues & Solutions

#### Build Failures
```bash
# Check build logs in Netlify dashboard
# Common fixes:
1. Ensure Node.js version is 18+ in netlify.toml
2. Check package.json dependencies
3. Verify build command is correct
```

#### Environment Variables
```bash
# Make sure all VITE_ prefixed variables are set
# Variables are case-sensitive
# Redeploy after changing environment variables
```

#### Routing Issues
```bash
# SPA routing is handled by netlify.toml redirects
# All routes redirect to index.html with 200 status
```

## 📱 Step 7: Test Your Deployments

### 7.1 Functionality Testing
Test each application:
- ✅ **Login/logout flows**
- ✅ **Navigation between pages**
- ✅ **API connectivity** (will show errors until backend is deployed)
- ✅ **Responsive design on mobile**

### 7.2 Performance Testing
Use tools like:
- [Google PageSpeed Insights](https://pagespeed.web.dev/)
- [GTmetrix](https://gtmetrix.com/)
- [WebPageTest](https://webpagetest.org/)

## 🎉 Success! Your Apps Are Live

After successful deployment, you'll have:

### 🔧 **Admin Dashboard**
- **URL:** `https://your-admin-site.netlify.app`
- **Purpose:** Platform administration and franchise management
- **Users:** Platform administrators

### 🏢 **Franchise Dashboard**  
- **URL:** `https://your-franchise-site.netlify.app`
- **Purpose:** Franchise operations and client management
- **Users:** Franchise owners and staff

### 👤 **Client Portal**
- **URL:** `https://your-client-site.netlify.app`
- **Purpose:** Financial services and account management
- **Users:** End clients (individuals, businesses, corporations)

## 🔄 Next Steps

1. **Deploy Backend API** (separate guide needed)
2. **Configure API endpoints** in environment variables
3. **Set up monitoring and alerts**
4. **Configure backup strategies**
5. **Implement CI/CD pipelines**

## 📞 Support

If you encounter issues:
1. Check [Netlify Documentation](https://docs.netlify.com/)
2. Review build logs in Netlify dashboard
3. Check GitHub repository for latest updates
4. Contact support team

---

**🎊 Congratulations!** Your Franchiseen platform is now live on Netlify with enterprise-grade hosting, security, and performance!
