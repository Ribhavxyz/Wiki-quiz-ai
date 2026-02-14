from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base


class Quiz(Base):
    __tablename__ = "quizzes"

    id = Column(Integer, primary_key=True, index=True)
    url = Column(String, unique=True, index=True, nullable=False)
    title = Column(String, nullable=False)
    summary = Column(Text)
    raw_html = Column(Text)
    cleaned_text = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    questions = relationship("Question", back_populates="quiz", cascade="all, delete")
    related_topics = relationship("RelatedTopic", back_populates="quiz", cascade="all, delete")


class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    quiz_id = Column(Integer, ForeignKey("quizzes.id"), nullable=False)

    question = Column(Text, nullable=False)
    options = Column(JSON, nullable=False)
    answer = Column(String, nullable=False)
    explanation = Column(Text)
    difficulty = Column(String)

    quiz = relationship("Quiz", back_populates="questions")


class RelatedTopic(Base):
    __tablename__ = "related_topics"

    id = Column(Integer, primary_key=True, index=True)
    quiz_id = Column(Integer, ForeignKey("quizzes.id"), nullable=False)

    topic_name = Column(String, nullable=False)

    quiz = relationship("Quiz", back_populates="related_topics")
