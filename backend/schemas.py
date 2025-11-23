from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

class UserBase(BaseModel):
    nickname: str
    voice_type: Optional[str] = None
    settings_genre: Optional[str] = "Pop"

class UserCreate(UserBase):
    pass

class User(UserBase):
    id: int
    xp: int
    level: int
    current_streak: int
    badges: List[Any] = []
    
    class Config:
        from_attributes = True

class ExerciseBase(BaseModel):
    name: str
    category: str
    difficulty: int
    is_scored: bool
    physiological_target: Optional[str] = None
    metaphors: Dict[str, Any] = {}
    instructions_audio_url: Optional[str] = None

class Exercise(ExerciseBase):
    id: int
    
    class Config:
        from_attributes = True

class SessionCreate(BaseModel):
    user_id: int
    exercise_id: int
    score: Optional[int] = None
    # For phase 1 we simulate audio upload/analysis by just sending score
    
class SessionResponse(BaseModel):
    xp_earned: int
    new_total_xp: int
    new_level: int
    streak: int
    feedback: Optional[str] = None
