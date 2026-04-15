# Quick Start Guide

Get the AI Service running in 5 minutes.

## Prerequisites

- Node.js 18+
- Redis (optional but recommended)
- Anthropic API key

## Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
# Copy example config
cp .env.example .env

# Edit .env and add your API key
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

### 3. Start Redis (Optional)
```bash
# macOS
brew services start redis

# Docker
docker run -d -p 6379:6379 redis:7-alpine

# Or disable caching in .env
CACHE_ENABLED=false
```

### 4. Run the Service
```bash
# Development mode with hot reload
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

Service will start at: http://localhost:3002

## Quick Test

### Health Check
```bash
curl http://localhost:3002/api/v1/ai/health
```

### Generate Question
```bash
curl -X POST http://localhost:3002/api/v1/ai/generate-question \
  -H "Content-Type: application/json" \
  -d '{
    "category": "behavioral",
    "difficulty": "medium",
    "company": "Google"
  }'
```

### Evaluate Answer
```bash
curl -X POST http://localhost:3002/api/v1/ai/evaluate-answer \
  -H "Content-Type: application/json" \
  -d '{
    "question": "Tell me about a challenging project",
    "answer": "I worked on a microservices migration...",
    "category": "behavioral"
  }'
```

## View API Docs

Open in browser: http://localhost:3002/api/docs

## Docker Quick Start

```bash
# Build and run with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f ai-service

# Stop
docker-compose down
```

## Common Issues

### "ANTHROPIC_API_KEY is not configured"
- Add your API key to `.env` file
- Restart the service

### "Redis connection failed"
- Start Redis: `redis-server`
- Or disable caching: `CACHE_ENABLED=false` in `.env`

### Port 3002 already in use
- Change port in `.env`: `PORT=3003`
- Or stop the process using port 3002

## Next Steps

- Read [README.md](./README.md) for detailed documentation
- Check [ARCHITECTURE.md](./ARCHITECTURE.md) for system design
- Run tests: `npm test`
- Configure rate limits in `.env`
- Set up monitoring (Sentry, DataDog)

## Example Integration

### JavaScript/TypeScript
```typescript
import axios from 'axios';

const aiService = axios.create({
  baseURL: 'http://localhost:3002/api/v1',
});

// Generate question
const question = await aiService.post('/ai/generate-question', {
  category: 'technical',
  difficulty: 'hard',
  role: 'Senior Engineer',
});

// Evaluate answer
const evaluation = await aiService.post('/ai/evaluate-answer', {
  question: question.data.question,
  answer: userAnswer,
  category: 'technical',
});

console.log('Score:', evaluation.data.score);
console.log('Feedback:', evaluation.data.feedback);
```

### Python
```python
import requests

AI_SERVICE = "http://localhost:3002/api/v1"

# Generate question
response = requests.post(f"{AI_SERVICE}/ai/generate-question", json={
    "category": "behavioral",
    "difficulty": "medium"
})
question = response.json()

# Evaluate answer
response = requests.post(f"{AI_SERVICE}/ai/evaluate-answer", json={
    "question": question["question"],
    "answer": user_answer,
    "category": "behavioral"
})
evaluation = response.json()

print(f"Score: {evaluation['score']}")
print(f"Grade: {evaluation['grade']}")
```

## Development Tips

### Run with Debug
```bash
npm run start:debug
```

### Watch Mode
```bash
npm run start:dev
```

### Run Tests
```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# Coverage
npm run test:cov
```

### Lint & Format
```bash
npm run lint
npm run format
```

## Production Checklist

- [ ] Set strong ANTHROPIC_API_KEY
- [ ] Configure Redis with persistence
- [ ] Set appropriate rate limits
- [ ] Enable monitoring (Sentry)
- [ ] Configure CORS for your domain
- [ ] Set up SSL/TLS
- [ ] Configure backup strategy
- [ ] Set up alerting
- [ ] Review security settings
- [ ] Load test before launch

## Support

For issues or questions:
1. Check [README.md](./README.md)
2. Review [ARCHITECTURE.md](./ARCHITECTURE.md)
3. Check service logs
4. Contact development team

Happy coding! 🚀
