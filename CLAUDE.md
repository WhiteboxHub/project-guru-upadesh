# Guru Upadesh - AI-Powered Interview Preparation Platform

## Project Overview

Guru Upadesh is a production-grade, AI-powered interview preparation platform similar to Final Round AI. It provides real-time interview assistance, practice sessions, mock interviews, resume analysis, and personalized feedback to help candidates ace their interviews.

### Core Features

1. **Real-Time Interview Assistant**
   - Live transcription and AI-powered response suggestions
   - Context-aware answer generation
   - Multi-language support

2. **Mock Interview System**
   - AI interviewer with customizable difficulty levels
   - Industry-specific interview scenarios (Tech, Finance, Consulting, etc.)
   - Real-time feedback and scoring

3. **Resume Analysis & Optimization**
   - ATS compatibility checking
   - Keyword optimization suggestions
   - Industry-specific tailoring

4. **Question Bank & Practice**
   - Behavioral questions (STAR method)
   - Technical questions (coding, system design)
   - Case study scenarios
   - Company-specific question databases

5. **Performance Analytics**
   - Interview performance tracking
   - Improvement metrics and trends
   - Personalized recommendations

## Tech Stack

### Backend
- **Framework**: Node.js with Express.js or NestJS (TypeScript)
- **API**: RESTful + WebSocket for real-time features
- **Database**: PostgreSQL (primary), Redis (caching/sessions)
- **ORM**: Prisma or TypeORM
- **AI Integration**: 
  - Claude API (Anthropic) for conversational AI
  - OpenAI Whisper for speech-to-text
  - ElevenLabs or similar for text-to-speech
- **Queue System**: Bull/BullMQ for job processing
- **Search**: Elasticsearch or Typesense for question search

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **UI Library**: React 18+
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: Zustand or Redux Toolkit
- **Real-time**: Socket.io-client
- **Audio/Video**: MediaRecorder API, WebRTC

### Infrastructure
- **Hosting**: AWS, GCP, or Vercel (frontend) + Railway/Render (backend)
- **CDN**: Cloudflare or AWS CloudFront
- **Storage**: AWS S3 or Google Cloud Storage
- **Monitoring**: Sentry (errors), DataDog or New Relic (APM)
- **Logging**: Winston + CloudWatch/Loki
- **CI/CD**: GitHub Actions

### Testing
- **Unit Tests**: Jest + ts-jest
- **Integration Tests**: Supertest
- **E2E Tests**: Playwright or Cypress
- **Load Testing**: k6 or Artillery
- **Code Coverage**: Target >80%

## Project Structure

```
project-guru-upadesh/
├── apps/
│   ├── web/                    # Next.js frontend
│   │   ├── src/
│   │   │   ├── app/           # App router pages
│   │   │   ├── components/    # React components
│   │   │   ├── hooks/         # Custom hooks
│   │   │   ├── lib/           # Utilities
│   │   │   ├── services/      # API clients
│   │   │   └── types/         # TypeScript types
│   │   ├── public/
│   │   ├── tests/
│   │   └── package.json
│   │
│   ├── api/                    # Backend API
│   │   ├── src/
│   │   │   ├── modules/       # Feature modules
│   │   │   │   ├── auth/
│   │   │   │   ├── interviews/
│   │   │   │   ├── questions/
│   │   │   │   ├── users/
│   │   │   │   └── analytics/
│   │   │   ├── common/        # Shared code
│   │   │   │   ├── middleware/
│   │   │   │   ├── guards/
│   │   │   │   ├── decorators/
│   │   │   │   └── utils/
│   │   │   ├── config/        # Configuration
│   │   │   ├── database/      # DB migrations/seeds
│   │   │   └── main.ts
│   │   ├── tests/
│   │   └── package.json
│   │
│   └── ai-service/            # Microservice for AI operations
│       ├── src/
│       │   ├── services/
│       │   │   ├── transcription/
│       │   │   ├── response-generation/
│       │   │   └── analysis/
│       │   └── main.ts
│       └── tests/
│
├── packages/
│   ├── shared/                # Shared types and utilities
│   ├── ui/                    # Shared UI components
│   └── config/                # Shared configs (ESLint, TS, etc.)
│
├── infrastructure/
│   ├── docker/                # Docker configs
│   ├── kubernetes/            # K8s manifests (if using)
│   └── terraform/             # Infrastructure as Code
│
├── docs/
│   ├── API.md                 # API documentation
│   ├── DEPLOYMENT.md          # Deployment guide
│   ├── ARCHITECTURE.md        # System architecture
│   ├── TESTING.md             # Testing guide
│   ├── CONTRIBUTING.md        # Contribution guidelines
│   └── TROUBLESHOOTING.md     # Common issues
│
├── scripts/
│   ├── setup.sh              # Dev environment setup
│   ├── seed-db.ts            # Database seeding
│   └── deploy.sh             # Deployment script
│
├── .github/
│   └── workflows/            # CI/CD pipelines
│
├── CLAUDE.md                 # This file
├── README.md
├── package.json              # Root package.json (monorepo)
├── turbo.json               # Turborepo config
└── .env.example
```

