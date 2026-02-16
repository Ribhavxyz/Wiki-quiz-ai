from dotenv import load_dotenv
load_dotenv()
from fastapi import FastAPI, Depends, HTTPException, Query
from sqlalchemy import text
from utils.validators import validate_wikipedia_url
from services.scraper import scrape_wikipedia
from database import engine, get_db
import models
from fastapi.middleware.cors import CORSMiddleware

from models import Base, Quiz, Question, RelatedTopic, Attempt
from schemas import (
    QuizHistoryResponse,
    QuizDetailResponse,
    AttemptCreateRequest,
    AttemptResponse,
    TopicSummaryResponse,
    AnalyticsResponse,
    QuizAnalyticsItem,
)
from typing import List

from sqlalchemy.orm import Session
from services.quiz_service import generate_quiz_from_text
from sqlalchemy import func, cast, Float

from schemas import QuizGenerateResponse

import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)






Base.metadata.create_all(bind=engine)


@app.get("/")
def roof():
    return {"message": "Wiki Quiz backend Running"}

@app.get("/test-db")
def test_db():
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        return {"message": "Database connection successful "}
    except Exception as e:
        return {"message": f"Database connection failed : {str(e)}"}
    from utils.validators import validate_wikipedia_url

@app.get("/validate")
def validate(url: str):
    validate_wikipedia_url(url)
    return {"message": "Valid Wikipedia URL "}

@app.get("/scrape")
def scrape(url: str):
    data = scrape_wikipedia(url)

    # Remove raw_html from response
    data.pop("raw_html", None)

    return data

def validate_llm_output(parsed: dict):
    if "quiz" not in parsed or "related_topics" not in parsed:
        raise HTTPException(status_code=500, detail="Invalid LLM output structure.")

    if not isinstance(parsed["quiz"], list):
        raise HTTPException(status_code=500, detail="Quiz must be a list.")

    for q in parsed["quiz"]:
        required_fields = ["question", "options", "answer", "difficulty", "explanation"]

        for field in required_fields:
            if field not in q:
                raise HTTPException(status_code=500, detail=f"Missing field: {field}")

        if len(q["options"]) != 4:
            raise HTTPException(status_code=500, detail="Each question must have 4 options.")

        if q["difficulty"] not in ["easy", "medium", "hard"]:
            raise HTTPException(status_code=500, detail="Invalid difficulty value.")

from schemas import QuizGenerateRequest

@app.post("/generate", response_model=QuizGenerateResponse)
def generate_quiz(request: QuizGenerateRequest, db: Session = Depends(get_db)):
    
    url = request.url

    # 1️⃣ Validate URL
    if not validate_wikipedia_url(url):
        raise HTTPException(status_code=400, detail="Invalid Wikipedia URL.")
    logger.info(f"Generating quiz for {url}")


    # 2️⃣ Check if quiz already exists
    existing_quiz = db.query(Quiz).filter(Quiz.url == url).first()

    # CASE A: Quiz exists AND already has questions
    if existing_quiz and existing_quiz.questions:
        return build_response(existing_quiz)

    # CASE B: Quiz exists BUT has no questions
    if existing_quiz and not existing_quiz.questions:
        quiz = existing_quiz

    # CASE C: Quiz does NOT exist → Scrape + Save
    if not existing_quiz:
        scraped_data = scrape_wikipedia(url)

        quiz = Quiz(
            url=url,
            title=scraped_data["title"],
            summary=scraped_data["summary"],
            raw_html=scraped_data["raw_html"],
            cleaned_text=scraped_data["cleaned_text"],
        )

        db.add(quiz)
        db.commit()
        db.refresh(quiz)

    # 3️⃣ Generate quiz using cleaned_text
    try:
        llm_output = generate_quiz_from_text(quiz.cleaned_text, strict_output=request.strict_output)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Quiz generation failed: {str(e)}")
    validate_llm_output(llm_output)
    
    



    # 4️⃣ Save questions
    for q in llm_output["quiz"]:
        question = Question(
            quiz_id=quiz.id,
            question_text=q["question"],
            options=q["options"],  # JSON column → store directly
            correct_answer=q["answer"],
            difficulty=q["difficulty"],
            explanation=q["explanation"],
        )
        db.add(question)

    # 5️⃣ Save related topics
    for topic in llm_output["related_topics"]:
        related = RelatedTopic(
            quiz_id=quiz.id,
            topic_name=topic
        )
        db.add(related)

    db.commit()
    db.refresh(quiz)

    return build_response(quiz)
