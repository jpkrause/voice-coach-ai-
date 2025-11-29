Vision: VocalCoach AI
1. Das Kernversprechen
VocalCoach AI ist mehr als nur ein Aufnahmegerät. Es ist ein intelligenter, geduldiger und analytischer Gesangslehrer, der 24/7 verfügbar ist. Die Anwendung verbindet die mathematische Präzision klassischer Audio-Analyse mit der emotionalen und didaktischen Intelligenz moderner multimodaler KI.
2. Die Zielgruppe (Du)
Sänger, die objektives Feedback zu Tonhöhe (Pitch) und Rhythmus brauchen.
Sänger, die tiefgreifendes Feedback zu Stimmgesundheit (Vocal Health) und Technik (Stütze vs. Pressen) benötigen.
Nutzer, die ihre Vocal Identity (Stimmfach, Range, Tessitura) verstehen wollen.
3. Core Features (MVP - Minimum Viable Product)
A. Onboarding & Vocal Identity
Profilierung: Erfassung von Nickname, musikalischen Vorlieben.
Guided Assessment: Warm-up, Range Test, Fach-Bestimmung (z.B. Baritenor).
B. Die "Ohren" (Audio Engine & Analyse)
High-Fidelity Recording: Studio-Qualität.
Ampel-Feedback (Vocal Health): Grün (Gesund), Gelb (Instabil), Rot (Gepresst).
NEU: Der "Breath-Alyzer" (Atem-Monitor):
Misst die "S"-Übung (Zischen).
Bewertet Dauer (Lungenkapazität) und Gleichmäßigkeit (Stütze/Appoggio).
Erkennt "Zittern" im Luftstrom (mangelnde Rumpfspannung).
C. Der "Coach" (Hybrid AI)
Hybrid Intelligence: Kombiniert Python-Messdaten (Jitter, Shimmer, Cent-Abweichung) mit KI-Interpretation.
Die Persona: Der Coach ist "Streng in der Sache, aber ermunternd im Ton".
Negativ: "Das war schlecht."
VocalCoach AI: "Die Intonation war bei den hohen Tönen unstabil (zu tief). Versuch, mehr Raum im Rachen zu schaffen, du bist fast da!"
Kontext: Berücksichtigt Genre (Pop vs. Klassik).
D. Progression & Gamification (NEU)
Daily Streak: "Halte deine Stimme fit" (Tägliche Erinnerung).
XP System: Punkte für Übungen (z.B. +50 XP für "Clean Intonation").
Level-System: Vom "Shower Singer" (Lvl 1) zum "Stage Pro" (Lvl 50).
Badges: "Iron Lungs" (für 60sek 'S'-Übung), "Pitch Perfect" (100% Trefferquote).
4. Die Übungs-Bibliothek (Content)
Die 10 Basis-Übungen (Daily Bread)
The Sigh (Gähnen): Kiefer lockern, Raum schaffen.
Lip Trills (Lippenflattern): Stütze aktivieren ohne Kehlkopfbelastung.
Humming (Summen): Resonanz in die "Maske" bringen.
The Siren (Glissando): Verbindung von Brust- zu Kopfstimme (Mix).
Staccato-Hüpfer: Zwerchfell-Impulse trainieren.
Messa di Voce: Lautstärke an- und abschwellen auf einem Ton (Kontrolle).
Vowel Alignment: I-E-A-O-U auf einem Ton (Formanten-Tuning).
Octave Jumps: Flexibilität und Treffsicherheit.
Ng-Klang: Zungenwurzel entspannen.
Soft Onset: Sanfter Stimmeinsatz ohne harten "Knack".
10 Spezifische / Rollen-Übungen
The "Nye" (Twang): Für Musical/Pop Durchsetzungskraft.
Belt Call ("Hey!"): Rufen in der Höhe (Rock/Pop).
Vocal Fry Onset: Für Metal oder Stimmtherapie (Stimmlippenschluss).
Coloratura Run: Schnelligkeit (Barock/RnB).
Sobbing (Weinen): Kehlkopf senken (Klassik/Ballade).
Creaky Door: Feiner Stimmlippenschluss.
Dynamics Hold: Leise singen in hoher Lage (Kontrolle).
Diction Drill: Zungenbrecher auf Tönen (Rap/Musical).
Blues Scale: Pentatonik Improvisation (Jazz).
Distortion Prep: Sicheres "Anrauen" der Stimme (Rock).
3 Cool Down Rituals (The Reset - Mandatory!)
Modus: No Score / Pure Relaxation. Zählt nur als "Erledigt" für den Streak.
Vocal Fry Slides (Stimmband-Massage):
Ein sehr tiefes, entspanntes "Knarren" (wie eine knarrende Tür). Lockert die Schleimhaut der Stimmlippen komplett.
The Chewing Hum (Kauen & Summen):
Ein "Mmmmh" summen und dabei übertrieben kauen (wie Kaugummi). Löst Kiefer- und Zungenverspannungen, die sich beim Singen aufgebaut haben.
Downward Sighs (Abwärts-Seufzer):
Sanftes Rutschen von der Mittellage in die Tiefe. Signalisiert dem Körper: "Arbeit vorbei, Entspannung."
5. Design Philosophie
Studio Dark Mode: Fokus und Ruhe.
Feedback-Loops: Visuelles Feedback muss sofort verständlich sein (Farben statt nur Zahlen).



