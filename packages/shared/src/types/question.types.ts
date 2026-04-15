export type QuestionCategory =
  | 'technical'
  | 'behavioral'
  | 'system-design'
  | 'coding'
  | 'algorithms'
  | 'databases'
  | 'frontend'
  | 'backend'
  | 'devops'
  | 'leadership'
  | 'problem-solving';

export type QuestionDifficulty = 'easy' | 'medium' | 'hard';

export interface Question {
  id: string;
  text: string;
  category: QuestionCategory;
  difficulty: QuestionDifficulty;
  tags: string[];
  company?: string;
  expectedAnswerLength?: number;
  hints?: string[];
  followUpQuestions?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateQuestionDto {
  text: string;
  category: QuestionCategory;
  difficulty: QuestionDifficulty;
  tags?: string[];
  company?: string;
  expectedAnswerLength?: number;
  hints?: string[];
  followUpQuestions?: string[];
}

export interface SearchQuestionsDto {
  query?: string;
  category?: QuestionCategory;
  difficulty?: QuestionDifficulty;
  tags?: string[];
  company?: string;
  limit?: number;
  offset?: number;
}

export interface QuestionSearchResult {
  questions: Question[];
  total: number;
  page: number;
  pageSize: number;
}
