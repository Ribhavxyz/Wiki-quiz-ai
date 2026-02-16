from pydantic import BaseModel, Field
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
    quiz: List[QuestionResponse]
    related_topics: List[str]

    class Config:
        from_attributes = True



class QuizGenerateRequest(BaseModel):
    url: str
    strict_output: bool = False


class AttemptCreateRequest(BaseModel):
    quiz_id: int
    score: int
    total: int


class AttemptResponse(BaseModel):
    id: int
    quiz_id: int
    score: int
    total: int
    created_at: datetime

    class Config:
        from_attributes = True


class TopicSummaryResponse(BaseModel):
    topic: str
    summary: str


class QuizAnalyticsItem(BaseModel):
    title: str
    attempts: int
    avgScore: float


class AnalyticsResponse(BaseModel):
    totalAttempts: int = Field(default=0)
    averageScore: float = Field(default=0.0)
    byQuiz: List[QuizAnalyticsItem] = Field(default_factory=list)
