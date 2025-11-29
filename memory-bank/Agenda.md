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



VocalCoach AI - Technical Roadmap v3 (The Interactive Era)

Status: Core Analysis Stable ✅ | Focus: Interactive UX & Advanced Algorithms 🚧

🎯 Epic 1: The "Piano Roll" Experience (Frontend Heavy)

Ziel: Der User soll nicht nur eine Wellenform sehen, sondern seine Stimme als Linie auf Noten-Balken.

1.1 Canvas Piano Roll (Visualisierung)

Datei: src/components/AudioRecorder.jsx (oder neue PianoRoll.jsx)

Konzept:

Y-Achse: Logarithmische Frequenz (Noten C2 bis C6).

X-Achse: Zeit (Scrollend).

Layer 1 (Target): Graue Balken zeigen die Soll-Noten der Übung (aus exercise.pattern).

Layer 2 (User): Eine leuchtende Linie (z.B. Cyan) zeigt den ml5 Pitch in Echtzeit.

Tech: HTML5 Canvas requestAnimationFrame.

1.2 Feedback-Loop (Visuell)

Färbe die User-Linie Grün, wenn sie den grauen Balken trifft, und Rot, wenn sie daneben liegt.

Das gibt sofortiges Dopamin beim Üben.

🧠 Epic 2: Algorithmic Accuracy (Backend Heavy)

Ziel: Die "Trefferquote" bei Melodien (Scales) wissenschaftlich berechnen.

2.1 Dynamic Time Warping (DTW)

Problem: analyze_pitch_accuracy zählt aktuell nur "Hits". Wenn der User zu langsam/schnell singt, versagt der Vergleich.

Lösung: Implementierung des DTW-Algorithmus (fastdtw oder librosa.sequence.dtw).

Logik:

Extrahiere Pitch-Kurve der Referenz (Synth).

Extrahiere Pitch-Kurve des Users.

DTW "dehnt/staucht" die Zeitachsen, um die bestmögliche Übereinstimmung zu finden.

Der "Distance Score" ist dein Maß für Intonation & Phrasierung (unabhängig vom Tempo).

2.2 Rhythm Analysis

Nutze librosa.onset.onset_detect, um zu prüfen: War der User rhythmisch "tight" auf dem Beat des Playbacks?

📊 Epic 3: Long-Term Vocal Health (Data Science)

Ziel: Trends erkennen, die ein einzelner Tag nicht zeigt.

3.1 Dashboard Charts (recharts)

Visualisiere den Verlauf von:

Jitter: Wird die Stimme über Wochen "klarer"?

Range: Hat sich der höchste Ton nach oben verschoben?

Stamina: Wird die MPT (Atemdauer) länger?

3.2 Der "Vocal Health Monitor"

Wenn Jitter 3 Sessions in Folge steigt -> Warnung: "Deine Stimme scheint ermüdet. Mach 2 Tage Pause." (KI Proaktivität).

🛠️ Technical Debt & Refactoring

[ ] Frontend State Management:

Mit steigender Komplexität (Recorder, Modal, User, History) sollten wir Zustand (Zustand Library) oder Context API sauber aufsetzen, um "Prop Drilling" zu vermeiden.

[ ] Async Processing:

Die Analyse dauert ca. 1-2 Sekunden.

UI: Zeige coole Loading-Animationen (z.B. eine schwingende Stimmgabel), während das Backend rechnet.
