import { apiRequest } from './api-client';

export interface Question {
  id: string;
  type: 'behavioral' | 'technical' | 'case-study';
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  question: string;
  sampleAnswer?: string;
  tips?: string[];
  tags?: string[];
  company?: string;
  createdAt: string;
  updatedAt: string;
}

export interface QuestionFilters {
  type?: string;
  category?: string;
  difficulty?: string;
  company?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface QuestionsResponse {
  success: boolean;
  data: Question[];
  meta: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface QuestionResponse {
  success: boolean;
  data: Question;
}

export const questionService = {
  /**
   * Get all questions with filters
   */
  async getQuestions(filters?: QuestionFilters): Promise<QuestionsResponse> {
    return apiRequest<QuestionsResponse>({
      method: 'GET',
      url: '/questions',
      params: filters,
    });
  },

  /**
   * Get question by ID
   */
  async getQuestion(id: string): Promise<QuestionResponse> {
    return apiRequest<QuestionResponse>({
      method: 'GET',
      url: `/questions/${id}`,
    });
  },

  /**
   * Get random questions
   */
  async getRandomQuestions(params: {
    count: number;
    type?: string;
    difficulty?: string;
  }): Promise<QuestionsResponse> {
    return apiRequest<QuestionsResponse>({
      method: 'GET',
      url: '/questions/random',
      params,
    });
  },

  /**
   * Search questions
   */
  async searchQuestions(query: string): Promise<QuestionsResponse> {
    return apiRequest<QuestionsResponse>({
      method: 'GET',
      url: '/questions/search',
      params: { q: query },
    });
  },

  /**
   * Get question categories
   */
  async getCategories(): Promise<{ success: boolean; data: string[] }> {
    return apiRequest<{ success: boolean; data: string[] }>({
      method: 'GET',
      url: '/questions/categories',
    });
  },

  /**
   * Get companies list
   */
  async getCompanies(): Promise<{ success: boolean; data: string[] }> {
    return apiRequest<{ success: boolean; data: string[] }>({
      method: 'GET',
      url: '/questions/companies',
    });
  },
};
