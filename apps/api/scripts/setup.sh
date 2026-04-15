#!/bin/bash

# Setup script for Guru Upadesh API
# This script sets up the development environment

set -e

echo "🚀 Setting up Guru Upadesh API..."

# Check Node.js version
required_node_version=18
current_node_version=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)

if [ "$current_node_version" -lt "$required_node_version" ]; then
    echo "❌ Node.js version $required_node_version or higher is required"
    echo "Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version check passed"

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
    echo "⚠️  Please update the .env file with your configuration"
else
    echo "✅ .env file already exists"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Generate Prisma client
echo "🔨 Generating Prisma client..."
npm run prisma:generate

# Check if database is accessible
echo "🔍 Checking database connection..."
if npm run migrate -- --help > /dev/null 2>&1; then
    echo "✅ Database connection successful"

    # Run migrations
    echo "🗄️  Running database migrations..."
    npm run migrate

    # Seed database
    echo "🌱 Seeding database..."
    npm run seed
else
    echo "⚠️  Could not connect to database. Please ensure PostgreSQL is running and DATABASE_URL is set correctly in .env"
fi

echo ""
echo "✨ Setup complete!"
echo ""
echo "📚 Next steps:"
echo "  1. Update .env with your configuration"
echo "  2. Ensure PostgreSQL and Redis are running"
echo "  3. Run 'npm run dev' to start the development server"
echo ""
echo "🌐 The API will be available at:"
echo "  - API: http://localhost:3000"
echo "  - Docs: http://localhost:3000/api/docs"
echo ""
