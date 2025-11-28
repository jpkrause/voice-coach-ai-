Projekt Roadmap & TODOs
Phase 0: Setup & "Hello World"
[x] Environment & DB
[x] Git & Ordnerstruktur.
[x] FastAPI & SQLite Setup.
[x] React Setup.
Phase 1: Foundation & Gamification
Ziel: User Account, Datenbank und erste Motivations-Mechaniken.
[x] DB Models erweitern
[x] User Model mit streak, xp, level Feldern.
[x] Exercise Model anlegen.
[x] Seed-Script schreiben: Die 10 Basis-Übungen und 10 Spezifischen Übungen in die DB füllen.
[x] Gamification Logic
[x] Funktion calculate_xp(score, difficulty).
[x] Funktion update_streak(user_id).
[x] Endpoint GET /profile (liefert Level & Streak).
Phase 2: Audio Engine & "Breath-Alyzer"
[x] Basis Analyse
[x] Librosa & Parselmouth Setup.
[x] Breath Analyzer (breath.py)
[x] Algorithmus für RMS-Amplitude (Lautstärke über Zeit).
[x] Erkennung von Einbrüchen (schlechte Stütze).
[x] Testen mit einer Aufnahme von "Sssss".
[ ] Refinement & UX
[x] Noise Calibration (Grundrauschen entfernen).
[x] Global Difficulty Levels (Anpassung der Toleranz-Schwellen).
[x] Visualisierung
[x] Live-Lautstärke-Visualizer im Frontend (Wellenform/Canvas).
Phase 3: Vocal Assessment & AI
[x] Vocal Health (Jitter/Shimmer)
[x] Ampel-System Logik implementieren.
[x] Hybrid AI
[x] Gemini Anbindung mit Metriken (inkl. Atem-Daten).
[x] Prompt Engineering für Feedback (Context Injection aus knowledge.py).
Phase 4: Content & UI Polish
[x] Content Production
[x] Audio-Dateien für die Übungen generieren (gTTS Script & API Integration).
[ ] UI Design
[x] Progress Bars für XP und Level.
[x] Badge-Case (Trophäenschrank) im Profil.
[ ] Dark Mode finalisieren.
Phase 5: Version 0.7 - Multi-Layer & Scales
[x] Audio Synthesis
[x] Backend Synth Engine (Sine/Sawtooth) für Tonleitern.
[x] Endpoint für On-Demand Generierung von Audio.
[x] Multi-Layer Exercises
[x] DB Schema Update (Exercise Patterns).
[x] Pitch Accuracy Logic (Vergleich gesungene Melodie vs. Target).
[x] Frontend "Listen -> Sing" Workflow.
Phase 6: Personalization & Adaptive Audio
[x] Dynamic Root Notes
    [x] Voice Type mapping in knowledge.py.
    [x] Backend support for custom root note generation.
    [x] Frontend passing user_id to audio endpoint.
[x] Drone/Accompaniment
    [x] Synth engine update for background drone.

Phase 7: Alpha -> Beta (Robustness & Real-time)
Focus: Stabilität der Analyse, visuelles Live-Feedback und Gedächtnis für den AI Coach.

[ ] Priority 1: Core Algorithm Refinement
    [x] Smart Pitch Filtering (backend/analysis/pitch.py): Replace min/max with percentiles (10/90) to ignore outliers.
    [x] Voice Type Calibration (backend/main.py): Implement "Bottom-Heavy" logic for range detection.

[ ] Priority 2: Live Frontend Experience
    [x] Real-time Pitch Detection (AudioRecorder.jsx): Integrate ml5.js for client-side pitch tracking.
    [x] Interactive Piano Roll (ExerciseModal.jsx): Visual Target-Bars + User Pitch Line overlay (Guitar Hero style).

[ ] Priority 3: AI Memory & Trends
    [x] History Injection: Pass last 5 sessions to AI prompt for trend comparison.
    [x] Trend Analysis Endpoint: GET /stats/trends for dashboard charts.

[ ] Priority 4: Technical Improvements & Refactoring
    [x] Fix Blocking Async: Convert CPU-bound async endpoints to sync def (or use threadpool) to prevent event loop blocking.
    [x] Safe Temp Files: Use tempfile.NamedTemporaryFile instead of manual open/remove.
    [x] Dynamic User ID: Remove hardcoded "user_id=1" in frontend, use context/auth.
    [x] Dockerization: Create Dockerfile and docker-compose.yml.
