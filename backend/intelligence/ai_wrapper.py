import os
import google.generativeai as genai
from dotenv import load_dotenv
import json
from .knowledge import get_feedback_context

load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY")
MODEL_NAME = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")

if API_KEY:
    genai.configure(api_key=API_KEY)

def generate_performance_review(metrics: dict, user_context: dict):
    """
    Generates a detailed performance review using the configured Gemini model.
    """
    if not API_KEY:
        return "AI Feedback unavailable: No API Key configured."
        
    try:
        model = genai.GenerativeModel(MODEL_NAME)
        
        # Build Scientific Context
        health_context = []
        if "health_status" in metrics:
            health_context.append(f"Vocal Health Status: {metrics['health_status']}")
        if "jitter_percent" in metrics:
             health_context.append(f"Jitter: {metrics['jitter_percent']}% (Zittrigkeit/Rauigkeit)")
        if "pitch_stability_std" in metrics:
            health_context.append(f"Pitch Stability (StdDev): {metrics['pitch_stability_std']} (Niedriger ist stabiler)")
            
        context_str = "\n".join(health_context)

        prompt = f"""
        Du bist 'VocalCoach AI', ein erfahrener, analytischer aber sehr empathischer Gesangslehrer.
        Dein Schüler (Level {user_context.get('level', 1)}, {user_context.get('voice_type', 'Unbekannt')}) hat eine Performance (Song/Arie) aufgenommen.
        
        Technische Analyse der Aufnahme:
        {json.dumps(metrics, indent=2)}
        
        Kontext & Interpretation:
        {context_str}
        
        Deine Aufgabe:
        Schreibe ein konstruktives Feedback (ca. 4-5 Sätze).
        1. **Gesamteindruck:** Wie war die Performance technisch? (Pitch Range, Stabilität).
        2. **Vocal Health:** Interpretiere die Ampel/Jitter Werte. Wenn "Gelb" oder "Rot": Warne sanft vor Überanstrengung oder Pressen.
        3. **Coaching Tipp:** Gib EINEN konkreten Tipp für das nächste Mal (z.B. Atemstütze, Vokalausgleich, Entspannung).
        
        Tone of Voice:
        - Professionell aber locker ("Du").
        - Nutze Metaphern (z.B. "Stell dir vor...", "Wie ein...").
        - Sei motivierend!
        """
        
        response = model.generate_content(prompt)
        return response.text.strip()
        
    except Exception as e:
        print(f"Gemini Error ({MODEL_NAME}): {e}")
        return f"Ups! Mein AI-Gehirn ({MODEL_NAME}) hat gerade Schluckauf. Aber technisch sah das interessant aus!"

def generate_feedback(exercise_name: str, metrics: dict, user_context: dict):
    """
    Generates personalized feedback for exercises.
    
    Args:
        exercise_name: Name of the exercise (e.g., "Lip Trills")
        metrics: Dictionary of metrics (e.g., {"jitter_percent": 1.2, "shimmer_percent": 2.5, "score": 80})
        user_context: Dictionary of user context (e.g., {"level": 2, "voice_type": "Bariton", "streak": 5})
        
    Returns:
        str: AI generated feedback text.
    """
    if not API_KEY:
        return "AI Feedback unavailable: No API Key configured in backend/.env."
        
    try:
        model = genai.GenerativeModel(MODEL_NAME)
        
        # Build Context from Knowledge Base
        scientific_context = []
        if "jitter_percent" in metrics:
            scientific_context.append(get_feedback_context("jitter_local", metrics["jitter_percent"]))
        if "hnr_db" in metrics:
            scientific_context.append(get_feedback_context("hnr", metrics["hnr_db"]))
            
        context_str = "\n".join(scientific_context)
        
        # Build History Context
        history_str = ""
        if "history_avg_score" in user_context:
            trend = "stabil"
            if metrics.get("score", 0) > user_context['history_avg_score']:
                trend = "verbessert 📈"
            elif metrics.get("score", 0) < user_context['history_avg_score']:
                trend = "leicht verschlechtert"
                
            history_str = f"""
            Verlauf (Letzte {user_context['history_count']} Sessions):
            - Durchschnitt Score: {user_context['history_avg_score']}
            - Trend heute: {trend}
            """
        
        prompt = f"""
        Du bist ein professioneller, aber motivierender Vocal Coach (VocalCoach AI).
        Dein Schüler (Level {user_context.get('level', 1)}, {user_context.get('voice_type', 'Unbekannt')}) hat gerade die Übung '{exercise_name}' gemacht.
        
        Messdaten der Aufnahme:
        {json.dumps(metrics, indent=2)}
        
        {history_str}
        
        Wissenschaftlicher Hintergrund (zur internen Analyse):
        {context_str}
        
        Aufgabe:
        Gib kurzes, prägnantes und motivierendes Feedback (max 3 Sätze).
        1. Erwähne kurz das Ergebnis (Lob oder sanfte Korrektur).
        2. Gib einen konkreten physikalischen Tipp zur Verbesserung basierend auf den Werten (z.B. bei hohem Jitter -> 'Denk an ein inneres Lächeln' oder 'weniger Druck').
        Nutze Metaphern aus dem Gesangsunterricht.
        Sei du per Du. Nutze Emojis passend.
        """
        
        response = model.generate_content(prompt)
        return response.text.strip()
        
    except Exception as e:
        print(f"Gemini Error: {e}")
        return "Gut gemacht! Bleib dran! (KI konnte gerade keine Verbindung herstellen)"
