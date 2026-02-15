import { useEffect, useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import QuizModal from "../components/QuizModal";
import type { QuizData } from "../types/quiz";
import { normalizeQuizData } from "../utils/quizValidation";

interface HistoryQuizRow {
  id: number;
  title: string;
  created_at?: string;
}

export default function History() {
  const [quizzes, setQuizzes] = useState<HistoryQuizRow[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<QuizData | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [loadingQuizAction, setLoadingQuizAction] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await api.get("/history");
      setQuizzes(res.data);
    } catch (error) {
      alert("Failed to fetch history");
    }
  };

  const handleDetails = async (quizId: number) => {
    try {
      setLoadingQuizAction(true);
      const res = await api.get(`/quiz/${quizId}`);
      const safeQuiz = normalizeQuizData(res.data);
      if (!safeQuiz) {
        throw new Error("Invalid quiz payload");
      }
      setSelectedQuiz(safeQuiz);
      setIsDetailsOpen(true);
    } catch (error) {
      alert("Failed to load quiz details");
    } finally {
      setLoadingQuizAction(false);
    }
  };

  const handleReattempt = async (quizId: number) => {
    try {
      setLoadingQuizAction(true);
      const res = await api.get(`/quiz/${quizId}`);
      const safeQuiz = normalizeQuizData(res.data);
      if (!safeQuiz) {
        throw new Error("Invalid quiz payload");
      }
      navigate("/", {
        state: {
          quizPreview: safeQuiz,
          startMode: "attempt",
        },
      });
      setSelectedQuiz(null);
      setIsDetailsOpen(false);
    } catch (error) {
      alert("Failed to start reattempt");
    } finally {
      setLoadingQuizAction(false);
    }
  };

  const closeDetailsModal = () => {
    setIsDetailsOpen(false);
    setSelectedQuiz(null);
  };

  return (
    <>
      <div className="min-h-screen px-6 py-12">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-semibold mb-2">Quiz History</h2>
            <p className="text-gray-400">View all your generated quizzes</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl shadow-xl p-8">
            <table className="table-auto w-full text-left">
              <thead className="text-slate-400 text-xs uppercase tracking-wider border-b border-white/10">
                <tr>
                  <th className="px-4 py-4">Title</th>
                  <th className="px-4 py-4">Created Date</th>
                  <th className="px-4 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {quizzes.map((quiz) => (
                  <tr key={quiz.id} className="hover:bg-slate-700/40 transition duration-200">
                    <td className="px-4 py-5">
                      <p className="text-lg font-semibold text-white">{quiz.title}</p>
                    </td>
                    <td className="px-4 py-5">
                      <p className="text-sm text-slate-400">
                        {quiz.created_at
                          ? new Date(quiz.created_at).toLocaleDateString()
                          : "N/A"}
                      </p>
                    </td>
                    <td className="px-4 py-5">
                      <div className="flex justify-end gap-3">
                        <button
                          onClick={() => handleDetails(quiz.id)}
                          disabled={loadingQuizAction}
                          className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 transition disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          Details
                        </button>
                        <button
                          onClick={() => handleReattempt(quiz.id)}
                          disabled={loadingQuizAction}
                          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          Reattempt
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <QuizModal
        quiz={selectedQuiz}
        isOpen={isDetailsOpen}
        onClose={closeDetailsModal}
      />
    </>
  );
}
