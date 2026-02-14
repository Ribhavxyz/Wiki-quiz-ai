from fastapi import FastAPI
from sqlalchemy import text
from utils.validators import validate_wikipedia_url
from services.scraper import scrape_wikipedia
from database import engine
import models
from models import Base
from fastapi import Depends
from sqlalchemy.orm import Session
from database import get_db
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


