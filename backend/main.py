from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import shutil
import os
import tempfile
from datetime import datetime

from . import models, database, schemas, gamification
from .analysis.breath import analyze_breath_stability
from .analysis.quality import analyze_health
from .analysis.pitch import analyze_pitch, analyze_pitch_accuracy
from .intelligence.ai_wrapper import generate_feedback, generate_performance_review
from .intelligence.knowledge import KNOWLEDGE_BASE
from .audio.synth import generate_scale_audio
import math

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
def analyze_breath_endpoint(difficulty: int = 1, file: UploadFile = File(...)):
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
def analyze_health_endpoint(
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
def analyze_performance_endpoint(
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
        with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as tmp:
            shutil.copy(demo_source, tmp.name)
            temp_filename = tmp.name
    elif local_filename:
        # Use a file from user_uploads
        source_path = os.path.join("backend/user_uploads", local_filename)
        if not os.path.exists(source_path):
            return {"success": False, "error": f"File '{local_filename}' not found in user_uploads."}
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
             shutil.copy(source_path, tmp.name)
             temp_filename = tmp.name
    elif file:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
            shutil.copyfileobj(file.file, tmp)
            temp_filename = tmp.name
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
def analyze_range_endpoint(file: UploadFile = File(...)):
    """
    Endpoint for the Range Finder.
    Determines lowest and highest note sung and classifies voice type.
    """
    with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
        shutil.copyfileobj(file.file, tmp)
        temp_filename = tmp.name
        
    try:
        result = analyze_pitch(temp_filename)
        
        if result.get("success"):
            metrics = result.get("metrics", {})
            min_hz = metrics.get("min_pitch_hz")
            max_hz = metrics.get("max_pitch_hz")
            
            if min_hz and max_hz:
                best_match = "Unknown"
                min_diff = float("inf")
                
                # Calculate user's logarithmic center frequency
                # Bottom-Heavy Logic: Weigh min_pitch twice as much as max_pitch
                user_log_center = (2 * math.log(min_hz) + math.log(max_hz)) / 3
                
                fache = KNOWLEDGE_BASE["voice_classification"]["fache"]
                
                for fach_name, data in fache.items():
                    f_min, f_max = data["range_hz"]
                    
                    # Calculate fach's logarithmic center frequency
                    fach_log_center = (math.log(f_min) + math.log(f_max)) / 2
                    
                    # Calculate distance
                    diff = abs(user_log_center - fach_log_center)
                    
                    if diff < min_diff:
                        min_diff = diff
                        best_match = fach_name
                
                result["detected_voice_type"] = best_match
                
                # Add context from KB
                if best_match in fache:
                     result["voice_type_info"] = fache[best_match]

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

@app.get("/stats/trends")
def get_stats_trends(user_id: int, db: Session = Depends(database.get_db)):
    """
    Returns time-series data for the user's sessions.
    """
    sessions = db.query(models.Session).filter(models.Session.user_id == user_id).order_by(models.Session.created_at.asc()).all()
    
    data = []
    for s in sessions:
        jitter = 0.0
        if s.metrics_json and isinstance(s.metrics_json, dict):
            jitter = s.metrics_json.get("health", {}).get("jitter_percent", 0.0)
            
        data.append({
            "date": s.created_at.isoformat(),
            "score": s.score,
            "exercise_id": s.exercise_id,
            "jitter": jitter
        })
    return data

# --- Exercises ---

@app.get("/exercises/", response_model=List[schemas.Exercise])
def read_exercises(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    exercises = db.query(models.Exercise).offset(skip).limit(limit).all()
    
    # Inject Audio URL if missing
    for ex in exercises:
        # If exercise has a pattern, the audio is generated on-demand or pre-generated via a specific endpoint
        if ex.pattern:
             ex.instructions_audio_url = f"http://localhost:8000/exercises/{ex.id}/audio"
        elif not ex.instructions_audio_url:
            filename = f"{ex.id}_{ex.name.replace(' ', '_').lower()}.mp3"
            # Using absolute URL for localhost dev
            ex.instructions_audio_url = f"http://localhost:8000/static/exercises/{filename}"
            
    return exercises

@app.get("/exercises/{exercise_id}/pattern")
def get_exercise_pattern(exercise_id: int, user_id: int = None, db: Session = Depends(database.get_db)):
    """
    Returns the note sequence (metadata) for a generated exercise.
    This tells the frontend WHEN and WHICH notes to display on the Piano Roll.
    """
    exercise = db.query(models.Exercise).filter(models.Exercise.id == exercise_id).first()
    if not exercise:
        raise HTTPException(status_code=404, detail="Exercise not found")

    if not exercise.pattern:
        return {"sequence": []} # Static files have no known pattern yet

    # Determine Root Note based on User Voice Type
    root_note = "C4" # Default fallback
    
    if user_id:
        user = db.query(models.User).filter(models.User.id == user_id).first()
        if user and user.voice_type:
             # Lookup default root for this voice type
             fache = KNOWLEDGE_BASE["voice_classification"]["fache"]
             if user.voice_type in fache:
                 root_note = fache[user.voice_type].get("default_root", "C4")
    
    # Generate Metadata (Fast, no audio generation)
    pattern_data = exercise.pattern
    result = generate_scale_audio(
        root_note=root_note,
        pattern=pattern_data.get("intervals", []),
        duration_per_note=pattern_data.get("duration", 0.8),
        output_path=None,
        with_drone=False,
        generate_audio=False
    )
    
    return result

@app.get("/exercises/{exercise_id}/audio")
def get_exercise_audio(exercise_id: int, user_id: int = None, db: Session = Depends(database.get_db)):
    exercise = db.query(models.Exercise).filter(models.Exercise.id == exercise_id).first()
    if not exercise:
        raise HTTPException(status_code=404, detail="Exercise not found")
        
    if not exercise.pattern:
        # Fallback to static file if no pattern
        filename = f"{exercise.id}_{exercise.name.replace(' ', '_').lower()}.mp3"
        # Return FileResponse directly
        file_path = f"backend/static/exercises/{filename}"
        if os.path.exists(file_path):
            return FileResponse(file_path)
        else:
             raise HTTPException(status_code=404, detail="Audio file not found")

    # Determine Root Note based on User Voice Type
    root_note = "C4" # Default fallback
    voice_type_suffix = "default"
    
    if user_id:
        user = db.query(models.User).filter(models.User.id == user_id).first()
        if user and user.voice_type:
             voice_type_suffix = user.voice_type
             # Lookup default root for this voice type
             fache = KNOWLEDGE_BASE["voice_classification"]["fache"]
             if user.voice_type in fache:
                 root_note = fache[user.voice_type].get("default_root", "C4")
    
    # Generate Audio if pattern exists
    output_filename = f"generated_{exercise.id}_{exercise.name.replace(' ', '_').lower()}_{voice_type_suffix}.wav"
    output_path = os.path.join("backend/static/exercises", output_filename)
    
    # Check if exists (cache)
    if not os.path.exists(output_path):
        pattern_data = exercise.pattern
        generate_scale_audio(
            root_note=root_note,
            pattern=pattern_data.get("intervals", []),
            duration_per_note=pattern_data.get("duration", 0.8),
            output_path=output_path,
            with_drone=True
        )
        
    return FileResponse(output_path, media_type="audio/wav")

# --- Sessions & Gamification ---

@app.post("/sessions/", response_model=schemas.SessionResponse)
def create_session(
    user_id: int = Form(...),
    exercise_id: int = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(database.get_db)
):
    # 1. Get User and Exercise
    user = db.query(models.User).filter(models.User.id == user_id).first()
    exercise = db.query(models.Exercise).filter(models.Exercise.id == exercise_id).first()
    
    if not user or not exercise:
        raise HTTPException(status_code=404, detail="User or Exercise not found")

    # 2. Save Uploaded File (Persistent storage for session history)
    upload_dir = "backend/user_uploads"
    os.makedirs(upload_dir, exist_ok=True)
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"{timestamp}_{file.filename}"
    file_path = os.path.join(upload_dir, filename)
    
    # We keep this file permanently, so open/write is correct here, no tempfile needed unless we want atomic write.
    # But standard open is fine for this MVP.
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # 3. Run Analysis
    # Note: We analyze the PERMANENT file here, not a temp file, because we want to keep it.
    health_result = analyze_health(file_path)
    
    # Pitch Analysis (Standard or Pattern-based)
    pitch_result = {}
    accuracy_result = {}
    
    if exercise.pattern:
        # Pattern-based matching
        accuracy_result = analyze_pitch_accuracy(file_path, exercise.pattern)
        if accuracy_result.get("success"):
             score = int(accuracy_result.get("accuracy_score", 0))
             pitch_result = {"success": True, "metrics": accuracy_result} # Pack for AI context
        else:
             score = 0
             pitch_result = analyze_pitch(file_path) # Fallback to get some stats
    else:
        # Standard Pitch Analysis
        pitch_result = analyze_pitch(file_path)
        score = 70  # Start Score for standard exercises
        
        # Pitch Scoring Logic for standard exercises
        if pitch_result.get("success"):
            metrics = pitch_result["metrics"]
            if metrics.get("pitch_stability_std", 10.0) < 2.0:
                score += 10
    
    # Health Scoring Modifier
    if health_result.get("success"):
        overall_health = health_result["assessment"]["overall"]
        if overall_health == "green":
            if not exercise.pattern: score += 20 # Bonus only for non-accuracy exercises
        elif overall_health == "red":
            score -= 20 # Penalty always applies
            
    # Clamp Score
    score = max(0, min(100, score))

    # 5. AI Feedback
    metrics_for_ai = {}
    if health_result.get("success"):
        metrics_for_ai.update(health_result["metrics"])
    if pitch_result.get("success"):
        metrics_for_ai.update(pitch_result["metrics"])
    
    metrics_for_ai["score"] = score
    
    # History Injection for AI
    history = db.query(models.Session).filter(models.Session.user_id == user_id).order_by(models.Session.id.desc()).limit(5).all()
    avg_score = 0
    if history:
        avg_score = sum([s.score for s in history]) / len(history)

    user_context = {
        "level": user.level,
        "voice_type": user.voice_type or "Unknown",
        "streak": user.current_streak,
        "history_avg_score": round(avg_score, 1),
        "history_count": len(history)
    }
    
    ai_feedback = generate_feedback(exercise.name, metrics_for_ai, user_context)

    # 6. Gamification Logic
    gamification.update_streak(user, db)
    
    xp_earned = gamification.calculate_xp(
        session_score=score,
        difficulty=exercise.difficulty,
        current_streak=user.current_streak
    )
    
    # Update User Stats
    user.xp += xp_earned
    user.level = gamification.calculate_level(user.xp)
    
    # 7. Save Session
    db_session = models.Session(
        user_id=user_id,
        exercise_id=exercise_id,
        score=score,
        audio_url=file_path,
        metrics_json={
            "health": health_result.get("metrics"),
            "pitch": pitch_result.get("metrics"),
            "assessment": health_result.get("assessment")
        },
        ai_feedback={"text": ai_feedback}
    )
    db.add(db_session)
    db.commit()
    db.refresh(user)
    
    return {
        "xp_earned": xp_earned,
        "new_total_xp": user.xp,
        "new_level": user.level,
        "streak": user.current_streak,
        "score": score,
        "feedback": ai_feedback
    }
