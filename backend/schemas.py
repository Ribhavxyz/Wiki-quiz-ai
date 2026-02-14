from pydantic import BaseModel
from datetime import datetime
from typing import List


class QuizBase(BaseModel):
    id: int
    url: str
    title: str
    summary: str


class QuizHistoryResponse(BaseModel):
    id: int
    url: str
    title: str
    created_at: datetime


class QuizDetailResponse(BaseModel):
    id: int
    url: str
    title: str
    summary: str
    cleaned_text: str
    created_at: datetime

    class Config:
        from_attributes = True
