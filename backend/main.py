from dotenv import load_dotenv
load_dotenv()
from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy import text
from utils.validators import validate_wikipedia_url
from services.scraper import scrape_wikipedia
from database import engine, get_db
import models
from models import Base, Quiz, Question, RelatedTopic
from schemas import QuizHistoryResponse, QuizDetailResponse
from typing import List

from sqlalchemy.orm import Session
from services.quiz_service import generate_quiz_from_text

from schemas import QuizGenerateResponse

import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)







app = FastAPI()


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

@app.post("/generate", response_model=QuizGenerateResponse)

def generate_quiz(url: str, db: Session = Depends(get_db)):

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
        llm_output = generate_quiz_from_text(quiz.cleaned_text)
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
def get_quiz(quiz_id: int, db: Session = Depends(get_db)):
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()

    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")

    return quiz

