import librosa
import numpy as np
import os

def analyze_pitch(file_path: str):
    """
    Analyzes the pitch of an audio file using Librosa's Probabilistic YIN (pyin).
    Returns basic pitch statistics.
    """
    try:
        # Load audio
        y, sr = librosa.load(file_path, sr=None)
        
        # Estimate F0 using pYIN
        # fmin=50Hz (~G1), fmax=2000Hz (~C7) covers most human vocal ranges
        f0, voiced_flag, voiced_probs = librosa.pyin(y, fmin=50, fmax=2000, sr=sr)
        
        # Filter out unvoiced frames (where pitch wasn't detected)
        voiced_f0 = f0[voiced_flag]
        
        if len(voiced_f0) == 0:
            return {
                "success": False,
                "error": "No pitch detected. Please try recording closer to the microphone or singing louder."
            }
            
        # Basic Statistics
        min_pitch = float(np.min(voiced_f0))
        max_pitch = float(np.max(voiced_f0))
        avg_pitch = float(np.mean(voiced_f0))
        pitch_std = float(np.std(voiced_f0))
        
        # Pitch Range (Semitones)
        # 12 * log2(fmax / fmin)
        range_semitones = 12 * np.log2(max_pitch / min_pitch)
        
        # Convert Hz to Note Name (e.g. 440 -> A4)
        min_note = librosa.hz_to_note(min_pitch)
        max_note = librosa.hz_to_note(max_pitch)
        
        return {
            "success": True,
            "metrics": {
                "min_pitch_hz": round(min_pitch, 2),
                "max_pitch_hz": round(max_pitch, 2),
                "avg_pitch_hz": round(avg_pitch, 2),
                "pitch_stability_std": round(pitch_std, 2), # Lower is more stable (if singing a single note)
                "range_semitones": round(range_semitones, 1),
                "vocal_range": f"{min_note} - {max_note}"
            }
        }
        
    except Exception as e:
        print(f"Pitch Analysis Error: {e}")
        return {
            "success": False,
            "error": str(e)
        }
