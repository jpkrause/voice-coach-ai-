"""
VOCAL COACH AI - SCIENTIFIC KNOWLEDGE BASE
Based on 'Computational Vocology: Theoretisches Rahmenwerk'

This file serves as the 'Ground Truth' for the AI. It contains:
1. Thresholds for acoustic analysis (Jitter, Shimmer, etc.)
2. Exercise definitions and their physiological targets.
3. Voice classification data (Passaggios).
4. MPT norms.
"""

KNOWLEDGE_BASE = {
    "vocal_health_metrics": {
        "jitter_local": {
            "unit": "%",
            "description": "Zyklus-zu-Zyklus-Schwankungen der Grundfrequenz (Pitch-Stabilität).",
            "thresholds": {
                "healthy": {"max": 1.04, "label": "Exzellent/Gesund"},
                "warning": {"min": 1.04, "max": 1.50, "label": "Grauzone (leicht rau)"},
                "pathological": {"min": 1.50, "label": "Pathologisch/Instabil (Rauigkeit)"}
            },
            "context": "Jitter > 1.04% deutet auf unregelmäßige Stimmlippenschwingung hin (z.B. Schleim, Knötchen oder mangelnde muskuläre Kontrolle). Achtung: Vibrato muss vorher herausgerechnet werden!"
        },
        "shimmer_local": {
            "unit": "%",
            "description": "Zyklus-zu-Zyklus-Schwankungen der Amplitude (Lautstärke-Konsistenz).",
            "thresholds": {
                "healthy": {"max": 3.81, "label": "Exzellent/Gesund"},
                "warning": {"min": 3.81, "max": 5.00, "label": "Grauzone"},
                "pathological": {"min": 5.00, "label": "Pathologisch (Hauchigkeit/Heiserkeit)"}
            },
            "context": "Hoher Shimmer korreliert mit 'Behauchtheit' (Breathiness) und unvollständigem Glottisschluss."
        },
        "shimmer_db": {
             "unit": "dB",
             "description": "Shimmer in Dezibel.",
             "thresholds": {
                 "healthy": {"max": 0.35, "label": "Exzellent"},
                 "warning": {"min": 0.35, "max": 0.50, "label": "Grauzone"},
                 "pathological": {"min": 0.50, "label": "Instabil"}
             }
        },
        "hnr": {
            "unit": "dB",
            "description": "Harmonics-to-Noise Ratio. Verhältnis von Klang zu Rauschen.",
            "thresholds": {
                "excellent": {"min": 25.0, "label": "Sehr Resonant"},
                "acceptable": {"min": 20.0, "max": 24.0, "label": "Normal"},
                "pathological": {"max": 12.0, "label": "Pathologisch/Extrem Behaucht"}
            },
            "context": "Werte unter 20dB gelten als klinische Grenze für Heiserkeit. Im Jazz/Pop kann 15-18dB stilistisch gewollt sein (Breathy Voice)."
        },
        "vibrato": {
            "unit": "Hz",
            "description": "Periodische Frequenzmodulation.",
            "norms": {
                "classic": {"min": 5.5, "max": 6.5},
                "pop": {"min": 4.5, "max": 6.0}
            },
            "errors": {
                "wobble": {"max": 4.5, "label": "Wobble (zu langsam, mangelnde Spannung)"},
                "tremolo": {"min": 7.0, "label": "Tremolo (zu schnell, Hyperfunktion)"}
            }
        }
    },
    "mpt_norms": {
        "description": "Maximum Phonation Time (in Sekunden) für gehaltene Vokale.",
        "adult_male": {
            "untrained": {"min": 22.0, "avg": 25.0},
            "singer": {"min": 30.0, "avg": 40.0}
        },
        "adult_female": {
            "untrained": {"min": 19.0, "avg": 21.0},
            "singer": {"min": 25.0, "avg": 35.0}
        },
        "pathology_limit": 10.0
    },
    "voice_classification": {
        "description": "Klassifizierung nach Passaggio-Punkten (Übergangsfrequenzen) nach Richard Miller.",
        "fache": {
            "Sopran": {
                "range_hz": [261, 1047], # C4-C6
                "passaggios": {"P1": "E4/F4 (330-350Hz)", "P2": "F#5/G5 (740-784Hz)"}
            },
            "Mezzo-Sopran": {
                "range_hz": [220, 880], # A3-A5
                "passaggios": {"P1": "E4/F4 (330-350Hz)", "P2": "E5/F5 (659-698Hz)"}
            },
            "Alt": {
                "range_hz": [174, 698], # F3-F5
                "passaggios": {"P1": "G4 (392Hz)", "P2": "D5 (587Hz)"}
            },
            "Tenor": {
                "range_hz": [130, 523], # C3-C5
                "passaggios": {"P1": "D4 (293Hz)", "P2": "G4 (392Hz)"}
            },
            "Bariton": {
                "range_hz": [98, 392], # G2-G4
                "passaggios": {"P1": "B3 (246Hz)", "P2": "E4 (329Hz)"}
            },
            "Bass": {
                "range_hz": [82, 329], # E2-E4
                "passaggios": {"P1": "A3 (220Hz)", "P2": "D4 (293Hz)"}
            }
        }
    },
    "exercises": {
        "basic": [
            {
                "id": 1,
                "name": "Lip Trills",
                "category": "SOVT/Warmup",
                "target": "Ausgleich subglottischer Druck, Lockerung",
                "execution": "Lippen flattern lassen auf 'Brrr'.",
                "expected_metrics": "HNR stabil, keine F0-Brüche.",
                "pattern": {
                    "type": "scale",
                    "intervals": [0, 2, 4, 5, 4, 2, 0], # 1-2-3-4-3-2-1
                    "duration": 0.5,
                    "root": "C3" 
                }
            },
            {
                "id": 2,
                "name": "Straw Phonation",
                "category": "SOVT/Reset",
                "target": "Impedanzanpassung, Senkung PTP (Phonations-Schwellendruck)",
                "execution": "Durch kleinen Strohhalm summen.",
                "expected_metrics": "Sehr niedrige Amplitude, hohe Stabilität."
            },
            {
                "id": 3,
                "name": "Ng-Siren",
                "category": "Register-Übergang",
                "target": "Entkopplung Zunge/Kehlkopf, Mix-Voice",
                "execution": "Auf 'Ng' (wie in 'Ding') von tief nach hoch gleiten.",
                "expected_metrics": "Stetiger F0-Anstieg ohne Amplitudensprung."
            },
            {
                "id": 4,
                "name": "Glottal Onsets",
                "category": "Adduktion",
                "target": "Sauberer Stimmlippenschluss (gegen Hauchigkeit)",
                "execution": "Kurze, knackige 'E'-Laute.",
                "expected_metrics": "Kurze Anstiegszeit (<50ms)."
            },
            {
                "id": 5,
                "name": "Mum-Scale",
                "category": "Larynx-Senkung",
                "target": "Kehlkopf senken, Pharynx weiten",
                "execution": "Absteigende Skala auf 'Mum' (dumm fühlen).",
                "expected_metrics": "Niedrige Formanten (F1/F2 abgesenkt)."
            },
             {
                "id": 6,
                "name": "Staccato Ha-Ha",
                "category": "Support",
                "target": "Aktivierung Zwerchfell-Recoil",
                "execution": "Kurze Impulse auf 'Ha', Bauch federt.",
                "expected_metrics": "Deutliche Trennung der Töne (Silence gaps)."
            },
             {
                "id": 7,
                "name": "Sustained [u]",
                "category": "Kopfstimme",
                "target": "Isolation CT-Muskel",
                "execution": "Hohen Ton auf [u] halten.",
                "expected_metrics": "Hoher HNR, fast sinusförmige Welle."
            },
            {
                "id": 8,
                "name": "Vocal Fry Glides",
                "category": "Entspannung",
                "target": "Lockerung der Schleimhaut, TA-Entspannung",
                "execution": "In das 'Knarren' gleiten.",
                "expected_metrics": "F0 < 70 Hz, aperiodisch."
            },
            {
                "id": 9,
                "name": "Messa di Voce (Mini)",
                "category": "Dynamik",
                "target": "Balance Appoggio bei Lautstärkeänderung",
                "execution": "Leise -> Laut -> Leise auf einem Ton.",
                "expected_metrics": "Konstanter Shimmer trotz Dynamik."
            },
            {
                "id": 10,
                "name": "Octave Jumps",
                "category": "Flexibilität",
                "target": "Schnelle CT/TA Anpassung",
                "execution": "Sprünge 1-8-1 auf [i].",
                "expected_metrics": "Pitch-Accuracy < 20 Cents.",
                 "pattern": {
                    "type": "scale",
                    "intervals": [0, 12, 0], 
                    "duration": 1.0,
                    "root": "C4" 
                }
            },
            {
                "id": 13,
                "name": "Major Scale (C4)",
                "category": "Pitch/Ear Training",
                "target": "Intonation und Gehörbildung",
                "execution": "Singe die C-Dur Tonleiter auf 'La'.",
                "expected_metrics": "Pitch-Accuracy < 15 Cents.",
                "pattern": {
                    "type": "scale",
                    "intervals": [0, 2, 4, 5, 7, 9, 11, 12], # Major Scale
                    "duration": 0.8,
                    "root": "C4" 
                }
            }
        ],
        "advanced": [
            {
                "id": 11,
                "name": "The Nyeh (Twang)",
                "category": "CVT Edge",
                "target": "AES Verengung, Durchsetzungskraft",
                "execution": "Hexe/Ente imitieren auf 'Nyeh'.",
                "expected_metrics": "Energieboost 2-4 kHz (Sängerformant)."
            },
             {
                "id": 12,
                "name": "The Hey Call",
                "category": "CVT Overdrive",
                "target": "Belting, Ruf-Modus",
                "execution": "Rufen auf 'Hey' (Biss-Position).",
                "expected_metrics": "Hohe Intensität, starke Obertöne."
            },
            # Weitere Advanced Übungen hier ergänzbar...
        ]
    }
}

def get_feedback_context(metric_name, value):
    """
    Returns a RAG-ready context string for the AI based on a metric value.
    Example: get_feedback_context("jitter_local", 1.8)
    """
    metric = KNOWLEDGE_BASE["vocal_health_metrics"].get(metric_name)
    if not metric:
        return ""
    
    thresholds = metric["thresholds"]
    status = "unknown"
    
    # Simple logic to determine status (adjust for specific metrics)
    if metric_name == "jitter_local":
        if value <= thresholds["healthy"]["max"]: status = "healthy"
        elif value <= thresholds["warning"]["max"]: status = "warning"
        else: status = "pathological"
        
    elif metric_name == "hnr":
        if value >= thresholds["excellent"]["min"]: status = "excellent"
        elif value >= thresholds["acceptable"]["min"]: status = "acceptable"
        else: status = "pathological"
        
    # Construct explanation
    return f"Gemessener {metric_name}: {value}{metric['unit']}. Das ist im Bereich '{status}'. Kontext: {metric['context']}"