VocalCoach AI - Roadmap v3: The "Rhythm & Flow" UpdateStatus: Analysis Core Stable ✅ | Focus: Temporal Visualization & Synchronization🎯 VisionWir verwandeln den statischen "Tuner-Modus" in einen dynamischen "Timeline-Modus". Der User soll nicht nur die richtige Note treffen, sondern auch zum richtigen Zeitpunkt.1. Backend: Die "Beat Map" EngineDamit das Frontend weiß, wann welche Note kommt, muss das Backend mehr als nur Audio liefern.[ ] Update audio/synth.py:Die Funktion generate_scale_audio muss modifiziert werden.Return Value: Statt nur Audio zurückzugeben (oder zu speichern), muss sie auch Metadaten liefern.Neue Struktur:{
  "audio_path": "static/exercises/scale_c4.wav",
  "sequence": [
     {"note": "C4", "freq": 261.63, "start_time": 0.0, "duration": 0.8},
     {"note": "D4", "freq": 293.66, "start_time": 0.8, "duration": 0.8},
     # ...
  ]
}
VocalCoach AI - Roadmap v3: The "Rhythm & Flow" UpdateStatus: Analysis Core Stable ✅ | Focus: Temporal Visualization & Synchronization🎯 VisionWir verwandeln den statischen "Tuner-Modus" in einen dynamischen "Timeline-Modus". Der User soll nicht nur die richtige Note treffen, sondern auch zum richtigen Zeitpunkt.1. Backend: Die "Beat Map" EngineDamit das Frontend weiß, wann welche Note kommt, muss das Backend mehr als nur Audio liefern.[ ] Update audio/synth.py:Die Funktion generate_scale_audio muss modifiziert werden.Return Value: Statt nur Audio zurückzugeben (oder zu speichern), muss sie auch Metadaten liefern.Neue Struktur:{
  "audio_path": "static/exercises/scale_c4.wav",
  "sequence": [
     {"note": "C4", "freq": 261.63, "start_time": 0.0, "duration": 0.8},
     {"note": "D4", "freq": 293.66, "start_time": 0.8, "duration": 0.8},
     # ...
  ]
}
VocalCoach AI - Roadmap v3: The "Rhythm & Flow" Update

Status: Analysis Core Stable ✅ | Focus: Temporal Visualization & Synchronization

🎯 Vision

Wir verwandeln den statischen "Tuner-Modus" in einen dynamischen "Timeline-Modus". Der User soll nicht nur die richtige Note treffen, sondern auch zum richtigen Zeitpunkt.

1. Backend: Die "Beat Map" Engine

Damit das Frontend weiß, wann welche Note kommt, muss das Backend mehr als nur Audio liefern.

[ ] Update audio/synth.py:

Die Funktion generate_scale_audio muss modifiziert werden.

Return Value: Statt nur Audio zurückzugeben (oder zu speichern), muss sie auch Metadaten liefern.

Neue Struktur:

{
  "audio_path": "static/exercises/scale_c4.wav",
  "sequence": [
     {"note": "C4", "freq": 261.63, "start_time": 0.0, "duration": 0.8},
     {"note": "D4", "freq": 293.66, "start_time": 0.8, "duration": 0.8},
     # ...
  ]
}


[ ] API Update (main.py):

Der Endpoint /exercises/{id}/audio sollte idealerweise diese JSON-Metadaten mitliefern (oder ein neuer Endpoint /exercises/{id}/pattern).

2. Frontend: Scrolling Piano Roll (Canvas)

Das Herzstück der neuen UI.

[ ] Refactor AudioRecorder.jsx:

Animation Loop: Statt statischer Balken müssen sich die x-Koordinaten der Balken basierend auf der currentTime des Audio-Players ändern.

Logik: x = (note.startTime - audio.currentTime) * speed + offset.

Visuell:

Zukunft (rechts): Graue Balken kommen herein.

Gegenwart (Mitte/Cursor): "Hit Zone". Hier muss der User singen.

Vergangenheit (links): Balken verschwinden.

[ ] Audio Player Sync:

Das <audio> Element muss die "Master Clock" für das Canvas sein.

3. Gamification: Timing Score

Intonation ist gut, Timing ist besser.

[ ] Rhythmus-Bewertung (Backend pitch.py):

Wenn wir DTW nutzen, bekommen wir auch Informationen über den zeitlichen Versatz.

Berechne einen rhythm_score: Wie stark weicht der "Warp Path" von der Diagonalen ab? (Wenn User zu schnell/langsam war).

[ ] UI Feedback:

Zeige nach der Übung: "Du warst etwas schleppend (zu spät)" oder "Du warst treibend (zu früh)".

4. Advanced: Custom User Ranges

Keine statischen C4-Skalen mehr.

[ ] Adaptive Generation:

Wenn der User ein Bass ist (E2 - C4), macht es keinen Sinn, ihm eine C4-Skala zu geben (zu hoch!).

Backend: Prüfe user.voice_type und generiere die Übung dynamisch in einer passenden Tonart (z.B. Start auf F2 für Bass).

Dies erfordert, dass generate_scale_audio den root_note Parameter dynamisch basierend auf dem User-Profil setzt.

🔌 Technical Debt Cleanup

[ ] Cleanup user_uploads: Implementiere einen Cronjob oder Check, der alte WAV-Dateien (älter als 7 Tage) löscht, um Speicher zu sparen.

[ ] Environment Variables: Sicherstellen, dass GEMINI_API_KEY auch im Docker-Container korrekt durchgereicht wird.