import { apiRequest } from './api-client';

export interface Interview {
  id: string;
  userId: string;
  type: 'behavioral' | 'technical' | 'case-study' | 'mock';
  difficulty: 'easy' | 'medium' | 'hard';
  industry?: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  startedAt?: string;
  completedAt?: string;
  duration?: number;
  score?: number;
  feedback?: string;
  questions?: InterviewQuestion[];
  createdAt: string;
  updatedAt: string;
}

export interface InterviewQuestion {
  id: string;
  question: string;
  answer?: string;
  aiSuggestion?: string;
  score?: number;
  feedback?: string;
  duration?: number;
}

export interface CreateInterviewDto {
  type: Interview['type'];
  difficulty: Interview['difficulty'];
  industry?: string;
}

export interface UpdateInterviewDto {
  status?: Interview['status'];
  answer?: string;
  questionId?: string;
}

export interface InterviewResponse {
  success: boolean;
  data: Interview;
}

export interface InterviewsListResponse {
  success: boolean;
  data: Interview[];
  meta: {
    page: number;
    limit: number;
    total: number;
  };
}

export const interviewService = {
  /**
   * Get all interviews
   */
  async getInterviews(params?: {
    page?: number;
    limit?: number;
    status?: string;
    type?: string;
  }): Promise<InterviewsListResponse> {
    return apiRequest<InterviewsListResponse>({
      method: 'GET',
      url: '/interviews',
      params,
    });
  },

  /**
   * Get interview by ID
   */
  async getInterview(id: string): Promise<InterviewResponse> {
    return apiRequest<InterviewResponse>({
      method: 'GET',
      url: `/interviews/${id}`,
    });
  },

  /**
   * Create new interview
   */
  async createInterview(data: CreateInterviewDto): Promise<InterviewResponse> {
    return apiRequest<InterviewResponse>({
      method: 'POST',
      url: '/interviews',
      data,
    });
  },

  /**
   * Update interview
   */
  async updateInterview(
    id: string,
    data: UpdateInterviewDto
  ): Promise<InterviewResponse> {
    return apiRequest<InterviewResponse>({
      method: 'PATCH',
      url: `/interviews/${id}`,
      data,
    });
  },

  /**
   * Delete interview
   */
  async deleteInterview(id: string): Promise<void> {
    return apiRequest<void>({
      method: 'DELETE',
      url: `/interviews/${id}`,
    });
  },

  /**
   * Start interview
   */
  async startInterview(id: string): Promise<InterviewResponse> {
    return apiRequest<InterviewResponse>({
      method: 'POST',
      url: `/interviews/${id}/start`,
    });
  },

  /**
   * Complete interview
   */
  async completeInterview(id: string): Promise<InterviewResponse> {
    return apiRequest<InterviewResponse>({
      method: 'POST',
      url: `/interviews/${id}/complete`,
    });
  },

  /**
   * Submit answer to interview question
   */
  async submitAnswer(
    interviewId: string,
    questionId: string,
    answer: string
  ): Promise<InterviewResponse> {
    return apiRequest<InterviewResponse>({
      method: 'POST',
      url: `/interviews/${interviewId}/questions/${questionId}/answer`,
      data: { answer },
    });
  },

  /**
   * Get AI suggestion for current question
   */
  async getAISuggestion(
    interviewId: string,
    questionId: string,
    context?: string
  ): Promise<{ suggestion: string }> {
    const response = await apiRequest<{ success: boolean; data: { suggestion: string } }>({
      method: 'POST',
      url: `/interviews/${interviewId}/questions/${questionId}/suggestion`,
      data: { context },
    });
    return response.data;
  },
};
