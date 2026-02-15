import type { QuizData, QuizQuestion } from "../types/quiz";

const isString = (value: unknown): value is string => typeof value === "string";

const asStringArray = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter(isString) : [];

const normalizeQuestion = (value: unknown): QuizQuestion | null => {
  if (!value || typeof value !== "object") return null;

  const source = value as Record<string, unknown>;
  const options = asStringArray(source.options);
  const answer = isString(source.answer) ? source.answer : "";
  const question = isString(source.question) ? source.question : "";
  const explanation = isString(source.explanation) ? source.explanation : "";
  const difficulty = isString(source.difficulty) ? source.difficulty.toLowerCase() : "medium";

  if (!question || options.length !== 4 || !answer) return null;

  return {
    question,
    options,
    answer,
    difficulty,
    explanation,
  };
};

export const normalizeQuizData = (value: unknown): QuizData | null => {
  if (!value || typeof value !== "object") return null;
  const source = value as Record<string, unknown>;

  const rawQuiz = Array.isArray(source.quiz)
    ? source.quiz
    : Array.isArray(source.questions)
    ? source.questions
    : [];

  const quiz = rawQuiz
    .map((question) => normalizeQuestion(question))
    .filter((question): question is QuizQuestion => Boolean(question));

  if (!quiz.length) return null;

  return {
    id: typeof source.id === "number" ? source.id : undefined,
    url: isString(source.url) ? source.url : "",
    title: isString(source.title) ? source.title : "Untitled Quiz",
    summary: isString(source.summary) ? source.summary : "No summary available.",
    quiz,
    related_topics: asStringArray(source.related_topics ?? source.relatedTopics),
  };
};

export const parseAndValidateQuizPayload = (payload: unknown): QuizData | null => {
  if (isString(payload)) {
    try {
      const parsed = JSON.parse(payload);
      return normalizeQuizData(parsed);
    } catch {
      return null;
    }
  }

  return normalizeQuizData(payload);
};