## Development Guidelines

### Code Quality Standards

1. **TypeScript**
   - Strict mode enabled
   - No implicit any
   - Explicit return types for functions
   - Use type guards and discriminated unions

2. **Code Style**
   - ESLint + Prettier configured
   - Follow Airbnb style guide (modified)
   - Max function length: 50 lines
   - Max file length: 300 lines
   - Meaningful variable names (no single letters except loops)

3. **Error Handling**
   - Use custom error classes
   - Always handle promises (no floating promises)
   - Log errors with context
   - Return user-friendly error messages
   - Never expose stack traces to users in production

4. **Security**
   - Never commit secrets (use environment variables)
   - Input validation on all endpoints (use Zod or Joi)
   - Rate limiting on all public endpoints
   - SQL injection prevention (use parameterized queries)
   - XSS prevention (sanitize inputs, use CSP headers)
   - CSRF protection
   - Implement proper CORS policies
   - Use helmet.js for security headers
   - Hash passwords with bcrypt (min 12 rounds)
   - Use JWT with short expiration times + refresh tokens

5. **Performance**
   - Implement caching strategies (Redis)
   - Database query optimization (use indexes)
   - Lazy loading for large datasets
   - Image optimization (WebP, compression)
   - Code splitting and dynamic imports
   - Implement pagination (cursor-based preferred)
   - Use connection pooling

### Testing Requirements

#### Unit Tests
- Test all business logic functions
- Mock external dependencies
- Aim for >80% code coverage
- Use descriptive test names (Given/When/Then)

```typescript
describe('InterviewService', () => {
  describe('createMockInterview', () => {
    it('should create mock interview with valid parameters', async () => {
      // Arrange
      const mockData = { userId: '123', type: 'technical' };
      
      // Act
      const result = await service.createMockInterview(mockData);
      
      // Assert
      expect(result).toBeDefined();
      expect(result.type).toBe('technical');
    });
  });
});
```

#### Integration Tests
- Test API endpoints end-to-end
- Use test database
- Test authentication flows
- Test error scenarios

#### E2E Tests
- Test critical user journeys
- Mock interview flow
- Resume upload and analysis
- Payment processing
- User registration/login

#### Load Testing
- Test concurrent users (target: 1000+)
- Database connection limits
- API rate limiting
- WebSocket connections

### Git Workflow

1. **Branch Naming**
   - `feature/description` - New features
   - `fix/description` - Bug fixes
   - `refactor/description` - Code refactoring
   - `docs/description` - Documentation
   - `test/description` - Test additions

2. **Commit Messages**
   - Use conventional commits
   - Format: `type(scope): description`
   - Examples:
     - `feat(auth): add OAuth2 login`
     - `fix(interview): resolve audio sync issue`
     - `test(api): add integration tests for questions endpoint`

3. **Pull Requests**
   - Require 1+ approvals
   - Must pass all CI checks
   - Include description of changes
   - Link related issues
   - Update documentation if needed

### API Design

1. **RESTful Conventions**
   - Use proper HTTP methods (GET, POST, PUT, PATCH, DELETE)
   - Use plural nouns for resources
   - Use nested routes for relationships
   - Version APIs (`/api/v1/`)

2. **Response Format**
   ```json
   {
     "success": true,
     "data": { ... },
     "message": "Optional message",
     "meta": {
       "page": 1,
       "limit": 20,
       "total": 100
     }
   }
   ```

3. **Error Format**
   ```json
   {
     "success": false,
     "error": {
       "code": "INVALID_INPUT",
       "message": "User-friendly message",
       "details": [...]
     }
   }
   ```

