from fastapi import FastAPI, Depends, HTTPException, UploadFile, File
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import shutil
import os

from . import models, database, schemas, gamification
from .analysis.breath import analyze_breath_stability
from .analysis.quality import analyze_health
from .analysis.pitch import analyze_pitch
from .intelligence.ai_wrapper import generate_feedback, generate_performance_review

models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="VocalCoach AI API")

# CORS Setup
origins = [
    "http://localhost:5173",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Static Files (for exercise audio)
app.mount("/static", StaticFiles(directory="backend/static"), name="static")

@app.get("/")
def read_root():
    return {"message": "Hello World from VocalCoach AI Backend!"}

@app.get("/health")
def health_check():
    return {"status": "ok"}

# --- Users ---

@app.post("/users/", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    # Check if user already exists (by nickname for simplicity in MVP)
    existing_user = db.query(models.User).filter(models.User.nickname == user.nickname).first()
    if existing_user:
        return existing_user # Return existing user if found (Auto-Login behavior)
        
    db_user = models.User(
        nickname=user.nickname, 
        voice_type=user.voice_type,
        settings_genre=user.settings_genre
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# --- Analysis Endpoints ---

@app.post("/analyze/breath")
async def analyze_breath_endpoint(difficulty: int = 1, file: UploadFile = File(...)):
    # Save temp file
    temp_filename = f"temp_{file.filename}"
    with open(temp_filename, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    try:
        # Run analysis
        result = analyze_breath_stability(temp_filename, difficulty)
        return result
    finally:
        # Cleanup
        if os.path.exists(temp_filename):
            os.remove(temp_filename)

@app.post("/analyze/health")
async def analyze_health_endpoint(
    level: int = 1,
    voice_type: str = "Unknown",
    file: UploadFile = File(...)
):
    # Save temp file
    temp_filename = f"temp_health_{file.filename}"
    with open(temp_filename, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    try:
        # Run analysis
        result = analyze_health(temp_filename)
        
        # Generate AI Feedback if successful
        if result.get("success"):
            metrics = result.get("metrics", {})
            user_context = {"level": level, "voice_type": voice_type}
            
            # Assuming this is a general health check or a specific exercise
            # We can pass "Vocal Health Check" as the exercise name
            feedback = generate_feedback("Vocal Health Check", metrics, user_context)
            result["ai_feedback"] = feedback
            
        return result
    finally:
        # Cleanup
        if os.path.exists(temp_filename):
            os.remove(temp_filename)

from fastapi import Form, File, UploadFile

@app.get("/user-uploads")
def get_user_uploads():
    """Lists audio files in the user_uploads directory."""
    upload_dir = "backend/user_uploads"
    if not os.path.exists(upload_dir):
        return []
    
    files = [f for f in os.listdir(upload_dir) if f.endswith(('.mp3', '.wav', '.m4a'))]
    return files

@app.post("/analyze/performance")
async def analyze_performance_endpoint(
    file: UploadFile = File(None),
    use_demo: bool = Form(False),
    local_filename: str = Form(None),
    # In a real app we'd get user_id from token/session
    level: int = 1,
    voice_type: str = "Unknown"
):
    temp_filename = ""
    
    # Handle Input (File vs Demo vs Local Upload)
    if use_demo:
        # Use a demo file from static folder (e.g. Lip Trills)
        demo_source = "backend/static/exercises/1_lip_trills.mp3"
        if not os.path.exists(demo_source):
             return {"success": False, "error": "Demo file not found on server."}
        temp_filename = "temp_demo_perf.mp3"
        shutil.copy(demo_source, temp_filename)
    elif local_filename:
        # Use a file from user_uploads
        source_path = os.path.join("backend/user_uploads", local_filename)
        if not os.path.exists(source_path):
            return {"success": False, "error": f"File '{local_filename}' not found in user_uploads."}
        temp_filename = f"temp_local_{local_filename}"
        shutil.copy(source_path, temp_filename)
    elif file:
        temp_filename = f"temp_perf_{file.filename}"
        with open(temp_filename, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    else:
        return {"success": False, "error": "No file provided."}
        
    try:
        # 1. Pitch Analysis
        pitch_result = analyze_pitch(temp_filename)
        
        # 2. Vocal Health Analysis
        health_result = analyze_health(temp_filename)
        
        # Combine Metrics
        combined_metrics = {}
        if pitch_result.get("success"):
            combined_metrics.update(pitch_result.get("metrics", {}))
            
        if health_result.get("success"):
            combined_metrics.update(health_result.get("metrics", {}))
            combined_metrics["health_status"] = health_result.get("status_color", "Unknown")
            
        # 3. AI Coach Review
        user_context = {"level": level, "voice_type": voice_type}
        feedback = generate_performance_review(combined_metrics, user_context)
        
        return {
            "success": True,
            "metrics": combined_metrics,
            "ai_feedback": feedback,
            "pitch_data": pitch_result, # detailed pitch data if needed
            "health_data": health_result
        }
        
    except Exception as e:
        return {"success": False, "error": str(e)}
    finally:
        if os.path.exists(temp_filename):
            os.remove(temp_filename)

@app.post("/analyze/range")
async def analyze_range_endpoint(file: UploadFile = File(...)):
    """
    Endpoint for the Range Finder.
    Determines lowest and highest note sung.
    """
    temp_filename = f"temp_range_{file.filename}"
    with open(temp_filename, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    try:
        result = analyze_pitch(temp_filename)
        return result
    finally:
        if os.path.exists(temp_filename):
            os.remove(temp_filename)

@app.get("/users/{user_id}", response_model=schemas.User)
def read_user(user_id: int, db: Session = Depends(database.get_db)):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user

# --- Exercises ---

@app.get("/exercises/", response_model=List[schemas.Exercise])
def read_exercises(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    exercises = db.query(models.Exercise).offset(skip).limit(limit).all()
    
    # Inject Audio URL if missing
    for ex in exercises:
        if not ex.instructions_audio_url:
            filename = f"{ex.id}_{ex.name.replace(' ', '_').lower()}.mp3"
            # Using absolute URL for localhost dev
            ex.instructions_audio_url = f"http://localhost:8000/static/exercises/{filename}"
            
    return exercises

# --- Sessions & Gamification ---

@app.post("/sessions/", response_model=schemas.SessionResponse)
def create_session(session: schemas.SessionCreate, db: Session = Depends(database.get_db)):
    # 1. Get User and Exercise
    user = db.query(models.User).filter(models.User.id == session.user_id).first()
    exercise = db.query(models.Exercise).filter(models.Exercise.id == session.exercise_id).first()
    
    if not user or not exercise:
        raise HTTPException(status_code=404, detail="User or Exercise not found")
    
    # 2. Gamification Logic
    # Update Streak
    gamification.update_streak(user, db)
    
    # Calculate XP
    xp_earned = gamification.calculate_xp(
        session_score=session.score,
        difficulty=exercise.difficulty,
        current_streak=user.current_streak
    )
    
    # Update User Stats
    user.xp += xp_earned
    user.level = gamification.calculate_level(user.xp)
    
    # 3. Save Session
    db_session = models.Session(
        user_id=session.user_id,
        exercise_id=session.exercise_id,
        score=session.score,
        # audio_url would go here
    )
    db.add(db_session)
    db.commit()
    db.refresh(user)
    
    return {
        "xp_earned": xp_earned,
        "new_total_xp": user.xp,
        "new_level": user.level,
        "streak": user.current_streak,
        "feedback": f"Great job! You earned {xp_earned} XP."
    }
