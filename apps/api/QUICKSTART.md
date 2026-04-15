# Quick Start Guide - Guru Upadesh API

This guide will help you get the API up and running in minutes.

## Prerequisites

Before you begin, ensure you have:

- Node.js 18+ installed
- PostgreSQL 14+ running
- Redis 6+ running (optional for now, infrastructure ready)
- npm or yarn package manager

## Installation Steps

### 1. Navigate to API Directory

```bash
cd apps/api
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create your `.env` file:

```bash
cp .env.example .env
```

Update the `.env` file with your configuration:

```env
# Minimum required for local development
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/guru_upadesh
JWT_SECRET=your-super-secret-key-change-this
JWT_REFRESH_SECRET=your-super-refresh-secret-key-change-this
```

### 4. Database Setup

Generate Prisma client:

```bash
npm run prisma:generate
```

Run database migrations:

```bash
npm run migrate
```

Seed the database with sample data:

```bash
npm run seed
```

### 5. Start the Server

Development mode with hot reload:

```bash
npm run dev
```

The API will be available at:
- **API**: http://localhost:3000
- **API Docs (Swagger)**: http://localhost:3000/api/docs

## Quick Test

### 1. Health Check

```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "ok",
  "info": {
    "database": {
      "status": "up"
    }
  }
}
```

### 2. Register a User

```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234!",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

Expected response:
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc...",
    "user": {
      "id": "uuid",
      "email": "test@example.com",
      "firstName": "John",
      "lastName": "Doe"
    }
  }
}
```

### 3. Login

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234!"
  }'
```

### 4. Get Current User Profile

```bash
# Replace YOUR_ACCESS_TOKEN with the token from login response
curl http://localhost:3000/api/v1/users/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Using the Demo Account

The seed script creates a demo account:

```
Email: demo@guruupadesh.com
Password: Test1234!
```

You can use this account for testing.

## API Documentation

Visit the interactive API documentation at:

**http://localhost:3000/api/docs**

Features:
- Try out all endpoints
- See request/response schemas
- Test authentication flows
- View all available endpoints

## Running Tests

### Unit Tests

```bash
npm test
```

### Test Coverage

```bash
npm run test:cov
```

Open `coverage/lcov-report/index.html` in your browser to see detailed coverage.

### E2E Tests

```bash
npm run test:e2e
```

### Watch Mode (for development)

```bash
npm run test:watch
```

## Development Tools

### Prisma Studio

Visual database browser:

```bash
npm run prisma:studio
```

Opens at http://localhost:5555

### View Logs

Logs are stored in the `logs/` directory:

```bash
# View application logs
tail -f logs/application-*.log

# View error logs only
tail -f logs/error-*.log
```

## Common Commands

### Database

```bash
# Create a new migration
npm run migrate -- --name your_migration_name

# Reset database (WARNING: deletes all data)
npm run migrate:reset

# Deploy migrations (production)
npm run migrate:deploy
```

### Code Quality

```bash
# Lint code
npm run lint

# Format code
npm run format
```

### Build for Production

```bash
npm run build
```

Start production server:

```bash
npm run start:prod
```

## Troubleshooting

### Database Connection Error

If you see: `Error: Can't reach database server at localhost:5432`

**Solution**: Ensure PostgreSQL is running:
```bash
# macOS (if installed via Homebrew)
brew services start postgresql

# Linux
sudo systemctl start postgresql

# Check if it's running
psql -U postgres -c "SELECT version();"
```

### Port Already in Use

If you see: `Error: listen EADDRINUSE: address already in use :::3000`

**Solution**: Either:
1. Stop the process using port 3000, or
2. Change the `PORT` in your `.env` file

### Migration Errors

If migrations fail:

```bash
# 1. Check database connection
psql $DATABASE_URL -c "SELECT 1"

# 2. Reset and try again (development only!)
npm run migrate:reset
npm run migrate
```

### Module Not Found

If you see module not found errors:

```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install
npm run prisma:generate
```

## Project Structure Overview

```
apps/api/
├── src/
│   ├── modules/        # Feature modules (auth, users, etc.)
│   ├── common/         # Shared utilities, guards, filters
│   ├── config/         # Configuration files
│   └── database/       # Prisma service
├── prisma/
│   ├── schema.prisma   # Database schema
│   └── seed.ts         # Database seeding
└── tests/              # E2E tests
```

## Next Steps

1. ✅ API is running
2. 📚 Read the [README.md](./README.md) for detailed documentation
3. 📖 Explore [API_STRUCTURE.md](./API_STRUCTURE.md) for architecture details
4. 🧪 Review test files to understand patterns
5. 🔧 Start building new features!

## Environment Variables Reference

### Required

```env
DATABASE_URL=postgresql://user:pass@host:port/dbname
JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-refresh-secret
```

### Optional (with defaults)

```env
NODE_ENV=development
PORT=3000
JWT_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d
BCRYPT_ROUNDS=12
RATE_LIMIT_TTL=60
RATE_LIMIT_MAX=100
CORS_ORIGIN=http://localhost:3001
```

## Support

- Check [README.md](./README.md) for detailed documentation
- Review [API_STRUCTURE.md](./API_STRUCTURE.md) for architecture
- View API docs at http://localhost:3000/api/docs
- Check test files for usage examples

## Success Checklist

- [ ] PostgreSQL is running
- [ ] Dependencies installed (`npm install`)
- [ ] `.env` file configured
- [ ] Prisma client generated
- [ ] Migrations applied
- [ ] Database seeded
- [ ] Server starts without errors
- [ ] Health check returns OK
- [ ] Can register a user
- [ ] Can login
- [ ] API docs accessible

If all items are checked, you're ready to develop!

---

**Happy Coding! 🚀**
