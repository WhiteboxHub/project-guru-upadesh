export const ERROR_MESSAGES = {
  // Authentication errors
  INVALID_CREDENTIALS: 'Invalid email or password',
  EMAIL_EXISTS: 'Email already registered',
  INVALID_TOKEN: 'Invalid or expired token',
  UNAUTHORIZED: 'Unauthorized access',
  TOKEN_EXPIRED: 'Token has expired',

  // User errors
  USER_NOT_FOUND: 'User not found',
  INVALID_USER_DATA: 'Invalid user data provided',

  // Interview errors
  INTERVIEW_NOT_FOUND: 'Interview not found',
  INTERVIEW_ALREADY_STARTED: 'Interview has already started',
  INTERVIEW_NOT_ACTIVE: 'Interview is not active',
  INVALID_INTERVIEW_STATUS: 'Invalid interview status',

  // Question errors
  QUESTION_NOT_FOUND: 'Question not found',
  NO_QUESTIONS_AVAILABLE: 'No questions available for selected criteria',

  // Validation errors
  VALIDATION_ERROR: 'Validation failed',
  INVALID_INPUT: 'Invalid input data',
  MISSING_REQUIRED_FIELD: 'Required field is missing',

  // Server errors
  INTERNAL_SERVER_ERROR: 'Internal server error',
  SERVICE_UNAVAILABLE: 'Service temporarily unavailable',
  DATABASE_ERROR: 'Database operation failed',

  // Rate limiting
  RATE_LIMIT_EXCEEDED: 'Too many requests. Please try again later',

  // AI service errors
  AI_SERVICE_ERROR: 'AI service error',
  AI_RESPONSE_TIMEOUT: 'AI service timeout',
  INSUFFICIENT_AI_CREDITS: 'Insufficient AI credits',
} as const;

export const HTTP_STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;
