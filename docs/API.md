# API Documentation

## Base URL

- Development: `http://localhost:3000/api/v1`
- Production: `https://api.guruupadesh.com/api/v1`

## Authentication

All protected endpoints require a JWT access token in the Authorization header:

```
Authorization: Bearer <access_token>
```

## Response Format

### Success Response

```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message",
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {}
  }
}
```

## Endpoints

### Authentication

#### Register

```http
POST /auth/register
```

**Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "createdAt": "2026-04-14T10:00:00Z"
  }
}
```

#### Login

```http
POST /auth/login
```

**Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe"
    }
  }
}
```

#### Refresh Token

```http
POST /auth/refresh
```

**Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

#### Get Current User

```http
GET /auth/me
```

**Headers:** `Authorization: Bearer <access_token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "profile": {
      "bio": "Software Engineer",
      "avatarUrl": "https://...",
      "phone": "+1234567890"
    }
  }
}
```

### Interviews

#### Create Interview

```http
POST /interviews
```

**Headers:** `Authorization: Bearer <access_token>`

**Body:**
```json
{
  "type": "technical",
  "difficulty": "medium"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "type": "technical",
    "difficulty": "medium",
    "status": "pending",
    "createdAt": "2026-04-14T10:00:00Z"
  }
}
```

#### Get Interview

```http
GET /interviews/:id
```

**Headers:** `Authorization: Bearer <access_token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "type": "technical",
    "difficulty": "medium",
    "status": "completed",
    "score": 85,
    "startedAt": "2026-04-14T10:00:00Z",
    "completedAt": "2026-04-14T10:30:00Z",
    "questions": [
      {
        "id": "uuid",
        "question": "Explain the difference between var, let, and const",
        "category": "javascript",
        "difficulty": "medium"
      }
    ]
  }
}
```

#### List Interviews

```http
GET /interviews?page=1&limit=20&status=completed
```

**Headers:** `Authorization: Bearer <access_token>`

**Query Parameters:**
- `page` (optional): Page number, default 1
- `limit` (optional): Items per page, default 20
- `status` (optional): Filter by status (pending, in_progress, completed, cancelled)
- `type` (optional): Filter by type (technical, behavioral, etc.)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "type": "technical",
      "difficulty": "medium",
      "status": "completed",
      "score": 85,
      "completedAt": "2026-04-14T10:30:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "totalPages": 3
  }
}
```

#### Submit Answer

```http
POST /interviews/:id/answers
```

**Headers:** `Authorization: Bearer <access_token>`

**Body:**
```json
{
  "questionId": "uuid",
  "answer": "var is function-scoped while let and const are block-scoped...",
  "timeTaken": 180
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "score": 85,
    "feedback": "Excellent answer! You correctly explained...",
    "suggestions": [
      "Consider mentioning hoisting behavior"
    ]
  }
}
```

### Questions

#### Get Questions

```http
GET /questions?category=technical&difficulty=medium&limit=10
```

**Headers:** `Authorization: Bearer <access_token>`

**Query Parameters:**
- `query` (optional): Search term
- `category` (optional): Filter by category
- `difficulty` (optional): Filter by difficulty
- `company` (optional): Filter by company
- `page` (optional): Page number
- `limit` (optional): Items per page

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "text": "Explain closures in JavaScript",
      "category": "technical",
      "difficulty": "medium",
      "tags": ["javascript", "fundamentals"],
      "company": "Google"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 500,
    "totalPages": 50
  }
}
```

#### Get Question by ID

```http
GET /questions/:id
```

**Headers:** `Authorization: Bearer <access_token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "text": "Explain closures in JavaScript",
    "category": "technical",
    "difficulty": "medium",
    "tags": ["javascript", "fundamentals"],
    "hints": [
      "Think about scope and function context",
      "Consider variable lifetime"
    ],
    "followUpQuestions": [
      "What are common use cases for closures?"
    ]
  }
}
```

### Analytics

#### Get User Analytics

```http
GET /analytics/me
```

**Headers:** `Authorization: Bearer <access_token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "totalInterviews": 25,
    "completedInterviews": 20,
    "averageScore": 78,
    "strongCategories": ["javascript", "react"],
    "weakCategories": ["system-design", "algorithms"],
    "improvementRate": 12.5,
    "recentPerformance": [
      {
        "date": "2026-04-14",
        "score": 85,
        "interviewType": "technical"
      }
    ]
  }
}
```

#### Get Category Performance

```http
GET /analytics/categories
```

**Headers:** `Authorization: Bearer <access_token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "category": "javascript",
      "averageScore": 85,
      "totalAttempts": 10,
      "lastAttempt": "2026-04-14T10:00:00Z"
    }
  ]
}
```

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid input data |
| `AUTHENTICATION_ERROR` | 401 | Invalid credentials |
| `UNAUTHORIZED` | 401 | Missing or invalid token |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Resource already exists |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |
| `SERVICE_UNAVAILABLE` | 503 | Service temporarily unavailable |

## Rate Limiting

- Public endpoints: 100 requests per 15 minutes per IP
- Authenticated endpoints: 1000 requests per 15 minutes per user
- AI endpoints: 50 requests per hour per user

Rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1704196800
```

## WebSocket Events

Connect to WebSocket at: `ws://localhost:3000` (development) or `wss://api.guruupadesh.com` (production)

### Client → Server Events

#### Join Interview
```json
{
  "event": "join_interview",
  "data": {
    "interviewId": "uuid"
  }
}
```

#### Submit Answer
```json
{
  "event": "submit_answer",
  "data": {
    "questionId": "uuid",
    "answer": "answer text"
  }
}
```

### Server → Client Events

#### Question
```json
{
  "event": "question",
  "data": {
    "questionId": "uuid",
    "question": "Explain REST APIs",
    "category": "backend",
    "timeLimit": 300
  }
}
```

#### Feedback
```json
{
  "event": "feedback",
  "data": {
    "score": 85,
    "feedback": "Great answer!",
    "suggestions": ["Consider mentioning..."]
  }
}
```

#### Status
```json
{
  "event": "status",
  "data": {
    "status": "in_progress",
    "currentQuestion": 3,
    "totalQuestions": 10
  }
}
```

## Changelog

### v1.0.0 (2026-04-14)
- Initial API release
- Authentication endpoints
- Interview management
- Question bank
- Analytics endpoints
- WebSocket support
