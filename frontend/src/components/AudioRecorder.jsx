import React, { useState, useRef, useEffect } from 'react';

const AudioRecorder = ({ onRecordingComplete }) => {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Visualization refs
  const canvasRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const requestRef = useRef(null);
  const sourceRef = useRef(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // --- Visualization Setup ---
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = audioCtx;
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 2048; // Resolution
      analyserRef.current = analyser;
      
      const source = audioCtx.createMediaStreamSource(stream);
      sourceRef.current = source;
      source.connect(analyser);
      
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
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("Could not access microphone. Please ensure permissions are granted.");
    }
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
