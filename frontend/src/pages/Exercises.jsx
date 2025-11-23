import { useState, useEffect } from 'react';
import AudioRecorder from '../components/AudioRecorder';
import ExerciseModal from '../components/ExerciseModal';

const Exercises = () => {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeExercise, setActiveExercise] = useState(null);
  
  // Breath Analysis State
  const [breathResult, setBreathResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Vocal Health Analysis State
  const [healthResult, setHealthResult] = useState(null);
  const [isHealthAnalyzing, setIsHealthAnalyzing] = useState(false);

  const handleHealthUpload = async (audioBlob) => {
    setIsHealthAnalyzing(true);
    setHealthResult(null);
    
    const formData = new FormData();
    formData.append("file", audioBlob, "health_recording.wav");
    
    try {
        const response = await fetch("http://localhost:8000/analyze/health", {
            method: "POST",
            body: formData,
        });
        const data = await response.json();
        setHealthResult(data);
    } catch (error) {
        console.error("Health Analysis failed", error);
        alert("Analysis failed. See console.");
    } finally {
        setIsHealthAnalyzing(false);
    }
  };

  const handleBreathUpload = async (audioBlob) => {
    setIsAnalyzing(true);
    setBreathResult(null);
    
    const formData = new FormData();
    formData.append("file", audioBlob, "breath_recording.wav");
    
    try {
        const response = await fetch("http://localhost:8000/analyze/breath", {
            method: "POST",
            body: formData,
        });
        const data = await response.json();
        setBreathResult(data);
    } catch (error) {
        console.error("Analysis failed", error);
        alert("Analysis failed. See console.");
    } finally {
        setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    fetch('http://localhost:8000/exercises/')
      .then(res => res.json())
      .then(data => {
        setExercises(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleStartExercise = (exercise) => {
    setActiveExercise(exercise);
  };

  if (loading) return <div>Loading Library...</div>;

  // Group by category (simplified logic)
  const grouped = exercises.reduce((acc, ex) => {
    const key = ex.difficulty === 1 ? 'Basic Foundation' : 'Advanced & Genre';
    if (!acc[key]) acc[key] = [];
    acc[key].push(ex);
    return acc;
  }, {});

  return (
    <div>
      <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>Exercise Library</h1>
      
      {/* Breath-Alyzer Section */}
      <div className="card" style={{ marginBottom: '3rem', border: '1px solid var(--accent-gold)' }}>
        <h2 style={{ color: 'var(--accent-gold)', marginBottom: '1rem' }}>🏆 Breath-Alyzer Challenge</h2>
        <p>Test your support! Sustain an "S" sound as long and steady as you can.</p>
        
        <AudioRecorder onRecordingComplete={handleBreathUpload} />
        
        {isAnalyzing && <p>Analyzing Stability...</p>}
        
        {breathResult && (
            <div style={{ marginTop: '1rem', padding: '1rem', background: '#333', borderRadius: '8px' }}>
                <h3>Results:</h3>
                <p><strong>Duration:</strong> {breathResult.duration_seconds?.toFixed(1)}s</p>
                <p><strong>Stability Score:</strong> {(breathResult.stability_score * 100).toFixed(0)}%</p>
                <p><strong>Std Dev (dB):</strong> {breathResult.std_amplitude_db?.toFixed(2)} dB (Target: {'<'} 1.0)</p>
                <div style={{ 
                    width: '100%', 
                    height: '10px', 
                    background: '#555', 
                    marginTop: '0.5rem', 
                    borderRadius: '5px' 
                }}>
                    <div style={{ 
                        width: `${breathResult.stability_score * 100}%`, 
                        height: '100%', 
                        background: breathResult.stability_score > 0.8 ? 'green' : (breathResult.stability_score > 0.5 ? 'orange' : 'red'),
                        borderRadius: '5px',
                        transition: 'width 0.5s ease'
                    }} />
                </div>
            </div>
        )}
      </div>

      {/* Vocal Health Check Section */}
      <div className="card" style={{ marginBottom: '3rem', border: '1px solid #00d4ff' }}>
        <h2 style={{ color: '#00d4ff', marginBottom: '1rem' }}>🏥 Vocal Health Check</h2>
        <p>Analyze your voice quality. Sing a steady, comfortable note (e.g. "Ahhh") for 3-5 seconds.</p>
        
        <AudioRecorder onRecordingComplete={handleHealthUpload} />
        
        <div style={{ textAlign: 'center', margin: '1rem 0', color: '#888' }}>- OR -</div>
        
        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
            <label style={{ 
                cursor: 'pointer', 
                padding: '0.5rem 1rem', 
                border: '1px solid #444', 
                borderRadius: '4px',
                background: '#222',
                color: '#ccc'
            }}>
                📂 Upload Audio File (WAV/MP3)
                <input 
                    type="file" 
                    accept="audio/*" 
                    style={{ display: 'none' }}
                    onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                            handleHealthUpload(e.target.files[0]);
                        }
                    }}
                />
            </label>
        </div>

        {isHealthAnalyzing && <p>Analyzing Vocal Health (Librosa + Gemini AI)...</p>}
        
        {healthResult && (
            <div style={{ marginTop: '1rem', padding: '1rem', background: '#222', borderRadius: '8px' }}>
                {healthResult.success ? (
                    <>
                        <h3>Analysis Results</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
                            <div style={{ padding: '0.5rem', background: '#333', borderRadius: '4px', textAlign: 'center' }}>
                                <div style={{ fontSize: '0.8rem', color: '#888' }}>Jitter (Roughness)</div>
                                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: healthResult.assessment.jitter.status === 'green' ? '#4caf50' : (healthResult.assessment.jitter.status === 'yellow' ? '#ff9800' : '#f44336') }}>
                                    {healthResult.metrics.jitter_percent.toFixed(2)}%
                                </div>
                                <div style={{ fontSize: '0.7rem' }}>{healthResult.assessment.jitter.feedback}</div>
                            </div>
                            <div style={{ padding: '0.5rem', background: '#333', borderRadius: '4px', textAlign: 'center' }}>
                                <div style={{ fontSize: '0.8rem', color: '#888' }}>Shimmer (Breathiness)</div>
                                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: healthResult.assessment.shimmer.status === 'green' ? '#4caf50' : (healthResult.assessment.shimmer.status === 'yellow' ? '#ff9800' : '#f44336') }}>
                                    {healthResult.metrics.shimmer_percent.toFixed(2)}%
                                </div>
                                <div style={{ fontSize: '0.7rem' }}>{healthResult.assessment.shimmer.feedback}</div>
                            </div>
                            <div style={{ padding: '0.5rem', background: '#333', borderRadius: '4px', textAlign: 'center' }}>
                                <div style={{ fontSize: '0.8rem', color: '#888' }}>HNR (Clarity)</div>
                                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: healthResult.assessment.hnr.status === 'green' ? '#4caf50' : (healthResult.assessment.hnr.status === 'yellow' ? '#ff9800' : '#f44336') }}>
                                    {healthResult.metrics.hnr_db.toFixed(1)} dB
                                </div>
                                <div style={{ fontSize: '0.7rem' }}>{healthResult.assessment.hnr.feedback}</div>
                            </div>
                        </div>
                        
                        {/* AI Feedback Section */}
                        <div style={{ background: '#2a2a40', padding: '1rem', borderRadius: '8px', borderLeft: '4px solid #7c4dff' }}>
                            <h4 style={{ margin: '0 0 0.5rem 0', color: '#b388ff' }}>🤖 AI Coach Feedback</h4>
                            <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>
                                {healthResult.ai_feedback || "Loading feedback..."}
                            </p>
                        </div>
                    </>
                ) : (
                    <div style={{ color: '#f44336' }}>Error: {healthResult.error}</div>
                )}
            </div>
        )}
      </div>

      {Object.entries(grouped).map(([category, items]) => (
        <div key={category} style={{ marginBottom: '3rem' }}>
          <h2 style={{ borderBottom: '1px solid #333', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>
            {category}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {items.map(ex => (
              <div key={ex.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <h3 style={{ fontSize: '1.4rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>{ex.name}</h3>
                    <span style={{ 
                        fontSize: '0.8rem', 
                        padding: '0.2rem 0.5rem', 
                        borderRadius: '4px', 
                        background: '#333', 
                        color: 'var(--accent-gold)' 
                    }}>
                        {ex.category}
                    </span>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '1rem' }}>
                    {ex.physiological_target}
                  </p>
                  {ex.metaphors?.execution && (
                      <p style={{ fontSize: '0.9rem', fontStyle: 'italic', color: '#888' }}>
                          "{ex.metaphors.execution}"
                      </p>
                  )}
                </div>
                <button 
                    className="btn-primary" 
                    style={{ marginTop: '1.5rem', width: '100%', fontSize: '0.9rem' }}
                    onClick={() => handleStartExercise(ex)}
                >
                    Start Practice
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
      
      {activeExercise && (
        <ExerciseModal 
          exercise={activeExercise} 
          onClose={() => setActiveExercise(null)} 
        />
      )}
    </div>
  );
};

export default Exercises;
