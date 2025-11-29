import React, { useState, useRef, useEffect } from 'react';
import ml5 from 'ml5';

const AudioRecorder = ({ onRecordingComplete, targetPattern, audioSrc, sequenceData }) => {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Audio Playback
  const audioPlayerRef = useRef(null);

  // Visualization refs
  const canvasRef = useRef(null);
  const audioContextRef = useRef(null);
  const requestRef = useRef(null);
  
  // Pitch Detection refs
  const pitchDetectorRef = useRef(null);
  const currentPitchRef = useRef(null);
  const isRecordingRef = useRef(false); // Ref for loop access
  const startTimeRef = useRef(0); // For wall clock fallback

  // History for Pitch Line Drawing
  const pitchHistoryRef = useRef([]); // [{time, freq}, ...]

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      isRecordingRef.current = true;
      pitchHistoryRef.current = [];
      // eslint-disable-next-line
      startTimeRef.current = Date.now() / 1000;
      
      // --- Audio Player Setup ---
      if (audioPlayerRef.current && audioSrc) {
          audioPlayerRef.current.currentTime = 0;
          audioPlayerRef.current.play().catch(e => console.log("Audio play failed:", e));
      }

      // --- Visualization Setup ---
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = audioCtx;
      
      // --- Pitch Detection Setup (ml5) ---
      const modelUrl = 'https://cdn.jsdelivr.net/gh/ml5js/ml5-data-and-models/models/pitch-detection/crepe/';
      
      // Initialize ml5 pitch detection
      pitchDetectorRef.current = ml5.pitchDetection(modelUrl, audioCtx, stream, () => {
          console.log("Pitch Model Loaded");
          detectPitch(); // Start recursive pitch detection
      });

      draw(); // Start animation loop
      
      // --- Recording Setup ---
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        if (onRecordingComplete) {
            onRecordingComplete(audioBlob);
        }
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
        
        // Cleanup
        cancelAnimationFrame(requestRef.current);
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            audioContextRef.current.close();
        }
        isRecordingRef.current = false;
        
        // Stop audio player
        if (audioPlayerRef.current) {
            audioPlayerRef.current.pause();
            audioPlayerRef.current.currentTime = 0;
        }
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("Could not access microphone. Please ensure permissions are granted.");
    }
  };

  const detectPitch = () => {
      if (!pitchDetectorRef.current || !isRecordingRef.current) return;
      
      pitchDetectorRef.current.getPitch((err, frequency) => {
          if (frequency) {
              currentPitchRef.current = frequency;
              // Add to history with current audio time
              const currentTime = audioPlayerRef.current ? audioPlayerRef.current.currentTime : 0;
              pitchHistoryRef.current.push({ time: currentTime, freq: frequency });
              
              // Keep history manageable
              if (pitchHistoryRef.current.length > 500) {
                  pitchHistoryRef.current.shift();
              }
          } else {
              currentPitchRef.current = null;
          }
          
          if (isRecordingRef.current) {
               detectPitch();
          }
      });
  };

  const draw = () => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const canvasCtx = canvas.getContext('2d');
    
    requestRef.current = requestAnimationFrame(draw);
    
    // Time Logic
    let currentTime = 0;
    if (audioPlayerRef.current && !audioPlayerRef.current.paused) {
        currentTime = audioPlayerRef.current.currentTime;
    } else if (isRecordingRef.current) {
        // Fallback to wall clock relative to start
        // eslint-disable-next-line
        currentTime = (Date.now() / 1000) - startTimeRef.current;
    }
    
    const timeWindow = 4.0; // Show 4 seconds on screen
    const pixelsPerSecond = canvas.width / timeWindow;
    const playheadX = canvas.width * 0.2; // Playhead at 20% width
    
    // Clear canvas
    canvasCtx.fillStyle = '#1a1a1a'; 
    canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Grid Lines
    canvasCtx.strokeStyle = '#333';
    canvasCtx.lineWidth = 1;
    // Draw horizontal lines (Note Grid) - simplified
    for (let i = 0; i < 10; i++) {
        const y = i * (canvas.height / 10);
        canvasCtx.beginPath();
        canvasCtx.moveTo(0, y);
        canvasCtx.lineTo(canvas.width, y);
        canvasCtx.stroke();
    }
    
    // Draw Target Pattern (Piano Roll)
    if (sequenceData && sequenceData.length > 0) {
        // Find visible notes
        const visibleNotes = sequenceData.filter(note => {
            const noteEnd = note.start_time + note.duration;
            const screenStart = currentTime - (playheadX / pixelsPerSecond);
            const screenEnd = currentTime + ((canvas.width - playheadX) / pixelsPerSecond);
            return noteEnd > screenStart && note.start_time < screenEnd;
        });

        // Min/Max Log Scale
        const minLog = Math.log(65); // C2
        const maxLog = Math.log(1046); // C6

        visibleNotes.forEach(note => {
             // Calculate X
             const timeDiff = note.start_time - currentTime;
             const x = playheadX + (timeDiff * pixelsPerSecond);
             const width = note.duration * pixelsPerSecond;
             
             // Calculate Y
             const freqLog = Math.log(note.freq);
             let normalized = (freqLog - minLog) / (maxLog - minLog);
             normalized = Math.max(0, Math.min(1, normalized));
             const y = canvas.height - (normalized * canvas.height);
             
             // Draw Bar
             canvasCtx.fillStyle = 'rgba(255, 255, 255, 0.2)';
             canvasCtx.fillRect(x, y - 10, width, 20);
             
             // Draw Text
             canvasCtx.fillStyle = '#aaa';
             canvasCtx.font = '10px Arial';
             canvasCtx.fillText(note.note, x + 2, y + 4);
        });
    } else if (targetPattern && targetPattern.intervals) {
        // Fallback for static visualization (no sequence data)
        // ... (Keep old logic or simple message)
        canvasCtx.fillStyle = '#555';
        canvasCtx.font = '14px Arial';
        canvasCtx.fillText("No rhythm data available for this exercise.", 10, 20);
    }

    // Draw Playhead
    canvasCtx.beginPath();
    canvasCtx.strokeStyle = '#ffcc00'; // Gold
    canvasCtx.lineWidth = 2;
    canvasCtx.moveTo(playheadX, 0);
    canvasCtx.lineTo(playheadX, canvas.height);
    canvasCtx.stroke();

    // Draw Pitch History (The Snake)
    if (pitchHistoryRef.current.length > 1) {
        const minLog = Math.log(65);
        const maxLog = Math.log(1046);
        
        canvasCtx.beginPath();
        canvasCtx.lineWidth = 3;
        canvasCtx.lineJoin = 'round';
        canvasCtx.lineCap = 'round';
        
        for (let i = 0; i < pitchHistoryRef.current.length - 1; i++) {
            const p1 = pitchHistoryRef.current[i];
            const p2 = pitchHistoryRef.current[i+1];
            
            // Calc coords
            const t1Diff = p1.time - currentTime;
            const x1 = playheadX + (t1Diff * pixelsPerSecond);
            
            const t2Diff = p2.time - currentTime;
            const x2 = playheadX + (t2Diff * pixelsPerSecond);
            
            // Skip off-screen points (left)
            if (x2 < -50) continue;
            
            const f1Log = Math.log(p1.freq);
            let n1 = (f1Log - minLog) / (maxLog - minLog);
            const y1 = canvas.height - (n1 * canvas.height);
            
            const f2Log = Math.log(p2.freq);
            let n2 = (f2Log - minLog) / (maxLog - minLog);
            const y2 = canvas.height - (n2 * canvas.height);
            
            // Color Logic (Distance to nearest note)
            let color = '#00f2ff'; // Cyan default
            
            // Check accuracy against sequence at that time
            if (sequenceData) {
                const targetNote = sequenceData.find(n => p1.time >= n.start_time && p1.time <= (n.start_time + n.duration));
                if (targetNote) {
                     const targetCents = 1200 * Math.log2(targetNote.freq);
                     const userCents = 1200 * Math.log2(p1.freq);
                     if (Math.abs(userCents - targetCents) < 50) {
                         color = '#00ff00'; // Green
                     } else {
                         color = '#ff0055'; // Red
                     }
                }
            }
            
            canvasCtx.strokeStyle = color;
            canvasCtx.beginPath();
            canvasCtx.moveTo(x1, y1);
            canvasCtx.lineTo(x2, y2);
            canvasCtx.stroke();
        }
    }
    
    // Current Pitch Indicator
    if (currentPitchRef.current) {
        // ... (Show current freq text)
        canvasCtx.fillStyle = '#fff';
        canvasCtx.font = 'bold 12px Arial';
        canvasCtx.fillText(`${Math.round(currentPitchRef.current)} Hz`, playheadX + 10, 20);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      isRecordingRef.current = false;
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            audioContextRef.current.close();
        }
    };
  }, []);

  return (
    <div style={{ textAlign: 'center', margin: '1rem 0' }}>
      
      {/* Hidden Audio Player */}
      {audioSrc && (
          <audio ref={audioPlayerRef} src={audioSrc} style={{ display: 'none' }} />
      )}

      <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
        <canvas 
            ref={canvasRef} 
            width={600} 
            height={200} // Increased height for better visibility
            style={{ 
                background: '#1a1a1a', 
                borderRadius: '8px',
                border: '1px solid #333',
                maxWidth: '100%',
                boxShadow: '0 0 10px rgba(0, 242, 255, 0.1)'
            }}
        />
      </div>

      {!isRecording ? (
        <button 
            onClick={startRecording}
            className="btn-primary"
            style={{ background: '#dc3545', padding: '0.8rem 2rem', fontSize: '1.1rem' }} 
        >
            ● Start Recording
        </button>
      ) : (
        <button 
            onClick={stopRecording}
            className="btn-primary"
            style={{ background: '#333', padding: '0.8rem 2rem', fontSize: '1.1rem' }}
        >
            ■ Stop Recording
        </button>
      )}
      {isRecording && <div style={{ marginTop: '0.5rem', color: '#dc3545', fontWeight: 'bold' }}>Recording...</div>}
    </div>
  );
};

export default AudioRecorder;
