# Troubleshooting Guide

Common issues and their solutions for Guru Upadesh development.

## Table of Contents

1. [Installation Issues](#installation-issues)
2. [Database Issues](#database-issues)
3. [Docker Issues](#docker-issues)
4. [Development Server Issues](#development-server-issues)
5. [API Issues](#api-issues)
6. [Frontend Issues](#frontend-issues)
7. [Testing Issues](#testing-issues)
8. [Deployment Issues](#deployment-issues)

## Installation Issues

### `pnpm install` fails

**Problem:** Dependencies fail to install

**Solutions:**
```bash
# Clear pnpm cache
pnpm store prune

# Remove node_modules and lockfile
rm -rf node_modules pnpm-lock.yaml

# Reinstall
pnpm install
```

### Wrong Node version

**Problem:** `Error: The engine "node" is incompatible with this module`

**Solution:**
```bash
# Check your Node version
node --version

# Should be 18+
# Use nvm to switch versions
nvm install 18
nvm use 18
```

### `turbo` command not found

**Solution:**
```bash
# Install turbo globally
npm install -g turbo

# Or use pnpm to run scripts
pnpm dev
```

## Database Issues

### Connection refused to PostgreSQL

**Problem:** `Error: connect ECONNREFUSED 127.0.0.1:5432`

**Solutions:**

1. **Check if PostgreSQL is running:**
   ```bash
   docker ps | grep postgres
   ```

2. **Start Docker services:**
   ```bash
   pnpm docker:dev
   ```

3. **Check DATABASE_URL in .env:**
   ```
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/guru_upadesh
   ```

4. **Test connection:**
   ```bash
   psql postgresql://postgres:postgres@localhost:5432/guru_upadesh
   ```

### Prisma migration fails

**Problem:** `Migration failed to apply`

**Solutions:**

1. **Reset database:**
   ```bash
   cd apps/api
   pnpm prisma migrate reset
   ```

2. **Check for conflicting migrations:**
   ```bash
   pnpm prisma migrate status
   ```

3. **Force resolve:**
   ```bash
   pnpm prisma migrate resolve --applied <migration-name>
   ```

### "Table does not exist" errors

**Solution:**
```bash
# Run migrations
cd apps/api
pnpm prisma migrate deploy

# Generate Prisma client
pnpm prisma generate
```

### Seeding fails

**Problem:** `Error running seed script`

**Solutions:**

1. **Check if tables exist:**
   ```bash
   pnpm prisma studio
   # Verify tables in the UI
   ```

2. **Run migrations first:**
   ```bash
   pnpm prisma migrate deploy
   pnpm prisma db seed
   ```

## Docker Issues

### Docker containers won't start

**Problem:** `docker-compose up` fails

**Solutions:**

1. **Check Docker is running:**
   ```bash
   docker ps
   ```

2. **Remove existing containers:**
   ```bash
   docker-compose -f infrastructure/docker/docker-compose.dev.yml down -v
   docker-compose -f infrastructure/docker/docker-compose.dev.yml up -d
   ```

3. **Check logs:**
   ```bash
   docker logs guru-upadesh-postgres-dev
   docker logs guru-upadesh-redis-dev
   ```

### Port already in use

**Problem:** `Error: Port 5432 is already allocated`

**Solutions:**

1. **Find process using the port:**
   ```bash
   # macOS/Linux
   lsof -i :5432
   
   # Kill the process
   kill -9 <PID>
   ```

2. **Change port in docker-compose:**
   ```yaml
   ports:
     - "5433:5432"  # Use different host port
   ```

   Update `.env`:
   ```
   DATABASE_URL=postgresql://postgres:postgres@localhost:5433/guru_upadesh
   ```

### Docker out of disk space

**Problem:** `no space left on device`

**Solutions:**
```bash
# Clean up Docker
docker system prune -a --volumes

# Remove unused images
docker image prune -a
```

## Development Server Issues

### Port already in use

**Problem:** `Error: listen EADDRINUSE: address already in use :::3000`

**Solutions:**

1. **Kill process on port:**
   ```bash
   # macOS/Linux
   lsof -i :3000
   kill -9 <PID>

   # Or use
   npx kill-port 3000
   ```

2. **Change port:**
   ```bash
   # In apps/api/.env
   PORT=3005
   ```

### Hot reload not working

**Problem:** Changes don't reflect automatically

**Solutions:**

1. **Restart dev server:**
   ```bash
   # Stop all
   # Ctrl+C

   # Start again
   pnpm dev
   ```

2. **Clear Next.js cache:**
   ```bash
   rm -rf apps/web/.next
   pnpm --filter=web dev
   ```

3. **Clear Turbo cache:**
   ```bash
   pnpm clean
   pnpm dev
   ```

### Module not found errors

**Problem:** `Cannot find module '@guru-upadesh/shared'`

**Solutions:**

1. **Build shared packages:**
   ```bash
   pnpm --filter=@guru-upadesh/shared build
   ```

2. **Clear and reinstall:**
   ```bash
   rm -rf node_modules
   pnpm install
   ```

## API Issues

### JWT token errors

**Problem:** `Unauthorized: Invalid token`

**Solutions:**

1. **Check JWT_SECRET in .env:**
   ```
   JWT_SECRET=your-secret-key-here
   ```

2. **Token expired:**
   - Refresh the token using `/auth/refresh` endpoint
   - Login again

3. **Verify token format:**
   ```
   Authorization: Bearer <token>
   ```

### CORS errors

**Problem:** `Access-Control-Allow-Origin` error

**Solutions:**

1. **Check CORS_ORIGINS in .env:**
   ```
   CORS_ORIGINS=http://localhost:3001,http://localhost:3000
   ```

2. **Verify API CORS config:**
   ```typescript
   // apps/api/src/main.ts
   app.enableCors({
     origin: process.env.CORS_ORIGINS?.split(','),
     credentials: true,
   });
   ```

### Redis connection issues

**Problem:** `Error connecting to Redis`

**Solutions:**

1. **Check Redis is running:**
   ```bash
   docker ps | grep redis
   redis-cli ping
   # Should return PONG
   ```

2. **Check REDIS_URL:**
   ```
   REDIS_URL=redis://localhost:6379
   ```

## Frontend Issues

### Next.js build fails

**Problem:** Build errors during `next build`

**Solutions:**

1. **Check TypeScript errors:**
   ```bash
   pnpm --filter=web typecheck
   ```

2. **Clear cache:**
   ```bash
   rm -rf apps/web/.next
   pnpm --filter=web build
   ```

3. **Check environment variables:**
   ```bash
   # Ensure NEXT_PUBLIC_ prefix for client-side vars
   NEXT_PUBLIC_API_URL=http://localhost:3000
   ```

### Images not loading

**Problem:** Next.js Image component errors

**Solutions:**

1. **Add domain to next.config.js:**
   ```javascript
   images: {
     domains: ['your-domain.com', 'cdn.example.com'],
   }
   ```

2. **Use correct image path:**
   ```jsx
   <Image src="/images/logo.png" alt="Logo" width={100} height={100} />
   ```

### Styling issues

**Problem:** Tailwind classes not working

**Solutions:**

1. **Check tailwind.config.ts content paths:**
   ```typescript
   content: [
     './src/app/**/*.{js,ts,jsx,tsx,mdx}',
     './src/components/**/*.{js,ts,jsx,tsx,mdx}',
   ]
   ```

2. **Restart dev server:**
   ```bash
   pnpm --filter=web dev
   ```

## Testing Issues

### Tests fail with database errors

**Problem:** Tests can't connect to database

**Solutions:**

1. **Use test database:**
   ```bash
   # In test files or setup
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/guru_upadesh_test
   ```

2. **Create test database:**
   ```bash
   createdb guru_upadesh_test
   ```

### Jest timeout errors

**Problem:** `Exceeded timeout of 5000 ms for a test`

**Solutions:**

1. **Increase timeout:**
   ```typescript
   it('should complete', async () => {
     // ...
   }, 10000); // 10 seconds
   ```

2. **Or in jest.config.ts:**
   ```typescript
   testTimeout: 10000
   ```

### Mock not working

**Problem:** Mocks not being called

**Solutions:**

1. **Clear mocks between tests:**
   ```typescript
   afterEach(() => {
     jest.clearAllMocks();
   });
   ```

2. **Verify mock setup:**
   ```typescript
   const mockFn = jest.fn();
   expect(mockFn).toHaveBeenCalled();
   ```

## Deployment Issues

### Docker build fails

**Problem:** `ERROR [internal] load metadata`

**Solutions:**

1. **Check Dockerfile paths:**
   ```dockerfile
   COPY apps/api/package.json ./apps/api/
   ```

2. **Build with no cache:**
   ```bash
   docker build --no-cache -t app:latest -f Dockerfile .
   ```

### Environment variables not set

**Problem:** App crashes with missing env vars

**Solutions:**

1. **Check .env is not in .dockerignore**

2. **Pass env vars to container:**
   ```bash
   docker run -e DATABASE_URL=$DATABASE_URL app:latest
   ```

3. **Use docker-compose env_file:**
   ```yaml
   services:
     api:
       env_file:
         - .env.production
   ```

### Health checks failing

**Problem:** Container marked unhealthy

**Solutions:**

1. **Check health endpoint:**
   ```bash
   curl http://localhost:3000/health
   ```

2. **Verify health check config:**
   ```yaml
   healthcheck:
     test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
     interval: 30s
     timeout: 10s
     retries: 3
   ```

## Getting More Help

If your issue isn't listed here:

1. **Check logs:**
   ```bash
   # Docker logs
   docker logs guru-upadesh-api
   
   # Application logs
   tail -f apps/api/logs/error.log
   ```

2. **Search existing issues:** https://github.com/yourusername/guru-upadesh/issues

3. **Create a new issue** with:
   - Error message
   - Steps to reproduce
   - Environment (OS, Node version, etc.)
   - Logs

4. **Contact the team:**
   - Discord: [Your server]
   - Email: support@guruupadesh.com
