from sqlalchemy.orm import Session
from backend.database import SessionLocal, engine
from backend import models
from backend.intelligence.knowledge import KNOWLEDGE_BASE

# Ensure tables exist
models.Base.metadata.create_all(bind=engine)

def seed_exercises(db: Session):
    print("Seeding exercises...")
    
    # Clear existing exercises to avoid duplicates (optional, for dev)
    db.query(models.Exercise).delete()
    
    exercises_data = KNOWLEDGE_BASE["exercises"]
    
    # Flatten basic and advanced lists
    all_exercises = exercises_data["basic"] + exercises_data["advanced"]
    
    for ex_data in all_exercises:
        # Determine difficulty based on category/list logic or default
        # Simple mapping: Basic -> 1, Advanced -> 3
        difficulty = 1 if ex_data in exercises_data["basic"] else 3
        
        exercise = models.Exercise(
            id=ex_data["id"],
            name=ex_data["name"],
            category=ex_data["category"],
            difficulty=difficulty,
            is_scored=True, # Default
            physiological_target=ex_data["target"],
            # Metaphors and instructions_audio_url can be added later or extracted if available
            metaphors={"execution": ex_data["execution"], "metrics": ex_data["expected_metrics"]} 
        )
        db.add(exercise)
    
    db.commit()
    print(f"Seeded {len(all_exercises)} exercises.")

def seed_users(db: Session):
    print("Seeding test user...")
    if not db.query(models.User).filter(models.User.nickname == "TestSinger").first():
        user = models.User(
            nickname="TestSinger",
            email="test@example.com",
            voice_type="Bariton",
            level=1,
            xp=0,
            settings_genre="Pop"
        )
        db.add(user)
        db.commit()
        print("Test user created.")
    else:
        print("Test user already exists.")

if __name__ == "__main__":
    db = SessionLocal()
    try:
        seed_exercises(db)
        seed_users(db)
    finally:
        db.close()
