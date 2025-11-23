import numpy as np
from scipy.io.wavfile import write
import os
import librosa

def generate_tone(frequency, duration, sample_rate=44100, amplitude=0.5):
    """Generates a sine wave tone."""
    t = np.linspace(0, duration, int(sample_rate * duration), False)
    # Simple sine wave
    tone = amplitude * np.sin(2 * np.pi * frequency * t)
    
    # Apply ADSR envelope (simple)
    # 5% attack, 10% decay, 70% sustain, 15% release
    total_samples = len(t)
    attack = int(total_samples * 0.05)
    decay = int(total_samples * 0.1)
    release = int(total_samples * 0.15)
    sustain = total_samples - attack - decay - release
    
    envelope = np.concatenate([
        np.linspace(0, 1, attack),
        np.linspace(1, 0.8, decay),
        np.ones(sustain) * 0.8,
        np.linspace(0.8, 0, release)
    ])
    
    # Ensure envelope length matches tone (rounding errors)
    if len(envelope) < len(tone):
        envelope = np.pad(envelope, (0, len(tone) - len(envelope)), 'constant')
    elif len(envelope) > len(tone):
        envelope = envelope[:len(tone)]
        
    return tone * envelope

def generate_scale_audio(root_note, pattern, duration_per_note=0.8, sample_rate=44100, output_path=None):
    """
    Generates an audio file for a scale.
    root_note: e.g. "C4"
    pattern: list of semitone intervals, e.g. [0, 2, 4, 5, 7, 9, 11, 12] (Major Scale)
    """
    root_hz = librosa.note_to_hz(root_note)
    full_audio = np.array([])
    
    # Calculate frequencies
    for semitone in pattern:
        # f = f0 * 2^(n/12)
        freq = root_hz * (2 ** (semitone / 12.0))
        tone = generate_tone(freq, duration_per_note, sample_rate)
        full_audio = np.concatenate([full_audio, tone])
        
        # Add a tiny bit of silence between notes
        silence = np.zeros(int(sample_rate * 0.05))
        full_audio = np.concatenate([full_audio, silence])
        
    # Normalize to 16-bit PCM range
    audio_int16 = np.int16(full_audio / np.max(np.abs(full_audio)) * 32767)
    
    if output_path:
        write(output_path, sample_rate, audio_int16)
        return output_path
    
    return audio_int16

if __name__ == "__main__":
    # Test
    if not os.path.exists("backend/static/exercises"):
        os.makedirs("backend/static/exercises")
    generate_scale_audio("C4", [0, 2, 4, 5, 7, 9, 11, 12], output_path="backend/static/exercises/test_scale_C4.wav")
    print("Generated test scale.")
