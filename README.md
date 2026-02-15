AI Wiki Quiz Generator

An end-to-end full stack application that generates structured quizzes automatically from Wikipedia articles using Large Language Models (LLMs).

Built as part of the DeepKlarity Full Stack Developer Assignment.

🧠 Problem Statement

Users provide a Wikipedia article URL.
The system:

Scrapes article content

Cleans and processes text

Uses an LLM to generate:

5–10 MCQ questions

4 options each

Correct answer

Explanation

Difficulty level

Related topics

Stores everything in PostgreSQL

Displays quizzes via React frontend

Maintains history of generated quizzes

🏗️ Tech Stack
Backend

FastAPI

SQLAlchemy ORM

PostgreSQL

BeautifulSoup (HTML scraping)

LangChain

Google Gemini API

Pydantic

Uvicorn

Frontend

React (Vite)

TypeScript

Axios

TailwindCSS

Deployment

Backend: Render

Frontend: Vercel

⚙️ System Architecture

User → React Frontend → FastAPI Backend →
Scraper → Text Cleaner → LLM (Gemini via LangChain) →
PostgreSQL Storage → JSON Response → UI Rendering

📌 Features
TAB 1 – Generate Quiz

URL validation

Wikipedia scraping

Text cleaning (citation removal, truncation)

Quiz generation via LLM

Structured quiz display

Related topic suggestions

Take Quiz mode (interactive attempt)

Score calculation

TAB 2 – History

Stores all processed URLs

Prevents duplicate scraping

Modal preview of previous quizzes

Reattempt functionality

🧠 Prompt Engineering Strategy

The LLM is instructed to:

Generate strictly structured JSON

Base questions only on provided article text

Include difficulty classification

Avoid hallucinations

Provide concise explanations

Output is validated before storing in DB.

🗄️ Database Design
Quiz Table

id

url

title

summary

cleaned_text

raw_html

created_at

Question Table

id

quiz_id (FK)

question_text

options (JSON)

correct_answer

difficulty

explanation

RelatedTopic Table

id

quiz_id (FK)

topic_name

🛡️ Error Handling

Invalid URL → 400

Scraping failure → 500

LLM invalid output → 500

DB connection failure → handled

Duplicate quiz requests → reuse stored data

📦 API Endpoints

GET /
GET /test-db
GET /validate
GET /scrape
POST /generate
GET /history
GET /quiz/{id}

🧪 Sample Data

Sample generated outputs are available in:

sample_data/

🖥️ Running Locally
Backend
cd backend
python -m venv env
env\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload

Frontend
cd frontend
npm install
npm run dev

🌍 Deployment Links

Backend: https://wiki-quiz-ai.onrender.com

Frontend: https://your-vercel-link