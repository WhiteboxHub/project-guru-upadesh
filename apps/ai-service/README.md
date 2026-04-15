# Guru Upadesh AI Service

AI-powered microservice for interview assistance and evaluation using Claude API (Anthropic).

## Features

- **Interview Question Generation**: Generate category-specific interview questions with customizable difficulty
- **Answer Evaluation**: Comprehensive answer evaluation with STAR method analysis for behavioral questions
- **Follow-up Questions**: Generate contextual follow-up questions based on candidate responses
- **Resume Analysis**: ATS compatibility checking and resume optimization recommendations
- **Interview Feedback**: Generate comprehensive feedback for completed interviews

## Tech Stack

- **Framework**: NestJS 10.x with TypeScript
- **AI**: Anthropic Claude API (Claude 3.5 Sonnet)
- **Caching**: Redis for response caching and cost optimization
- **Rate Limiting**: Built-in rate limiting with @nestjs/throttler
- **Circuit Breaker**: Fault tolerance for external API calls
- **Testing**: Jest for unit and e2e tests

## Prerequisites

- Node.js 18+ 
- Redis (for caching)
- Anthropic API key

## Installation

```bash
npm install
```

## Configuration

Copy `.env.example` to `.env` and configure:

```bash
# Required
ANTHROPIC_API_KEY=sk-ant-your-api-key-here

# Optional (with defaults)
PORT=3002
CLAUDE_MODEL=claude-3-5-sonnet-20241022
CLAUDE_MAX_TOKENS=4096
CLAUDE_TEMPERATURE=0.7

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
CACHE_TTL=3600
```

## Running the Service

```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod

# Debug mode
npm run start:debug
```

The service will be available at `http://localhost:3002`

## API Documentation

Swagger documentation is available at `http://localhost:3002/api/docs`

### Endpoints

#### Generate Interview Question
```http
POST /api/v1/ai/generate-question
Content-Type: application/json

{
  "category": "behavioral",
  "difficulty": "medium",
  "company": "Google",
  "role": "Software Engineer"
}
```

#### Evaluate Answer
```http
POST /api/v1/ai/evaluate-answer
Content-Type: application/json

{
  "question": "Tell me about a challenging project",
  "answer": "In my previous role...",
  "category": "behavioral",
  "context": {
    "role": "Senior Developer",
    "yearsOfExperience": 5
  }
}
```

#### Analyze Resume
```http
POST /api/v1/ai/analyze-resume
Content-Type: application/json

{
  "resumeText": "Full resume content...",
  "jobDescription": "Optional job description...",
  "targetIndustry": "Technology",
  "targetRole": "Senior Software Engineer"
}
```

#### Health Check
```http
GET /api/v1/ai/health
```

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

Coverage target: >80% for all metrics

## Architecture

### Services

- **ClaudeService**: Main service for AI operations
- **PromptBuilderService**: Constructs prompts for different AI tasks
- **ResponseParserService**: Parses and validates AI responses
- **CacheService**: Redis-based caching for cost optimization
- **TokenCounterService**: Tracks token usage and costs
- **RateLimiterService**: API rate limiting per operation
- **CircuitBreakerService**: Fault tolerance for external calls

### Caching Strategy

- Question generation: 1 hour cache
- Follow-up questions: 30 minutes cache
- Answer evaluation: No caching (unique per user)
- Resume analysis: No caching (unique per user)

### Rate Limits

- Generate question: 50 requests/hour
- Evaluate answer: 100 requests/hour
- Analyze resume: 20 requests/hour
- Generate feedback: 30 requests/hour

## Cost Optimization

- Aggressive caching for repeated queries
- Token usage tracking and monitoring
- Configurable temperature and max tokens per operation
- Circuit breaker to prevent excessive failed API calls

## Error Handling

- Custom exception filters with standardized error format
- Circuit breaker for service resilience
- Retry logic with exponential backoff
- Graceful degradation when AI service is unavailable

## Monitoring

### Health Endpoint
Check service health including AI status, cache, and token usage:
```bash
curl http://localhost:3002/api/v1/ai/health
```

### Statistics Endpoint
Get detailed statistics:
```bash
curl http://localhost:3002/api/v1/ai/stats
```

## Security

- API keys never logged or exposed
- Input validation on all endpoints
- Rate limiting to prevent abuse
- Timeout protection on AI calls
- CORS configuration for allowed origins

## Production Considerations

1. **Environment Variables**: Never commit secrets
2. **Scaling**: Stateless design allows horizontal scaling
3. **Redis**: Use Redis cluster for production
4. **Monitoring**: Integrate with Sentry/DataDog for error tracking
5. **Logging**: Winston configured for structured logging
6. **API Keys**: Rotate regularly and use secret management

## Development

### Code Style
- ESLint + Prettier configured
- Strict TypeScript mode
- No implicit any
- Explicit return types

### Adding New AI Operations

1. Create DTO in `src/dto/`
2. Add prompt builder method in `PromptBuilderService`
3. Add parser method in `ResponseParserService`
4. Add service method in `ClaudeService`
5. Add controller endpoint in `AiController`
6. Write tests for all layers

## Troubleshooting

### Common Issues

**Service won't start**
- Check ANTHROPIC_API_KEY is configured
- Verify Redis is running
- Check port 3002 is available

**High latency**
- Check Redis connection
- Monitor Claude API response times
- Review circuit breaker status

**Rate limiting issues**
- Adjust limits in environment variables
- Check rate limiter configuration
- Monitor usage patterns

## License

UNLICENSED - Private project

## Support

For issues or questions, contact the development team.
