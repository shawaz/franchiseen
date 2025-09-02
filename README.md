# Franchiseen - Multi-Tenant Fintech Franchise Management and Crowdfunding Platform

A comprehensive multi-tenant fintech platform that enables franchise management with integrated financial services, payment processing, and blockchain capabilities. Built for franchise networks to manage operations, finances, and payments across multiple locations.

## Architecture Overview

### Multi-Tenant Strategy
- **Database-per-tenant**: Each franchise gets their own database schema for complete data isolation
- **Shared application layer**: Single codebase serves all franchises with franchise-specific configurations
- **Subdomain routing**: Each franchise accessible via `{franchise-name}.franchiseen.com`

### Technology Stack

#### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js with Helmet for security
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with refresh tokens
- **API**: RESTful APIs + GraphQL for complex queries
- **File Storage**: AWS S3 or compatible storage
- **Queue System**: Redis with Bull for background jobs
- **Caching**: Redis for session and data caching
- **Blockchain**: Solana integration with Solana Pay

#### Frontend
- **Framework**: React 18 with TypeScript
- **State Management**: Zustand + React Query
- **Styling**: Tailwind CSS with Headless UI
- **Build Tool**: Vite
- **Testing**: Jest + React Testing Library

#### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Reverse Proxy**: Nginx
- **Monitoring**: Prometheus + Grafana
- **Logging**: Winston with structured logging

## Project Structure

```
franchiseen/
├── apps/
│   ├── api/                 # Backend API server
│   ├── admin-dashboard/     # Platform admin interface
│   ├── franchise-dashboard/ # Franchise owner dashboard
│   └── client-portal/       # Client-facing portal
├── packages/
│   ├── database/            # Database schemas and migrations
│   ├── shared/              # Shared utilities and types
│   ├── ui/                  # Shared UI components
│   └── config/              # Shared configuration
├── infrastructure/
│   ├── docker/              # Docker configurations
│   ├── nginx/               # Nginx configurations
│   └── monitoring/          # Monitoring setup
└── docs/                    # Documentation
```

## Key Features

### For Platform Administrators
- Franchise network management and provisioning
- Revenue sharing and commission tracking
- Platform-wide analytics and monitoring
- Compliance and regulatory oversight
- Global financial settings and configurations

### For Franchise Owners
- Complete franchise operations management
- Financial dashboard and reporting
- Payment processing and settlement
- Client relationship management
- Revenue analytics and forecasting
- Multi-gateway payment integration (Stripe, PayPal, Solana Pay)
- Commission and fee management
- Crypto payment acceptance (SOL, USDC, USDT)
- Automated financial reconciliation

### For Clients
- Secure client portal experience
- Service browsing and selection
- Payment processing and history
- Account management and statements
- Transaction tracking and receipts
- Document management
- Crypto payments with Solana Pay (scan QR code or connect wallet)
- Instant, low-cost financial transactions

## Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn
- PostgreSQL 14+
- Redis 6+
- Docker and Docker Compose (optional)

### Development Setup
```bash
# Clone the repository
git clone <repository-url>
cd franchiseen

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Start development servers
npm run dev
```

### Frontend Applications

The platform includes three React-based frontend applications:

#### 🔧 Admin Dashboard (Port 3000)
- **Purpose**: Platform administration and franchise management
- **Users**: Platform administrators
- **Features**: Franchise oversight, user management, system monitoring

#### 🏢 Franchise Dashboard (Port 3002)
- **Purpose**: Franchise operations and client management
- **Users**: Franchise owners and staff
- **Features**: Client KYC, transaction processing, Solana Pay integration

#### 👤 Client Portal (Port 3003)
- **Purpose**: Financial services and account management
- **Users**: End clients (individuals, businesses, corporations)
- **Features**: Multi-account banking, crypto payments, transaction history

### Quick Start - Frontend Only
```bash
# Install dependencies for all apps
npm install

# Start all frontend applications
cd apps/admin-dashboard && npm run dev &     # Port 3000
cd apps/franchise-dashboard && npm run dev & # Port 3002
cd apps/client-portal && npm run dev &       # Port 3003

# Demo credentials available in each login page
```

## Solana Pay Integration

Franchiseen is one of the first e-commerce platforms to integrate **Solana Pay**, enabling instant, low-cost cryptocurrency payments.

### Supported Cryptocurrencies
- **SOL**: Native Solana token
- **USDC**: USD Coin stablecoin
- **USDT**: Tether USD stablecoin

### Key Features
- **QR Code Payments**: Customers scan QR codes with Solana wallets
- **Wallet Integration**: Direct connection to popular Solana wallets
- **Instant Settlement**: Transactions confirm in seconds
- **Low Fees**: Minimal transaction costs compared to traditional payments
- **Real-time Validation**: Automatic payment verification on-chain
- **Multi-network Support**: Mainnet, Devnet, and Testnet

### Payment Flow
1. Customer selects Solana Pay at checkout
2. System generates payment request with QR code
3. Customer scans QR code or connects wallet
4. Transaction is broadcast to Solana blockchain
5. Payment is validated and order is confirmed
6. Merchant receives funds instantly

### Configuration
```bash
# Set up your Solana merchant wallet
SOLANA_NETWORK=devnet
SOLANA_MERCHANT_WALLET=your_wallet_address_here
SOLANA_RPC_URL=https://api.devnet.solana.com
```

## Multi-Tenant Implementation

### Database Schema Design
- **Platform Level**: Global tables for tenants, users, subscriptions
- **Tenant Level**: Isolated schemas for each store's data
- **Shared Resources**: Common lookups, configurations, and templates
- **Blockchain Data**: Solana transaction records and payment requests

### Request Flow
1. Subdomain extraction from request
2. Tenant identification and validation
3. Database connection routing
4. Request processing with tenant context
5. Response with tenant-specific data

### Security Considerations
- Complete data isolation between tenants
- Role-based access control (RBAC)
- API rate limiting per tenant
- Secure file upload and storage
- SQL injection prevention
- XSS and CSRF protection
- Blockchain transaction validation

## 🚀 Deployment

### Netlify Deployment (Recommended)

Deploy all three frontend applications to Netlify with one command:

```bash
# Run the deployment preparation script
./scripts/deploy.sh

# Follow the interactive prompts for Netlify setup
```

**Manual Deployment Steps:**
1. Push your code to GitHub
2. Connect each app to Netlify:
   - **Admin Dashboard**: `apps/admin-dashboard` → `dist`
   - **Franchise Dashboard**: `apps/franchise-dashboard` → `dist`
   - **Client Portal**: `apps/client-portal` → `dist`
3. Set environment variables in Netlify dashboard
4. Deploy!

**📖 Detailed deployment guide:** [DEPLOYMENT.md](DEPLOYMENT.md)

### Live Demo URLs (After Deployment)
- **Admin Dashboard**: `https://admin.franchiseen.com`
- **Franchise Dashboard**: `https://dashboard.franchiseen.com`
- **Client Portal**: `https://portal.franchiseen.com`

## Development Roadmap

1. **Phase 1**: ✅ Core infrastructure and multi-tenant setup
2. **Phase 2**: ✅ Authentication and basic CRUD operations
3. **Phase 3**: ✅ Frontend applications with modern React stack
4. **Phase 4**: ✅ Solana Pay integration and crypto payments
5. **Phase 5**: 🚧 Backend API and database implementation
6. **Phase 6**: 📋 Advanced analytics and reporting features

## Contributing

Please read our contributing guidelines and code of conduct before submitting pull requests.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
