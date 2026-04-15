# Guru Upadesh

> AI-Powered Interview Preparation Platform

[![CI](https://github.com/yourusername/guru-upadesh/actions/workflows/ci.yml/badge.svg)](https://github.com/yourusername/guru-upadesh/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)

Guru Upadesh is a production-grade, AI-powered interview preparation platform that helps candidates ace their interviews with real-time assistance, mock interviews, resume analysis, and personalized feedback.

## ✨ Features

- 🎯 **Mock Interview System** - AI interviewer with customizable difficulty levels
- 📝 **Real-Time Interview Assistant** - Live transcription and AI-powered response suggestions
- 📊 **Performance Analytics** - Track your progress and identify improvement areas
- 💼 **Resume Analysis** - ATS compatibility checking and keyword optimization
- 🎓 **Question Bank** - Extensive database of interview questions across multiple categories
- 🤖 **AI-Powered Feedback** - Detailed evaluation using Claude API
- 🔄 **Real-Time Communication** - WebSocket-based live interview sessions

## 🏗️ Architecture

Guru Upadesh is built as a modern monorepo with separate applications:

- **Frontend** (`apps/web/`): Next.js 14 with App Router
- **Backend API** (`apps/api/`): NestJS with Prisma ORM
- **AI Service** (`apps/ai-service/`): Microservice for AI operations using Claude API
- **Shared Packages** (`packages/`): Common types, utilities, and configurations

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- pnpm 8+
- Docker and Docker Compose
- PostgreSQL 14+ (via Docker)
- Redis 7+ (via Docker)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/guru-upadesh.git
cd guru-upadesh

# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env
# Update .env with your API keys and secrets

# Generate secure secrets
./scripts/generate-env.sh

# Start Docker services (PostgreSQL & Redis)
pnpm docker:dev

# Run database migrations
pnpm migrate:dev

# Seed the database with sample data
pnpm seed

# Start all applications
pnpm dev
```

The applications will be available at:
- 🌐 **Frontend**: http://localhost:3001
- 🔌 **API**: http://localhost:3000
- 🤖 **AI Service**: http://localhost:3002
- 📊 **Prisma Studio**: http://localhost:5555 (run `pnpm studio`)

## 📦 Project Structure

```
guru-upadesh/
├── apps/
│   ├── web/              # Next.js frontend
│   ├── api/              # NestJS backend API
│   └── ai-service/       # AI microservice
├── packages/
│   ├── shared/           # Shared types and utilities
│   └── config/           # Shared configurations
├── infrastructure/
│   ├── docker/           # Docker configurations
│   ├── kubernetes/       # K8s manifests
│   └── terraform/        # Infrastructure as Code
├── docs/                 # Documentation
├── scripts/              # Utility scripts
└── .github/              # CI/CD workflows
```

## 🛠️ Development

### Available Scripts

```bash
# Development
pnpm dev                  # Start all apps in dev mode
pnpm build                # Build all apps
pnpm lint                 # Lint all apps
pnpm typecheck            # Type check all apps
pnpm format               # Format code with Prettier

# Testing
pnpm test                 # Run all tests
pnpm test:watch           # Run tests in watch mode
pnpm test:cov             # Run tests with coverage
pnpm test:e2e             # Run end-to-end tests

# Database
pnpm migrate:dev          # Run migrations
pnpm migrate:deploy       # Deploy migrations
pnpm seed                 # Seed database
pnpm studio               # Open Prisma Studio

# Docker
pnpm docker:dev           # Start Docker services
pnpm docker:down          # Stop Docker services

# Individual apps
pnpm --filter=web dev     # Run only frontend
pnpm --filter=api dev     # Run only API
pnpm --filter=ai-service dev  # Run only AI service
```

### Environment Variables

Key environment variables (see `.env.example` for full list):

```bash
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/guru_upadesh

# Redis
REDIS_URL=redis://localhost:6379

# Security
JWT_SECRET=<generate-with-scripts/generate-env.sh>
REFRESH_TOKEN_SECRET=<generate-with-scripts/generate-env.sh>

# AI Services
ANTHROPIC_API_KEY=sk-ant-api-your-key-here
OPENAI_API_KEY=sk-your-key-here
```

## 🧪 Testing

We maintain >80% code coverage across all packages.

```bash
# Run all tests
pnpm test

# Run tests for specific package
pnpm --filter=api test

# Run with coverage
pnpm test:cov

# Run E2E tests
pnpm test:e2e

# Run specific test file
pnpm --filter=api test -- auth.service.spec.ts
```

See [TESTING.md](./docs/TESTING.md) for detailed testing guidelines.

## 📚 Documentation

- [API Documentation](./docs/API.md)
- [Architecture Overview](./docs/ARCHITECTURE.md)
- [Contributing Guide](./docs/CONTRIBUTING.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)
- [Testing Guide](./docs/TESTING.md)
- [Troubleshooting](./docs/TROUBLESHOOTING.md)

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./docs/CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests and linting
5. Commit your changes (use [conventional commits](https://www.conventionalcommits.org/))
6. Push to your branch
7. Open a Pull Request

## 🐛 Bug Reports

Found a bug? Please open an [issue](https://github.com/yourusername/guru-upadesh/issues) with:
- Clear description
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable
- Environment details

## 🔒 Security

See [SECURITY.md](./SECURITY.md) for security policies and vulnerability reporting.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🙏 Acknowledgments

- [Anthropic](https://www.anthropic.com/) for Claude API
- [Next.js](https://nextjs.org/) for the amazing React framework
- [NestJS](https://nestjs.com/) for the powerful backend framework
- [Prisma](https://www.prisma.io/) for the excellent ORM
- [shadcn/ui](https://ui.shadcn.com/) for beautiful UI components

## 📧 Contact

- Website: https://guruupadesh.com
- Email: support@guruupadesh.com
- Twitter: [@guruupadesh](https://twitter.com/guruupadesh)

---

<p align="center">Made with ❤️ by the Guru Upadesh Team</p>
