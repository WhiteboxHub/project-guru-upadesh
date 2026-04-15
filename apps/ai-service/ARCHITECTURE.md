# AI Service Architecture

## Overview

The AI Service is a production-grade NestJS microservice that provides AI-powered interview assistance and evaluation capabilities using the Claude API from Anthropic. It's designed with scalability, reliability, and cost-efficiency in mind.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     API Layer (REST)                        │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              AiController                             │  │
│  │  - Rate Limiting (Throttler)                         │  │
│  │  - Input Validation (class-validator)               │  │
│  │  - API Documentation (Swagger)                       │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   Service Layer                             │
│  ┌──────────────────┐  ┌──────────────────┐               │
│  │  ClaudeService   │  │ PromptBuilder    │               │
│  │  - AI Operations │  │ - Prompt Gen     │               │
│  │  - Retry Logic   │  │ - Context Build  │               │
│  │  - Token Track   │  │ - Template Mgmt  │               │
│  └──────────────────┘  └──────────────────┘               │
│  ┌──────────────────┐  ┌──────────────────┐               │
│  │ ResponseParser   │  │  CacheService    │               │
│  │ - JSON Parsing   │  │  - Redis Cache   │               │
│  │ - Validation     │  │  - TTL Mgmt      │               │
│  └──────────────────┘  └──────────────────┘               │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  Resilience Layer                           │
│  ┌──────────────────┐  ┌──────────────────┐               │
│  │ CircuitBreaker   │  │  RateLimiter     │               │
│  │ - Fault Tolerance│  │  - API Limiting  │               │
│  │ - State Mgmt     │  │  - User Quotas   │               │
│  └──────────────────┘  └──────────────────┘               │
│  ┌──────────────────┐                                      │
│  │ TokenCounter     │                                      │
│  │ - Usage Tracking │                                      │
│  │ - Cost Monitor   │                                      │
│  └──────────────────┘                                      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  External Services                          │
│  ┌──────────────────┐  ┌──────────────────┐               │
│  │  Anthropic API   │  │   Redis Cache    │               │
│  │  (Claude AI)     │  │   (ioredis)      │               │
│  └──────────────────┘  └──────────────────┘               │
└─────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. Controller Layer

**AiController** (`src/controllers/ai.controller.ts`)
- Handles HTTP requests and responses
- Applies rate limiting per endpoint
- Input validation using DTOs
- Swagger documentation
- Error handling and logging

Endpoints:
- `POST /api/v1/ai/generate-question` - Generate interview questions
- `POST /api/v1/ai/evaluate-answer` - Evaluate candidate answers
- `POST /api/v1/ai/generate-followup` - Generate follow-up questions
- `POST /api/v1/ai/analyze-resume` - Analyze resumes
- `POST /api/v1/ai/generate-feedback` - Generate interview feedback
- `GET /api/v1/ai/health` - Health check
- `GET /api/v1/ai/stats` - Service statistics

### 2. Service Layer

**ClaudeService** (`src/services/claude/claude.service.ts`)
- Main service for AI operations
- Integrates with Anthropic Claude API
- Implements retry logic with exponential backoff
- Token usage tracking
- Circuit breaker integration
- Cache management

Key Methods:
- `generateInterviewQuestion()` - Generate questions with caching
- `evaluateAnswer()` - Evaluate answers with STAR method
- `generateFollowUp()` - Context-aware follow-ups
- `analyzeResume()` - Comprehensive resume analysis
- `generateInterviewFeedback()` - End-to-end feedback

**PromptBuilderService** (`src/services/claude/prompt-builder.service.ts`)
- Constructs optimized prompts for Claude
- Category-specific prompt templates
- Difficulty-level guidance
- Context injection (company, role, experience)
- Output format specification

**ResponseParserService** (`src/services/claude/response-parser.service.ts`)
- Parses Claude API responses
- JSON extraction and validation
- Score normalization (0-100)
- Grade conversion
- Error handling for malformed responses

### 3. Utility Layer

