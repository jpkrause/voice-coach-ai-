Technischer Architekturplan: VocalCoach AI

1. Architektur-Übersicht

Wir verwenden eine hybride Architektur:

Frontend (React): Zuständig für Aufnahme, Visualisierung (Canvas) und Interaktion.

Backend (FastAPI): Zuständig für Heavy-Lifting (DSP - Digital Signal Processing), Datenbank und Gamification-Logik.

Intelligence Layer: Kombiniert deterministische Analyse (Python/Parselmouth) mit probabilistischer Interpretation (Gemini AI) und pädagogischem Wissen (PDF-Knowledge-Base).

2. Scientific Core ("The Ground Truth")

Basierend auf dem Forschungsbericht "Computational Vocology". Diese Schwellenwerte sind hard-coded im Backend.

A. Vocal Health Metrics (Engine: parselmouth)

Das Backend bewertet jede Aufnahme nach diesem Ampel-System.

Metrik

Grün (Gesund/Exzellent)

Gelb (Warnung/Grauzone)

Rot (Pathologisch/Fehler)

Jitter (local)

$\le 1.04\%$

$1.05\% - 1.50\%$

$> 1.50\%$ (Rauigkeit)

Shimmer (local)

$\le 3.81\%$

$3.82\% - 5.00\%$

$> 5.00\%$ (Hauchigkeit)

HNR (Noise)

$\ge 20 \text{ dB}$

$12 - 19 \text{ dB}$

$< 12 \text{ dB}$ (Luftig)

Vibrato Rate

$4.5 - 7.0 \text{ Hz}$

$< 4.5$ oder $> 7.0$

Tremolo ($>8 \text{ Hz}$) / Wobble

B. Breath Analysis (Engine: breath.py)

Messung der MPT (Maximum Phonation Time) und Stabilität (Standardabweichung dB).

Stabilitäts-Ziel: Amplitude Standardabweichung $< 1.0 \text{ dB}$ (Gute Stütze).

Normwerte (Level 1 Basis):

Männer: 25s

Frauen: 22s

Gamification: $+1 \text{ Level}$ pro $+2 \text{ Sekunden}$ Verbesserung.

3. Datenbank Schema (SQLite + SQLAlchemy)

Wir benötigen eine relationale Struktur für Progression und Personalisierung.

users

id (PK)

nickname, email

voice_type (Enum: Sopran, Mezzo, Alt, Tenor, Bariton, Bass)

level (Int, Default: 1)

xp (Int, Default: 0)

current_streak (Int), last_practice_at (DateTime)

settings_genre (Enum: Pop, Klassik, Rock)

exercises

id (PK)

name (z.B. "Lip Trills")

category (Warmup, Technique, Breath, CoolDown)

difficulty (1-5)

is_scored (Bool) -> False für Cool Downs.

physiological_target (String, z.B. "SOVT / PTP Reduction" - für den KI Kontext)

metaphors (JSON): {"nasal": "Denk an ein inneres Gähnen", "pressed": "Lass den Kiefer fallen"}

user_exercise_stats (The Learning Brain)

Speichert, wie effektiv eine Übung für diesen spezifischen User ist.

user_id (FK), exercise_id (FK)

times_performed (Int)

avg_score (Float)

efficacy_rating (Float): Interner Wert (-1.0 bis +1.0). Steigt, wenn nach dieser Übung der Pitch/Jitter besser wird.

sessions

id, user_id, exercise_id

audio_path (File System Link)

metrics_json (Gespeicherte Rohdaten: Jitter, Shimmer, Cents)

ai_feedback_text

4. Backend Module & Logik

analysis/quality.py (Vocal Health)

Implementiert die parselmouth Logik.

Wichtig: Muss Vibrato entfernen oder erkennen, bevor Jitter berechnet wird, sonst wird Vibrato als "Wackeln" bestraft.

Funktion analyze_health(audio): Gibt Ampel-Status (G/Y/R) und physikalische Werte zurück.

analysis/pitch.py (Intonation)

Nutzt librosa.pyin für Fundamental Frequency ($f_0$).

Vergleicht $f_0$ mit Soll-Noten (MIDI).

Berechnet cent_deviation: Wie weit weg vom perfekten Ton? (z.B. +15 Cents = Sharp).

gamification.py (The Hook)

Berechnet Belohnungen nach jedem Upload.

XP Formel:

base_xp = 50
score_multiplier = session_score / 100  # 0.0 bis 1.0
streak_bonus = min(current_streak * 5, 50) # Max 50 XP extra für Streaks
total_xp = (base_xp * score_multiplier * difficulty) + streak_bonus


Level Up: level = floor(sqrt(xp / 100)) (Quadratische Kurve - wird schwerer).

Streak Logic:

Wenn last_practice == yesterday: streak += 1

Wenn last_practice == today: pass

Sonst: streak = 0 (Sorry!)

ai_coach.py (RAG / Context Injection)

Hier verknüpfen wir den PDF-Bericht mit der KI.

System Prompt Construction:

Lädt dynamisch Metadaten aus dem PDF-Wissen.

Beispiel Input: "Jitter = 2.1%".

Inject Knowledge: "Jitter > 1.5% deutet auf aperiodische Stimmlippenschwingung hin. Mögliche Ursache: Schleim, Knötchen oder Pressen."

User Prompt: "Erkläre dem User nett, dass er 'kratzig' klingt und was er dagegen tun kann (nutze Metapher: 'Wasser trinken', 'Leiser singen')."

5. API Endpoints (Auszug)

POST /api/onboarding/profile: Erstellt User & bestimmt Range.

POST /api/analyze/range: Spezial-Endpoint für den Range-Test (erwartet Glissando).

POST /api/analyze/breath: Spezial-Endpoint für 'S'-Challenge (nur Amplitude/Zeit).

POST /api/session/{exercise_id}: Haupt-Endpoint für Übungen.

Nimmt Audio entgegen.

Führt quality.py & pitch.py aus.

Berechnet Score & XP.

Holt KI-Feedback.

Gibt alles als JSON zurück.

GET /api/recommendations: Liefert 3 Übungen basierend auf user_exercise_stats (Was hat zuletzt geholfen?).

6. Projektstruktur Update

vocal-coach-ai/
├── backend/
│   ├── main.py
│   ├── config.py          # Schwellenwerte (1.04% etc.) hier als Konstanten!
│   ├── database.py
│   ├── models.py          # SQLAlchemy Klassen
│   ├── analysis/
│   │   ├── pitch.py
│   │   ├── quality.py     # Parselmouth Implementierung
│   │   └── breath.py      # MPT & Stability
│   ├── intelligence/
│   │   ├── ai_wrapper.py  # Gemini API
│   │   ├── knowledge.py   # PDF-Wissen & Metaphern-DB
│   │   └── recommender.py # Adaptive Logik
│   ├── gamification.py    # XP & Streaks
│   └── static/exercises/  # Audio Files
├── frontend/
│   ├── src/
│   │   ├── features/
│   │   │   ├── Assessment/
│   │   │   ├── Recorder/
│   │   │   └── Dashboard/ # XP Bar, Badges, Streak Flame
│   │   └── ...
└── docs/
    └── reference/         # Das PDF & Research Notes
