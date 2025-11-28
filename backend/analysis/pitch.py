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
    Compares the user's recording against a target musical pattern (Scale/Arpeggio).
    target_pattern: {"intervals": [...], "root": "C4"}
    """
    try:
        # 1. Calculate Target Frequencies
        root_hz = librosa.note_to_hz(target_pattern["root"])
        target_freqs = [root_hz * (2 ** (i / 12.0)) for i in target_pattern["intervals"]]
        target_notes = [librosa.hz_to_note(f) for f in target_freqs]
        
        # 2. Extract User Pitch
        y, sr = librosa.load(file_path, sr=None)
        f0, voiced_flag, _ = librosa.pyin(y, fmin=50, fmax=2000, sr=sr)
        voiced_f0 = f0[voiced_flag]
        
        if len(voiced_f0) == 0:
            return {"success": False, "error": "No voice detected"}

        # 3. Simplify User Pitch to Note Sequence (Quantization)
        # Convert f0 to MIDI notes
        midi_notes = librosa.hz_to_midi(voiced_f0)
        rounded_notes = np.round(midi_notes)
        
        # Remove repeated notes (simple run-length encoding equivalent)
        # We only care about the sequence of distinct notes sung
        detected_sequence = []
        prev_note = None
        min_duration_frames = 10 # Ignore blips
        current_run = 0
        
        for note in rounded_notes:
            if note == prev_note:
                current_run += 1
            else:
                if prev_note is not None and current_run > min_duration_frames:
                     detected_sequence.append(librosa.midi_to_note(prev_note))
                prev_note = note
                current_run = 1
        # Add last note
        if prev_note is not None and current_run > min_duration_frames:
             detected_sequence.append(librosa.midi_to_note(prev_note))
             
        # 4. Score Logic (Simple "Hit Rate")
        # Check how many of the target notes appear in the user's sequence (in roughly correct order)
        hits = 0
        user_idx = 0
        
        matched_notes = []
        
        for target_note in target_notes:
            # Look ahead in user sequence
            found = False
            # Allow searching a few steps ahead/behind or just strictly forward?
            # Let's do strict forward search for now
            while user_idx < len(detected_sequence):
                user_note = detected_sequence[user_idx]
                user_idx += 1
                
                # Check for exact match (ignoring octave errors? No, scale needs specific octave usually)
                if user_note == target_note:
                    hits += 1
                    matched_notes.append(target_note)
                    found = True
                    break
            
            if not found:
                # If not found, we don't advance hits, but we continue checking next target
                # (Maybe user skipped a note)
                pass

        accuracy = (hits / len(target_notes)) * 100
        
        return {
            "success": True,
            "accuracy_score": round(accuracy, 1),
            "target_notes": target_notes,
            "detected_sequence": detected_sequence,
            "matched_notes": matched_notes,
            "feedback": f"You hit {hits} out of {len(target_notes)} notes."
        }

    except Exception as e:
        print(f"Pitch Accuracy Error: {e}")
        return {"success": False, "error": str(e)}
