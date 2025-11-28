import React, { useState } from 'react';
import AudioRecorder from './AudioRecorder';

const ExerciseModal = ({ exercise, onClose }) => {
    const [isUploading, setIsUploading] = useState(false);
    const [result, setResult] = useState(null);

    const handleUpload = async (audioBlob) => {
        setIsUploading(true);
        setResult(null);

        const formData = new FormData();
        formData.append("user_id", 1); // Hardcoded user for MVP
        formData.append("exercise_id", exercise.id);
        formData.append("file", audioBlob, "exercise_recording.wav");

        try {
            const response = await fetch("http://localhost:8000/sessions/", {
                method: "POST",
                body: formData,
            });
            const data = await response.json();
            setResult(data);
        } catch (error) {
            console.error("Session upload failed", error);
            alert("Upload failed. See console.");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0,
            width: '100%', height: '100%',
            backgroundColor: 'rgba(0,0,0,0.8)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
        }}>
            <div style={{
                background: '#1a1a1a',
                padding: '2rem',
                borderRadius: '8px',
                width: '90%',
                maxWidth: '500px',
                position: 'relative',
                border: '1px solid var(--accent-gold)'
            }}>
                <button 
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '1rem', right: '1rem',
                        background: 'transparent',
                        border: 'none',
                        color: '#888',
                        fontSize: '1.5rem',
                        cursor: 'pointer'
                    }}
                >
                    &times;
                </button>

                <h2 style={{ color: 'var(--accent-gold)', marginBottom: '0.5rem' }}>{exercise.name}</h2>
                <p style={{ color: '#ccc', marginBottom: '1rem' }}>{exercise.physiological_target}</p>
                
                {exercise.metaphors?.execution && (
                    <div style={{ background: '#333', padding: '1rem', borderRadius: '4px', marginBottom: '1.5rem', fontStyle: 'italic' }}>
                        "{exercise.metaphors.execution}"
                    </div>
                )}

                {/* Audio Guide Player */}
                {exercise.instructions_audio_url && !result && (
                    <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
                         <p style={{ color: '#aaa', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                            {exercise.pattern ? "1. Listen to the pattern:" : "Instructions:"}
                         </p>
                         {/* Append user_id to URL to allow backend to personalize the audio (e.g. root note) */}
                         <audio 
                            controls 
                            src={`${exercise.instructions_audio_url}${exercise.instructions_audio_url.includes('?') ? '&' : '?'}user_id=1`} 
                            style={{ width: '100%' }} 
                         />
                    </div>
                )}

                {!result ? (
                    <>
                        {exercise.pattern && (
                             <p style={{ color: '#aaa', marginBottom: '0.5rem', fontSize: '0.9rem', textAlign: 'center' }}>
                                2. Record your attempt:
                             </p>
                        )}
                        <div style={{ marginBottom: '1rem' }}>
                            <AudioRecorder onRecordingComplete={handleUpload} />
                        </div>
                        {isUploading && <p style={{ textAlign: 'center', color: '#888' }}>Analyzing your performance...</p>}
                    </>
                ) : (
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ 
                            fontSize: '3rem', 
                            fontWeight: 'bold', 
                            color: 'var(--accent-gold)',
                            marginBottom: '0.5rem'
                        }}>
                            {result.score}
                        </div>
                        <p style={{ fontSize: '1.2rem', marginBottom: '1.5rem' }}>Score</p>
                        
                        <div style={{ background: '#2a2a40', padding: '1rem', borderRadius: '8px', textAlign: 'left', marginBottom: '1.5rem', borderLeft: '4px solid #7c4dff' }}>
                            <h4 style={{ margin: '0 0 0.5rem 0', color: '#b388ff' }}>Coach Feedback</h4>
                            <p>{result.feedback}</p>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '1.5rem' }}>
                            <div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>+{result.xp_earned}</div>
                                <div style={{ fontSize: '0.8rem', color: '#888' }}>XP Earned</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>🔥 {result.streak}</div>
                                <div style={{ fontSize: '0.8rem', color: '#888' }}>Day Streak</div>
                            </div>
                        </div>

                        <button className="btn-primary" onClick={onClose}>
                            Close & Continue
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExerciseModal;
