import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import GenerateQuiz from "./pages/GenerateQuiz";
import History from "./pages/History";

function Layout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white">

      {/* NAVBAR */}
      <div className="flex justify-between items-center px-10 py-6">
        
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-3 rounded-xl shadow-lg shadow-blue-600/20">
            ✨
          </div>
          <h1 className="text-xl font-semibold tracking-wide">
            Wiki Quiz AI
          </h1>
        </div>

        {/* Tabs */}
        <div className="bg-white/10 backdrop-blur-md rounded-full p-1 flex gap-2">
          <Link
            to="/"
            className={`px-6 py-2 rounded-full transition-all duration-200 ${
              location.pathname === "/"
                ? "bg-blue-600 shadow-md"
                : "hover:bg-white/10"
            }`}
          >
            Generate Quiz
          </Link>

          <Link
            to="/history"
            className={`px-6 py-2 rounded-full transition-all duration-200 ${
              location.pathname === "/history"
                ? "bg-blue-600 shadow-md"
                : "hover:bg-white/10"
            }`}
          >
            History
          </Link>
        </div>
      </div>

      {/* Page Content */}
      <div className="max-w-4xl mx-auto px-6 pb-20">
        <Routes>
          <Route path="/" element={<GenerateQuiz />} />
          <Route path="/history" element={<History />} />
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