def build_response(quiz: Quiz):

    return {
        "id": quiz.id,
        "url": quiz.url,
        "title": quiz.title,
        "summary": quiz.summary,
        "quiz": [
            {
                "question": q.question_text,
                "options": q.options,
                "answer": q.correct_answer,
                "difficulty": q.difficulty,
                "explanation": q.explanation,
            }
            for q in quiz.questions
        ],
        "related_topics": [
            topic.topic_name for topic in quiz.related_topics
        ],
    }


@app.get("/history", response_model=List[QuizHistoryResponse])
def get_history(db: Session = Depends(get_db)):
    quizzes = db.query(Quiz).order_by(Quiz.created_at.desc()).all()
    return quizzes


@app.get("/quiz/{quiz_id}", response_model=QuizDetailResponse)
def get_quiz_detail(quiz_id: int, db: Session = Depends(get_db)):
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()

    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")

    return build_response(quiz)



@app.post("/attempts", response_model=AttemptResponse)
def create_attempt(payload: AttemptCreateRequest, db: Session = Depends(get_db)):
    if payload.total <= 0:
        raise HTTPException(status_code=422, detail="total must be greater than 0")
    if payload.score < 0:
        raise HTTPException(status_code=422, detail="score must be non-negative")
    if payload.score > payload.total:
        raise HTTPException(status_code=422, detail="score cannot be greater than total")

    quiz = db.query(Quiz).filter(Quiz.id == payload.quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")

    attempt = Attempt(
        quiz_id=payload.quiz_id,
        score=payload.score,
        total=payload.total,
    )

    db.add(attempt)
    db.commit()
    db.refresh(attempt)
    return attempt


@app.get("/topic-summary", response_model=TopicSummaryResponse)
def get_topic_summary(topic: str = Query(..., min_length=2, max_length=120)):
    normalized = topic.strip()
    if not normalized:
        raise HTTPException(status_code=422, detail="topic is required")

    return {
        "topic": normalized,
        "summary": f"{normalized} is a key concept related to the article context. This is a concise reference summary generated by the API stub.",
    }


@app.get("/analytics", response_model=AnalyticsResponse)
def get_analytics(db: Session = Depends(get_db)):
    average_expr = cast(Attempt.score, Float) * 100.0 / func.nullif(cast(Attempt.total, Float), 0.0)

    total_attempts = db.query(func.count(Attempt.id)).scalar() or 0
    average_score = db.query(func.avg(average_expr)).scalar()

    rows = (
        db.query(
            Quiz.title.label("title"),
            func.count(Attempt.id).label("attempts"),
            func.avg(average_expr).label("avg_score"),
        )
        .join(Attempt, Attempt.quiz_id == Quiz.id)
        .group_by(Quiz.title)
        .order_by(func.count(Attempt.id).desc(), Quiz.title.asc())
        .all()
    )

    by_quiz = [
        QuizAnalyticsItem(
            title=row.title,
            attempts=int(row.attempts or 0),
            avgScore=round(float(row.avg_score or 0.0), 2),
        )
        for row in rows
    ]

    return AnalyticsResponse(
        totalAttempts=int(total_attempts),
        averageScore=round(float(average_score or 0.0), 2),
        byQuiz=by_quiz,
    )

