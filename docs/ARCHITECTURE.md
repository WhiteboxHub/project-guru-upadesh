# System Architecture

## Overview

Guru Upadesh is built as a modern, scalable microservices architecture using a monorepo structure with Turborepo.

## High-Level Architecture

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │
       ├──── HTTP/HTTPS ────┐
       │                    │
       └──── WebSocket ─────┤
                            │
                      ┌─────▼──────┐
                      │  CDN/Proxy │
                      │ (Cloudflare)│
                      └─────┬──────┘
                            │
              ┌─────────────┴─────────────┐
              │                           │
        ┌─────▼──────┐            ┌──────▼──────┐
        │  Next.js   │            │  NestJS API │
        │  Frontend  │            │   (Port     │
        │ (Port 3001)│            │    3000)    │
        └────────────┘            └──────┬──────┘
                                         │
                      ┌──────────────────┼──────────────────┐
                      │                  │                  │
              ┌───────▼────────┐  ┌──────▼──────┐  ┌──────▼──────┐
              │  AI Service    │  │  PostgreSQL │  │    Redis    │
              │  (Port 3002)   │  │     DB      │  │   Cache     │
              └────────────────┘  └─────────────┘  └─────────────┘
                      │
              ┌───────▼────────┐
              │  Claude API    │
              │   (Anthropic)  │
              └────────────────┘
```

## Components

### 1. Frontend (Next.js 14)

**Location:** `apps/web/`
**Port:** 3001

**Technology Stack:**
- Next.js 14 with App Router
- React 18
- TypeScript
- Tailwind CSS + shadcn/ui
- Zustand (state management)
- React Query (server state)
- Socket.io-client (WebSocket)

**Responsibilities:**
- User interface and user experience
- Client-side routing
- State management
- Real-time WebSocket communication
- Form validation
- API communication

**Key Features:**
- Server-side rendering (SSR)
- Static site generation (SSG) for public pages
- Responsive design (mobile-first)
- Accessibility (WCAG 2.1 AA)
- Progressive Web App (PWA) capabilities

### 2. Backend API (NestJS)

**Location:** `apps/api/`
**Port:** 3000

**Technology Stack:**
- NestJS 10
- TypeScript
- Prisma ORM
- PostgreSQL
- Redis
- Passport JWT
- Winston (logging)
- Socket.io (WebSocket)

**Responsibilities:**
- Business logic
- Authentication and authorization
- Data validation
- Database operations
- Real-time communication (WebSocket)
- API gateway to AI service
- Rate limiting
- Caching

**Modules:**
- **Auth Module:** User registration, login, JWT management
- **Users Module:** User profile management
- **Interviews Module:** Interview CRUD, state management
- **Questions Module:** Question bank management
- **Analytics Module:** Performance tracking and reporting

### 3. AI Service (NestJS Microservice)

**Location:** `apps/ai-service/`
**Port:** 3002

**Technology Stack:**
- NestJS 10
- Anthropic SDK (Claude API)
- Redis (response caching)
- TypeScript

**Responsibilities:**
- AI-powered question generation
- Answer evaluation and scoring
- Feedback generation using Claude API
- Resume analysis
- Response caching for cost optimization

**Key Features:**
- Prompt engineering for interview contexts
- STAR method evaluation for behavioral questions
- Token usage tracking
- Circuit breaker for API failures
- Response streaming for real-time feedback

### 4. Database (PostgreSQL)

**Version:** 14+

**Schema:**
- **users:** User accounts
- **user_profiles:** Extended user information
- **interviews:** Interview sessions
- **questions:** Question bank
- **interview_questions:** Interview-question relationships
- **interview_responses:** User answers and scores
- **user_analytics:** Performance metrics

**Features:**
- ACID compliance
- Proper indexing for performance
- Foreign key constraints
- Row-level security (future)
- Automated backups

### 5. Cache (Redis)

**Version:** 7+

**Use Cases:**
- Session storage
- JWT token blacklisting
- API response caching
- AI response caching (cost optimization)
- Rate limiting counters
- WebSocket connection management

**Configuration:**
- Persistence enabled (AOF + RDB)
- Eviction policy: `allkeys-lru`
- Max memory: 256MB (development), 2GB (production)

### 6. Shared Packages

**Location:** `packages/`

**@guru-upadesh/shared:**
- Common TypeScript types
- Utility functions
- Constants
- Validators

**@guru-upadesh/tsconfig:**
- Shared TypeScript configurations

**@guru-upadesh/eslint-config:**
- Shared ESLint rules

## Data Flow

### 1. User Registration Flow

```
User → Frontend → API → Database
                  ↓
            Hash Password
                  ↓
            Create User
                  ↓
            Return JWT Tokens
                  ↓
         Store in HTTP-only Cookie
```

### 2. Mock Interview Flow

```
User Starts Interview → Frontend → API
                                    ↓
                              Create Interview
                                    ↓
                              WebSocket Connect
                                    ↓
                              AI Service (Generate Question)
                                    ↓
                              Claude API
                                    ↓
                              Return Question → Frontend
                                    ↓
User Submits Answer → Frontend → WebSocket
                                    ↓
                              AI Service (Evaluate)
                                    ↓
                              Claude API
                                    ↓
                              Return Score/Feedback
                                    ↓
                              Save to Database
                                    ↓
                              Send to Frontend
