# Contributing to Guru Upadesh

Thank you for your interest in contributing to Guru Upadesh! This document provides guidelines and instructions for contributing.

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Workflow](#development-workflow)
4. [Coding Standards](#coding-standards)
5. [Testing Guidelines](#testing-guidelines)
6. [Pull Request Process](#pull-request-process)
7. [Commit Message Convention](#commit-message-convention)

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers and help them get started
- Focus on constructive feedback
- Assume good intentions

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 8+
- Docker and Docker Compose
- Git

### Setup Development Environment

```bash
# Clone the repository
git clone https://github.com/yourusername/guru-upadesh.git
cd guru-upadesh

# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env
# Update .env with your values

# Start Docker services
pnpm docker:dev

# Run database migrations
pnpm migrate:dev

# Seed database
pnpm seed

# Start all applications
pnpm dev
```

The applications will be available at:
- Frontend: http://localhost:3001
- API: http://localhost:3000
- AI Service: http://localhost:3002

## Development Workflow

### 1. Create a Branch

```bash
# Update main branch
git checkout main
git pull origin main

# Create a feature branch
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b fix/bug-description
```

### Branch Naming Convention

- `feature/description` - New features
- `fix/description` - Bug fixes
- `refactor/description` - Code refactoring
- `docs/description` - Documentation updates
- `test/description` - Test additions/updates
- `chore/description` - Build process or tooling changes

### 2. Make Changes

- Write clean, readable code
- Follow the coding standards (see below)
- Add tests for new features
- Update documentation as needed

### 3. Test Your Changes

```bash
# Run linting
pnpm lint

# Run type checking
pnpm typecheck

# Run unit tests
pnpm test

# Run specific package tests
pnpm --filter=api test

# Run tests with coverage
pnpm test:cov

# Run E2E tests (if applicable)
pnpm test:e2e
```

### 4. Commit Your Changes

Follow the [commit message convention](#commit-message-convention):

```bash
git add .
git commit -m "feat(api): add interview scheduling endpoint"
```

### 5. Push and Create Pull Request

```bash
git push origin feature/your-feature-name
```

Then create a pull request on GitHub.

## Coding Standards

### TypeScript

- **Strict mode enabled**: No implicit any
- **Explicit return types**: For all functions
- **Interface over type**: Use interfaces for object shapes
- **Naming conventions**:
  - Classes: PascalCase
  - Interfaces: PascalCase with 'I' prefix (e.g., `IUser`)
  - Functions/variables: camelCase
  - Constants: UPPER_SNAKE_CASE
  - Files: kebab-case

### Code Style

```typescript
// Good
export interface IUserProfile {
  id: string;
  userId: string;
  bio: string;
}

export class UserService {
  async getUserById(id: string): Promise<User | null> {
    const user = await this.userRepository.findById(id);
    return user;
  }
}

// Bad - no return type, unclear naming
export class Service {
  async getUser(id) {
    return await this.repo.find(id);
  }
}
```

### Function Length

- Maximum 50 lines per function
- If longer, split into smaller functions
- Each function should do one thing well

### File Organization

```typescript
// 1. Imports (external, then internal)
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

// 2. Interfaces/Types
interface IServiceOptions {
  timeout: number;
}

// 3. Constants
const DEFAULT_TIMEOUT = 30000;

// 4. Class implementation
@Injectable()
export class MyService {
  constructor(private prisma: PrismaService) {}

  // Public methods first
  async publicMethod(): Promise<void> {
    // Implementation
  }

  // Private methods last
  private privateMethod(): void {
    // Implementation
  }
}
```

### Error Handling

```typescript
// Good - specific error handling
try {
  const user = await this.findUser(id);
  if (!user) {
    throw new NotFoundException(`User with ID ${id} not found`);
  }
  return user;
} catch (error) {
  this.logger.error(`Failed to fetch user: ${error.message}`, error.stack);
  throw error;
}

// Bad - generic error handling
try {
  return await this.findUser(id);
} catch (e) {
  console.log(e);
}
```

### Comments

- Write self-documenting code
- Use comments to explain "why", not "what"
- Add JSDoc comments for public APIs

```typescript
// Good
/**
 * Evaluates an interview answer using AI and returns a score with feedback.
 * Uses caching to reduce API costs for similar answers.
 *
 * @param question - The interview question
 * @param answer - The candidate's answer
 * @returns Score (0-100) and detailed feedback
 */
async evaluateAnswer(question: string, answer: string): Promise<Evaluation> {
  // Check cache first to reduce costs
  const cached = await this.getCachedEvaluation(question, answer);
  if (cached) return cached;

  return this.ai.evaluate(question, answer);
}
```

## Testing Guidelines

### Unit Tests

- Test all business logic
- Mock external dependencies
- Use descriptive test names

```typescript
describe('UserService', () => {
  describe('createUser', () => {
    it('should create user with valid data', async () => {
      // Arrange
      const userData = { email: 'test@example.com', password: 'pass123' };

      // Act
      const result = await service.createUser(userData);

      // Assert
      expect(result).toBeDefined();
      expect(result.email).toBe(userData.email);
    });

    it('should throw ConflictException for duplicate email', async () => {
      // Arrange
      const userData = { email: 'existing@example.com', password: 'pass123' };

      // Act & Assert
      await expect(service.createUser(userData)).rejects.toThrow(
        ConflictException
      );
    });
  });
});
```

### Integration Tests

- Test API endpoints end-to-end
- Use test database
- Clean up after tests

```typescript
describe('POST /api/v1/auth/register', () => {
  it('should register a new user', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email: 'newuser@example.com',
        password: 'SecurePass123!',
        firstName: 'John',
        lastName: 'Doe',
      })
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('id');
  });
});
```

### Test Coverage

- Aim for >80% code coverage
- 100% coverage for critical paths (auth, payments)
- Focus on meaningful tests, not just coverage numbers

## Pull Request Process

### Before Submitting

1. **Update your branch** with the latest main:
   ```bash
   git checkout main
   git pull origin main
   git checkout your-branch
   git rebase main
   ```

2. **Run all checks**:
   ```bash
   pnpm lint
   pnpm typecheck
   pnpm test
   pnpm build
   ```

3. **Update documentation** if needed

4. **Add tests** for new features

### PR Description Template

```markdown
## Description
Brief description of what this PR does

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## How to Test
1. Step 1
2. Step 2
3. Expected result

## Checklist
- [ ] My code follows the style guidelines
- [ ] I have performed a self-review
- [ ] I have commented my code where needed
- [ ] I have updated the documentation
- [ ] I have added tests that prove my fix/feature works
- [ ] New and existing unit tests pass locally
- [ ] No console warnings or errors

## Screenshots (if applicable)
```

### Review Process

- At least 1 approval required
- All CI checks must pass
- Address review comments promptly
- Squash commits before merging if requested

## Commit Message Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/).

### Format

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only changes
- `style`: Code style changes (formatting, no code change)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Build process or tooling changes
- `ci`: CI configuration changes

### Scopes

- `api`: Backend API
- `web`: Frontend application
- `ai-service`: AI microservice
- `shared`: Shared packages
- `docs`: Documentation
- `infra`: Infrastructure

### Examples

```bash
# Feature
feat(api): add interview scheduling endpoint

# Bug fix
fix(web): resolve login form validation issue

# Documentation
docs(readme): update installation instructions

# Refactoring
refactor(api): simplify authentication middleware

# Performance
perf(ai-service): optimize Claude API response caching

# Breaking change
feat(api)!: change interview API response format

BREAKING CHANGE: Interview endpoint now returns nested questions object
```

## Getting Help

- Check existing [issues](https://github.com/yourusername/guru-upadesh/issues)
- Join our [Discord](https://discord.gg/your-server) (if applicable)
- Read the [documentation](./docs/)

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
