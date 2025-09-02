#!/bin/bash

# Franchiseen Platform - Netlify Deployment Script
# This script helps automate the deployment process

set -e

echo "🚀 Franchiseen Platform - Netlify Deployment Helper"
echo "=================================================="

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
if [ ! -f "package.json" ] || [ ! -d "apps" ]; then
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

# Install dependencies
print_status "Installing dependencies for all applications..."

# First, let's handle the shared package issue by building it
print_status "Building shared package..."
if [ -d "packages/shared" ]; then
    cd "packages/shared"
    npm install
    npm run build 2>/dev/null || echo "No build script for shared package"
    cd "../.."
fi

# Install root dependencies using workspaces
print_status "Installing root dependencies..."
npm install

# Install dependencies for each app individually (avoiding workspace issues)
for app in admin-dashboard franchise-dashboard client-portal; do
    if [ -d "apps/$app" ]; then
        print_status "Installing dependencies for $app..."
        cd "apps/$app"

        # Remove workspace reference temporarily for deployment
        if [ -f "package.json" ]; then
            # Create a backup
            cp package.json package.json.backup

            # Replace workspace reference with file reference
            sed 's/"@franchiseen\/shared": "workspace:\*"/"@franchiseen\/shared": "file:..\/..\/packages\/shared"/g' package.json > package.json.tmp
            mv package.json.tmp package.json
        fi

        npm install
        cd "../.."
    else
        print_warning "Directory apps/$app not found, skipping..."
    fi
done

print_success "All dependencies installed!"

# Build all applications
print_status "Building all applications..."

for app in admin-dashboard franchise-dashboard client-portal; do
    print_status "Building $app..."
    cd "apps/$app"
    npm run build
    
    if [ $? -eq 0 ]; then
        print_success "$app built successfully!"
    else
        print_error "Failed to build $app"
        exit 1
    fi
    
    cd "../.."
done

print_success "All applications built successfully!"

# Restore original package.json files
print_status "Restoring original package.json files..."
for app in admin-dashboard franchise-dashboard client-portal; do
    if [ -f "apps/$app/package.json.backup" ]; then
        cd "apps/$app"
        mv package.json.backup package.json
        cd "../.."
        print_status "Restored package.json for $app"
    fi
done

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
    echo "Please add your GitHub repository as remote:"
    echo "git remote add origin https://github.com/yourusername/franchiseen.git"
    echo "Then run: git push -u origin main"
else
    print_status "Pushing to remote repository..."
    git push origin main
    print_success "Code pushed to repository!"
fi

echo ""
echo "🎉 Deployment preparation complete!"
echo ""
echo "Next steps:"
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
echo "🔧 Don't forget to set environment variables in Netlify:"
echo "   VITE_API_URL=https://your-api-domain.com/api/v1"
echo "   VITE_APP_NAME=Franchiseen [App Name]"
echo "   VITE_APP_VERSION=1.0.0"
echo ""
echo "📖 For detailed instructions, see DEPLOYMENT.md"
echo ""
print_success "Happy deploying! 🚀"
