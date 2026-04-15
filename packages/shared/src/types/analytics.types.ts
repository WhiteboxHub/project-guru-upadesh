export interface UserAnalytics {
  userId: string;
  totalInterviews: number;
  completedInterviews: number;
  averageScore: number;
  strongCategories: string[];
  weakCategories: string[];
  improvementRate: number;
  lastUpdated: Date;
}

export interface PerformanceMetrics {
  date: Date;
  score: number;
  interviewType: string;
  timeTaken: number;
}

export interface CategoryPerformance {
  category: string;
  averageScore: number;
  totalAttempts: number;
  lastAttempt: Date;
}

export interface ImprovementTrend {
  period: string;
  score: number;
  interviewCount: number;
}

export interface AnalyticsQueryDto {
  userId: string;
  startDate?: Date;
  endDate?: Date;
  category?: string;
}
