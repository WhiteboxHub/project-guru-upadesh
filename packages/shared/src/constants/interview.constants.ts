export const INTERVIEW_TYPES = {
  TECHNICAL: 'technical',
  BEHAVIORAL: 'behavioral',
  CASE_STUDY: 'case-study',
  SYSTEM_DESIGN: 'system-design',
} as const;

export const INTERVIEW_DIFFICULTIES = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard',
} as const;

export const INTERVIEW_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export const INTERVIEW_CONFIG = {
  MIN_QUESTIONS: 5,
  MAX_QUESTIONS: 10,
  TIME_PER_QUESTION: 300, // 5 minutes in seconds
  MAX_ANSWER_LENGTH: 5000,
  PASSING_SCORE: 70,
};

export const SCORE_RANGES = {
  EXCELLENT: { min: 90, max: 100, label: 'Excellent' },
  GOOD: { min: 75, max: 89, label: 'Good' },
  AVERAGE: { min: 60, max: 74, label: 'Average' },
  BELOW_AVERAGE: { min: 40, max: 59, label: 'Below Average' },
  POOR: { min: 0, max: 39, label: 'Needs Improvement' },
};
