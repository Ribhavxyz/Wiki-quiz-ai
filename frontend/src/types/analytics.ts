export interface AnalyticsByQuiz {
  title: string;
  attempts: number;
  avgScore: number;
}

export interface AnalyticsResponse {
  totalAttempts: number;
  averageScore: number;
  byQuiz: AnalyticsByQuiz[];
}
