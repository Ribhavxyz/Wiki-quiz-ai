import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api/axios";
import type { QuizData } from "../types/quiz";
import { getDifficultyBreakdown, saveAttempt } from "../utils/attemptStorage";
import { normalizeQuizData, parseAndValidateQuizPayload } from "../utils/quizValidation";

type QuizMode = "preview" | "attempt" | "result";
type DifficultyFilter = "all" | "easy" | "medium" | "hard";

export default function GenerateQuiz() {
  const location = useLocation();
  const [url, setUrl] = useState("");
  const [strictOutput, setStrictOutput] = useState(false);
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [attemptSyncError, setAttemptSyncError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<QuizMode>("preview");
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>("all");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answers, setAnswers] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackResult, setFeedbackResult] = useState<boolean | null>(null);
  const [activeTopic, setActiveTopic] = useState<string | null>(null);
  const [topicSummary, setTopicSummary] = useState("");
  const [isTopicModalVisible, setIsTopicModalVisible] = useState(false);

  const difficultyCounts = useMemo(
    () =>
      (quizData?.quiz ?? []).reduce(
        (acc, item) => {
          const key = String(item.difficulty || "medium").toLowerCase();
          if (key === "easy") acc.easy += 1;
          else if (key === "hard") acc.hard += 1;
          else acc.medium += 1;
          return acc;
        },
        { easy: 0, medium: 0, hard: 0 },
      ),
    [quizData],
  );

  const activeQuestions = useMemo(() => {
    if (!quizData) return [];
    if (difficultyFilter === "all") return quizData.quiz;
    return quizData.quiz.filter(
      (item) => String(item.difficulty || "medium").toLowerCase() === difficultyFilter,
    );
  }, [quizData, difficultyFilter]);

  const currentQuestionData = activeQuestions[currentQuestion];
  const progress = activeQuestions.length
    ? ((currentQuestion + 1) / activeQuestions.length) * 100
    : 0;

  const resetAttemptState = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setAnswers([]);
    setScore(0);
    setShowFeedback(false);
    setFeedbackResult(null);
    setAttemptSyncError(null);
  };

  useEffect(() => {
    const routeState = location.state as
      | { quizPreview?: unknown; startMode?: "preview" | "attempt" }
      | null;
    const previewQuiz = routeState?.quizPreview;
    if (!previewQuiz) return;

    const normalized = normalizeQuizData(previewQuiz);
    if (!normalized) return;
    setQuizData(normalized);
    setUrl(normalized.url ?? "");
    setGenerationError(null);
    setDifficultyFilter("all");
    setMode(routeState?.startMode ?? "preview");
    resetAttemptState();
    setActiveTopic(null);
    setTopicSummary("");
    setIsTopicModalVisible(false);
  }, [location.state]);

  useEffect(() => {
    if (mode === "attempt") {
      resetAttemptState();
    }
  }, [difficultyFilter]);

  useEffect(() => {
    if (!activeTopic) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [activeTopic]);

  const closeTopicModal = () => {
    setIsTopicModalVisible(false);
    setTimeout(() => {
      setActiveTopic(null);
      setTopicSummary("");
    }, 200);
  };

  const handleTopicClick = async (topic: string) => {
    setActiveTopic(topic);
    setTopicSummary("Loading summary...");
    setIsTopicModalVisible(false);
    requestAnimationFrame(() => setIsTopicModalVisible(true));

    try {
      const res = await api.get(`/topic-summary?topic=${encodeURIComponent(topic)}`);
      setTopicSummary(res?.data?.summary || "No summary available yet for this topic.");
    } catch (error) {
      setTopicSummary("Summary unavailable right now. Please try again.");
    }
  };

  const handleGenerate = async () => {
    if (!url.trim()) {
      setGenerationError("Please enter a valid Wikipedia URL.");
      return;
    }

    try {
      setLoading(true);
      setGenerationError(null);
      const res = await api.post("/generate", {
        url: url.trim(),
        strict_output: strictOutput,
      });
      const normalized = parseAndValidateQuizPayload(res.data);
      if (!normalized) {
        setQuizData(null);
        setGenerationError(
          "Generated response failed validation. Try again or enable stricter output.",
        );
        return;
      }

      setQuizData(normalized);
      setMode("preview");
      setDifficultyFilter("all");
      resetAttemptState();
    } catch {
      setQuizData(null);
      setGenerationError("Could not generate quiz at the moment. Please retry.");
    } finally {
      setLoading(false);
    }
  };

  const persistAttemptResult = async (finalScore: number, finalAnswers: string[]) => {
    if (!quizData || activeQuestions.length === 0) return;
    const total = activeQuestions.length;
    const percentage = total > 0 ? (finalScore / total) * 100 : 0;

    const record = saveAttempt({
      quizId: quizData.id ?? quizData.url ?? quizData.title,
      title: quizData.title,
      score: finalScore,
      total,
      percentage,
      difficultyBreakdown: getDifficultyBreakdown(activeQuestions),
      answers: finalAnswers,
    });

    try {
      await api.post("/attempts", {
        quiz_id: quizData.id,
        title: record.title,
        score: record.score,
        total: record.total,
        percentage: record.percentage,
        attempted_at: record.attemptedAt,
        difficulty_breakdown: record.difficultyBreakdown,
      });
      setAttemptSyncError(null);
    } catch {
      setAttemptSyncError("Saved locally. Backend sync failed.");
    }
  };

  return (
    <div className="space-y-10">
      <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-md border border-blue-400/20 rounded-2xl p-8 space-y-6 shadow-2xl shadow-blue-950/20">
        <div className="space-y-3">
          <label className="block text-slate-200 font-medium mb-2">Wikipedia URL</label>
          <input
            type="text"
            placeholder="https://en.wikipedia.org/wiki/..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full bg-slate-950 border border-blue-500/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
          <label className="inline-flex items-center gap-3 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={strictOutput}
              onChange={(e) => setStrictOutput(e.target.checked)}
              className="h-4 w-4 rounded border-slate-500 bg-slate-800 text-blue-500 focus:ring-blue-500"
            />
            Regenerate with stricter output
          </label>
        </div>

        <button
          type="button"
          disabled={loading}
          onClick={handleGenerate}
          className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-blue-600/20 transition-all duration-200 py-3 rounded-xl font-medium"
        >
          {loading ? "Generating..." : "Generate Quiz"}
        </button>

        {generationError && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {generationError}
          </div>
        )}
      </div>

      {loading && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-10 text-center shadow-xl">
          <p className="text-slate-300 animate-pulse">Generating a structured quiz...</p>
        </div>
      )}

      {!loading && !quizData && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-16 text-center shadow-xl">
          <div className="text-5xl mb-4 text-cyan-300">✨</div>
          <h2 className="text-xl font-semibold mb-3">Ready to Generate</h2>
          <p className="text-gray-400 max-w-md mx-auto">
            Enter a Wikipedia URL to generate an AI-powered quiz with structured questions and explanations.
          </p>
        </div>
      )}

      {quizData && (
        <div className="space-y-8">
          {mode === "preview" && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 shadow-xl space-y-6">
              <div>
                <h2 className="text-2xl font-semibold mb-3">{quizData.title}</h2>
                <p className="text-gray-300">{quizData.summary}</p>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-gray-300">
                <span>{quizData.quiz.length} questions</span>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setStrictOutput(true);
                      handleGenerate();
                    }}
                    className="bg-slate-700 hover:bg-slate-600 transition text-white font-medium px-4 py-2 rounded-lg"
                  >
                    Regenerate Strict
                  </button>
                  <button
                    onClick={() => {
                      setMode("attempt");
                      resetAttemptState();
                    }}
                    className="bg-blue-600 hover:bg-blue-700 active:scale-95 transition duration-200 text-white font-medium px-5 py-2.5 rounded-lg shadow-lg shadow-blue-600/20"
                  >
                    Start Quiz
                  </button>
                </div>
              </div>
            </div>
          )}

          {mode === "attempt" && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 shadow-xl space-y-6">
              <div className="flex flex-wrap items-center gap-2">
                {(
                  [
                    { key: "all", label: "All", count: quizData.quiz.length },
                    { key: "easy", label: "Easy", count: difficultyCounts.easy },
                    { key: "medium", label: "Medium", count: difficultyCounts.medium },
                    { key: "hard", label: "Hard", count: difficultyCounts.hard },
                  ] as const
                ).map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setDifficultyFilter(item.key)}
                    className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm border transition ${
                      difficultyFilter === item.key
                        ? "border-blue-400 bg-blue-600/20 text-blue-200"
                        : "border-white/15 bg-slate-900/70 text-slate-300 hover:border-white/30"
                    }`}
                  >
                    <span>{item.label}</span>
                    <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs">{item.count}</span>
                  </button>
                ))}
              </div>

              {activeQuestions.length === 0 ? (
                <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4 text-yellow-200">
                  No questions available for this difficulty. Pick another filter.
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm text-blue-300">
                      <p>Question {currentQuestion + 1} of {activeQuestions.length}</p>
                      <p>{Math.round(progress)}%</p>
                    </div>
                    <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.35, ease: "easeOut" }}
                      />
                    </div>
                  </div>

                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`${difficultyFilter}-${currentQuestion}`}
                      initial={{ opacity: 0, x: 24, scale: 0.98 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0, x: -24, scale: 0.98 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      className="space-y-5"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <h3 className="text-xl font-semibold">{currentQuestionData?.question}</h3>
                        <span className="rounded-full bg-slate-800 border border-white/10 px-3 py-1 text-xs uppercase text-slate-300">
                          {currentQuestionData?.difficulty}
                        </span>
                      </div>

                      <div className="space-y-3">
                        {currentQuestionData?.options.map((opt, i) => (
                          <button
                            key={`${opt}-${i}`}
                            type="button"
                            disabled={showFeedback}
                            onClick={() => setSelectedAnswer(opt)}
                            className={`w-full text-left px-4 py-3 rounded-lg border transition-all duration-300 ease-out ${
                              showFeedback
                                ? opt === currentQuestionData?.answer
                                  ? `bg-green-600 border-green-500 shadow-lg shadow-green-500/30 text-white ${
                                      selectedAnswer === opt ? "scale-[1.02]" : ""
                                    }`
                                  : selectedAnswer === opt
                                  ? "bg-red-600 border-red-500 animate-shake text-white"
                                  : "bg-slate-900 border-white/10 text-gray-300"
                                : selectedAnswer === opt
                                ? "bg-blue-600/30 border-blue-400 text-white"
                                : "bg-slate-900 border-white/10 text-gray-300 hover:border-blue-500/50 hover:bg-blue-500/10"
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>

                      {showFeedback && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2 }}
                          className="rounded-xl border border-white/10 bg-slate-900/80 p-4"
                        >
                          <p className="text-slate-300">{currentQuestionData?.explanation}</p>
                        </motion.div>
                      )}
                    </motion.div>
                  </AnimatePresence>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      disabled={!selectedAnswer || showFeedback}
                      onClick={() => {
                        if (!selectedAnswer || showFeedback || !currentQuestionData) return;
                        const updatedAnswers = [...answers, selectedAnswer];
                        const isLast = currentQuestion === activeQuestions.length - 1;
                        const isCorrect = selectedAnswer === currentQuestionData.answer;
                        const nextScore = isCorrect ? score + 1 : score;

                        setShowFeedback(true);
                        setFeedbackResult(isCorrect);
                        setAnswers(updatedAnswers);
                        setScore(nextScore);

                        setTimeout(async () => {
                          setShowFeedback(false);
                          setFeedbackResult(null);

                          if (isLast) {
                            setMode("result");
                            setSelectedAnswer(null);
                            await persistAttemptResult(nextScore, updatedAnswers);
                            return;
                          }

                          setCurrentQuestion((prev) => prev + 1);
                          setSelectedAnswer(null);
                        }, 850);
                      }}
                      className="bg-blue-600 hover:bg-blue-700 active:scale-95 transition duration-200 disabled:bg-blue-900/40 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-medium px-5 py-2.5 rounded-lg shadow-lg shadow-blue-600/20"
                    >
                      {currentQuestion === activeQuestions.length - 1 ? "Finish Quiz" : "Next"}
                    </button>
                  </div>

                  {showFeedback && (
                    <p
                      className={`text-sm transition-all duration-300 ease-out ${
                        feedbackResult ? "text-green-300" : "text-red-300"
                      }`}
                    >
                      {feedbackResult ? "Correct answer!" : "Incorrect. Showing the correct answer..."}
                    </p>
                  )}
                </>
              )}
            </div>
          )}

          {mode === "result" && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 shadow-xl space-y-6">
              <div>
                <h2 className="text-2xl font-semibold mb-2">Quiz Complete</h2>
                <p className="text-gray-300">
                  You scored <span className="text-blue-300 font-semibold">{score}</span> out of{" "}
                  <span className="text-white font-semibold">{activeQuestions.length}</span>.
                </p>
                {attemptSyncError && (
                  <p className="mt-2 text-xs text-amber-300">{attemptSyncError}</p>
                )}
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setMode("attempt");
                    resetAttemptState();
                  }}
                  className="bg-blue-600 hover:bg-blue-700 active:scale-95 transition duration-200 text-white font-medium px-5 py-2.5 rounded-lg shadow-lg shadow-blue-600/20"
                >
                  Retry
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode("preview");
                    resetAttemptState();
                  }}
                  className="bg-slate-900 hover:bg-slate-800 active:scale-95 transition duration-200 text-gray-200 border border-white/10 font-medium px-5 py-2.5 rounded-lg"
                >
                  Back to Summary
                </button>
              </div>
            </div>
          )}

          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 shadow-xl">
            <h3 className="font-semibold mb-4">Related Topics</h3>
            <div className="flex flex-wrap gap-3">
              {quizData.related_topics.map((topic: string, index: number) => (
                <button
                  type="button"
                  key={index}
                  onClick={() => handleTopicClick(topic)}
                  className="bg-blue-600/20 border border-blue-500/30 text-blue-300 px-4 py-2 rounded-full text-sm"
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTopic && (
        <div
          onClick={closeTopicModal}
          className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-all duration-300 ease-out ${
            isTopicModalVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`w-full max-w-md bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-xl transition-all duration-300 ease-out ${
              isTopicModalVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
            }`}
          >
            <h4 className="text-lg font-semibold text-white mb-3">{activeTopic}</h4>
            <p className="text-slate-300 text-sm leading-relaxed mb-5">{topicSummary}</p>
            <button
              type="button"
              onClick={closeTopicModal}
              className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-4 py-2 rounded-lg transition-all duration-300 ease-out"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
