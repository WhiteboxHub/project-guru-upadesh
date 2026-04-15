#!/bin/bash

# Guru Upadesh AI Service - Setup Script

set -e

echo "🚀 Setting up Guru Upadesh AI Service..."

# Check Node.js version
echo "📋 Checking Node.js version..."
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Error: Node.js 18 or higher is required. Current version: $(node -v)"
    exit 1
fi
echo "✅ Node.js version: $(node -v)"

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
    echo "⚠️  Please configure your ANTHROPIC_API_KEY in the .env file"
else
    echo "✅ .env file already exists"
fi

# Check if ANTHROPIC_API_KEY is set
if ! grep -q "ANTHROPIC_API_KEY=sk-ant-" .env; then
    echo "⚠️  Warning: ANTHROPIC_API_KEY not configured in .env file"
    echo "   Please add your Anthropic API key to continue"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check Redis availability
echo "🔍 Checking Redis availability..."
if command -v redis-cli &> /dev/null; then
    if redis-cli ping &> /dev/null; then
        echo "✅ Redis is running"
    else
        echo "⚠️  Redis is installed but not running"
        echo "   Start Redis with: redis-server"
        echo "   Or disable caching by setting CACHE_ENABLED=false in .env"
    fi
else
    echo "⚠️  Redis is not installed"
    echo "   Install Redis or disable caching by setting CACHE_ENABLED=false in .env"
    echo "   macOS: brew install redis"
    echo "   Ubuntu: sudo apt-get install redis-server"
    echo "   Docker: docker run -d -p 6379:6379 redis:7-alpine"
fi

# Build the project
echo "🔨 Building the project..."
npm run build

# Run tests
echo "🧪 Running tests..."
npm run test

echo ""
echo "✅ Setup complete!"
echo ""
echo "🎯 Next steps:"
echo "   1. Configure ANTHROPIC_API_KEY in .env file"
echo "   2. Start Redis if not running: redis-server"
echo "   3. Start the service: npm run start:dev"
echo "   4. Access API docs: http://localhost:3002/api/docs"
echo ""
echo "💡 Useful commands:"
echo "   npm run start:dev     - Start development server"
echo "   npm run test          - Run tests"
echo "   npm run test:cov      - Run tests with coverage"
echo "   npm run lint          - Lint code"
echo ""
