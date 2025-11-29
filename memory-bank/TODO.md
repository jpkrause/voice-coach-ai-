Projekt Roadmap & TODOs

## Phase 0: Setup & "Hello World" (✅ Done)
[x] Environment & DB
[x] Git & Ordnerstruktur.
[x] FastAPI & SQLite Setup.
[x] React Setup.

## Phase 1: Foundation & Gamification (✅ Done)
Ziel: User Account, Datenbank und erste Motivations-Mechaniken.
[x] DB Models erweitern (User, Streak, XP).
[x] Exercise Model anlegen & Seeding (Basis & Spezifische Übungen).
[x] Gamification Logic (XP Formel, Streak Update).
[x] Endpoint GET /profile.

## Phase 2: Audio Engine & "Breath-Alyzer" (✅ Done)
[x] Basis Analyse (Librosa & Parselmouth Setup).
[x] Breath Analyzer (RMS-Amplitude, Stabilitätstest).
[x] Noise Calibration & Difficulty Levels.
[x] Visualisierung (Live-Lautstärke-Visualizer).

## Phase 3: Vocal Assessment & AI (✅ Done)
[x] Vocal Health Metrics (Jitter/Shimmer Ampel-System).
[x] Hybrid AI Integration (Gemini Anbindung).
[x] Prompt Engineering (Context Injection aus knowledge.py).

## Phase 4: Content & UI Polish (✅ Done)
[x] Content Production (Audio-Dateien generiert/TTS).
[x] UI Design (Progress Bars, Badges).
[ ] Dark Mode finalisieren (fehlt evtl. noch Feinschliff).

## Phase 5: Version 0.7 - Multi-Layer & Scales (✅ Done)
[x] Audio Synthesis (Sine/Sawtooth Engine).
[x] Multi-Layer Exercises (Exercise Patterns).
[x] Pitch Accuracy Logic (Basis "Hit-Rate" Algorithmus).
[x] Frontend "Listen -> Sing" Workflow.

## Phase 6: Personalization & Adaptive Audio (✅ Done)
[x] Dynamic Root Notes (Voice Type mapping).
[x] Drone/Accompaniment Synth Engine.

## Phase 7: Alpha -> Beta Refinement (✅ Done)
Focus: Stabilität der Analyse, visuelles Live-Feedback und Gedächtnis.
[x] **Smart Pitch Filtering:** (backend/analysis/pitch.py) Percentile-Filter (10/90) implementiert.
[x] **Voice Type Calibration:** (backend/main.py) "Bottom-Heavy" Logik implementiert.
[x] **Real-time Pitch Detection:** (Frontend) ml5.js Integration steht.
[x] **Interactive Piano Roll:** (Frontend) Canvas zeichnet Target-Bars & User-Pitch.
[x] **AI Memory:** (Backend) History Injection (letzte 5 Sessions) in AI Prompt integriert.
[x] **Technical Improvements:** Async Blocking Fixes, Safe Temp Files, Dockerization.

---

## 🚀 Phase 8: Interactive & Scientific Polish (Next Steps)
Fokus: Präzision der Bewertung (DTW), User Experience (Live Feedback) und Langzeit-Gesundheit.

### 8.1 Algorithmic Accuracy (Backend)
Verschiebung von einfacher "Hit-Rate" zu wissenschaftlichem Sequenz-Vergleich.
[x] **Dynamic Time Warping (DTW) Implementierung**
    - Datei: `backend/analysis/pitch.py`
    - Task: Import von `fastdtw` (oder `scipy.spatial.distance`).
    - Logic: Ersetze die einfache Array-Suche in `analyze_pitch_accuracy` durch DTW-Distanz-Berechnung.
    - Ziel: Bewertung von Phrasierung und Timing (nicht nur "Note getroffen"). Erkennt, wenn User richtig singt, aber leicht versetzt zum Beat.

### 8.2 Visual Feedback Loop (Frontend)
Das "Guitar Hero" Gefühl verstärken.
[x] **Gamified Piano Roll**
    - Datei: `frontend/src/components/AudioRecorder.jsx`
    - Task: Färbe die Pitch-Linie in Echtzeit.
        - **Grün:** Wenn `abs(user_hz - target_hz) < threshold` (z.B. 50 Cents).
        - **Rot/Grau:** Wenn daneben.
    - Task: Visueller Effekt (z.B. "Glow" oder Partikel) bei Note Onset.

### 8.3 Vocal Health Monitor (Dashboard)
Langzeit-Trends sichtbar machen und proaktiv warnen.
[x] **Trend Charts**
    - Datei: `frontend/src/pages/Dashboard.jsx`
    - Task: Nutze `recharts` um `GET /stats/trends` Daten zu visualisieren.
    - Metriken: Jitter (Y-Achse) über Zeit (X-Achse). Ziel: Sinkende Kurve.
[x] **Proactive AI Warnings**
    - Logic: Wenn Jitter-Trend der letzten 3 Sessions steigt -> Zeige Warnung im Dashboard ("Stimme wirkt müde, mach Pause!").

### 8.4 Advanced Audio Features
[ ] **MIDI / MusicXML Support** (Optional für später)
    - Import echter Songs statt nur Skalen.
[ ] **Formant Biofeedback**
    - Echtzeit-Anzeige der Vokal-Farbe (Hell/Dunkel) im Canvas.

## 🎨 Phase 9: UI Overhaul (Transformation zum "Digital Studio")
Anpassung des Interfaces an die neuen Real-time & Scientific Features.

### 9.1 Dashboard 2.0 ("The Cockpit")
[x] **Vocal Health Monitor UI**
    - Integration einer "Ampel" oder Tachometer-Anzeige für den aktuellen Vocal-Status (via Jitter Chart).
[x] **Trend Visualization**
    - Einbau von `recharts` (LineChart) für Jitter- und Score-Verlauf.
[x] **Quick Actions**
    - Prominente Buttons für "Daily Warmup" und "Quick Check".

### 9.2 Immersive Practice Mode
[ ] **Fullscreen Recorder**
    - Umbau des `ExerciseModal` zu einem Fullscreen-Overlay ("Studio Mode").
    - Vergrößerung des Canvas für bessere Lesbarkeit der Pitch-Linie.
[ ] **Live Feedback UX**
    - Visuelle Indikatoren (Neon-Glow) bei Treffern direkt im Canvas (in Sync mit Phase 8.2).

### 9.3 Post-Game Analysis
[ ] **Detailed Result Screen**
    - Anzeige der Pitch-Kurve *nach* der Aufnahme zur Analyse ("Wo war ich zu tief?").
    - Aufschlüsselung des Scores (Intonation vs. Timing).

### 9.4 Visual Polish
[ ] **Modern Styling**
    - Glassmorphism-Effekte für Cards und Modals.
    - Konsistentes Neon-Farbschema (Cyberpunk/Studio Aesthetic).
    - Mobile Responsiveness Optimierung.
