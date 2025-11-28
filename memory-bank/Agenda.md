VocalCoach AI - Technical Roadmap v2.0
Status: Alpha -> Moving to Beta
Focus: Robustheit, Real-time Feedback & AI Memory
🚨 Priority 1: Core Algorithm Refinement (Immediate Fixes)
Das Fundament muss stimmen, bevor wir Features bauen.
[ ] Smart Pitch Filtering (Fix Range Finder)
Datei: backend/analysis/pitch.py
Task: Ersetze np.min/max durch np.percentile(f0, 10) und np.percentile(f0, 90).
Ziel: Ignorieren von Ausreißern (Husten, Quietschen, Raumklang), damit ein Bariton nicht als Mezzo erkannt wird.
[ ] Voice Type Calibration
Datei: backend/main.py -> /analyze/range
Task: Implementiere "Bottom-Heavy Logic". Die tiefste Note ist physiologisch begrenzter als die höchste (Falsett/Whistle). Gewichte min_pitch stärker bei der Fach-Erkennung.
🚀 Priority 2: The "Live" Experience (Frontend Engineering)
Weg von "Black Box", hin zu visuellem Echtzeit-Feedback.
[ ] Real-time Pitch Detection (Client-Side)
Tech: Integration von ml5.js (PitchDetection) oder Aubio (via WebAssembly) direkt in React.
UI: Visualisierung einer "Pitch Line" über einem Canvas während der Aufnahme.
Nutzen: Der User sieht sofort, ob er den Ton hält, nicht erst nach dem Upload.
[ ] Interactive Piano Roll
Komponente: ExerciseModal
Task: Statt nur Audio abzuspielen, visualisiere die Ziel-Noten als Balken (wie Guitar Hero).
Sync: Synchronisiere die Pitch-Linie des Users mit den Ziel-Balken.
🧠 Priority 3: The "Deep" Coach (AI Memory)
Die KI soll sich erinnern, nicht nur reagieren.
[ ] History Injection
Backend: Erweitere generate_feedback in ai_wrapper.py.
Logic: Hole die letzten 5 Sessions des Users aus der DB.
Prompt: "Vergleiche die aktuelle Session mit dem Durchschnitt der letzten 5. Ist der Trend positiv oder negativ?"
[ ] Trend Analysis Endpoints
API: GET /stats/trends
Return: Array von [date, jitter_value, pitch_accuracy] für Chart.js Graphen im Dashboard.
🛠️ Priority 4: Advanced Audio Features
[ ] MIDI Support
Backend: backend/analysis/alignment.py
Funktion: Dynamic Time Warping (DTW) um die gesungene Melodie zeitlich an eine Soll-Melodie (MIDI) anzupassen.
Ziel: Bewertung von Timing und Phrasierung bei echten Songs.
[ ] Formant Biofeedback
Visuell: Echtzeit-Anzeige des "Sängerformanten" (2-4kHz Energie).
Feedback: "Mach den Klang heller/dunkler", indem man sieht, wie sich das Spektrum ändert.
📱 Priority 5: Architecture Polish
[ ] Dockerization
Erstelle Dockerfile und docker-compose.yml für Backend (Python) und Frontend (Node), um das Deployment zu vereinfachen.
[ ] Async Processing
Verschiebe die parselmouth Analyse in einen Background Worker (Celery/Redis), falls die Analysen länger als 2-3 Sekunden dauern.