4. **Rate Limiting**
   - Public endpoints: 100 requests/hour
   - Authenticated: 1000 requests/hour
   - AI endpoints: 50 requests/hour
   - Return `X-RateLimit-*` headers

### Environment Variables

Required environment variables (see `.env.example`):

```bash
# Application
NODE_ENV=development
PORT=3000
API_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/guru_upadesh
REDIS_URL=redis://localhost:6379

# Authentication
JWT_SECRET=your-super-secret-key
JWT_EXPIRATION=15m
REFRESH_TOKEN_EXPIRATION=7d

# AI Services
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
ELEVENLABS_API_KEY=...

# AWS/Storage
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_BUCKET=...
AWS_REGION=us-east-1

# Monitoring
SENTRY_DSN=...
DATADOG_API_KEY=...

# Payment (if applicable)
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...
```

## Database Schema Guidelines

1. **Naming Conventions**
   - Tables: snake_case, plural (`users`, `mock_interviews`)
   - Columns: snake_case (`created_at`, `user_id`)
   - Indexes: `idx_table_column`
   - Foreign keys: `fk_table_column`

2. **Required Fields**
   - `id` (UUID preferred)
   - `created_at` (timestamp)
   - `updated_at` (timestamp)
   - `deleted_at` (timestamp, for soft deletes)

3. **Relationships**
   - Use foreign keys with proper constraints
   - Define ON DELETE and ON UPDATE behaviors
   - Create indexes on foreign keys

4. **Migrations**
   - Never modify existing migrations
   - Create new migration for changes
   - Always provide rollback (down migration)
   - Test migrations on staging first

## AI Integration Guidelines

### Claude API Usage

1. **Prompt Engineering**
   - Use clear, structured prompts
   - Include context and examples
   - Specify output format
   - Set appropriate temperature (0.7 for creative, 0.3 for factual)

2. **Response Generation**
   - Stream responses for better UX
   - Implement retry logic with exponential backoff
   - Cache common responses
   - Set timeouts (30s max)

3. **Context Management**
   - Maintain conversation history (last 10 exchanges)
   - Truncate old messages to stay within token limits
   - Store full history in database

4. **Cost Optimization**
   - Cache frequent queries
   - Batch requests when possible
   - Use appropriate model sizes
   - Implement usage quotas per user

### Speech Processing

1. **Audio Input**
   - Support multiple formats (MP3, WAV, WebM)
   - Max file size: 25MB
   - Max duration: 30 minutes
   - Implement chunking for real-time transcription

2. **Quality**
   - Noise reduction preprocessing
   - Speaker diarization for multi-person interviews
   - Punctuation and formatting

## Deployment

### Pre-deployment Checklist

- [ ] All tests passing
- [ ] Environment variables configured
- [ ] Database migrations ready
- [ ] Secrets rotated
- [ ] Monitoring configured
- [ ] Backup strategy in place
- [ ] Rollback plan documented
- [ ] Load testing completed
- [ ] Security audit performed
- [ ] Documentation updated

### Deployment Strategy

1. **Staging Environment**
   - Mirror production setup
   - Deploy all changes here first
   - Run full test suite
   - Manual QA testing

2. **Production Deployment**
   - Use blue-green or canary deployment
   - Deploy during low-traffic hours
   - Monitor error rates and performance
   - Keep previous version ready for rollback

3. **Database Migrations**
   - Run migrations before code deploy
   - Ensure backward compatibility
   - Have rollback scripts ready
   - Backup database before migrations

### Monitoring & Alerts

1. **Metrics to Track**
   - API response times (p50, p95, p99)
   - Error rates
   - CPU/Memory usage
   - Database query performance
   - AI API latency and costs
   - User engagement metrics

2. **Alerts**
   - Error rate > 1%
   - Response time > 1s
   - CPU/Memory > 80%
   - Database connections > 80% of pool
   - Disk space < 20%

3. **Logs**
   - Structured JSON logging
   - Include request IDs for tracing
   - Log levels: ERROR, WARN, INFO, DEBUG
   - Retain logs for 30 days minimum

## Performance Targets

- **Page Load**: < 2s (First Contentful Paint)
- **API Response**: < 200ms (p95)
- **AI Response**: < 3s (streaming start)
- **Uptime**: 99.9%
- **Concurrent Users**: 10,000+
- **Database Queries**: < 100ms (p95)

