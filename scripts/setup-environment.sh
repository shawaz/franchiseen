#!/bin/bash

# Franchise Platform - Environment Setup Script
# This script helps you set up environment variables for both dev and prod

set -e

echo "🚀 Franchise Platform - Environment Setup"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

# Check if Convex CLI is installed
if ! command -v convex &> /dev/null; then
    print_error "Convex CLI not found. Installing..."
    npm install -g convex
fi

# Check if Solana CLI is installed
if ! command -v solana &> /dev/null; then
    print_info "Solana CLI not found. Recommended for wallet management."
    echo "Install with: sh -c \"\$(curl -sSfL https://release.solana.com/stable/install)\""
fi

echo ""
echo "Which environment do you want to set up?"
echo "1) Development (Devnet)"
echo "2) Production (Mainnet)"
echo "3) Both"
read -p "Enter choice [1-3]: " choice

setup_dev() {
    echo ""
    echo "📱 Setting up DEVELOPMENT environment..."
    echo "========================================"
    
    # Check if dev deployment exists
    if npx convex env list 2>/dev/null | grep -q "dev"; then
        print_success "Convex dev environment already exists"
        DEV_URL=$(npx convex env get NEXT_PUBLIC_CONVEX_URL 2>/dev/null || echo "")
        if [ -n "$DEV_URL" ]; then
            echo "Current dev URL: $DEV_URL"
        fi
    else
        print_info "Convex dev environment not found. Run 'npx convex dev' first."
    fi
    
    echo ""
    echo "Create .env.local for local development? (y/n)"
    read -p "> " create_env
    
    if [ "$create_env" = "y" ] || [ "$create_env" = "Y" ]; then
        cat > .env.local << EOF
# Local Development Environment
# Generated on $(date)

# Environment
NEXT_PUBLIC_APP_ENV=development

# Convex (Get from: npx convex env get NEXT_PUBLIC_CONVEX_URL)
NEXT_PUBLIC_CONVEX_URL=https://your-dev-deployment.convex.cloud

# Solana Devnet
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_SOLANA_DEVNET_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_USE_REAL_WALLETS=true

# APIs (Add your keys)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
NEXT_PUBLIC_UPLOADCARE_PUBLIC_KEY=

# Backend variables are set in Convex using:
# npx convex env set WALLET_ENCRYPTION_KEY "your-key"
# npx convex env set AUTH_SECRET "your-secret"
# npx convex env set RESEND_API_KEY "your-key"
EOF
        print_success ".env.local created! Please update with your actual values."
    fi
}

setup_prod() {
    echo ""
    echo "🏭 Setting up PRODUCTION environment..."
    echo "======================================="
    
    # Check if prod deployment exists
    if npx convex env list --prod 2>/dev/null | grep -q "production"; then
        print_success "Convex production environment exists"
        PROD_URL=$(npx convex env get NEXT_PUBLIC_CONVEX_URL --prod 2>/dev/null || echo "")
        if [ -n "$PROD_URL" ]; then
            echo "Current prod URL: $PROD_URL"
        fi
    else
        echo ""
        echo "Convex production environment not found."
        read -p "Create production environment? (y/n): " create_prod
        
        if [ "$create_prod" = "y" ] || [ "$create_prod" = "Y" ]; then
            print_info "Creating production environment..."
            npx convex env add production
            print_success "Production environment created!"
            
            print_info "Deploying to production..."
            npx convex deploy --prod
            print_success "Deployed to production!"
        fi
    fi
    
    echo ""
    echo "🔐 Setting up production secrets..."
    echo ""
    
    # Check if secrets are set
    AUTH_SECRET=$(npx convex env get AUTH_SECRET --prod 2>/dev/null || echo "")
    WALLET_KEY=$(npx convex env get WALLET_ENCRYPTION_KEY --prod 2>/dev/null || echo "")
    
    if [ -z "$AUTH_SECRET" ]; then
        read -p "Generate and set AUTH_SECRET? (y/n): " gen_auth
        if [ "$gen_auth" = "y" ] || [ "$gen_auth" = "Y" ]; then
            NEW_AUTH_SECRET=$(openssl rand -hex 32)
            npx convex env set AUTH_SECRET "$NEW_AUTH_SECRET" --prod
            print_success "AUTH_SECRET generated and set"
        fi
    else
        print_success "AUTH_SECRET already set"
    fi
    
    if [ -z "$WALLET_KEY" ]; then
        read -p "Generate and set WALLET_ENCRYPTION_KEY? (y/n): " gen_wallet
        if [ "$gen_wallet" = "y" ] || [ "$gen_wallet" = "Y" ]; then
            NEW_WALLET_KEY=$(openssl rand -hex 64)
            npx convex env set WALLET_ENCRYPTION_KEY "$NEW_WALLET_KEY" --prod
            print_success "WALLET_ENCRYPTION_KEY generated and set"
            print_info "⚠️  IMPORTANT: Save this key securely!"
            echo "Encryption Key: $NEW_WALLET_KEY"
            echo ""
            read -p "Press Enter after you've saved the key..."
        fi
    else
        print_success "WALLET_ENCRYPTION_KEY already set"
    fi
    
    # Other API keys
    echo ""
    print_info "Set other API keys manually:"
    echo "  npx convex env set RESEND_API_KEY 'your-key' --prod"
    echo "  npx convex env set OPENAI_API_KEY 'your-key' --prod"
    
    # Create Vercel environment variables reminder
    echo ""
    echo "📋 Vercel Environment Variables for Production:"
    echo "=============================================="
    echo "NEXT_PUBLIC_CONVEX_URL=https://your-prod-deployment.convex.cloud"
    echo "NEXT_PUBLIC_SOLANA_NETWORK=mainnet-beta"
    echo "NEXT_PUBLIC_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com"
    echo "NEXT_PUBLIC_USE_REAL_WALLETS=true"
    echo "NEXT_PUBLIC_APP_ENV=production"
    echo "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-key"
    echo "NEXT_PUBLIC_UPLOADCARE_PUBLIC_KEY=your-key"
    echo ""
    print_info "Copy these to Vercel Dashboard → Settings → Environment Variables"
}

case $choice in
    1)
        setup_dev
        ;;
    2)
        setup_prod
        ;;
    3)
        setup_dev
        setup_prod
        ;;
    *)
        print_error "Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "=========================================="
print_success "Environment setup complete!"
echo ""
echo "📚 Next steps:"
echo "  1. Update .env.local with your actual API keys"
echo "  2. Run 'npm run dev' to start development"
echo "  3. See DUAL_ENVIRONMENT_DEPLOYMENT.md for full guide"
echo ""

