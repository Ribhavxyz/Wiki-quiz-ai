# 🧠 AI Wiki Quiz Generator

An AI-powered quiz generation system that converts any Wikipedia article into a structured quiz.

## 🚀 Tech Stack

- Backend: FastAPI (Python)
- Database: PostgreSQL + SQLAlchemy
- Scraping: BeautifulSoup
- Validation: Custom URL validation
- Caching: Database-level URL caching
- (Phase 2) LLM: LangChain + Gemini

---

## ✅ Phase 1 Features (Completed)

- FastAPI backend running
- PostgreSQL connected
- Auto-generated database tables
- Wikipedia URL validation
- HTML scraping using BeautifulSoup
- Text cleaning and preprocessing
- Data persistence in PostgreSQL
- Caching logic (prevents duplicate scraping)

---

## 📌 API Endpoints

### `POST /generate`
Generates or fetches cached quiz data for a Wikipedia URL.

### `GET /test-db`
Tests database connectivity.

### `GET /scrape`
Scrapes Wikipedia content (development testing endpoint).

---

## 🏗 Architecture Layers

1. Infrastructure Layer (FastAPI setup)
2. Persistence Layer (SQLAlchemy models + DB)
3. Extraction Layer (Scraper)
4. Validation Layer (Strict Wikipedia-only URLs)
5. Business Logic Layer (Caching + DB save)

---

## 🔜 Upcoming (Phase 2)

- LangChain + Gemini integration
- Quiz question generation (5–10 MCQs)
- Related topics generation
- Strict JSON enforcement
- Question table persistence
- History endpoint
- Frontend UI

---

## 👨‍💻 Author

Built as part of DeepKlarity AI Wiki Quiz Generator assignment.
