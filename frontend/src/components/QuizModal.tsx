import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { QuizData } from "../types/quiz";

interface Props {
  quiz: QuizData | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function QuizModal({ quiz, isOpen, onClose }: Props) {
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      window.addEventListener("keydown", handleKey);
    }

    return () => {
      window.removeEventListener("keydown", handleKey);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && quiz && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 bg-slate-900 p-6 md:p-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 rounded-md border border-white/10 bg-slate-800 px-3 py-1.5 text-sm text-slate-200 hover:bg-slate-700"
            >
              Close
            </button>

            <div className="mb-6 pr-20">
              <h2 className="text-2xl font-semibold text-white">{quiz.title}</h2>
              <p className="mt-2 text-slate-300">{quiz.summary || "No summary available."}</p>
              <p className="mt-3 text-sm text-slate-400">{quiz.quiz.length} questions</p>
            </div>

            <div className="space-y-5">
              {quiz.quiz.map((item, idx) => (
                <div
                  key={`${quiz.id ?? quiz.title}-${idx}`}
                  className="rounded-xl border border-white/10 bg-white/5 p-5"
                >
                  <div className="mb-3 flex items-start justify-between gap-4">
                    <h3 className="text-lg font-medium text-white">
                      {idx + 1}. {item.question}
                    </h3>
                    <span className="shrink-0 rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300 border border-white/10">
                      {item.difficulty || "Unknown"}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {item.options.map((option, optionIdx) => {
                      const isCorrect = option === item.answer;
                      return (
                        <div
                          key={`${quiz.id ?? quiz.title}-${idx}-${optionIdx}`}
                          className={`rounded-lg border px-4 py-2.5 text-sm ${
                            isCorrect
                              ? "border-green-500/70 bg-green-600/20 text-green-200"
                              : "border-white/10 bg-slate-950/40 text-slate-200"
                          }`}
                        >
                          {option}
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-4 space-y-2 text-sm">
                    <p className="text-slate-200">
                      <span className="font-semibold text-slate-100">Correct answer:</span>{" "}
                      {item.answer}
                    </p>
                    <p className="text-slate-300">
                      <span className="font-semibold text-slate-100">Explanation:</span>{" "}
                      {item.explanation || "No explanation provided."}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
