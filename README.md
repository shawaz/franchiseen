# Franchiseen - Blockchain-Powered Franchise Platform

A Next.js platform for franchise management with real Solana blockchain integration, enabling tokenized franchise ownership, transparent transactions, and automated payouts.

![Platform Status](https://img.shields.io/badge/status-active-success)
![Blockchain](https://img.shields.io/badge/blockchain-solana-blue)
![License](https://img.shields.io/badge/license-private-red)

---

## 🌟 Features

- **Real Solana Integration** - On-chain transactions visible in Solana Explorer
- **Tokenized Franchises** - Fractional ownership through blockchain tokens
- **Automated Wallets** - Real wallet generation for franchises and brands
- **Smart Transactions** - Automated fund distribution (working capital, fees, setup costs)
- **POS System** - Point-of-sale billing for franchise operations
- **Investor Dashboard** - Track investments and returns
- **Multi-Role System** - Admin, franchiser, franchise, investor roles
- **Real-Time Updates** - Convex backend for instant synchronization

---

## 🚀 Quick Start

### For Developers

```bash
# 1. Clone and install
git clone <repository>
cd franchiseen
npm install

# 2. Setup environment
npm run setup:env

# 3. Start development
npm run dev              # Frontend (http://localhost:3000)
npm run convex:dev       # Backend
```

See **[QUICK_START.md](./QUICK_START.md)** for detailed instructions.

### For Deployment

See **[DEPLOYMENT_SUMMARY.md](./DEPLOYMENT_SUMMARY.md)** for executive overview.

---

## 📚 Documentation

### Getting Started
- **[QUICK_START.md](./QUICK_START.md)** - Get running in 5 minutes
- **[DEPLOYMENT_SUMMARY.md](./DEPLOYMENT_SUMMARY.md)** - Executive overview
- **[ENVIRONMENT_COMPARISON.md](./ENVIRONMENT_COMPARISON.md)** - Devnet vs Mainnet

### Deployment Guides
- **[DUAL_ENVIRONMENT_DEPLOYMENT.md](./DUAL_ENVIRONMENT_DEPLOYMENT.md)** - Complete deployment strategy (12 phases)
- **[DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)** - Step-by-step verification checklist
- **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - Vercel deployment guide
- **[MAINNET_DEPLOYMENT.md](./MAINNET_DEPLOYMENT.md)** - Mainnet-specific guide

### Technical Guides
- **[SOLANA_TRANSACTIONS_GUIDE.md](./SOLANA_TRANSACTIONS_GUIDE.md)** - Understanding blockchain transactions
- **[WALLET_FUNDING_GUIDE.md](./WALLET_FUNDING_GUIDE.md)** - How to fund wallets
- **[PAYOUT_SYSTEM_GUIDE.md](./PAYOUT_SYSTEM_GUIDE.md)** - Payout calculations
- **[ROUTE_PROTECTION.md](./ROUTE_PROTECTION.md)** - Authentication and authorization

---

## 🏗️ Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **React 19** - UI library
- **Tailwind CSS 4** - Styling
- **Radix UI** - Component primitives
- **Framer Motion** - Animations
- **Gill** - Solana wallet UI components

### Backend
- **Convex** - Real-time database and API
- **Convex Auth** - Authentication system
- **Resend** - Email service

### Blockchain
- **Solana** - Blockchain platform
- **@solana/web3.js** - Solana JavaScript SDK
- **@solana/spl-token** - Token operations

### Development
- **TypeScript** - Type safety
- **ESLint** - Code linting
- **Prettier** - Code formatting

---

## 🌍 Environments

The platform runs on two completely separate environments:

| Environment | URL | Database | Blockchain | Purpose |
|-------------|-----|----------|------------|---------|
| **Development** | dev.franchiseen.com | Convex Dev | Solana Devnet | Testing |
| **Production** | franchiseen.com | Convex Prod | Solana Mainnet | Live |

**Cost:**
- Development: **FREE** (test SOL, free tier)
- Production: **~$50-125/month** (scales with usage)

See **[ENVIRONMENT_COMPARISON.md](./ENVIRONMENT_COMPARISON.md)** for detailed comparison.

---

## 📋 Project Structure

```
franchiseen/
├── convex/                      # Backend (Convex functions)
│   ├── franchiseManagement.ts  # Franchise operations
│   ├── walletKeypairs.ts       # Wallet management
│   ├── solanaTransactions.ts   # Blockchain transactions
│   ├── payoutManagement.ts     # Payout calculations
│   └── schema.ts               # Database schema
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (admin)/           # Admin pages
│   │   ├── (platform)/        # Platform pages
│   │   └── (public)/          # Public pages
│   ├── components/             # React components
│   │   ├── app/               # Application components
│   │   └── ui/                # Reusable UI components
│   ├── lib/                    # Utilities
│   ├── hooks/                  # Custom React hooks
│   └── types/                  # TypeScript types
├── scripts/                    # Utility scripts
│   ├── setup-environment.sh   # Environment setup
│   ├── fundWallets.js         # Wallet funding
│   └── verifyWallets.js       # Wallet verification
└── [Documentation files]       # Comprehensive guides
```

---

## 🔑 Environment Variables

### Frontend (NEXT_PUBLIC_*)

```bash
NEXT_PUBLIC_CONVEX_URL=              # Convex deployment URL
NEXT_PUBLIC_SOLANA_NETWORK=          # devnet or mainnet-beta
NEXT_PUBLIC_SOLANA_RPC_URL=          # Solana RPC endpoint
NEXT_PUBLIC_APP_ENV=                 # development or production
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=    # Google Maps
NEXT_PUBLIC_UPLOADCARE_PUBLIC_KEY=  # Uploadcare
```

### Backend (Convex)

```bash
# Set using: npx convex env set VARIABLE_NAME "value" --prod
WALLET_ENCRYPTION_KEY=               # Wallet encryption (64-char hex)
AUTH_SECRET=                         # Authentication secret (32-char hex)
RESEND_API_KEY=                      # Email service
OPENAI_API_KEY=                      # AI features (optional)
```

See example files:
- `.env.devnet.example` - Development environment
- `.env.mainnet.example` - Production environment

---

## 🚀 Available Scripts

### Development

```bash
npm run dev                    # Start Next.js dev server
npm run convex:dev            # Start Convex backend
npm run build                 # Build for production
npm run lint                  # Run ESLint
npm run format                # Format code with Prettier
```

### Convex Management

```bash
npm run convex:deploy:prod    # Deploy to production
npm run convex:logs:dev       # Watch dev logs
npm run convex:logs:prod      # Watch prod logs
npm run convex:env:dev        # List dev environment vars
npm run convex:env:prod       # List prod environment vars
```

### Deployment

```bash
npm run setup:env             # Setup environment variables
npm run deploy:devnet         # Deploy to devnet
npm run deploy:mainnet        # Deploy to mainnet
```

### Wallet Management

```bash
npm run wallet:fund:devnet    # Fund devnet wallets
npm run wallet:verify         # Verify wallet setup
```

---

## 🔐 Security

### Current Implementation
✅ Real Solana wallets with keypairs  
✅ Secret keys stored encrypted  
✅ On-chain transactions working  
✅ Role-based access control  

### Before Production
⚠️ Upgrade encryption from base64 to AES-256  
⚠️ Implement rate limiting  
⚠️ Add transaction validation  
⚠️ Set up monitoring and alerts  
⚠️ Configure regular backups  

See **Phase 6** in [DUAL_ENVIRONMENT_DEPLOYMENT.md](./DUAL_ENVIRONMENT_DEPLOYMENT.md) for security hardening steps.

---

## 🧪 Testing

### Local Testing

```bash
# Start development servers
npm run dev
npm run convex:dev

# Run tests (if configured)
npm test
```

### Devnet Testing

Deploy to devnet and test:
- User registration and login
- Franchise creation and approval
- Token purchases
- Wallet operations
- Transaction execution
- POS billing
- Payout calculations

### Production Testing

After deployment, verify:
- Basic functionality (smoke test)
- Critical user paths
- Small real transaction
- Monitoring systems

See **[DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)** for complete testing checklist.

---

## 📊 Monitoring

### Development
- Convex Dashboard: https://dashboard.convex.dev
- Solana Explorer: https://explorer.solana.com/?cluster=devnet
- Vercel: https://vercel.com/dashboard

### Production
- Convex Dashboard: https://dashboard.convex.dev (monitor 24/7)
- Solana Explorer: https://explorer.solana.com/ (verify all transactions)
- Vercel Analytics: Built-in performance monitoring

---

## 🤝 Contributing

1. Create a feature branch from `devnet`
2. Make your changes
3. Test locally
4. Push and create PR to `devnet`
5. After testing on devnet, merge to `main`

### Branch Strategy

```
main          → Production (mainnet)
  ↓
devnet        → Development (devnet)
  ↓
feature/*     → Local development
```

---

## 📞 Support

### Documentation
Start with **[QUICK_START.md](./QUICK_START.md)** for immediate help.

### External Resources
- **Convex:** https://docs.convex.dev
- **Next.js:** https://nextjs.org/docs
- **Solana:** https://docs.solana.com
- **Vercel:** https://vercel.com/docs

### Community
- Convex Discord: https://convex.dev/community
- Solana Discord: https://solana.com/community

---

## 📝 License

Private - All rights reserved

---

## 🎯 Roadmap

### Phase 1: Foundation ✅
- [x] Platform architecture
- [x] User authentication
- [x] Role-based access
- [x] Basic franchise management

### Phase 2: Blockchain Integration ✅
- [x] Real wallet generation
- [x] On-chain transactions
- [x] Solana devnet integration
- [x] Transaction tracking

### Phase 3: Core Features ✅
- [x] Franchise funding flow
- [x] POS system
- [x] Expense management
- [x] Payout system

### Phase 4: Production Ready (In Progress)
- [ ] Security hardening
- [ ] Performance optimization
- [ ] Monitoring setup
- [ ] Documentation complete

### Phase 5: Launch
- [ ] Deploy to mainnet
- [ ] Beta testing
- [ ] Public launch
- [ ] Marketing

### Phase 6: Growth
- [ ] Additional features
- [ ] Scale infrastructure
- [ ] Expand to more chains
- [ ] Mobile apps

---

## 🙏 Acknowledgments

Built with:
- [Next.js](https://nextjs.org/) - React framework
- [Convex](https://convex.dev/) - Backend platform
- [Solana](https://solana.com/) - Blockchain platform
- [Gill](https://gill.site/) - Wallet UI components
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework

---

## 📧 Contact

For questions or support:
- Technical issues: Open an issue
- Security concerns: security@franchiseen.com
- General inquiries: info@franchiseen.com

---

**Built with ❤️ for the future of franchising**

🚀 Ready to deploy? Start with **[DEPLOYMENT_SUMMARY.md](./DEPLOYMENT_SUMMARY.md)**
