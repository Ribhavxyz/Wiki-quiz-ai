import { useMemo, useState } from "react";
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";
import { getAttempts } from "../utils/attemptStorage";

const PIE_COLORS = ["#22c55e", "#f59e0b", "#ef4444", "#3b82f6", "#a855f7"];

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

export default function Dashboard() {
  const [tab, setTab] = useState<"analytics" | "attempts">("analytics");
  const attempts = getAttempts();

  const analytics = useMemo(() => {
    const totalQuizzesTaken = attempts.length;
    const averageScore =
      totalQuizzesTaken === 0
        ? 0
        : attempts.reduce((sum, attempt) => sum + attempt.percentage, 0) / totalQuizzesTaken;

    const buckets = [
      { range: "0-20", count: 0 },
      { range: "21-40", count: 0 },
      { range: "41-60", count: 0 },
      { range: "61-80", count: 0 },
      { range: "81-100", count: 0 },
    ];

    const quizCounts = new Map<string, number>();
    for (const attempt of attempts) {
      if (attempt.percentage <= 20) buckets[0].count += 1;
      else if (attempt.percentage <= 40) buckets[1].count += 1;
      else if (attempt.percentage <= 60) buckets[2].count += 1;
      else if (attempt.percentage <= 80) buckets[3].count += 1;
      else buckets[4].count += 1;

      quizCounts.set(attempt.title, (quizCounts.get(attempt.title) ?? 0) + 1);
    }

    const topQuizzes = [...quizCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([title, attemptsCount]) => ({ title, attempts: attemptsCount }));

    return {
      totalQuizzesTaken,
      averageScore,
      distribution: buckets,
      topQuizzes,
    };
  }, [attempts]);

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-blue-400/20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 shadow-2xl shadow-blue-900/20">
        <h2 className="text-3xl font-semibold tracking-tight text-white">Score Dashboard</h2>
        <p className="mt-2 text-slate-300">Track your quiz performance over time.</p>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => setTab("analytics")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
            tab === "analytics"
              ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
              : "bg-slate-800 text-slate-300 hover:bg-slate-700"
          }`}
        >
          Analytics
        </button>
        <button
          type="button"
          onClick={() => setTab("attempts")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
            tab === "attempts"
              ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
              : "bg-slate-800 text-slate-300 hover:bg-slate-700"
          }`}
        >
          My Attempts
        </button>
      </div>

      {tab === "analytics" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-6 shadow-xl">
            <p className="text-sm text-slate-400">Total Quizzes Taken</p>
            <p className="mt-3 text-4xl font-semibold text-white">{analytics.totalQuizzesTaken}</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-6 shadow-xl">
            <p className="text-sm text-slate-400">Average Score</p>
            <p className="mt-3 text-4xl font-semibold text-emerald-300">
              {analytics.averageScore.toFixed(1)}%
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-6 shadow-xl">
            <p className="text-sm text-slate-400">Top Quiz Attempts</p>
            <p className="mt-3 text-4xl font-semibold text-cyan-300">
              {analytics.topQuizzes[0]?.attempts ?? 0}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-6 shadow-xl lg:col-span-2">
            <h3 className="mb-4 text-lg font-semibold text-white">Score Distribution</h3>
            <div className="h-72 w-full">
              <Bar
                data={{
                  labels: analytics.distribution.map((item) => item.range),
                  datasets: [
                    {
                      label: "Attempts",
                      data: analytics.distribution.map((item) => item.count),
                      backgroundColor: "#3b82f6",
                      borderRadius: 8,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      labels: {
                        color: "#e2e8f0",
                      },
                    },
                  },
                  scales: {
                    x: {
                      ticks: {
                        color: "#cbd5e1",
                      },
                      grid: {
                        color: "#1e293b",
                      },
                    },
                    y: {
                      ticks: {
                        color: "#cbd5e1",
                      },
                      grid: {
                        color: "#1e293b",
                      },
                    },
                  },
                }}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-semibold text-white">Top 5 Most Attempted</h3>
            {analytics.topQuizzes.length === 0 ? (
              <p className="text-sm text-slate-400">No attempts yet.</p>
            ) : (
              <div className="h-72 w-full">
                <Pie
                  data={{
                    labels: analytics.topQuizzes.map((item) => item.title),
                    datasets: [
                      {
                        data: analytics.topQuizzes.map((item) => item.attempts),
                        backgroundColor: analytics.topQuizzes.map(
                          (_, index) => PIE_COLORS[index % PIE_COLORS.length],
                        ),
                        borderColor: "#0f172a",
                        borderWidth: 2,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        labels: {
                          color: "#e2e8f0",
                        },
                      },
                    },
                  }}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {tab === "attempts" && (
        <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-6 shadow-xl">
          <h3 className="mb-4 text-xl font-semibold text-white">My Attempts</h3>
          {attempts.length === 0 ? (
            <p className="text-sm text-slate-400">No attempts recorded yet.</p>
          ) : (
            <div className="space-y-3">
              {attempts.map((attempt) => (
                <div
                  key={attempt.id}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-white">{attempt.title}</p>
                      <p className="text-xs text-slate-400">
                        {new Date(attempt.attemptedAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="rounded-full bg-blue-600/20 px-3 py-1 text-sm text-blue-300">
                      {attempt.score}/{attempt.total} ({attempt.percentage.toFixed(1)}%)
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
