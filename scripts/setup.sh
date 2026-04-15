#!/bin/bash

set -e

echo "🚀 Setting up Guru Upadesh development environment..."

# Check for required tools
command -v node >/dev/null 2>&1 || { echo "❌ Node.js is required but not installed. Aborting." >&2; exit 1; }
command -v pnpm >/dev/null 2>&1 || { echo "❌ pnpm is required but not installed. Installing..." >&2; npm install -g pnpm@8.15.1; }
command -v docker >/dev/null 2>&1 || { echo "❌ Docker is required but not installed. Aborting." >&2; exit 1; }

echo "✅ All required tools are installed"

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Copy environment files
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
    echo "⚠️  Please update .env with your actual values"
fi

# Start Docker services
echo "🐳 Starting Docker services (PostgreSQL & Redis)..."
docker-compose -f infrastructure/docker/docker-compose.dev.yml up -d

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 5

# Run database migrations
echo "🗄️  Running database migrations..."
cd apps/api && pnpm prisma migrate dev && cd ../..

# Seed database
echo "🌱 Seeding database..."
cd apps/api && pnpm prisma db seed && cd ../..

echo "✨ Setup complete! You can now run:"
echo "   pnpm dev - Start all applications in development mode"
echo "   pnpm docker:down - Stop Docker services"

