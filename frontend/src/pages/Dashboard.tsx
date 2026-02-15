import { useEffect, useMemo, useState } from "react";
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { fetchAnalytics } from "../api/analytics";
import type { AnalyticsResponse } from "../types/analytics";
import { useAttempts } from "../hooks/useAttempts";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function Dashboard() {
  const [tab, setTab] = useState<"analytics" | "attempts">("analytics");
  const [analytics, setAnalytics] = useState<AnalyticsResponse>({
    totalAttempts: 0,
    averageScore: 0,
    byQuiz: [],
  });
  const [loading, setLoading] = useState(true);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);
  const { records, pendingCount, syncError, syncing, retryPending } = useAttempts();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setAnalyticsError(null);
        const data = await fetchAnalytics();
        setAnalytics(data);
      } catch {
        setAnalyticsError("Failed to load analytics.");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const distribution = useMemo(() => {
    const buckets = [
      { range: "0-20", count: 0 },
      { range: "21-40", count: 0 },
      { range: "41-60", count: 0 },
      { range: "61-80", count: 0 },
      { range: "81-100", count: 0 },
    ];

    for (const quiz of analytics.byQuiz) {
      if (quiz.avgScore <= 20) buckets[0].count += quiz.attempts;
      else if (quiz.avgScore <= 40) buckets[1].count += quiz.attempts;
      else if (quiz.avgScore <= 60) buckets[2].count += quiz.attempts;
      else if (quiz.avgScore <= 80) buckets[3].count += quiz.attempts;
      else buckets[4].count += quiz.attempts;
    }

    return buckets;
  }, [analytics.byQuiz]);

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
            <p className="text-sm text-slate-400">Total Attempts</p>
            <p className="mt-3 text-4xl font-semibold text-white">{analytics.totalAttempts}</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-6 shadow-xl">
            <p className="text-sm text-slate-400">Average Score</p>
            <p className="mt-3 text-4xl font-semibold text-emerald-300">
              {analytics.averageScore.toFixed(2)}%
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-6 shadow-xl">
            <p className="text-sm text-slate-400">Pending Sync</p>
            <p className="mt-3 text-4xl font-semibold text-cyan-300">{pendingCount}</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-6 shadow-xl lg:col-span-2">
            <h3 className="mb-4 text-lg font-semibold text-white">Attempts by Score Bucket</h3>
            <div className="h-72 w-full">
              <Bar
                data={{
                  labels: distribution.map((item) => item.range),
                  datasets: [
                    {
                      label: "Attempts",
                      data: distribution.map((item) => item.count),
                      backgroundColor: "#3b82f6",
                      borderRadius: 8,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                }}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-semibold text-white">Average Score by Quiz</h3>
            <div className="h-72 w-full">
              <Bar
                data={{
                  labels: analytics.byQuiz.map((item) => item.title),
                  datasets: [
                    {
                      label: "Avg Score",
                      data: analytics.byQuiz.map((item) => item.avgScore),
                      backgroundColor: "#22c55e",
                      borderRadius: 8,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                }}
              />
            </div>
          </div>

          {(analyticsError || syncError || loading) && (
            <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-6 shadow-xl lg:col-span-3">
              {loading && <p className="text-sm text-slate-300">Loading analytics...</p>}
              {analyticsError && <p className="text-sm text-red-300">{analyticsError}</p>}
              {syncError && <p className="text-sm text-amber-300">{syncError}</p>}
              <button
                type="button"
                onClick={() => void retryPending()}
                disabled={syncing || pendingCount === 0}
                className="mt-3 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white disabled:opacity-60"
              >
                {syncing ? "Retrying..." : "Retry Pending Sync"}
              </button>
            </div>
          )}
        </div>
      )}

      {tab === "attempts" && (
        <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-6 shadow-xl">
          <h3 className="mb-4 text-xl font-semibold text-white">My Attempts</h3>
          {records.length === 0 ? (
            <p className="text-sm text-slate-400">No attempts recorded yet.</p>
          ) : (
            <div className="space-y-3">
              {records.map((attempt) => (
                <div
                  key={attempt.local_id}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-xs text-slate-400">
                      {new Date(attempt.created_at).toLocaleString()}
                    </p>
                    <div className="rounded-full bg-blue-600/20 px-3 py-1 text-sm text-blue-300">
                      Quiz #{attempt.quiz_id} • {attempt.score}/{attempt.total}
                    </div>
                    <div className={`text-xs ${attempt.synced ? "text-emerald-300" : "text-amber-300"}`}>
                      {attempt.synced ? "Synced" : "Pending"}
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
