import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import GenerateQuiz from "./pages/GenerateQuiz";
import History from "./pages/History";
import Dashboard from "./pages/Dashboard";

function Layout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white">

      {/* NAVBAR */}
      <div className="flex flex-col gap-4 px-6 py-6 md:flex-row md:items-center md:justify-between md:px-10">
        
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-3 rounded-xl shadow-lg shadow-blue-600/30">
            ✨
          </div>
          <h1 className="text-xl font-semibold tracking-wide">
            Wiki Quiz AI
          </h1>
        </div>

        {/* Tabs */}
        <div className="bg-white/10 backdrop-blur-md rounded-full p-1 flex flex-wrap gap-2">
          <Link
            to="/"
            className={`px-6 py-2 rounded-full transition-all duration-200 ${
              location.pathname === "/"
                ? "bg-blue-600 shadow-md shadow-blue-600/40"
                : "hover:bg-white/10"
            }`}
          >
            Generate Quiz
          </Link>

          <Link
            to="/history"
            className={`px-6 py-2 rounded-full transition-all duration-200 ${
              location.pathname === "/history"
                ? "bg-blue-600 shadow-md shadow-blue-600/40"
                : "hover:bg-white/10"
            }`}
          >
            History
          </Link>

          <Link
            to="/dashboard"
            className={`px-6 py-2 rounded-full transition-all duration-200 ${
              location.pathname === "/dashboard"
                ? "bg-blue-600 shadow-md shadow-blue-600/40"
                : "hover:bg-white/10"
            }`}
          >
            Dashboard
          </Link>
        </div>
      </div>

      {/* Page Content */}
      <div className="max-w-5xl mx-auto px-6 pb-20">
        <Routes>
          <Route path="/" element={<GenerateQuiz />} />
          <Route path="/history" element={<History />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}