**CacheService** (`src/utils/cache.service.ts`)
- Redis integration using ioredis
- TTL management
- Pattern-based deletion
- Statistics tracking
- Graceful degradation when Redis unavailable

**TokenCounterService** (`src/utils/token-counter.service.ts`)
- Token usage estimation
- Cost calculation per model
- Aggregate statistics
- Budget monitoring
- Operation breakdown

**RateLimiterService** (`src/utils/rate-limiter.service.ts`)
- Per-user rate limiting
- Per-operation limits
- Sliding window implementation
- Temporary blocking for abuse
- Redis-based state management

**CircuitBreakerService** (`src/utils/circuit-breaker.service.ts`)
- Three-state circuit breaker (CLOSED, OPEN, HALF_OPEN)
- Failure threshold configuration
- Automatic recovery
- Timeout protection
- Health status reporting

### 4. Common Layer

**Filters**
- `HttpExceptionFilter` - Standardized error responses
- Security-focused error handling
- Request context logging

**Interceptors**
- `LoggingInterceptor` - Request/response logging
- `TimeoutInterceptor` - Request timeout protection

## Data Flow

### Question Generation Flow
```
1. Client Request → Controller (validation)
2. Controller → ClaudeService.generateInterviewQuestion()
3. ClaudeService → CacheService.get() [check cache]
4. If cache miss:
   a. ClaudeService → PromptBuilderService.buildPrompt()
   b. ClaudeService → CircuitBreaker.execute()
   c. CircuitBreaker → Anthropic API
   d. Anthropic API → Response
   e. ClaudeService → ResponseParser.parse()
   f. ClaudeService → CacheService.set() [cache result]
5. ClaudeService → Controller
6. Controller → Client Response
```

### Answer Evaluation Flow
```
1. Client Request → Controller (validation)
2. Controller → ClaudeService.evaluateAnswer()
3. ClaudeService → PromptBuilderService (with STAR criteria)
4. ClaudeService → CircuitBreaker → Anthropic API
5. Anthropic API → Response with scores and feedback
6. ClaudeService → ResponseParser (STAR validation)
7. ClaudeService → TokenCounter.trackUsage()
8. ClaudeService → Controller
9. Controller → Client Response
```

## Caching Strategy

### What Gets Cached
- **Interview Questions**: 1 hour TTL
  - Key: `claude:question:{hash(params)}`
  - Rationale: Questions for same params are reusable
  
- **Follow-up Questions**: 30 minutes TTL
  - Key: `claude:followup:{hash(question+answer)}`
  - Rationale: Similar exchanges likely have similar follow-ups

### What Doesn't Get Cached
- **Answer Evaluations**: Unique per user
- **Resume Analysis**: Unique per user
- **Interview Feedback**: Unique per session

### Cache Invalidation
- TTL-based expiration
- Manual invalidation via admin endpoints (future)
- Pattern-based deletion for related keys

## Error Handling

### Retry Strategy
- Exponential backoff: 1s, 2s, 4s
- Max 3 retry attempts
- Only on transient failures (5xx, timeout)
- No retry on client errors (4xx)

### Circuit Breaker States

**CLOSED** (Normal Operation)
- All requests pass through
- Failures are tracked
- Transitions to OPEN after threshold failures

**OPEN** (Service Protection)
- All requests rejected immediately
- Error: "Service temporarily unavailable"
- Transitions to HALF_OPEN after reset timeout

**HALF_OPEN** (Testing Recovery)
- Limited requests allowed
- Successful requests → CLOSED
- Failed requests → OPEN

### Graceful Degradation
- Cache service failures → Continue without cache
- Redis unavailable → Disable caching
- Circuit open → Return user-friendly error
- Token counter failures → Log warning, continue

## Security Measures

### API Key Protection
- Never logged or exposed in responses
- Loaded from environment variables
- Validated at startup

### Input Validation
- DTOs with class-validator
- Type checking and transformation
- Whitelist unknown properties
- Length and format constraints

### Rate Limiting
- Global rate limit: 100 req/hour
- AI endpoints: 20-100 req/hour (per operation)
- IP-based or user-based identification
- Temporary blocking for abuse

