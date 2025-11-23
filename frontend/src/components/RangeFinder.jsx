import React, { useState } from 'react';
import AudioRecorder from './AudioRecorder';

const RangeFinder = () => {
    const [step, setStep] = useState('intro'); // intro, recording, analyzing, result
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const handleRecordingComplete = async (audioBlob) => {
        setStep('analyzing');
        setError(null);

        const formData = new FormData();
        formData.append('file', audioBlob, 'range_test.wav');

        try {
            const response = await fetch('http://localhost:8000/analyze/range', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`Server responded with ${response.status}`);
            }

            const data = await response.json();
            
            if (data.success) {
                setResult(data);
                setStep('result');
            } else {
                setError(data.error || "Analyse fehlgeschlagen.");
                setStep('intro');
            }
        } catch (err) {
            console.error("Upload Error:", err);
            setError("Netzwerkfehler beim Upload.");
            setStep('intro');
        }
    };

    const reset = () => {
        setStep('intro');
        setResult(null);
        setError(null);
    };

    return (
        <div className="card" style={{ maxWidth: '800px', margin: '2rem auto', textAlign: 'center' }}>
            <h2>🎤 Vocal Range Finder</h2>
            
            {step === 'intro' && (
                <div>
                    <p style={{ fontSize: '1.2rem', color: '#aaa', marginBottom: '2rem' }}>
                        Finde dein Stimmfach! Singe eine <strong>Sirene (Glissando)</strong> von deinem allertiefsten 
                        bis zu deinem allerhöchsten Ton.
                    </p>
                    
                    {error && (
                        <div style={{ color: '#dc3545', marginBottom: '1rem', padding: '1rem', background: 'rgba(220, 53, 69, 0.1)', borderRadius: '8px' }}>
                            ⚠️ {error}
                        </div>
                    )}

                    <div style={{ margin: '2rem 0' }}>
                        <AudioRecorder onRecordingComplete={handleRecordingComplete} />
                    </div>
                    
                    <p style={{ fontSize: '0.9rem', color: '#666' }}>
                        Tipp: Trau dich! Es muss nicht schön klingen, nur hoch und tief sein.
                    </p>
                </div>
            )}

            {step === 'analyzing' && (
                <div style={{ padding: '3rem' }}>
                    <div className="loading-spinner"></div>
                    <p>Analysiere deine Range...</p>
                </div>
            )}

            {step === 'result' && result && (
                <div>
                    <div style={{ marginBottom: '2rem' }}>
                        <h3 style={{ fontSize: '2rem', color: '#00f2ff', marginBottom: '0.5rem' }}>
                            Du bist wahrscheinlich ein {result.detected_voice_type}!
                        </h3>
                        <p style={{ color: '#aaa' }}>
                            Deine Range: <strong>{result.metrics.vocal_range}</strong> ({result.metrics.range_semitones} Halbtöne)
                        </p>
                    </div>

                    <div style={{ 
                        background: '#1a1a1a', 
                        padding: '1.5rem', 
                        borderRadius: '12px',
                        textAlign: 'left',
                        marginBottom: '2rem',
                        border: '1px solid #333'
                    }}>
                        <h4 style={{ color: '#fff', marginBottom: '1rem' }}>Analyse Details:</h4>
                        <ul style={{ listStyle: 'none', padding: 0, color: '#ccc' }}>
                            <li style={{ marginBottom: '0.5rem' }}>
                                📉 Tiefster Ton: <strong>{result.metrics.min_pitch_hz} Hz</strong>
                            </li>
                            <li style={{ marginBottom: '0.5rem' }}>
                                📈 Höchster Ton: <strong>{result.metrics.max_pitch_hz} Hz</strong>
                            </li>
                            {result.voice_type_info && (
                                <li style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #333' }}>
                                    ℹ️ Typische {result.detected_voice_type}-Range: {result.voice_type_info.range_hz[0]}Hz - {result.voice_type_info.range_hz[1]}Hz
                                </li>
                            )}
                        </ul>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                        <button onClick={reset} className="btn-secondary">
                            Neu messen
                        </button>
                        <button className="btn-primary">
                            In Profil speichern
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RangeFinder;
