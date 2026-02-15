import type { AttemptRecord, QuizQuestion } from "../types/quiz";

const STORAGE_KEY = "wiki_quiz_attempts_v1";

const safeJSONParse = <T>(value: string | null, fallback: T): T => {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
};

export const getAttempts = (): AttemptRecord[] =>
  safeJSONParse<AttemptRecord[]>(localStorage.getItem(STORAGE_KEY), []);

export const saveAttempt = (attempt: Omit<AttemptRecord, "id" | "attemptedAt">): AttemptRecord => {
  const next: AttemptRecord = {
    ...attempt,
    id: crypto.randomUUID(),
    attemptedAt: new Date().toISOString(),
  };

  const current = getAttempts();
  const updated = [next, ...current];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return next;
};

export const clearAttempts = () => {
  localStorage.removeItem(STORAGE_KEY);
};

export const getDifficultyBreakdown = (questions: QuizQuestion[]) => {
  return questions.reduce(
    (acc, question) => {
      const key = String(question.difficulty || "medium").toLowerCase();
      if (key === "easy") acc.easy += 1;
      else if (key === "hard") acc.hard += 1;
      else acc.medium += 1;
      return acc;
    },
    { easy: 0, medium: 0, hard: 0 },
  );
};
