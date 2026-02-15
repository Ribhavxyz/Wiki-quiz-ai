from sqlalchemy.orm import Session
from models import Quiz
from services.scraper import scrape_wikipedia
from utils.validators import validate_wikipedia_url


def generate_quiz_from_url(db: Session, url: str):
    # Validate URL
    validate_wikipedia_url(url)

    # Check cache
    existing_quiz = db.query(Quiz).filter(Quiz.url == url).first()

    if existing_quiz:
        return {
            "id": existing_quiz.id,
            "url": existing_quiz.url,
            "title": existing_quiz.title,
            "summary": existing_quiz.summary,
            "sections": [],
            "message": "Returned from cache ✅"
        }

    # Scrape
    data = scrape_wikipedia(url)

    # Save to DB
    new_quiz = Quiz(
        url=url,
        title=data["title"],
        summary=data["summary"],
        raw_html=data["raw_html"],
        cleaned_text=data["cleaned_text"]
    )

    db.add(new_quiz)
    db.commit()
    db.refresh(new_quiz)

    return {
        "id": new_quiz.id,
        "url": new_quiz.url,
        "title": new_quiz.title,
        "summary": new_quiz.summary,
        "sections": data["sections"],
        "message": "New quiz created ✅"
    }
import json
import re
from services.llm_service import LLMService


def clean_json_response(raw_text: str) -> str:
    return re.sub(r"```json|```", "", raw_text).strip()


def generate_quiz_from_text(article_text: str, strict_output: bool = False):
    llm_service = LLMService()

    with open("prompts/quiz_prompt.txt", "r", encoding="utf-8") as f:
        template = f.read()

    prompt = template.replace("{article_text}", article_text)
    if strict_output:
        prompt += (
            "\n\nOutput requirements: respond with strict JSON only, with keys quiz and related_topics, "
            "no markdown wrappers, no trailing text, and exactly 4 options per question."
        )

    raw_response = llm_service.generate(prompt)
    cleaned = clean_json_response(raw_response)

    parsed = json.loads(cleaned)

    return parsed
