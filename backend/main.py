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
from services.quiz_service import generate_quiz_from_url




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

@app.post("/generate")
def generate(url: str, db: Session = Depends(get_db)):
    return generate_quiz_from_url(db, url)

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

