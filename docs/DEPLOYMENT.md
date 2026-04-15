# Deployment Guide

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Database Setup](#database-setup)
4. [Application Deployment](#application-deployment)
5. [Monitoring Setup](#monitoring-setup)
6. [Rollback Procedures](#rollback-procedures)
7. [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Tools
- Node.js 18+ and npm/pnpm
- Docker and Docker Compose
- PostgreSQL 14+
- Redis 7+
- AWS CLI (if using AWS)
- kubectl (if using Kubernetes)
- Terraform (for infrastructure)

### Required Accounts
- Cloud provider account (AWS/GCP/Azure)
- Domain registrar account
- CDN provider (Cloudflare)
- Monitoring service (Sentry, DataDog)
- Email service (SendGrid/AWS SES)

## Environment Setup

### 1. Clone and Install

```bash
# Clone repository
git clone <repository-url>
cd project-guru-upadesh

# Install dependencies
npm install

# Or using pnpm
pnpm install
```

### 2. Environment Variables

Create environment files for each environment:

```bash
# Development
.env.development

# Staging
.env.staging

# Production
.env.production
```

**Critical Environment Variables:**

```bash
# Application
NODE_ENV=production
PORT=3000
API_URL=https://api.yourdomain.com
WEB_URL=https://yourdomain.com

# Database
DATABASE_URL=postgresql://user:password@host:5432/dbname
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10
REDIS_URL=redis://host:6379
REDIS_PASSWORD=your-redis-password

# Security
JWT_SECRET=<generate-strong-secret>
JWT_EXPIRATION=15m
REFRESH_TOKEN_SECRET=<generate-different-secret>
REFRESH_TOKEN_EXPIRATION=7d
ENCRYPTION_KEY=<generate-32-byte-key>

# AI Services
ANTHROPIC_API_KEY=sk-ant-api...
OPENAI_API_KEY=sk-...
ELEVENLABS_API_KEY=...

# AWS
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1
AWS_S3_BUCKET=guru-upadesh-assets
AWS_CLOUDFRONT_DOMAIN=...

# Monitoring
SENTRY_DSN=https://...@sentry.io/...
DATADOG_API_KEY=...
LOG_LEVEL=info

# Email
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=...
SMTP_PASSWORD=...
FROM_EMAIL=noreply@yourdomain.com

# Payment
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PUBLISHABLE_KEY=pk_live_...

# Rate Limiting
RATE_LIMIT_WINDOW=15m
RATE_LIMIT_MAX_REQUESTS=100

# CORS
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

**Generate Secrets:**

```bash
# Generate JWT secrets
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Generate encryption key
openssl rand -base64 32
```

## Database Setup

### 1. Provision Database

**AWS RDS (PostgreSQL):**

```bash
# Using Terraform
cd infrastructure/terraform
terraform init
terraform plan -var-file=production.tfvars
terraform apply -var-file=production.tfvars
```

**Manual Setup:**
- Instance type: db.t3.medium (or larger for production)
- Storage: 100GB SSD, auto-scaling enabled
- Backup retention: 7 days
- Multi-AZ deployment: Yes (production)
- Encryption at rest: Enabled
- Performance Insights: Enabled

### 2. Run Migrations

```bash
# Install migration tool globally
npm install -g db-migrate

# Run migrations
npm run migrate:production

# Or using Prisma
npx prisma migrate deploy

# Verify migrations
npm run migrate:status
```

### 3. Seed Initial Data

```bash
# Seed production data
npm run seed:production

# This includes:
# - Question banks
# - Interview templates
# - Default settings
# - Sample companies
```

### 4. Database Backups

**Automated Backups:**

```bash
# Setup automated backup script
crontab -e

# Add daily backup at 2 AM
0 2 * * * /path/to/scripts/backup-db.sh

# Backup script content:
#!/bin/bash
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="backup_${TIMESTAMP}.sql"

pg_dump $DATABASE_URL > /backups/${BACKUP_FILE}
gzip /backups/${BACKUP_FILE}

# Upload to S3
aws s3 cp /backups/${BACKUP_FILE}.gz s3://guru-upadesh-backups/database/

# Keep only last 30 days
find /backups -type f -mtime +30 -delete
```

## Application Deployment

### Option 1: Docker Deployment

**1. Build Docker Images:**

```bash
# Build API image
docker build -t guru-upadesh-api:latest -f apps/api/Dockerfile .

# Build Web image
docker build -t guru-upadesh-web:latest -f apps/web/Dockerfile .

# Build AI Service image
docker build -t guru-upadesh-ai:latest -f apps/ai-service/Dockerfile .

# Tag for registry
docker tag guru-upadesh-api:latest <registry>/guru-upadesh-api:v1.0.0
docker tag guru-upadesh-web:latest <registry>/guru-upadesh-web:v1.0.0
docker tag guru-upadesh-ai:latest <registry>/guru-upadesh-ai:v1.0.0

# Push to registry
docker push <registry>/guru-upadesh-api:v1.0.0
docker push <registry>/guru-upadesh-web:v1.0.0
docker push <registry>/guru-upadesh-ai:v1.0.0
```

**2. Deploy with Docker Compose:**

```yaml
# docker-compose.production.yml
version: '3.8'

services:
  api:
    image: <registry>/guru-upadesh-api:v1.0.0
    restart: always
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    env_file:
      - .env.production
    depends_on:
      - postgres
      - redis
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  web:
    image: <registry>/guru-upadesh-web:v1.0.0
    restart: always
    ports:
      - "80:3000"
    environment:
      - NODE_ENV=production
    env_file:
      - .env.production

  ai-service:
    image: <registry>/guru-upadesh-ai:v1.0.0
    restart: always
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
    env_file:
      - .env.production

  postgres:
    image: postgres:14-alpine
    restart: always
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      POSTGRES_DB: guru_upadesh
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}

  redis:
    image: redis:7-alpine
    restart: always
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data

  nginx:
    image: nginx:alpine
    restart: always
    ports:
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - /etc/letsencrypt:/etc/letsencrypt
    depends_on:
      - api
      - web

volumes:
  postgres_data:
  redis_data:
```

```bash
# Deploy
docker-compose -f docker-compose.production.yml up -d

# Check status
docker-compose -f docker-compose.production.yml ps

# View logs
docker-compose -f docker-compose.production.yml logs -f
```

### Option 2: Kubernetes Deployment

**1. Create Kubernetes Manifests:**

```yaml
# k8s/deployment.yml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: guru-upadesh-api
  namespace: production
spec:
  replicas: 3
  selector:
    matchLabels:
      app: guru-upadesh-api
  template:
    metadata:
      labels:
        app: guru-upadesh-api
    spec:
      containers:
      - name: api
        image: <registry>/guru-upadesh-api:v1.0.0
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        envFrom:
        - secretRef:
            name: guru-upadesh-secrets
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: guru-upadesh-api
  namespace: production
spec:
  selector:
    app: guru-upadesh-api
  ports:
  - port: 80
    targetPort: 3000
  type: LoadBalancer
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: guru-upadesh-api-hpa
  namespace: production
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: guru-upadesh-api
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

**2. Deploy to Kubernetes:**

```bash
# Create namespace
kubectl create namespace production

# Create secrets
kubectl create secret generic guru-upadesh-secrets \
  --from-env-file=.env.production \
  -n production

# Apply configurations
kubectl apply -f k8s/ -n production

# Check deployment
kubectl get pods -n production
kubectl get services -n production

# View logs
kubectl logs -f deployment/guru-upadesh-api -n production
```

### Option 3: Serverless Deployment (Vercel + Railway)

**Frontend (Vercel):**

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd apps/web
vercel --prod

# Or configure vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "env": {
    "NEXT_PUBLIC_API_URL": "@api-url"
  }
}
```

**Backend (Railway/Render):**

```yaml
# railway.json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm run start:prod",
    "healthcheckPath": "/health",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

## SSL/TLS Setup

### Using Let's Encrypt (Certbot)

```bash
# Install certbot
sudo apt-get install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal (cron)
sudo crontab -e
0 3 * * * certbot renew --quiet
```

### Using AWS Certificate Manager

```bash
# Request certificate
aws acm request-certificate \
  --domain-name yourdomain.com \
  --subject-alternative-names www.yourdomain.com \
  --validation-method DNS

# Add DNS validation records to your domain
# Wait for validation
# Attach to load balancer/CloudFront
```

## CDN Setup (Cloudflare)

1. Add domain to Cloudflare
2. Update nameservers at registrar
3. Configure SSL/TLS mode: Full (strict)
4. Enable caching rules:
   - Cache static assets (images, CSS, JS)
   - Bypass cache for API endpoints
5. Configure firewall rules
6. Enable DDoS protection
7. Set up page rules for optimization

## Monitoring Setup

### 1. Application Monitoring (Sentry)

```typescript
// apps/api/src/main.ts
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
  beforeSend(event) {
    // Don't send sensitive data
    if (event.request) {
      delete event.request.cookies;
      delete event.request.headers?.authorization;
    }
    return event;
  },
});
```

### 2. Performance Monitoring (DataDog)

```typescript
// apps/api/src/main.ts
import tracer from 'dd-trace';

tracer.init({
  service: 'guru-upadesh-api',
  env: process.env.NODE_ENV,
  analytics: true,
  runtimeMetrics: true,
});
```

### 3. Log Aggregation

```typescript
// Configure Winston
import winston from 'winston';
import { WinstonCloudWatch } from 'winston-cloudwatch';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new WinstonCloudWatch({
      logGroupName: 'guru-upadesh-api',
      logStreamName: `${process.env.NODE_ENV}-${Date.now()}`,
      awsRegion: process.env.AWS_REGION,
    }),
  ],
});
```

### 4. Uptime Monitoring

Use services like:
- UptimeRobot
- Pingdom
- AWS CloudWatch Synthetics

```bash
# Configure health check endpoints
GET /health - Basic health check
GET /ready - Readiness check (DB, Redis connected)
GET /metrics - Prometheus metrics
```

## CI/CD Pipeline

### GitHub Actions Workflow

```yaml
# .github/workflows/deploy-production.yml
name: Deploy to Production

on:
  push:
    branches: [main]
    tags: ['v*']

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linter
        run: npm run lint
      
      - name: Run tests
        run: npm test
      
      - name: Check code coverage
        run: npm run test:cov
        env:
          COVERAGE_THRESHOLD: 80

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Build Docker images
        run: |
          docker build -t ${{ secrets.DOCKER_REGISTRY }}/guru-upadesh-api:${{ github.sha }} -f apps/api/Dockerfile .
          docker build -t ${{ secrets.DOCKER_REGISTRY }}/guru-upadesh-web:${{ github.sha }} -f apps/web/Dockerfile .
      
      - name: Push to registry
        run: |
          echo ${{ secrets.DOCKER_PASSWORD }} | docker login -u ${{ secrets.DOCKER_USERNAME }} --password-stdin
          docker push ${{ secrets.DOCKER_REGISTRY }}/guru-upadesh-api:${{ github.sha }}
          docker push ${{ secrets.DOCKER_REGISTRY }}/guru-upadesh-web:${{ github.sha }}

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment: production
    steps:
      - name: Deploy to Kubernetes
        run: |
          kubectl set image deployment/guru-upadesh-api \
            api=${{ secrets.DOCKER_REGISTRY }}/guru-upadesh-api:${{ github.sha }} \
            -n production
          
          kubectl rollout status deployment/guru-upadesh-api -n production
      
      - name: Notify Slack
        if: always()
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          text: 'Production deployment ${{ job.status }}'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

## Post-Deployment Checklist

- [ ] Verify all services are running
- [ ] Check health endpoints return 200
- [ ] Test critical user flows (login, mock interview)
- [ ] Verify database connections
- [ ] Check Redis connectivity
- [ ] Test AI service integration
- [ ] Verify file uploads to S3
- [ ] Check SSL certificate validity
- [ ] Verify CDN caching
- [ ] Test WebSocket connections
- [ ] Monitor error rates in Sentry
- [ ] Check performance metrics
- [ ] Verify email sending works
- [ ] Test payment processing (if applicable)
- [ ] Check mobile responsiveness
- [ ] Verify API rate limiting
- [ ] Test authentication flows
- [ ] Check backup systems

## Rollback Procedures

### Quick Rollback (Kubernetes)

```bash
# View deployment history
kubectl rollout history deployment/guru-upadesh-api -n production

# Rollback to previous version
kubectl rollout undo deployment/guru-upadesh-api -n production

# Rollback to specific revision
kubectl rollout undo deployment/guru-upadesh-api --to-revision=2 -n production

# Monitor rollback
kubectl rollout status deployment/guru-upadesh-api -n production
```

### Database Rollback

```bash
# Rollback last migration
npm run migrate:rollback

# Or using Prisma
npx prisma migrate resolve --rolled-back <migration-name>

# Restore from backup if needed
psql $DATABASE_URL < /backups/backup_latest.sql
```

### Full System Rollback

1. Notify team via Slack/incident channel
2. Rollback application code (Kubernetes/Docker)
3. Rollback database if schema changed
4. Clear CDN cache if needed
5. Monitor error rates return to normal
6. Document incident in post-mortem

## Performance Optimization

### Database Optimization

```sql
-- Add indexes for common queries
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_interviews_user_id ON interviews(user_id);
CREATE INDEX idx_questions_category ON questions(category);

-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM interviews WHERE user_id = 'xxx';

-- Vacuum and analyze
VACUUM ANALYZE;
```

### Redis Caching

```typescript
// Cache frequently accessed data
const cacheKey = `user:${userId}:profile`;
const cached = await redis.get(cacheKey);

if (cached) {
  return JSON.parse(cached);
}

const data = await db.query(...);
await redis.setex(cacheKey, 3600, JSON.stringify(data)); // 1 hour
return data;
```

### CDN Configuration

```nginx
# Nginx caching configuration
location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

location /api/ {
    proxy_pass http://api:3000;
    proxy_cache_bypass $http_upgrade;
}
```

## Security Hardening

### Firewall Rules

```bash
# Allow only necessary ports
ufw allow 22/tcp   # SSH
ufw allow 80/tcp   # HTTP
ufw allow 443/tcp  # HTTPS
ufw enable
```

### Rate Limiting

```typescript
// Express rate limiter
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP',
});

app.use('/api/', limiter);
```

### Security Headers

```typescript
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));
```

## Troubleshooting

See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for common issues and solutions.

## Support

For deployment issues:
- Check logs: `kubectl logs -f deployment/guru-upadesh-api`
- Check metrics dashboard
- Review Sentry errors
- Contact DevOps team

## Additional Resources

- [AWS Best Practices](https://aws.amazon.com/architecture/well-architected/)
- [Kubernetes Production Best Practices](https://kubernetes.io/docs/setup/best-practices/)
- [12 Factor App](https://12factor.net/)
