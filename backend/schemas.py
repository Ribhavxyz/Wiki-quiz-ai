from pydantic import BaseModel
from datetime import datetime
from typing import List


# ----------------------------
# Question Schema
# ----------------------------

class QuestionResponse(BaseModel):
    question: str
    options: List[str]
    answer: str
    difficulty: str
    explanation: str

    class Config:
        from_attributes = True


# ----------------------------
# Quiz Generation Response
# ----------------------------

class QuizGenerateResponse(BaseModel):
    id: int
    url: str
    title: str
    summary: str
    quiz: List[QuestionResponse]
    related_topics: List[str]

    class Config:
        from_attributes = True


# ----------------------------
# History Schema
# ----------------------------

class QuizHistoryResponse(BaseModel):
    id: int
    url: str
    title: str
    created_at: datetime

    class Config:
        from_attributes = True


# ----------------------------
# Detailed Quiz View
# ----------------------------

class QuizDetailResponse(BaseModel):
    id: int
    url: str
    title: str
    summary: str
    cleaned_text: str
    created_at: datetime

    class Config:
        from_attributes = True
