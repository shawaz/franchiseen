#!/bin/bash

# Franchiseen Development Setup Script
# This script sets up the development environment for the Franchiseen platform

set -e

echo "🚀 Setting up Franchiseen development environment..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ and try again."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "⚠️  Docker is not installed. Some features may not work without Docker."
else
    echo "✅ Docker $(docker --version | cut -d' ' -f3 | cut -d',' -f1) detected"
fi

# Check if PostgreSQL is running (either locally or via Docker)
if ! command -v psql &> /dev/null && ! docker ps | grep -q postgres; then
    echo "⚠️  PostgreSQL not detected. You'll need to start PostgreSQL or use Docker Compose."
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Copy environment file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please update the .env file with your configuration before starting the servers."
else
    echo "✅ .env file already exists"
fi

# Generate Prisma client
echo "🗄️  Generating Prisma client..."
npm run db:generate

# Check if database is accessible
echo "🔍 Checking database connection..."
if npm run db:migrate --silent > /dev/null 2>&1; then
    echo "✅ Database connection successful"
    
    # Ask if user wants to seed the database
    read -p "🌱 Would you like to seed the database with demo data? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🌱 Seeding database..."
        npm run db:seed
        echo "✅ Database seeded successfully"
    fi
else
    echo "⚠️  Could not connect to database. Please ensure PostgreSQL is running and configured correctly."
    echo "   You can start PostgreSQL with Docker using: docker-compose up postgres -d"
fi

# Create logs directory
mkdir -p logs

echo ""
echo "🎉 Development environment setup complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Update your .env file with the correct configuration"
echo "   2. Start the development servers:"
echo "      npm run dev              # Start all services"
echo "      npm run dev:api          # Start API server only"
echo "      npm run docker:up        # Start with Docker Compose"
echo ""
echo "🔗 Useful URLs:"
echo "   API Server:        http://localhost:3001"
echo "   API Documentation: http://localhost:3001/api/docs"
echo "   Health Check:      http://localhost:3001/health"
echo ""
echo "📚 Documentation: See README.md for more information"