```

### 3. Analytics Generation Flow

```
Scheduled Job → API → Query Database
                 ↓
         Aggregate Statistics
                 ↓
         Calculate Trends
                 ↓
         Store in user_analytics
                 ↓
         Cache in Redis
```

## Security Architecture

### Authentication

- JWT access tokens (15 min expiry)
- Refresh tokens (7 days expiry)
- HTTP-only cookies for token storage
- Token rotation on refresh
- Blacklist for revoked tokens (Redis)

### Authorization

- Role-based access control (RBAC)
- JWT payload contains user roles
- Guard decorators on protected endpoints
- Resource-level permissions

### Data Security

- Passwords hashed with bcrypt (12 rounds)
- Sensitive data encrypted at rest
- TLS/SSL for data in transit
- Input validation on all endpoints
- SQL injection prevention (Prisma ORM)
- XSS prevention (CSP headers)
- CSRF protection

### Rate Limiting

- Public endpoints: 100 req/15min per IP
- Authenticated: 1000 req/15min per user
- AI endpoints: 50 req/hour per user
- Redis-based distributed rate limiting

### Security Headers

```
Helmet.js configuration:
- Content-Security-Policy
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Strict-Transport-Security
- X-XSS-Protection
```

## Scalability Considerations

### Horizontal Scaling

- **Frontend:** Static assets on CDN, multiple Next.js instances
- **API:** Stateless design, load balancer, multiple instances
- **AI Service:** Queue-based processing, worker pools
- **Database:** Read replicas, connection pooling
- **Cache:** Redis cluster, sentinel for high availability

### Caching Strategy

1. **Browser Cache:** Static assets (1 year)
2. **CDN Cache:** HTML pages (5 min), API responses (disabled)
3. **Redis Cache:**
   - User sessions (15 min)
   - API responses (5 min)
   - AI responses (1 hour)
   - Question bank (24 hours)

### Database Optimization

- Indexes on frequently queried columns
- Pagination for large datasets (cursor-based)
- Query optimization (N+1 prevention)
- Connection pooling (10-50 connections)
- Materialized views for analytics

## Monitoring & Observability

### Application Monitoring

- **Sentry:** Error tracking and alerting
- **DataDog/New Relic:** APM, metrics, traces
- **Winston:** Structured logging

### Infrastructure Monitoring

- **AWS CloudWatch:** Infrastructure metrics
- **UptimeRobot:** Uptime monitoring
- **PagerDuty:** On-call alerting

### Key Metrics

- API response times (p50, p95, p99)
- Error rates by endpoint
- Database query performance
- Cache hit rates
- AI API usage and costs
- Active WebSocket connections
- User engagement metrics

### Logging

- Structured JSON logs
- Log levels: ERROR, WARN, INFO, DEBUG
- Request ID for distributed tracing
- Sensitive data masking
- 30-day retention

## Deployment Architecture

### Development

```
Local Machine
├── Docker Compose
│   ├── PostgreSQL
│   └── Redis
├── Next.js (hot reload)
├── NestJS API (hot reload)
└── AI Service (hot reload)
```

### Staging

```
AWS / Railway
├── RDS PostgreSQL
├── ElastiCache Redis
├── ECS / Railway Services
│   ├── API (2 instances)
│   ├── AI Service (1 instance)
│   └── Web (Vercel)
└── CloudFront CDN
```

### Production

```
AWS Multi-Region
├── RDS PostgreSQL (Multi-AZ)
├── ElastiCache Redis Cluster
├── ECS with Auto Scaling
│   ├── API (3-10 instances)
│   ├── AI Service (2-5 instances)
│   └── Web (Vercel/CDN)
├── Application Load Balancer
├── CloudFront CDN
└── Route 53 DNS
```

## CI/CD Pipeline

```
GitHub Push → GitHub Actions
              ↓
         Run Linting
              ↓
         Run Tests (Unit, Integration)
              ↓
         Build Docker Images
              ↓
         Push to Registry
              ↓
         Deploy to Staging
              ↓
         Run E2E Tests
              ↓
         Manual Approval
              ↓
         Blue-Green Deploy to Production
              ↓
         Health Checks
              ↓
         Monitor Metrics
```

## Disaster Recovery

### Backup Strategy

- **Database:** Automated daily backups (30-day retention)
- **Redis:** AOF + RDB persistence
- **Files:** S3 versioning enabled
- **Code:** Git version control

### Recovery Procedures

1. **Database Failure:** Promote read replica, restore from backup
2. **Service Failure:** Auto-restart, rollback deployment
3. **Complete Outage:** Failover to DR region
4. **Data Corruption:** Point-in-time recovery

### RTO/RPO

- **Recovery Time Objective (RTO):** < 1 hour
- **Recovery Point Objective (RPO):** < 15 minutes

## Future Enhancements

### Phase 2
- Mobile apps (React Native)
- Video interview analysis
- Multi-language support
- Peer interview matching

### Phase 3
- Enterprise features (team accounts, SSO)
- Advanced analytics (ML-based insights)
- API rate limiting with tiered plans
- Content delivery network optimization

### Phase 4
- Multi-region deployment
- Kubernetes migration
- Event-driven architecture (Kafka)
- Microservices expansion

## Architecture Decision Records (ADRs)

See `/docs/adr/` directory for detailed architecture decisions:
- ADR-0001: Monorepo with Turborepo
- ADR-0002: PostgreSQL over MongoDB
- ADR-0003: Separate AI microservice
- ADR-0004: WebSocket for real-time communication
