import React, { useState, useRef, useEffect } from 'react';
import ml5 from 'ml5';

const AudioRecorder = ({ onRecordingComplete, targetPattern }) => {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Visualization refs
  const canvasRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const requestRef = useRef(null);
  const sourceRef = useRef(null);
  
  // Pitch Detection refs
  const pitchDetectorRef = useRef(null);
  const currentPitchRef = useRef(null);
  const isRecordingRef = useRef(false); // Ref for loop access

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      isRecordingRef.current = true;
      
      // --- Visualization Setup ---
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = audioCtx;
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 2048; // Resolution
      analyserRef.current = analyser;
      
      const source = audioCtx.createMediaStreamSource(stream);
      sourceRef.current = source;
      source.connect(analyser);
      
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
        
        // Cleanup Visualization
        cancelAnimationFrame(requestRef.current);
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            audioContextRef.current.close();
        }
        isRecordingRef.current = false;
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
          } else {
              currentPitchRef.current = null;
          }
          
          if (isRecordingRef.current) {
               detectPitch();
          }
      });
  };

  const draw = () => {
    if (!canvasRef.current || !analyserRef.current) return;
    
    const canvas = canvasRef.current;
    const canvasCtx = canvas.getContext('2d');
    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    requestRef.current = requestAnimationFrame(draw);
    
    // Get Time-Domain Data (Waveform)
    analyser.getByteTimeDomainData(dataArray);
    
    // Clear canvas
    canvasCtx.fillStyle = '#1a1a1a'; 
    canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw Target Pattern (Piano Roll)
    if (targetPattern && targetPattern.intervals) {
        const rootHz = 261.63; // C4 Default
        const minLog = Math.log(65);
        const maxLog = Math.log(1046);
        
        targetPattern.intervals.forEach(interval => {
            const targetFreq = rootHz * Math.pow(2, interval / 12);
            const freqLog = Math.log(targetFreq);
            
            let normalized = (freqLog - minLog) / (maxLog - minLog);
            normalized = Math.max(0, Math.min(1, normalized));
            
            const y = canvas.height - (normalized * canvas.height);
            
            // Draw Bar
            canvasCtx.fillStyle = 'rgba(255, 255, 255, 0.15)';
            canvasCtx.fillRect(0, y - 5, canvas.width, 10); // 10px height bar
            
            // Draw Center Line
            canvasCtx.beginPath();
            canvasCtx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            canvasCtx.lineWidth = 1;
            canvasCtx.moveTo(0, y);
            canvasCtx.lineTo(canvas.width, y);
            canvasCtx.stroke();
        });
    }

    // Draw Pitch Line (Overlay)
    if (currentPitchRef.current) {
        const freq = currentPitchRef.current;
        // Map Frequency (Log Scale)
        // Min: C2 (65Hz), Max: C6 (1046Hz)
        const minLog = Math.log(65);
        const maxLog = Math.log(1046);
        const freqLog = Math.log(freq);
        
        let normalized = (freqLog - minLog) / (maxLog - minLog);
        normalized = Math.max(0, Math.min(1, normalized)); // Clamp 0-1
        
        const y = canvas.height - (normalized * canvas.height);
        
        // Determine Color (Green if hitting a note)
        let pitchColor = '#ff0055'; // Default: Neon Red/Pink (Miss)
        
        if (targetPattern && targetPattern.intervals) {
            const rootHz = 261.63; // C4 Default - TODO: Make dynamic based on Voice Type
            const userCents = 1200 * Math.log2(freq / rootHz);
            
            // Check if close to any target note
            // targetPattern.intervals are in semitones (0, 2, 4...)
            // 1 semitone = 100 cents
            const thresholdCents = 50; // +/- 50 cents (quarter tone) tolerance
            
            const isHit = targetPattern.intervals.some(interval => {
                const targetCents = interval * 100;
                return Math.abs(userCents - targetCents) < thresholdCents;
            });
            
            if (isHit) {
                pitchColor = '#00ff00'; // Neon Green (Hit!)
            }
        }

        canvasCtx.beginPath();
        canvasCtx.strokeStyle = pitchColor;
        canvasCtx.lineWidth = 3;
        canvasCtx.shadowBlur = 10;
        canvasCtx.shadowColor = pitchColor;
        canvasCtx.moveTo(0, y);
        canvasCtx.lineTo(canvas.width, y);
        canvasCtx.stroke();
        canvasCtx.shadowBlur = 0; // Reset shadow
        
        // Draw Hz Text
        canvasCtx.fillStyle = pitchColor;
        canvasCtx.font = 'bold 14px Arial';
        canvasCtx.fillText(`${Math.round(freq)} Hz`, 10, y - 5);
    }

    // Draw Waveform
    canvasCtx.lineWidth = 2;
    canvasCtx.strokeStyle = '#00f2ff'; // Neon Cyan
    canvasCtx.beginPath();
    
    const sliceWidth = canvas.width * 1.0 / bufferLength;
    let x = 0;
    
    for(let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = v * canvas.height / 2;
        
        if(i === 0) {
            canvasCtx.moveTo(x, y);
        } else {
            canvasCtx.lineTo(x, y);
        }
        
        x += sliceWidth;
    }
    
    canvasCtx.lineTo(canvas.width, canvas.height / 2);
    canvasCtx.stroke();
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
      <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
        <canvas 
            ref={canvasRef} 
            width={600} 
            height={100} 
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
