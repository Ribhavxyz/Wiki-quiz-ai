import { useEffect, useState } from "react";
import api from "../api/axios";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function GenerateQuiz() {
  const location = useLocation();
  const [url, setUrl] = useState("");
  const [quizData, setQuizData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answers, setAnswers] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [mode, setMode] = useState<"preview" | "attempt" | "result">("preview");
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackResult, setFeedbackResult] = useState<boolean | null>(null);
  const [activeTopic, setActiveTopic] = useState<string | null>(null);
  const [topicSummary, setTopicSummary] = useState<string>("");
  const [isTopicModalVisible, setIsTopicModalVisible] = useState(false);

  const normalizeQuizData = (data: any) => {
    const normalizedQuiz = Array.isArray(data?.quiz)
      ? data.quiz
      : Array.isArray(data?.questions)
      ? data.questions
      : [];

    return {
      ...data,
      title: data?.title ?? "Untitled Quiz",
      summary: data?.summary ?? "No summary available.",
      quiz: normalizedQuiz,
      related_topics: Array.isArray(data?.related_topics)
        ? data.related_topics
        : Array.isArray(data?.relatedTopics)
        ? data.relatedTopics
        : [],
    };
  };

  const currentQuestionData = quizData?.quiz?.[currentQuestion];
  const progress =
    quizData?.quiz?.length
      ? ((currentQuestion + 1) / quizData.quiz.length) * 100
      : 0;

  useEffect(() => {
    const routeState = location.state as
      | { quizPreview?: any; startMode?: "preview" | "attempt" }
      | null;
    const previewQuiz = routeState?.quizPreview;
    if (!previewQuiz) return;

    const normalized = normalizeQuizData(previewQuiz);
    setQuizData(normalized);
    setUrl(normalized.url ?? "");
    setMode(routeState?.startMode ?? "preview");
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setAnswers([]);
    setScore(0);
    setShowFeedback(false);
    setFeedbackResult(null);
    setActiveTopic(null);
    setTopicSummary("");
    setIsTopicModalVisible(false);
  }, [location.state]);

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
    if (!url) {
      alert("Please enter a Wikipedia URL");
      return;
    }

    try {
      setLoading(true);
      const res = await api.post("/generate", { url });
      setQuizData(normalizeQuizData(res.data));
      setMode("preview");
      setCurrentQuestion(0);
      setSelectedAnswer(null);
      setAnswers([]);
      setScore(0);
      setShowFeedback(false);
      setFeedbackResult(null);
    } catch (error) {
      alert("Error generating quiz");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10">
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 space-y-6 shadow-xl">
        <div>
          <label className="block text-gray-300 font-medium mb-2">
            Wikipedia URL
          </label>
          <input
            type="text"
            placeholder="https://en.wikipedia.org/wiki/..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full bg-[#0f172a] border border-blue-500/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>

        <button
          onClick={handleGenerate}
          className="w-full bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all duration-200 py-3 rounded-xl font-medium"
        >
          {loading ? "Generating..." : "Generate Quiz"}
        </button>
      </div>

      {!quizData && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-16 text-center shadow-xl">
          <div className="text-5xl mb-4 text-blue-400">✨</div>
          <h2 className="text-xl font-semibold mb-3">Ready to Generate</h2>
          <p className="text-gray-400 max-w-md mx-auto">
            Enter a Wikipedia URL above to generate an AI-powered quiz with questions, answers, and explanations.
          </p>
        </div>
      )}

      {quizData && (
        <div className="space-y-8">
          {mode === "preview" && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 shadow-xl space-y-6">
              <div>
                <h2 className="text-2xl font-semibold mb-3">{quizData.title}</h2>
                <p className="text-gray-400">{quizData.summary}</p>
              </div>
              <div className="flex items-center justify-between gap-4 text-sm text-gray-400">
                <span>{quizData.quiz.length} questions</span>
                <button
                  onClick={() => {
                    setMode("attempt");
                    setCurrentQuestion(0);
                    setSelectedAnswer(null);
                    setAnswers([]);
                    setScore(0);
                    setShowFeedback(false);
                    setFeedbackResult(null);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 active:scale-95 transition duration-200 text-white font-medium px-5 py-2.5 rounded-lg shadow-lg shadow-blue-600/20"
                >
                  Start Quiz
                </button>
              </div>
            </div>
          )}

          {mode === "attempt" && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 shadow-xl space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm text-blue-300">
                  <p>Question {currentQuestion + 1} of {quizData.quiz.length}</p>
                  <p>{Math.round(progress)}%</p>
                </div>
                <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={currentQuestion}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-5"
                >
                  <h3 className="text-xl font-semibold">{currentQuestionData?.question}</h3>

                  <div className="space-y-3">
                    {currentQuestionData?.options.map((opt: string, i: number) => (
                      <button
                        key={i}
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
                              : "bg-[#0f172a] border-white/10 text-gray-300"
                            : selectedAnswer === opt
                            ? "bg-blue-600/30 border-blue-400 text-white"
                            : "bg-[#0f172a] border-white/10 text-gray-300 hover:border-blue-500/50 hover:bg-blue-500/10"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>

                  {showFeedback && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.4 }}
                    >
                      <p className="mt-4 text-slate-300">{currentQuestionData?.explanation}</p>
                    </motion.div>
                  )}
                </motion.div>
              </AnimatePresence>

              <div className="flex justify-end">
                <button
                  type="button"
                  disabled={!selectedAnswer || showFeedback}
                  onClick={() => {
                    if (!selectedAnswer || showFeedback) return;
                    const updatedAnswers = [...answers, selectedAnswer];
                    const isLast = currentQuestion === quizData.quiz.length - 1;
                    const isCorrect = selectedAnswer === currentQuestionData?.answer;
                    const nextScore = isCorrect ? score + 1 : score;

                    setShowFeedback(true);
                    setFeedbackResult(isCorrect);
                    setAnswers(updatedAnswers);
                    setScore(nextScore);

                    setTimeout(() => {
                      setShowFeedback(false);
                      setFeedbackResult(null);

                      if (isLast) {
                        setMode("result");
                        setSelectedAnswer(null);
                        return;
                      }

                      setCurrentQuestion((prev) => prev + 1);
                      setSelectedAnswer(null);
                    }, 1000);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 active:scale-95 transition duration-200 disabled:bg-blue-900/40 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-medium px-5 py-2.5 rounded-lg shadow-lg shadow-blue-600/20"
                >
                  {currentQuestion === quizData.quiz.length - 1 ? "Finish Quiz" : "Next"}
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
            </div>
          )}

          {mode === "result" && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 shadow-xl space-y-6">
              <div>
                <h2 className="text-2xl font-semibold mb-2">Quiz Complete</h2>
                <p className="text-gray-400">
                  You scored <span className="text-blue-300 font-semibold">{score}</span> out of{" "}
                  <span className="text-white font-semibold">{quizData.quiz.length}</span>.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setMode("attempt");
                    setCurrentQuestion(0);
                    setSelectedAnswer(null);
                    setAnswers([]);
                    setScore(0);
                    setShowFeedback(false);
                    setFeedbackResult(null);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 active:scale-95 transition duration-200 text-white font-medium px-5 py-2.5 rounded-lg shadow-lg shadow-blue-600/20"
                >
                  Retry
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode("preview");
                    setCurrentQuestion(0);
                    setSelectedAnswer(null);
                    setAnswers([]);
                    setScore(0);
                    setShowFeedback(false);
                    setFeedbackResult(null);
                  }}
                  className="bg-[#0f172a] hover:bg-[#16203a] active:scale-95 transition duration-200 text-gray-200 border border-white/10 font-medium px-5 py-2.5 rounded-lg"
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
