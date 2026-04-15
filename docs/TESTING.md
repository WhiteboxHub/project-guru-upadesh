# Testing Guide

## Table of Contents
1. [Testing Philosophy](#testing-philosophy)
2. [Test Types](#test-types)
3. [Setup](#setup)
4. [Unit Testing](#unit-testing)
5. [Integration Testing](#integration-testing)
6. [E2E Testing](#e2e-testing)
7. [Performance Testing](#performance-testing)
8. [Security Testing](#security-testing)
9. [CI/CD Integration](#cicd-integration)
10. [Best Practices](#best-practices)

## Testing Philosophy

### Testing Pyramid

```
       /\
      /  \     E2E Tests (10%)
     /____\    
    /      \   Integration Tests (30%)
   /________\  
  /          \ Unit Tests (60%)
 /____________\
```

### Goals
- **Code Coverage**: Minimum 80% overall
- **Critical Paths**: 100% coverage for auth, payments, AI integration
- **Fast Feedback**: Unit tests < 5s, Integration tests < 30s
- **Reliability**: Tests should be deterministic and isolated
- **Maintainability**: Tests should be easy to understand and update

## Test Types

### 1. Unit Tests
- Test individual functions/methods in isolation
- Mock external dependencies
- Fast execution (< 5 seconds total)
- High coverage (>80%)

### 2. Integration Tests
- Test multiple components working together
- Use test database
- Test API endpoints
- Moderate execution time (< 30 seconds)

### 3. End-to-End (E2E) Tests
- Test complete user flows
- Use real browsers
- Test critical paths only
- Slower execution (< 5 minutes)

### 4. Performance Tests
- Load testing
- Stress testing
- Spike testing
- Endurance testing

### 5. Security Tests
- Penetration testing
- Dependency vulnerability scanning
- OWASP Top 10 testing

## Setup

### Install Dependencies

```bash
# Unit & Integration testing
npm install --save-dev jest ts-jest @types/jest
npm install --save-dev supertest @types/supertest
npm install --save-dev @faker-js/faker

# E2E testing
npm install --save-dev @playwright/test
# or
npm install --save-dev cypress

# Load testing
npm install --save-dev k6

# Code coverage
npm install --save-dev @jest/test-results-processor
npm install --save-dev jest-html-reporter
```

### Jest Configuration

```typescript
// jest.config.ts
import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: [
    '**/__tests__/**/*.ts',
    '**/?(*.)+(spec|test).ts'
  ],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*.interface.ts',
    '!src/main.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testTimeout: 10000,
};

export default config;
```

### Test Setup File

```typescript
// tests/setup.ts
import { faker } from '@faker-js/faker';

// Set seed for reproducible tests
faker.seed(123);

// Global test setup
beforeAll(async () => {
  // Setup test database
  // Setup test Redis
  // Initialize test fixtures
});

afterAll(async () => {
  // Cleanup test database
  // Close connections
});

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';
```

## Unit Testing

### Example: Service Layer Test

```typescript
// src/modules/interviews/services/interview.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { InterviewService } from './interview.service';
import { InterviewRepository } from '../repositories/interview.repository';
import { AIService } from '@/modules/ai/ai.service';
import { NotFoundException } from '@nestjs/common';
import { faker } from '@faker-js/faker';

describe('InterviewService', () => {
  let service: InterviewService;
  let repository: jest.Mocked<InterviewRepository>;
  let aiService: jest.Mocked<AIService>;

  beforeEach(async () => {
    const mockRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const mockAIService = {
      generateQuestion: jest.fn(),
      analyzeResponse: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InterviewService,
        { provide: InterviewRepository, useValue: mockRepository },
        { provide: AIService, useValue: mockAIService },
      ],
    }).compile();

    service = module.get<InterviewService>(InterviewService);
    repository = module.get(InterviewRepository);
    aiService = module.get(AIService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createInterview', () => {
    it('should create a new interview successfully', async () => {
      // Arrange
      const createDto = {
        userId: faker.string.uuid(),
        type: 'technical',
        difficulty: 'medium',
      };

      const expectedInterview = {
        id: faker.string.uuid(),
        ...createDto,
        status: 'pending',
        createdAt: new Date(),
      };

      repository.create.mockResolvedValue(expectedInterview);
      aiService.generateQuestion.mockResolvedValue({
        question: 'What is React?',
        category: 'frontend',
      });

      // Act
      const result = await service.createInterview(createDto);

      // Assert
      expect(result).toEqual(expectedInterview);
      expect(repository.create).toHaveBeenCalledWith(createDto);
      expect(repository.create).toHaveBeenCalledTimes(1);
    });

    it('should throw error when user not found', async () => {
      // Arrange
      const createDto = {
        userId: 'invalid-id',
        type: 'technical',
        difficulty: 'medium',
      };

      repository.create.mockRejectedValue(
        new NotFoundException('User not found')
      );

      // Act & Assert
      await expect(service.createInterview(createDto)).rejects.toThrow(
        NotFoundException
      );
    });

    it('should handle AI service failure gracefully', async () => {
      // Arrange
      const createDto = {
        userId: faker.string.uuid(),
        type: 'technical',
        difficulty: 'medium',
      };

      repository.create.mockResolvedValue({ id: '123', ...createDto });
      aiService.generateQuestion.mockRejectedValue(
        new Error('AI service unavailable')
      );

      // Act & Assert
      await expect(service.createInterview(createDto)).rejects.toThrow(
        'AI service unavailable'
      );
    });
  });

  describe('analyzeResponse', () => {
    it('should analyze response and return score', async () => {
      // Arrange
      const interviewId = faker.string.uuid();
      const response = 'React is a JavaScript library for building UIs';

      aiService.analyzeResponse.mockResolvedValue({
        score: 85,
        feedback: 'Good answer with clear explanation',
        suggestions: ['Could mention component-based architecture'],
      });

      // Act
      const result = await service.analyzeResponse(interviewId, response);

      // Assert
      expect(result.score).toBe(85);
      expect(result.feedback).toBeDefined();
      expect(aiService.analyzeResponse).toHaveBeenCalledWith(response);
    });
  });

  describe('getInterviewById', () => {
    it('should return interview when found', async () => {
      // Arrange
      const interviewId = faker.string.uuid();
      const expectedInterview = {
        id: interviewId,
        userId: faker.string.uuid(),
        type: 'technical',
        status: 'completed',
      };

      repository.findById.mockResolvedValue(expectedInterview);

      // Act
      const result = await service.getInterviewById(interviewId);

      // Assert
      expect(result).toEqual(expectedInterview);
    });

    it('should throw NotFoundException when interview not found', async () => {
      // Arrange
      const interviewId = 'non-existent-id';
      repository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.getInterviewById(interviewId)).rejects.toThrow(
        NotFoundException
      );
    });
  });
});
```

### Example: Utility Function Test

```typescript
// src/common/utils/password.spec.ts
import { hashPassword, comparePassword, generateRandomPassword } from './password';

describe('Password Utilities', () => {
  describe('hashPassword', () => {
    it('should hash password successfully', async () => {
      const password = 'SecureP@ssw0rd';
      const hash = await hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(50);
    });

    it('should generate different hashes for same password', async () => {
      const password = 'SecureP@ssw0rd';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('comparePassword', () => {
    it('should return true for matching password', async () => {
      const password = 'SecureP@ssw0rd';
      const hash = await hashPassword(password);
      const isMatch = await comparePassword(password, hash);

      expect(isMatch).toBe(true);
    });

    it('should return false for non-matching password', async () => {
      const password = 'SecureP@ssw0rd';
      const wrongPassword = 'WrongPassword';
      const hash = await hashPassword(password);
      const isMatch = await comparePassword(wrongPassword, hash);

      expect(isMatch).toBe(false);
    });
  });

  describe('generateRandomPassword', () => {
    it('should generate password with correct length', () => {
      const length = 16;
      const password = generateRandomPassword(length);

      expect(password.length).toBe(length);
    });

    it('should generate different passwords each time', () => {
      const password1 = generateRandomPassword(16);
      const password2 = generateRandomPassword(16);

      expect(password1).not.toBe(password2);
    });

    it('should include special characters', () => {
      const password = generateRandomPassword(16);
      const hasSpecialChar = /[!@#$%^&*]/.test(password);

      expect(hasSpecialChar).toBe(true);
    });
  });
});
```

### Running Unit Tests

```bash
# Run all unit tests
npm run test

# Run with coverage
npm run test:cov

# Run in watch mode
npm run test:watch

# Run specific test file
npm test -- interview.service.spec.ts

# Run tests matching pattern
npm test -- --testNamePattern="should create"
```

## Integration Testing

### API Endpoint Testing

```typescript
// tests/integration/auth.test.ts
import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '@/app.module';
import { faker } from '@faker-js/faker';

describe('Authentication (Integration)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /auth/register', () => {
    it('should register a new user', async () => {
      const userData = {
        email: faker.internet.email(),
        password: 'SecureP@ssw0rd123',
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('email', userData.email);
      expect(response.body.data).not.toHaveProperty('password');
    });

    it('should return 400 for invalid email', async () => {
      const userData = {
        email: 'invalid-email',
        password: 'SecureP@ssw0rd123',
        firstName: 'John',
        lastName: 'Doe',
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 409 for duplicate email', async () => {
      const userData = {
        email: 'duplicate@example.com',
        password: 'SecureP@ssw0rd123',
        firstName: 'John',
        lastName: 'Doe',
      };

      // First registration
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(201);

      // Duplicate registration
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(409);

      expect(response.body.error.code).toBe('EMAIL_EXISTS');
    });
  });

  describe('POST /auth/login', () => {
    const testUser = {
      email: faker.internet.email(),
      password: 'SecureP@ssw0rd123',
      firstName: 'Test',
      lastName: 'User',
    };

    beforeAll(async () => {
      // Create test user
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(testUser);
    });

    it('should login successfully with valid credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200);

      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data).toHaveProperty('refreshToken');
      authToken = response.body.data.accessToken;
    });

    it('should return 401 for invalid credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword',
        })
        .expect(401);

      expect(response.body.error.code).toBe('INVALID_CREDENTIALS');
    });
  });

  describe('GET /auth/profile', () => {
    it('should get user profile with valid token', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data).toHaveProperty('email');
      expect(response.body.data).not.toHaveProperty('password');
    });

    it('should return 401 without token', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/auth/profile')
        .expect(401);
    });

    it('should return 401 with invalid token', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/auth/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });
});
```

### Database Integration Test

```typescript
// tests/integration/database.test.ts
import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

describe('Database Integration', () => {
  let prisma: PrismaClient;

  beforeAll(() => {
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // Clean up database
    await prisma.interview.deleteMany();
    await prisma.user.deleteMany();
  });

  describe('User CRUD operations', () => {
    it('should create and retrieve user', async () => {
      const userData = {
        email: faker.internet.email(),
        password: 'hashed-password',
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
      };

      const createdUser = await prisma.user.create({ data: userData });
      expect(createdUser.id).toBeDefined();

      const retrievedUser = await prisma.user.findUnique({
        where: { id: createdUser.id },
      });

      expect(retrievedUser).toMatchObject(userData);
    });

    it('should handle unique constraint on email', async () => {
      const email = faker.internet.email();

      await prisma.user.create({
        data: {
          email,
          password: 'password',
          firstName: 'John',
          lastName: 'Doe',
        },
      });

      await expect(
        prisma.user.create({
          data: {
            email, // Duplicate email
            password: 'password',
            firstName: 'Jane',
            lastName: 'Smith',
          },
        })
      ).rejects.toThrow();
    });
  });

  describe('Interview with relations', () => {
    it('should create interview with user relation', async () => {
      const user = await prisma.user.create({
        data: {
          email: faker.internet.email(),
          password: 'password',
          firstName: 'John',
          lastName: 'Doe',
        },
      });

      const interview = await prisma.interview.create({
        data: {
          userId: user.id,
          type: 'technical',
          status: 'pending',
        },
        include: {
          user: true,
        },
      });

      expect(interview.user.email).toBe(user.email);
    });
  });
});
```

## E2E Testing

### Playwright E2E Tests

```typescript
// tests/e2e/interview-flow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Mock Interview Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('should complete full mock interview', async ({ page }) => {
    // Navigate to mock interview
    await page.click('text=Start Mock Interview');
    await expect(page).toHaveURL('/interviews/new');

    // Select interview type
    await page.click('[data-testid="interview-type-technical"]');
    await page.click('[data-testid="difficulty-medium"]');
    await page.click('text=Start Interview');

    // Wait for interview to load
    await page.waitForSelector('[data-testid="interview-question"]');

    // Verify question is displayed
    const question = await page.textContent('[data-testid="interview-question"]');
    expect(question).toBeTruthy();

    // Grant microphone permission (in test environment)
    await page.context().grantPermissions(['microphone']);

    // Start recording
    await page.click('[data-testid="start-recording"]');
    await expect(page.locator('[data-testid="recording-indicator"]')).toBeVisible();

    // Simulate answer (in real test, this would be audio)
    await page.fill('[data-testid="text-answer"]', 'This is my answer to the question');

    // Submit answer
    await page.click('[data-testid="submit-answer"]');

    // Wait for AI feedback
    await page.waitForSelector('[data-testid="feedback-score"]');

    // Verify feedback is displayed
    const score = await page.textContent('[data-testid="feedback-score"]');
    expect(parseInt(score!)).toBeGreaterThan(0);

    // Complete interview
    await page.click('[data-testid="end-interview"]');
    await page.waitForURL('/interviews/*/results');

    // Verify results page
    await expect(page.locator('[data-testid="overall-score"]')).toBeVisible();
  });

  test('should handle microphone permission denial', async ({ page }) => {
    await page.goto('/interviews/new');
    
    // Deny microphone permission
    await page.context().clearPermissions();

    await page.click('[data-testid="start-recording"]');

    // Verify error message
    await expect(page.locator('text=Microphone access is required')).toBeVisible();
  });

  test('should save interview progress', async ({ page }) => {
    // Start interview
    await page.goto('/interviews/new');
    await page.click('[data-testid="interview-type-technical"]');
    await page.click('text=Start Interview');

    // Answer first question
    await page.fill('[data-testid="text-answer"]', 'First answer');
    await page.click('[data-testid="submit-answer"]');

    // Navigate away
    await page.goto('/dashboard');

    // Go back to interviews
    await page.click('text=My Interviews');

    // Verify in-progress interview exists
    await expect(page.locator('[data-testid="interview-in-progress"]')).toBeVisible();

    // Resume interview
    await page.click('[data-testid="resume-interview"]');

    // Verify we're back in the interview
    await expect(page.locator('[data-testid="interview-question"]')).toBeVisible();
  });
});
```

### Running E2E Tests

```bash
# Run all E2E tests
npx playwright test

# Run in headed mode
npx playwright test --headed

# Run specific browser
npx playwright test --project=chromium

# Debug mode
npx playwright test --debug

# Generate test report
npx playwright show-report
```

## Performance Testing

### Load Testing with k6

```javascript
// tests/performance/load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp up to 100 users
    { duration: '5m', target: 100 }, // Stay at 100 users
    { duration: '2m', target: 200 }, // Ramp up to 200 users
    { duration: '5m', target: 200 }, // Stay at 200 users
    { duration: '2m', target: 0 },   // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests must complete below 500ms
    'http_req_duration{staticAsset:yes}': ['p(95)<100'],
    errors: ['rate<0.1'], // Error rate must be less than 10%
  },
};

const BASE_URL = 'https://api.yourdomain.com';

export function setup() {
  // Login to get auth token
  const loginRes = http.post(`${BASE_URL}/api/v1/auth/login`, JSON.stringify({
    email: 'test@example.com',
    password: 'password123',
  }), {
    headers: { 'Content-Type': 'application/json' },
  });

  return { authToken: loginRes.json('data.accessToken') };
}

export default function(data) {
  const params = {
    headers: {
      'Authorization': `Bearer ${data.authToken}`,
      'Content-Type': 'application/json',
    },
  };

  // Test 1: Get user profile
  let res = http.get(`${BASE_URL}/api/v1/auth/profile`, params);
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 200ms': (r) => r.timings.duration < 200,
  }) || errorRate.add(1);

  sleep(1);

  // Test 2: Create mock interview
  res = http.post(`${BASE_URL}/api/v1/interviews`, JSON.stringify({
    type: 'technical',
    difficulty: 'medium',
  }), params);

  check(res, {
    'interview created': (r) => r.status === 201,
    'has interview ID': (r) => r.json('data.id') !== undefined,
  }) || errorRate.add(1);

  sleep(2);

  // Test 3: Get interview questions
  const interviewId = res.json('data.id');
  res = http.get(`${BASE_URL}/api/v1/interviews/${interviewId}/questions`, params);

  check(res, {
    'questions loaded': (r) => r.status === 200,
    'has questions': (r) => r.json('data.length') > 0,
  }) || errorRate.add(1);

  sleep(1);
}
```

### Running Performance Tests

```bash
# Run load test
k6 run tests/performance/load-test.js

# Run with custom VUs and duration
k6 run --vus 100 --duration 30s tests/performance/load-test.js

# Run and send results to cloud
k6 run --out cloud tests/performance/load-test.js
```

## Security Testing

### OWASP ZAP Automation

```yaml
# tests/security/zap-scan.yml
env:
  contexts:
    - name: "Guru Upadesh"
      urls:
        - "https://staging.yourdomain.com"
      includePaths:
        - "https://staging.yourdomain.com/.*"
      excludePaths:
        - "https://staging.yourdomain.com/logout"
      authentication:
        method: "json"
        parameters:
          loginPageUrl: "https://staging.yourdomain.com/api/v1/auth/login"
          loginRequestBody: '{"email":"test@example.com","password":"password123"}'
        verification:
          method: "response"
          loggedInRegex: "\\Qaccesstoken\\E"

jobs:
  - type: spider
    parameters:
      maxDuration: 10

  - type: passiveScan-wait
    parameters:
      maxDuration: 5

  - type: activeScan
    parameters:
      maxRuleDuration: 5
      maxScanDuration: 20

  - type: report
    parameters:
      template: "traditional-html"
      reportDir: "./reports"
      reportFile: "zap-report"
```

### Dependency Scanning

```bash
# Run npm audit
npm audit

# Fix vulnerabilities
npm audit fix

# Check with Snyk
npx snyk test

# Monitor dependencies
npx snyk monitor
```

## CI/CD Integration

### GitHub Actions Test Workflow

```yaml
# .github/workflows/test.yml
name: Test Suite

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  unit-tests:
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
      
      - name: Run unit tests
        run: npm run test:cov
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
          flags: unittests

  integration-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run migrations
        run: npm run migrate:test
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test
      
      - name: Run integration tests
        run: npm run test:integration
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test
          REDIS_URL: redis://localhost:6379

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright
        run: npx playwright install --with-deps
      
      - name: Run E2E tests
        run: npm run test:e2e
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

## Best Practices

### 1. Test Organization

```
tests/
├── unit/
│   ├── services/
│   ├── utils/
│   └── validators/
├── integration/
│   ├── api/
│   ├── database/
│   └── services/
├── e2e/
│   ├── auth/
│   ├── interviews/
│   └── payment/
├── performance/
│   └── load-tests/
└── fixtures/
    └── test-data.ts
```

### 2. Test Data Management

```typescript
// tests/fixtures/test-data.ts
import { faker } from '@faker-js/faker';

export const TestDataFactory = {
  user: (overrides = {}) => ({
    email: faker.internet.email(),
    password: 'SecureP@ssw0rd123',
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    ...overrides,
  }),

  interview: (overrides = {}) => ({
    type: 'technical',
    difficulty: 'medium',
    status: 'pending',
    ...overrides,
  }),

  question: (overrides = {}) => ({
    text: faker.lorem.sentence(),
    category: 'technical',
    difficulty: 'medium',
    ...overrides,
  }),
};
```

### 3. Test Naming Convention

```typescript
// Good: Descriptive, follows Given-When-Then
test('should return 404 when user with given ID does not exist', () => {});

// Bad: Vague, unclear
test('user test', () => {});
```

### 4. Avoid Test Interdependence

```typescript
// Bad: Tests depend on each other
test('create user', () => { /* creates user with ID 1 */ });
test('get user', () => { /* assumes user 1 exists */ });

// Good: Each test is independent
test('create user', () => {
  const user = await createTestUser();
  // test with user
  await cleanupTestUser(user.id);
});
```

### 5. Use Test Doubles Appropriately

```typescript
// Mock: For external services
jest.mock('@/services/email.service');

// Stub: For simple replacements
const stub = jest.fn().mockReturnValue('result');

// Spy: To verify calls
const spy = jest.spyOn(service, 'method');
```

### 6. Clean Up After Tests

```typescript
afterEach(async () => {
  // Clear mocks
  jest.clearAllMocks();
  
  // Clean database
  await prisma.interview.deleteMany();
  
  // Clear cache
  await redis.flushall();
});
```

## Coverage Reports

### Viewing Coverage

```bash
# Generate and open HTML report
npm run test:cov
open coverage/lcov-report/index.html
```

### Coverage Requirements

- **Overall**: 80% minimum
- **Critical modules**: 90% minimum (auth, payments)
- **Branches**: 75% minimum
- **Functions**: 80% minimum

## Continuous Improvement

1. **Review test results weekly**
2. **Update tests when code changes**
3. **Remove flaky tests**
4. **Add tests for bugs before fixing**
5. **Monitor test execution time**
6. **Keep test code clean and maintainable**

## Additional Resources

- [Jest Documentation](https://jestjs.io/)
- [Playwright Documentation](https://playwright.dev/)
- [k6 Documentation](https://k6.io/docs/)
- [Testing Best Practices](https://testingjavascript.com/)
