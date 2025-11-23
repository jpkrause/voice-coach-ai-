from datetime import datetime, timedelta
import math
from sqlalchemy.orm import Session
from . import models

def calculate_xp(session_score: int, difficulty: int, current_streak: int) -> int:
    """
    Calculates XP for a completed exercise session.
    """
    if session_score is None:
        return 0
        
    base_xp = 50
    score_multiplier = session_score / 100.0
    
    # Cap streak bonus at 50
    streak_bonus = min(current_streak * 5, 50)
    
    # Formula from tech_plan
    total_xp = (base_xp * score_multiplier * difficulty) + streak_bonus
    
    return int(total_xp)

def calculate_level(xp: int) -> int:
    """
    Calculates level based on total XP using a quadratic curve.
    level = floor(sqrt(xp / 100))
    """
    if xp < 100:
        return 1
    return int(math.floor(math.sqrt(xp / 100)))

def update_streak(user: models.User, db: Session):
    """
    Updates the user's streak based on the last practice date.
    Should be called whenever a session is completed.
    """
    now = datetime.utcnow()
    today = now.date()
    
    if user.last_practice_at:
        last_practice_date = user.last_practice_at.date()
        
        if last_practice_date == today:
            # Already practiced today, keep streak
            pass
        elif last_practice_date == today - timedelta(days=1):
            # Practiced yesterday, increment streak
            user.current_streak += 1
        else:
            # Missed a day (or more), reset streak
            # Wait, if it's the first practice after a break, it resets to 1?
            # Or 0? Usually 1 because today counts.
            user.current_streak = 1
    else:
        # First ever practice
        user.current_streak = 1
        
    user.last_practice_at = now
    # DB commit should be handled by the caller
