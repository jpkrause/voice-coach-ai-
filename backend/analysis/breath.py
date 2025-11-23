import numpy as np
import librosa

def analyze_breath_stability(audio_path: str, difficulty: int = 1):
    """
    Analyzes a breath exercise (e.g. 'S' sound) for duration and stability.
    
    Args:
        audio_path (str): Path to audio file.
        difficulty (int): Difficulty level (1-5). Higher is stricter.

    Returns:
        dict: {
            "duration_seconds": float,
            "mean_amplitude_db": float,
            "std_amplitude_db": float, # Lower is better (more stable)
            "stability_score": float, # 0.0 to 1.0 (calculated based on thresholds)
            "success": bool
        }
    """
    try:
        # Load audio (sr=None to preserve native sampling rate)
        y, sr = librosa.load(audio_path, sr=None)
        
        # Calculate duration
        duration = librosa.get_duration(y=y, sr=sr)
        
        # Calculate RMS amplitude
        # frame_length=2048, hop_length=512 are standard defaults
        rms = librosa.feature.rms(y=y)[0]
        
        # Convert to dB
        rms_db = librosa.amplitude_to_db(rms, ref=np.max)
        
        # --- Noise Calibration / Dynamic Thresholding ---
        # Estimate noise floor using the 10th percentile of volume
        # (Assuming at least 10% of the audio is silence/setup)
        noise_floor_db = np.percentile(rms_db, 10)
        
        # Calculate dynamic range
        # Since max is 0 (due to ref=np.max), the range is simply -noise_floor_db
        dynamic_range = 0 - noise_floor_db
        
        # Set threshold: Noise Floor + 25% of Dynamic Range
        # This adapts to both quiet studios and noisy rooms.
        threshold_db = noise_floor_db + (dynamic_range * 0.25)
        
        # Safety clamps
        threshold_db = min(threshold_db, -15.0) # Never cut off actual loud signal
        threshold_db = max(threshold_db, -70.0) # Don't process deep silence
        
        active_frames = rms_db[rms_db > threshold_db]
        
        if len(active_frames) == 0:
            return {
                "duration_seconds": 0.0,
                "mean_amplitude_db": -80.0,
                "std_amplitude_db": 0.0,
                "stability_score": 0.0,
                "success": False,
                "noise_floor_db": float(noise_floor_db)
            }
            
        mean_db = np.mean(active_frames)
        std_db = np.std(active_frames)
        
        # Calculate Stability Score
        # Define thresholds based on difficulty (1-5)
        # target_std: The standard deviation considered "perfect" (score 1.0)
        # max_std: The standard deviation considered "fail" (score 0.0)
        
        difficulty_map = {
            1: {"target": 2.5, "max": 6.0}, # Beginner: Very tolerant
            2: {"target": 2.0, "max": 5.5},
            3: {"target": 1.5, "max": 5.0}, # Intermediate
            4: {"target": 1.0, "max": 4.5},
            5: {"target": 0.7, "max": 4.0}, # Pro: Extremely stable required
        }
        
        # Clamp difficulty 1-5
        diff_level = max(1, min(5, int(difficulty)))
        thresholds = difficulty_map[diff_level]
        
        target_std = thresholds["target"]
        max_std = thresholds["max"]

        if std_db <= target_std:
            score = 1.0
        elif std_db >= max_std:
            score = 0.0
        else:
            # Linear interpolation between target and max
            # score = 1.0 - (current - target) / (max - target)
            score = 1.0 - (std_db - target_std) / (max_std - target_std)
            score = max(0.0, min(1.0, score))
            
        return {
            "duration_seconds": float(duration),
            "mean_amplitude_db": float(mean_db),
            "std_amplitude_db": float(std_db),
            "stability_score": float(score),
            "success": True,
            "noise_floor_db": float(noise_floor_db)
        }
        
    except Exception as e:
        print(f"Error analyzing breath: {e}")
        return {
            "duration_seconds": 0.0,
            "mean_amplitude_db": 0.0,
            "std_amplitude_db": 0.0,
            "stability_score": 0.0,
            "success": False,
            "error": str(e)
        }
