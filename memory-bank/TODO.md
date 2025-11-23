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
