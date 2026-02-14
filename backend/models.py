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

    # Relationships
    questions = relationship(
        "Question",
        back_populates="quiz",
        cascade="all, delete-orphan"
    )

    related_topics = relationship(
        "RelatedTopic",
        back_populates="quiz",
        cascade="all, delete-orphan"
    )


class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)

    quiz_id = Column(Integer, ForeignKey("quizzes.id", ondelete="CASCADE"), nullable=False)

    question_text = Column(Text, nullable=False)

    # Store 4 options as JSON array
    options = Column(JSON, nullable=False)

    correct_answer = Column(String, nullable=False)

    difficulty = Column(String, nullable=False)  # easy / medium / hard

    explanation = Column(Text)

    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationship back to Quiz
    quiz = relationship("Quiz", back_populates="questions")


class RelatedTopic(Base):
    __tablename__ = "related_topics"

    id = Column(Integer, primary_key=True, index=True)

    quiz_id = Column(Integer, ForeignKey("quizzes.id", ondelete="CASCADE"), nullable=False)

    topic_name = Column(String, nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationship back to Quiz
    quiz = relationship("Quiz", back_populates="related_topics")
