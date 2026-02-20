# 🚀 AI Wiki Quiz Generator

An end-to-end full-stack application that generates structured quizzes automatically from Wikipedia articles using Large Language Models (LLMs).

Built as part of the **DeepKlarity Full Stack Developer Assignment**.

---

## 🧠 Problem Statement

Users provide a Wikipedia article URL.

The system:

1. Scrapes article content (HTML scraping only)
2. Cleans and processes text (removes citations and noise)
3. Uses an LLM (Gemini via LangChain) to generate:
   - 5–10 MCQ questions
   - 4 options each
   - Correct answer
   - Explanation
   - Difficulty level
   - Related topics
4. Stores everything in PostgreSQL
5. Displays quizzes via React frontend
6. Maintains history of generated quizzes

---

## 🏗️ Tech Stack

### Backend
- FastAPI
- SQLAlchemy
- PostgreSQL
- BeautifulSoup
- LangChain
- Google Gemini API
- Pydantic
- Uvicorn

### Frontend
- React (Vite)
- TypeScript
- Axios
- TailwindCSS

### Deployment
- Backend: Render
- Frontend: Vercel

---


## ⚙️ System Architecture

```markdown
User
↓  
React Frontend
↓  
FastAPI Backend
↓  
Wikipedia Scraper
↓  
Text Cleaning Layer
↓  
LLM (Gemini via LangChain)
↓  
PostgreSQL
↓  
JSON Response
↓  
UI Rendering
```
---




## 📌 Features

### TAB 1 – Generate Quiz

- URL validation
- Wikipedia scraping
- Citation removal
- Quiz generation via LLM
- Structured UI
- Related topics
- Take Quiz mode
- Score calculation

### TAB 2 – History

- Lists processed URLs
- Prevents duplicate scraping
- Modal preview
- Reattempt functionality

---

## 🧠 Prompt Engineering Strategy

- Strict JSON output enforcement
- Grounded questions from provided text only
- Difficulty tagging (easy/medium/hard)
- Output validation before DB storage

---

## 🗄️ Database Design

### Quiz Table
- id
- url
- title
- summary
- cleaned_text
- raw_html
- created_at

### Question Table
- id
- quiz_id
- question_text
- options (JSON)
- correct_answer
- difficulty
- explanation

### RelatedTopic Table
- id
- quiz_id
- topic_name

---

## 🛡️ Error Handling

- Invalid URL → 400
- Scraping failure → 500
- LLM output validation failure → 500
- Duplicate URL requests reuse stored quiz

---

## 📦 API Endpoints

| Method | Endpoint | Description |
|--------|----------|------------|
| GET | `/` | Health check |
| GET | `/test-db` | Database test |
| GET | `/validate` | Validate URL |
| GET | `/scrape` | Scrape page |
| POST | `/generate` | Generate quiz |
| GET | `/history` | Get quiz history |
| GET | `/quiz/{id}` | Get full quiz |

---

## 🧪 Sample Data

Sample generated outputs are available here:

👉 [View Sample Data Folder](sample_data/)

---
## 📸 Application Screenshots

### 🧠 Generate Quiz Flow

#### Initial Screen
![Initial](Screenshots/Generate%20Quiz/Initial.png)

#### Generating Quiz
![Generating](Screenshots/Generate%20Quiz/Generating%20Quiz.png)

#### Question Screen
![Question](Screenshots/Generate%20Quiz/Question%20.png)

#### Attempt
![Attempt](Screenshots/Generate%20Quiz/Attempt%20.png)

#### Result Screen
![Result](Screenshots/Generate%20Quiz/Result.png)

---

### 📜 History Tab

#### Quiz History
![Quiz History](Screenshots/History%20Tab/Quiz%20History.png)

#### Preview Modal
![Preview](Screenshots/History%20Tab/Preview%20.png)

#### Reattempt Flow
![Reattempt](Screenshots/History%20Tab/Reattempt.png)

---

## 🖥️ Running Locally

### Backend

```bash
cd backend
python -m venv env
env\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload

```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

### Deployment Links

- Backend: https://wiki-quiz-ai.onrender.com

- Frontend: https://wiki-quiz-ai-ry3.vercel.app?_vercel_share=gKf2hA2rUachg8lmkFDFEvnchtYs75ar:

---

