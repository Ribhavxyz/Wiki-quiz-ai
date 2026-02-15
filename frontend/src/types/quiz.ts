export type Difficulty = "easy" | "medium" | "hard";

export interface QuizQuestion {
  question: string;
  options: string[];
  answer: string;
  difficulty: Difficulty | string;
  explanation: string;
}

export interface QuizData {
  id?: number;
  url?: string;
  title: string;
  summary: string;
  quiz: QuizQuestion[];
  related_topics: string[];
  created_at?: string;
}

export interface AttemptRecord {
  id: string;
  quizId: number | string;
  title: string;
  score: number;
  total: number;
  percentage: number;
  attemptedAt: string;
  difficultyBreakdown: {
    easy: number;
    medium: number;
    hard: number;
  };
  answers: string[];
}
