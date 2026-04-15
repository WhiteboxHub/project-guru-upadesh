# 🚀 Quick Start Guide

Get Guru Upadesh up and running in 5 minutes!

## ✅ Prerequisites

Make sure you have these installed:
- ✅ Node.js 18+ (`node --version`)
- ✅ pnpm 8+ (`pnpm --version` or install with `npm install -g pnpm`)
- ✅ Docker Desktop (running)

## 📦 Installation

### Step 1: Install Dependencies

```bash
pnpm install
```

This installs all dependencies for the monorepo (takes ~2 minutes).

### Step 2: Set Up Environment Variables

```bash
# Copy the example environment file
cp .env.example .env

# Generate secure secrets
./scripts/generate-env.sh

# Copy the generated secrets to .env file
```

**Required Environment Variables:**

Edit `.env` and add your API keys:

```bash
# Database (default values work for Docker setup)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/guru_upadesh
REDIS_URL=redis://localhost:6379

# Security (use values from generate-env.sh)
JWT_SECRET=<paste-from-generate-env>
REFRESH_TOKEN_SECRET=<paste-from-generate-env>

# AI Services (REQUIRED - get from Anthropic)
ANTHROPIC_API_KEY=sk-ant-api-your-key-here

# Optional (for full features)
OPENAI_API_KEY=sk-your-key-here
ELEVENLABS_API_KEY=your-key-here
```

**Get API Keys:**
- Anthropic (Claude): https://console.anthropic.com/
- OpenAI: https://platform.openai.com/api-keys
- ElevenLabs: https://elevenlabs.io/

### Step 3: Start Docker Services

```bash
# Start PostgreSQL and Redis
pnpm docker:dev

# Wait for services to be healthy (10-15 seconds)
docker ps
```

You should see two containers running:
- `guru-upadesh-postgres-dev`
- `guru-upadesh-redis-dev`

### Step 4: Set Up Database

```bash
# Run migrations to create tables
pnpm migrate:dev

# Seed database with sample data (100+ questions)
pnpm seed
```

### Step 5: Start All Applications

```bash
# Start all applications in development mode
pnpm dev
```

This starts:
- 🌐 **Frontend** (Next.js): http://localhost:3001
- 🔌 **API** (NestJS): http://localhost:3000
- 🤖 **AI Service**: http://localhost:3002

## 🎉 You're Ready!

Open http://localhost:3001 in your browser and:

1. **Create an account** (Register page)
2. **Start a mock interview**
3. **Answer questions** and get AI feedback
4. **View your analytics**

## 🛠️ Development Commands

### Run Individual Apps

```bash
# Frontend only
pnpm --filter=web dev

# API only
pnpm --filter=api dev

# AI Service only
pnpm --filter=ai-service dev
```

### Database Management

```bash
# Open Prisma Studio (visual database browser)
pnpm studio

# Reset database (careful!)
cd apps/api && pnpm prisma migrate reset

# Generate Prisma client (after schema changes)
cd apps/api && pnpm prisma generate
```

### Testing

```bash
# Run all tests
pnpm test

# Run tests with coverage
pnpm test:cov

# Run specific package tests
pnpm --filter=api test
pnpm --filter=web test
```

### Code Quality

```bash
# Lint all code
pnpm lint

# Format all code
pnpm format

# Type check
pnpm typecheck
```

### Building for Production

```bash
# Build all packages
pnpm build

# Build specific package
pnpm --filter=api build
pnpm --filter=web build
```

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Kill process on port
npx kill-port 3000  # API
npx kill-port 3001  # Web
npx kill-port 3002  # AI Service
```

### Docker Issues

```bash
# Restart Docker services
pnpm docker:down
pnpm docker:dev

# Check logs
docker logs guru-upadesh-postgres-dev
docker logs guru-upadesh-redis-dev
```

### Database Connection Issues

```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Test connection
psql postgresql://postgres:postgres@localhost:5432/guru_upadesh
```

### Clean Install

```bash
# Remove all node_modules and reinstall
pnpm clean
rm -rf node_modules
pnpm install
```

## 📚 Next Steps

- Read the [Architecture Guide](./docs/ARCHITECTURE.md)
- Check the [API Documentation](./docs/API.md)
- Review [Contributing Guidelines](./docs/CONTRIBUTING.md)
- See [Full Documentation](./docs/)

## 🆘 Need Help?

- Check [Troubleshooting Guide](./docs/TROUBLESHOOTING.md)
- Open an [Issue](https://github.com/yourusername/guru-upadesh/issues)
- Read the [FAQ](./docs/FAQ.md)

---

Happy coding! 🎉
