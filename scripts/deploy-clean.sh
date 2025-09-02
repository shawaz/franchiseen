#!/bin/bash

# Franchiseen Platform - Clean Deployment Script
# This script creates a clean deployment without workspace complications

set -e

echo "🚀 Franchiseen Platform - Clean Deployment"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -d "apps" ]; then
    print_error "Please run this script from the root of the Franchiseen project"
    exit 1
fi

print_status "Creating clean deployment builds..."

# Build each app individually with a clean approach
for app in admin-dashboard franchise-dashboard client-portal; do
    if [ -d "apps/$app" ]; then
        print_status "Building $app..."
        cd "apps/$app"
        
        # Clean install
        rm -rf node_modules package-lock.json
        npm install --no-package-lock
        
        # Build
        npm run build
        
        if [ $? -eq 0 ]; then
            print_success "$app built successfully!"
            print_status "Build output: apps/$app/dist"
        else
            print_error "Failed to build $app"
            cd "../.."
            exit 1
        fi
        
        cd "../.."
    fi
done

print_success "All applications built successfully!"

# Git setup
if [ ! -d ".git" ]; then
    print_status "Initializing git repository..."
    git init
    git add .
    git commit -m "Initial commit: Franchiseen platform"
    print_success "Git repository initialized!"
fi

# Check for changes
if [ -n "$(git status --porcelain)" ]; then
    print_status "Committing changes..."
    git add .
    git commit -m "Deploy: Franchiseen platform $(date '+%Y-%m-%d %H:%M:%S')"
    print_success "Changes committed!"
fi

echo ""
echo "🎉 Clean deployment build complete!"
echo ""
echo "✅ Built applications:"
echo "   📊 Admin Dashboard: apps/admin-dashboard/dist"
echo "   🏢 Franchise Dashboard: apps/franchise-dashboard/dist"  
echo "   👤 Client Portal: apps/client-portal/dist"
echo ""
echo "🚀 Ready for Netlify deployment!"
echo ""
echo "Next steps:"
echo "1. Push to GitHub: git push origin main"
echo "2. Deploy each app to Netlify with these exact settings:"
echo ""
echo "📊 Admin Dashboard:"
echo "   Base directory: apps/admin-dashboard"
echo "   Build command: npm install && npm run build"
echo "   Publish directory: apps/admin-dashboard/dist"
echo ""
echo "🏢 Franchise Dashboard:"
echo "   Base directory: apps/franchise-dashboard"  
echo "   Build command: npm install && npm run build"
echo "   Publish directory: apps/franchise-dashboard/dist"
echo ""
echo "👤 Client Portal:"
echo "   Base directory: apps/client-portal"
echo "   Build command: npm install && npm run build"
echo "   Publish directory: apps/client-portal/dist"
echo ""
print_success "Ready to deploy! 🚀"
