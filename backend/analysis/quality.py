import parselmouth
from parselmouth.praat import call
import numpy as np

def analyze_health(audio_path: str):
    """
    Analyzes vocal health metrics (Jitter, Shimmer, HNR) using Parselmouth (Praat).
    Implements the "Traffic Light" system for vocal health assessment.
    
    Args:
        audio_path (str): Path to the audio file.
        
    Returns:
        dict: Containing metrics (jitter, shimmer, hnr) and their status (green/yellow/red).
    """
    try:
        sound = parselmouth.Sound(audio_path)
        
        # 1. Pitch Analysis (needed for Jitter/Shimmer)
        # Use a broad range for human voice (75Hz to 600Hz)
        pitch = sound.to_pitch(time_step=0.01, pitch_floor=75, pitch_ceiling=600)
        
        # Check if we have enough voiced frames
        voiced_frames = pitch.count_voiced_frames()
        total_frames = pitch.get_number_of_frames()
        
        if voiced_frames < 10:
             return {
                "success": False,
                "error": "Not enough voiced audio detected. Please sing a sustained tone."
            }

        # 2. Point Process (needed for Jitter/Shimmer)
        point_process = call(sound, "To PointProcess (periodic, cc)", 75, 600)
        
        # 3. Jitter (Local)
        # 0.0001s shortest period, 0.02s longest period, 1.3 max period factor
        jitter_local = call(point_process, "Get jitter (local)", 0.0, 0.0, 0.0001, 0.02, 1.3)
        jitter_percent = jitter_local * 100
        
        # 4. Shimmer (Local)
        # 0.0001s shortest period, 0.02s longest period, 1.3 max period factor, 1.6 max amp factor
        shimmer_local = call([sound, point_process], "Get shimmer (local)", 0.0, 0.0, 0.0001, 0.02, 1.3, 1.6)
        shimmer_percent = shimmer_local * 100
        
        # 5. HNR (Harmonicity)
        harmonicity = sound.to_harmonicity_cc(time_step=0.01, minimum_pitch=75, silence_threshold=0.1, number_of_periods_per_window=1.0)
        hnr = harmonicity.values[harmonicity.values != -200] # Filter out unvoiced (-200 is praat default for silence)
        mean_hnr = np.mean(hnr) if len(hnr) > 0 else 0.0
        
        # --- Traffic Light Logic ---
        
        # Jitter
        if jitter_percent <= 1.04:
            jitter_status = "green"
            jitter_feedback = "Exzellent! Sehr klare Stimmgebung."
        elif jitter_percent <= 1.50:
            jitter_status = "yellow"
            jitter_feedback = "Leichte Rauigkeit. Achte auf entspannten Stimmlippenschluss."
        else:
            jitter_status = "red"
            jitter_feedback = "Rauigkeit erkannt. Bitte weniger Druck oder mehr Wasser trinken."
            
        # Shimmer
        if shimmer_percent <= 3.81:
            shimmer_status = "green"
            shimmer_feedback = "Super stabile Lautstärke."
        elif shimmer_percent <= 5.00:
            shimmer_status = "yellow"
            shimmer_feedback = "Leichtes Hauchen oder Wackeln in der Lautstärke."
        else:
            shimmer_status = "red"
            shimmer_feedback = "Hauchigkeit erkannt. Versuche, die Luft besser zu dosieren (weniger Hauch)."
            
        # HNR
        if mean_hnr >= 20.0:
            hnr_status = "green"
            hnr_feedback = "Glasklarer Klang, wenig Rauschen."
        elif mean_hnr >= 12.0:
            hnr_status = "yellow"
            hnr_feedback = "Etwas luftiger Klang."
        else:
            hnr_status = "red"
            hnr_feedback = "Sehr luftiger/rauschiger Klang. Prüfe deinen Stimmsitz."
            
        # Overall Assessment
        # If any is red -> Red
        # If any is yellow (and no red) -> Yellow
        # Else -> Green
        if "red" in [jitter_status, shimmer_status, hnr_status]:
            overall_status = "red"
        elif "yellow" in [jitter_status, shimmer_status, hnr_status]:
            overall_status = "yellow"
        else:
            overall_status = "green"
            
        return {
            "success": True,
            "metrics": {
                "jitter_percent": float(jitter_percent),
                "shimmer_percent": float(shimmer_percent),
                "hnr_db": float(mean_hnr)
            },
            "assessment": {
                "jitter": {"status": jitter_status, "feedback": jitter_feedback},
                "shimmer": {"status": shimmer_status, "feedback": shimmer_feedback},
                "hnr": {"status": hnr_status, "feedback": hnr_feedback},
                "overall": overall_status
            }
        }
        
    except Exception as e:
        print(f"Error in analyze_health: {e}")
        return {
            "success": False,
            "error": str(e)
        }
