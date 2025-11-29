import librosa
import numpy as np
import os
from fastdtw import fastdtw
from scipy.spatial.distance import euclidean

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
        # Smart Pitch Filtering: Use percentiles to ignore outliers (e.g. coughs, squeaks)
        min_pitch = float(np.percentile(voiced_f0, 10))
        max_pitch = float(np.percentile(voiced_f0, 90))
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

def analyze_pitch_accuracy(file_path: str, target_pattern: dict):
    """
    Compares the user's recording against a target musical pattern using DTW.
    Analyzes both Pitch Accuracy and Rhythmic Timing.
    target_pattern: {"intervals": [...], "root": "C4", "duration": 0.8}
    """
    try:
        # 1. Setup & Load Audio
        y, sr = librosa.load(file_path, sr=None)
        hop_length = 512
        
        # 2. Extract User Pitch (f0)
        f0, voiced_flag, _ = librosa.pyin(y, fmin=50, fmax=2000, sr=sr, hop_length=hop_length)
        
        if np.all(~voiced_flag):
            return {"success": False, "error": "No voice detected"}

        # Convert to MIDI (use NaN or 0 for unvoiced)
        # We replace NaNs with 0 for DTW, but keep in mind 0 is "silence" or "wrong"
        user_midi = librosa.hz_to_midi(f0)
        user_midi[np.isnan(user_midi)] = 0 # Treat unvoiced as 0
        
        # 3. Construct Target Pitch Curve (Time-Series)
        root_hz = librosa.note_to_hz(target_pattern.get("root", "C4"))
        intervals = target_pattern.get("intervals", [])
        note_duration = target_pattern.get("duration", 0.8) # Seconds per note
        silence_duration = 0.05
        
        frames_per_note = int((note_duration * sr) / hop_length)
        frames_per_silence = int((silence_duration * sr) / hop_length)
        
        target_midi_seq = []
        
        for semitone in intervals:
            # Calculate MIDI value
            target_freq = root_hz * (2 ** (semitone / 12.0))
            target_val = librosa.hz_to_midi(target_freq)
            
            # Append note frames
            target_midi_seq.extend([target_val] * frames_per_note)
            # Append silence frames
            target_midi_seq.extend([0] * frames_per_silence)
            
        target_midi = np.array(target_midi_seq)

        # 4. Perform DTW
        # We need to reshape for fastdtw: (N, 1)
        # This aligns the user's full performance with the target time-series
        distance, path = fastdtw(user_midi.reshape(-1, 1), target_midi.reshape(-1, 1), dist=euclidean)
        
        # 5. Calculate Pitch Score (Intonation)
        # Filter the path to only include frames where BOTH user and target are voiced ( > 0)
        # This ignores silence matching silence (which is easy)
        voiced_errors = []
        for u_idx, t_idx in path:
            u_val = user_midi[u_idx]
            t_val = target_midi[t_idx]
            if u_val > 0 and t_val > 0:
                voiced_errors.append(abs(u_val - t_val))
                
        avg_pitch_error = np.mean(voiced_errors) if voiced_errors else 10.0
        pitch_score = max(0, 100 - (avg_pitch_error * 10))
        
        # 6. Calculate Rhythm Score (Timing)
        # In a perfect rhythmic performance, the path should be close to diagonal
        # (assuming we aligned the start, or DTW handles it)
        # We calculate the deviation of the path from the diagonal line connecting start/end of match
        
        path_arr = np.array(path)
        # Normalize path coordinates to 0..1 to compare slope
        # This is a simplified rhythm check
        # A better check: How much warping happened?
        # Manhatten distance of path from diagonal is a proxy.
        
        # Simple Rhythm Proxy: Ratio of User Duration to Target Duration
        # If user sang 10s for a 5s scale, Rhythm is bad.
        # But DTW handles speed variation.
        
        # Let's use "Warp Cost": Sum of absolute difference between indices?
        # Or just use the fact that if we matched well, the user midi sequence length 
        # should be somewhat close to target length (ignoring leading/trailing silence).
        
        # Advanced: Path Deviation Score
        # Calculate regression line of path. R-squared would be 'steadiness' of tempo.
        # Slope would be 'speed' (relative to target).
        # We'll use a simplified metric: Length Ratio
        
        # Trim user silence from start/end for length comparison
        voiced_indices = np.where(user_midi > 0)[0]
        if len(voiced_indices) > 0:
            user_duration_frames = voiced_indices[-1] - voiced_indices[0]
            target_duration_frames = len(target_midi)
            ratio = user_duration_frames / target_duration_frames
            # Ideal ratio is 1.0. 
            # 0.8 (too fast) or 1.2 (too slow) penalizes score.
            rhythm_deviation = abs(1.0 - ratio)
            rhythm_score = max(0, 100 - (rhythm_deviation * 200)) # 10% deviation = -20 points
        else:
            rhythm_score = 0
            
        # Combined Score
        total_score = (pitch_score * 0.7) + (rhythm_score * 0.3)
        
        # Feedback Generation
        feedback_parts = []
        if pitch_score > 80: feedback_parts.append("Great Intonation!")
        elif pitch_score > 50: feedback_parts.append("Watch your pitch.")
        else: feedback_parts.append("Pitch needs work.")
        
        if rhythm_score > 80: feedback_parts.append("Solid Rhythm.")
        elif rhythm_score > 50: feedback_parts.append("Timing was okay.")
        else: feedback_parts.append(f"Timing off ({'Too Fast' if ratio < 1 else 'Too Slow'}).")
        
        return {
            "success": True,
            "accuracy_score": round(total_score, 1),
            "pitch_score": round(pitch_score, 1),
            "rhythm_score": round(rhythm_score, 1),
            "avg_error_semitones": round(avg_pitch_error, 2),
            "feedback": " ".join(feedback_parts)
        }

    except Exception as e:
        print(f"Pitch Accuracy Error: {e}")
        return {"success": False, "error": str(e)}
