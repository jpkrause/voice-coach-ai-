from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, JSON, Float
from sqlalchemy.orm import relationship
from .database import Base
from datetime import datetime

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    nickname = Column(String, index=True)
    email = Column(String, nullable=True)
    voice_type = Column(String, nullable=True) # e.g. "Baritone", "Soprano"
    xp = Column(Integer, default=0)
    level = Column(Integer, default=1)
    current_streak = Column(Integer, default=0)
    last_practice_at = Column(DateTime, nullable=True)
    badges = Column(JSON, default=list)
    settings_genre = Column(String, default="Pop") # Pop, Klassik, Rock

    sessions = relationship("Session", back_populates="user")
    exercise_stats = relationship("UserExerciseStats", back_populates="user")

class Exercise(Base):
    __tablename__ = "exercises"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    category = Column(String) # Basic, Belt, Breath, CoolDown
    difficulty = Column(Integer, default=1) # 1-5
    is_scored = Column(Boolean, default=True)
    physiological_target = Column(String, nullable=True) # e.g. "SOVT / PTP Reduction"
    metaphors = Column(JSON, default=dict) # {"nasal": "Denk an ein inneres Gähnen"}
    instructions_audio_url = Column(String, nullable=True)
    
    # New fields for Multi-Layer / Scales
    pattern = Column(JSON, nullable=True) # e.g. {"intervals": [0, 2, 4], "duration": 0.5, "sequence": ["C4", "D4"]}

    sessions = relationship("Session", back_populates="exercise")
    user_stats = relationship("UserExerciseStats", back_populates="exercise")

class UserExerciseStats(Base):
    """The Learning Brain: Tracks efficacy of exercises for specific users."""
    __tablename__ = "user_exercise_stats"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    exercise_id = Column(Integer, ForeignKey("exercises.id"))
    times_performed = Column(Integer, default=0)
    avg_score = Column(Float, default=0.0)
    efficacy_rating = Column(Float, default=0.0) # -1.0 to +1.0

    user = relationship("User", back_populates="exercise_stats")
    exercise = relationship("Exercise", back_populates="user_stats")

class Session(Base):
    __tablename__ = "sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    exercise_id = Column(Integer, ForeignKey("exercises.id"))
    score = Column(Integer, nullable=True)
    audio_url = Column(String, nullable=True)
    metrics_json = Column(JSON, nullable=True) # Raw data: Jitter, Shimmer, Cents
    ai_feedback = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="sessions")
    exercise = relationship("Exercise", back_populates="sessions")
