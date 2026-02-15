import { useEffect, useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function History() {
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<any>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
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

  const handlePreview = async (quizId: number) => {
    try {
      setLoadingPreview(true);
      const res = await api.get(`/quiz/${quizId}`);
      console.log("Preview Data:", res.data);
      const safeQuiz = {
        ...res.data,
        title: res.data?.title ?? "Untitled Quiz",
        summary: res.data?.summary ?? "",
        questions: Array.isArray(res.data?.questions) ? res.data.questions : [],
        related_topics: Array.isArray(res.data?.related_topics) ? res.data.related_topics : [],
      };
      setSelectedQuiz(safeQuiz);
    } catch (error) {
      alert("Failed to load quiz preview");
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleReattempt = async (quizId: number) => {
    try {
      setLoadingPreview(true);
      const res = await api.get(`/quiz/${quizId}`);
      const safeQuiz = {
        ...res.data,
        title: res.data?.title ?? "Untitled Quiz",
        summary: res.data?.summary ?? "",
        questions: Array.isArray(res.data?.questions) ? res.data.questions : [],
        related_topics: Array.isArray(res.data?.related_topics) ? res.data.related_topics : [],
      };
      navigate("/", {
        state: {
          quizPreview: safeQuiz,
          startMode: "attempt",
        },
      });
      setSelectedQuiz(null);
    } catch (error) {
      alert("Failed to start reattempt");
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleStartQuiz = () => {
    if (!selectedQuiz?.id) return;
    handleReattempt(selectedQuiz.id);
  };

  const renderPreviewModal = () => {
    if (!selectedQuiz) return null;

    return (
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={() => setSelectedQuiz(null)}
      >
        <div
          className="bg-slate-800 w-full max-w-3xl rounded-xl p-5 sm:p-6 md:p-8 shadow-2xl relative border border-slate-700"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => setSelectedQuiz(null)}
            className="absolute top-4 right-4 text-slate-400 hover:text-white"
          >
            ✕
          </button>

          <h2 className="text-2xl font-bold mb-4">
            {selectedQuiz.title}
          </h2>

          <p className="text-slate-300 mb-6">
            {selectedQuiz.summary || "No summary available."}
          </p>

          <div className="text-sm text-slate-400 mb-4">
            {selectedQuiz.questions?.length ?? 0} Questions
          </div>

          {selectedQuiz.related_topics?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {selectedQuiz.related_topics.map((topic: string, i: number) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-slate-700 rounded-full text-sm text-blue-400"
                >
                  {topic}
                </span>
              ))}
            </div>
          )}

          <button
            onClick={handleStartQuiz}
            className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-lg font-medium transition"
          >
            Start Quiz
          </button>
        </div>
      </div>
    );
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
                        {new Date(quiz.created_at).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="px-4 py-5">
                      <div className="flex justify-end gap-3">
                        <button
                          onClick={() => handlePreview(quiz.id)}
                          disabled={loadingPreview}
                          className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 transition disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          Preview
                        </button>
                        <button
                          onClick={() => handleReattempt(quiz.id)}
                          disabled={loadingPreview}
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

      {renderPreviewModal()}
    </>
  );
}