## Accessibility

- WCAG 2.1 Level AA compliance
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode
- Closed captions for video content
- Resizable text (up to 200%)

## Internationalization (i18n)

- Use react-i18next or similar
- Support UTF-8 encoding
- Date/time localization
- Currency formatting
- Right-to-left (RTL) support if needed
- Extract all UI strings to translation files

## Documentation Requirements

### Code Documentation
- JSDoc comments for all public functions
- README in each major directory
- Architecture decision records (ADRs)

### API Documentation
- OpenAPI/Swagger specification
- Request/response examples
- Authentication guide
- Rate limiting info
- Error codes reference

### User Documentation
- Getting started guide
- Feature tutorials
- Video walkthroughs
- FAQ section
- Troubleshooting guide

## Compliance & Legal

- **Data Privacy**
  - GDPR compliance (if EU users)
  - CCPA compliance (if California users)
  - Data retention policies
  - Right to deletion
  - Data export functionality

- **Audio/Video Recording**
  - Explicit user consent
  - Clear privacy policy
  - Data encryption at rest and in transit
  - Secure deletion

- **AI Usage Disclosure**
  - Clear communication about AI usage
  - Human review options
  - AI limitations disclosure

## When Working on This Project

### For New Features
1. Check if feature exists in question bank or similar systems
2. Review related modules for patterns
3. Write tests first (TDD approach)
4. Implement feature with error handling
5. Update API documentation
6. Add monitoring/logging
7. Test on staging
8. Update user documentation

### For Bug Fixes
1. Write a failing test that reproduces the bug
2. Fix the bug
3. Ensure test passes
4. Check for similar bugs elsewhere
5. Update documentation if behavior changed

### For Refactoring
1. Ensure comprehensive test coverage first
2. Make small, incremental changes
3. Run tests after each change
4. Update documentation
5. No functional changes during refactoring

### AI-Assisted Development with Claude
- Use Claude Code for boilerplate generation
- Review all AI-generated code carefully
- Test AI-generated code thoroughly
- Add proper error handling to AI code
- Optimize AI-generated queries and algorithms
- Document AI usage in code comments

## Common Pitfalls to Avoid

1. **Security**
   - Don't store passwords in plain text
   - Don't trust client-side validation alone
   - Don't expose sensitive data in logs
   - Don't use predictable IDs for sensitive resources

2. **Performance**
   - Don't make N+1 database queries
   - Don't load entire datasets without pagination
   - Don't forget to add indexes
   - Don't skip caching for expensive operations

3. **Code Quality**
   - Don't catch and ignore errors silently
   - Don't use magic numbers/strings
   - Don't create God objects/functions
   - Don't skip writing tests

4. **AI Integration**
   - Don't send sensitive user data to AI without consent
   - Don't rely solely on AI responses without validation
   - Don't forget to handle AI service outages
   - Don't skip rate limiting on AI endpoints

## Support & Communication

- **Issue Tracking**: GitHub Issues
- **Documentation**: `/docs` directory
- **Code Reviews**: Required for all PRs
- **Team Communication**: [Your preferred tool]

## Versioning

- Use Semantic Versioning (SemVer)
- Format: MAJOR.MINOR.PATCH
- Update version in package.json
- Tag releases in git
- Maintain CHANGELOG.md

## License

[Specify your license here]

---

## Quick Start for Claude Code

When I ask you to work on this project:

1. **Understand Context**: Read relevant documentation in `/docs`
2. **Check Structure**: Follow the project structure outlined above
3. **Read Before Writing**: Always read existing code before modifying
4. **Test Everything**: Write and run tests for all changes
5. **Follow Patterns**: Match existing code patterns and conventions
6. **Document Changes**: Update docs and comments
7. **Security First**: Never compromise on security
8. **Think Production**: All code should be production-ready

When creating new features:
- Start with types/interfaces
- Add validation schemas
- Implement business logic with tests
- Add API endpoints
- Create frontend components
- Update documentation
- Test end-to-end

When fixing bugs:
- Reproduce the bug with a test
- Fix the minimal code necessary
- Verify the fix
- Check for similar issues
- Document if it's a known edge case

Remember: Quality over speed. Production-grade means secure, tested, documented, and maintainable code.
