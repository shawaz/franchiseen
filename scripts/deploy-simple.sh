#!/bin/bash

# Franchiseen Platform - Simple Netlify Deployment Script
# This script handles deployment without workspace complications

set -e

echo "🚀 Franchiseen Platform - Simple Deployment Helper"
echo "================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -d "apps" ]; then
    print_error "Please run this script from the root of the Franchiseen project"
    exit 1
fi

print_status "Checking prerequisites..."

# Check if git is installed
if ! command -v git &> /dev/null; then
    print_error "Git is not installed. Please install Git first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install Node.js and npm first."
    exit 1
fi

print_success "Prerequisites check passed!"

# Create a temporary shared package for deployment
print_status "Preparing shared package for deployment..."

# Copy shared package to each app's node_modules (simple approach)
for app in admin-dashboard franchise-dashboard client-portal; do
    if [ -d "apps/$app" ]; then
        print_status "Preparing $app for deployment..."
        cd "apps/$app"
        
        # Install dependencies (excluding the problematic shared package)
        npm install --ignore-scripts
        
        # Create a simple shared package locally
        mkdir -p node_modules/@franchiseen
        cp -r ../../packages/shared node_modules/@franchiseen/shared
        
        # Build the app
        print_status "Building $app..."
        npm run build
        
        if [ $? -eq 0 ]; then
            print_success "$app built successfully!"
        else
            print_error "Failed to build $app"
            exit 1
        fi
        
        cd "../.."
    else
        print_warning "Directory apps/$app not found, skipping..."
    fi
done

print_success "All applications built successfully!"

# Check if git repository is initialized
if [ ! -d ".git" ]; then
    print_warning "Git repository not initialized. Initializing..."
    git init
    git add .
    git commit -m "Initial commit: Franchiseen platform"
    print_success "Git repository initialized!"
else
    print_status "Git repository already exists"
fi

# Check git status
if [ -n "$(git status --porcelain)" ]; then
    print_status "Uncommitted changes detected. Committing..."
    git add .
    git commit -m "Deploy: Update Franchiseen platform $(date '+%Y-%m-%d %H:%M:%S')"
    print_success "Changes committed!"
else
    print_status "No uncommitted changes detected"
fi

# Check if remote origin exists
if ! git remote get-url origin &> /dev/null; then
    print_warning "No git remote 'origin' found."
    echo ""
    echo "📋 Next steps:"
    echo "1. Create a GitHub repository at https://github.com/new"
    echo "2. Run these commands:"
    echo "   git remote add origin https://github.com/yourusername/franchiseen-platform.git"
    echo "   git push -u origin main"
    echo ""
else
    print_status "Pushing to remote repository..."
    git push origin main
    print_success "Code pushed to repository!"
fi

echo ""
echo "🎉 Deployment preparation complete!"
echo ""
echo "✅ All applications built successfully:"
echo "   📊 Admin Dashboard: apps/admin-dashboard/dist"
echo "   🏢 Franchise Dashboard: apps/franchise-dashboard/dist"
echo "   👤 Client Portal: apps/client-portal/dist"
echo ""
echo "🚀 Next steps for Netlify deployment:"
echo ""
echo "1. Go to https://app.netlify.com/"
echo "2. Click 'Add new site' → 'Import an existing project'"
echo "3. Connect to GitHub and select your repository"
echo "4. Deploy each application with these settings:"
echo ""
echo "📊 Admin Dashboard:"
echo "   Base directory: apps/admin-dashboard"
echo "   Build command: npm run build"
echo "   Publish directory: apps/admin-dashboard/dist"
echo ""
echo "🏢 Franchise Dashboard:"
echo "   Base directory: apps/franchise-dashboard"
echo "   Build command: npm run build"
echo "   Publish directory: apps/franchise-dashboard/dist"
echo ""
echo "👤 Client Portal:"
echo "   Base directory: apps/client-portal"
echo "   Build command: npm run build"
echo "   Publish directory: apps/client-portal/dist"
echo ""
echo "🔧 Environment variables to set in Netlify:"
echo "   VITE_API_URL=https://your-api-domain.com/api/v1"
echo "   VITE_APP_NAME=Franchiseen [App Name]"
echo "   VITE_APP_VERSION=1.0.0"
echo ""
echo "📖 For detailed instructions, see DEPLOYMENT.md"
echo ""
print_success "Ready for Netlify deployment! 🚀"
