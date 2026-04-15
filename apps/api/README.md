# Guru Upadesh API

Production-grade NestJS API for the Guru Upadesh AI-powered interview preparation platform.

## Features

- **Authentication & Authorization**: JWT-based authentication with refresh tokens
- **User Management**: Complete CRUD operations for user profiles
- **Interview Management**: Track and manage mock interviews
- **Question Bank**: Comprehensive database of interview questions
- **Analytics**: Performance tracking and user statistics
- **Health Checks**: Kubernetes-ready health endpoints

## Tech Stack

- **Framework**: NestJS 10.x
- **Database**: PostgreSQL with Prisma ORM
- **Cache**: Redis
- **Authentication**: JWT with Passport
- **Logging**: Winston
- **Validation**: class-validator & class-transformer
- **API Documentation**: Swagger/OpenAPI
- **Testing**: Jest

## Prerequisites

- Node.js 18+ 
- PostgreSQL 14+
- Redis 6+
- npm or yarn

## Getting Started

### 1. Environment Setup

Copy the example environment file:

```bash
cp .env.example .env
```

Update the environment variables in `.env` with your configuration.

### 2. Install Dependencies

```bash
npm install
```

### 3. Database Setup

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

### 4. Start Development Server

```bash
npm run dev
```

The API will be available at `http://localhost:3000`

API Documentation: `http://localhost:3000/api/docs`

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm test` - Run unit tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:cov` - Run tests with coverage report
- `npm run test:e2e` - Run end-to-end tests
- `npm run lint` - Lint code
- `npm run format` - Format code with Prettier
- `npm run migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio

## Project Structure

```
src/
├── common/              # Shared utilities, guards, filters
│   ├── decorators/      # Custom decorators
│   ├── filters/         # Exception filters
│   ├── guards/          # Auth guards
│   ├── interceptors/    # Response interceptors
│   ├── middleware/      # Custom middleware
│   ├── services/        # Shared services (logger)
│   └── utils/           # Utility functions
├── config/              # Configuration files
├── database/            # Database module and service
├── modules/             # Feature modules
│   ├── auth/            # Authentication
│   ├── users/           # User management
│   ├── interviews/      # Interview management
│   ├── questions/       # Question bank
│   ├── analytics/       # Analytics and reporting
│   └── health/          # Health checks
├── app.module.ts        # Root module
└── main.ts              # Application entry point

prisma/
├── schema.prisma        # Database schema
├── migrations/          # Database migrations
└── seed.ts              # Database seeding script
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - Logout user

### Users
- `GET /api/v1/users` - Get all users (paginated)
- `GET /api/v1/users/me` - Get current user profile
- `GET /api/v1/users/me/stats` - Get current user statistics
- `GET /api/v1/users/:id` - Get user by ID
- `PATCH /api/v1/users/me` - Update current user profile
- `DELETE /api/v1/users/:id` - Delete user

### Interviews
- `GET /api/v1/interviews` - Get all user interviews
- `GET /api/v1/interviews/:id` - Get interview by ID

### Questions
- `GET /api/v1/questions` - Get all questions (paginated)
- `GET /api/v1/questions/:id` - Get question by ID

### Analytics
- `GET /api/v1/analytics/user` - Get user analytics
- `GET /api/v1/analytics/stats` - Get overall statistics

### Health
- `GET /health` - Health check
- `GET /health/ready` - Readiness probe
- `GET /health/live` - Liveness probe

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

Use the login endpoint to obtain a token.

## Testing

### Unit Tests

```bash
npm test
```

### Test Coverage

```bash
npm run test:cov
```

Target coverage: >80%

### E2E Tests

```bash
npm run test:e2e
```

## Database Management

### Create a Migration

```bash
npm run migrate -- --name migration_name
```

### Apply Migrations

```bash
npm run migrate:deploy
```

### Reset Database (Development)

```bash
npm run migrate:reset
```

### Open Prisma Studio

```bash
npm run prisma:studio
```

## Security

- Passwords are hashed with bcrypt (12 rounds)
- JWT tokens with short expiration times
- Refresh token rotation
- Rate limiting on all endpoints
- Input validation on all requests
- Helmet.js for security headers
- CORS configuration

## Logging

Application logs are stored in the `logs/` directory:
- `application-*.log` - All logs
- `error-*.log` - Error logs only

Logs are rotated daily and kept for 30 days.

## Production Deployment

1. Set `NODE_ENV=production`
2. Configure production database URL
3. Set strong JWT secrets
4. Enable SSL for database connections
5. Configure proper CORS origins
6. Set up monitoring and alerting
7. Configure log aggregation

### Environment Variables

Required environment variables for production:

```bash
NODE_ENV=production
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
JWT_SECRET=<strong-secret>
JWT_REFRESH_SECRET=<strong-secret>
CORS_ORIGIN=https://yourdomain.com
```

## Contributing

1. Follow the code style guidelines in CLAUDE.md
2. Write tests for all new features
3. Update documentation
4. Ensure all tests pass
5. Create a pull request

## License

UNLICENSED - Private project

## Support

For issues and questions, please open an issue on the repository.
