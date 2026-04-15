export type InterviewType = 'technical' | 'behavioral' | 'case-study' | 'system-design';
export type InterviewDifficulty = 'easy' | 'medium' | 'hard';
export type InterviewStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

export interface Interview {
  id: string;
  userId: string;
  type: InterviewType;
  difficulty: InterviewDifficulty;
  status: InterviewStatus;
  score?: number;
  startedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateInterviewDto {
  type: InterviewType;
  difficulty: InterviewDifficulty;
}

export interface InterviewResponse {
  id: string;
  interviewId: string;
  questionId: string;
  answer: string;
  score?: number;
  feedback?: string;
  timeTaken?: number;
  createdAt: Date;
}

export interface SubmitAnswerDto {
  questionId: string;
  answer: string;
  timeTaken?: number;
}

export interface InterviewFeedback {
  overallScore: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  detailedFeedback: string;
}

export interface InterviewResult {
  interview: Interview;
  responses: InterviewResponse[];
  feedback: InterviewFeedback;
  questions: InterviewQuestion[];
}

export interface InterviewQuestion {
  id: string;
  questionId: string;
  question: string;
  category: string;
  difficulty: InterviewDifficulty;
  order: number;
}

export interface WebSocketMessage {
  type: 'question' | 'answer' | 'feedback' | 'status' | 'error';
  payload: unknown;
  timestamp: Date;
}
