import os
from gtts import gTTS
from backend.intelligence.knowledge import KNOWLEDGE_BASE

OUTPUT_DIR = "backend/static/exercises"

def generate_exercise_audio():
    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)
        
    exercises = KNOWLEDGE_BASE["exercises"]["basic"] + KNOWLEDGE_BASE["exercises"]["advanced"]
    
    print(f"Generating audio for {len(exercises)} exercises...")
    
    for ex in exercises:
        filename = f"{ex['id']}_{ex['name'].replace(' ', '_').lower()}.mp3"
        filepath = os.path.join(OUTPUT_DIR, filename)
        
        # Text to speak
        text = f"Exercise: {ex['name']}. Target: {ex['target']}. Instructions: {ex['execution']}"
        
        print(f"Generating {filename}...")
        try:
            tts = gTTS(text=text, lang='en')
            tts.save(filepath)
        except Exception as e:
            print(f"Failed to generate {filename}: {e}")

    print("Audio generation complete.")

if __name__ == "__main__":
    generate_exercise_audio()