### CORS Configuration
- Configurable allowed origins
- Credentials support
- Method restrictions

## Performance Optimization

### Token Usage
- Aggressive caching for repeated queries
- Temperature tuning per operation type
- Max token limits per operation
- Prompt optimization for token efficiency

### Response Times
- Target: <3s for AI operations
- Caching reduces to <100ms for cache hits
- Timeout protection at 60s
- Streaming support (future enhancement)

### Scalability
- Stateless design
- Horizontal scaling ready
- Redis for shared state
- Connection pooling

## Monitoring & Observability

### Health Checks
```json
{
  "status": "ok",
  "service": "ai-service",
  "ai": {
    "status": "healthy",
    "model": "claude-3-5-sonnet-20241022",
    "circuitBreakerState": "CLOSED"
  },
  "cache": {
    "enabled": true,
    "connected": true,
    "keyCount": 42
  },
  "tokens": {
    "totalOperations": 150,
    "totalTokens": 75000,
    "estimatedTotalCost": 0.45
  }
}
```

### Key Metrics
- Request count per endpoint
- Response time percentiles (p50, p95, p99)
- Error rate
- Token usage and cost
- Cache hit rate
- Circuit breaker state
- Rate limit violations

### Logging
- Structured JSON logs
- Request ID for tracing
- Error stack traces (development only)
- Performance timings
- AI API response times

## Cost Management

### Token Pricing (Claude 3.5 Sonnet)
- Input: $3 per 1M tokens
- Output: $15 per 1M tokens

### Cost Optimization Strategies
1. **Aggressive Caching**: 60%+ cache hit rate target
2. **Prompt Optimization**: Minimal context, clear instructions
3. **Temperature Tuning**: Lower for deterministic tasks
4. **Token Limits**: Appropriate max tokens per operation
5. **Budget Monitoring**: Real-time cost tracking
6. **Usage Quotas**: Per-user limits

### Estimated Costs (Monthly)
- 10,000 questions @ avg 2000 tokens = $0.30
- 20,000 evaluations @ avg 3000 tokens = $0.90
- 1,000 resume analyses @ avg 8000 tokens = $0.24
- **Total: ~$1.50/month** (with 50% cache hit rate)

## Future Enhancements

1. **Streaming Responses**: Real-time token streaming for better UX
2. **Multi-model Support**: Fallback to other models
3. **A/B Testing**: Test different prompts and models
4. **Analytics Dashboard**: Usage patterns and insights
5. **Custom Model Fine-tuning**: Domain-specific models
6. **Webhook Support**: Async processing for long operations
7. **Multi-tenancy**: Isolated quotas per organization
8. **Advanced Caching**: Semantic similarity caching

## Deployment Architecture

### Development
```
Local Machine
├── Node.js Process (port 3002)
└── Redis (port 6379)
```

### Production (Docker)
```
Docker Network
├── AI Service Container (replicas: 3)
├── Redis Container (with persistence)
├── Load Balancer (Nginx/Traefik)
└── Monitoring (Prometheus/Grafana)
```

### Kubernetes (Scalable)
```
Kubernetes Cluster
├── AI Service Deployment (HPA enabled)
├── Redis StatefulSet
├── Service Mesh (Istio)
├── Ingress Controller
└── Monitoring Stack
```

## Testing Strategy

### Unit Tests (>80% coverage)
- Service layer logic
- Prompt building
- Response parsing
- Utility functions
- Error handling

### Integration Tests
- Redis integration
- Circuit breaker behavior
- Rate limiting
- Cache invalidation

### E2E Tests
- Full request/response cycle
- Error scenarios
- Rate limiting enforcement
- Health checks

### Load Tests (Future)
- 1000+ concurrent users
- Token usage under load
- Cache performance
- Circuit breaker under stress

## Configuration

All configuration via environment variables:
- AI settings (model, tokens, temperature)
- Redis connection
- Rate limits
- Circuit breaker thresholds
- Logging levels
- CORS origins

See `.env.example` for complete list.
