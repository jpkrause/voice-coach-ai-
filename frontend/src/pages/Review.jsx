import { useState, useEffect } from 'react';
import '../App.css';

const Review = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [localFiles, setLocalFiles] = useState([]);
  const [selectedLocalFile, setSelectedLocalFile] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch list of files in user_uploads
    fetch('http://localhost:8000/user-uploads')
      .then(res => res.json())
      .then(data => setLocalFiles(data))
      .catch(err => console.error("Failed to fetch local files", err));
  }, []);

  const handleFileChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
      setResult(null); // Clear previous results
      setError(null);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile && !selectedLocalFile) return;
    
    if (selectedFile) {
        await performAnalysis({ file: selectedFile });
    } else if (selectedLocalFile) {
        await performAnalysis({ localFilename: selectedLocalFile });
    }
  };

  const handleDemoAnalyze = async () => {
    await performAnalysis({ useDemo: true });
  };

  const performAnalysis = async ({ file, useDemo, localFilename }) => {
    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    if (useDemo) {
        formData.append('use_demo', 'true');
    } else if (localFilename) {
        formData.append('local_filename', localFilename);
    } else if (file) {
        formData.append('file', file);
    }

    try {
      const response = await fetch('http://localhost:8000/analyze/performance', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || errorData.error || 'Analysis failed with status ' + response.status);
      }

      const data = await response.json();
      if (!data.success) {
          throw new Error(data.error || "Unknown backend error");
      }
      setResult(data);
    } catch (err) {
      console.error("Analysis Error:", err);
      setError(err.message || 'Could not analyze the file. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="dashboard-container">
      <header style={{ marginBottom: '2rem' }}>
        <h1>Performance Review</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Upload a recording of your performance (song, aria, or practice) to get AI-powered feedback on your technique.
        </p>
      </header>

      <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ padding: '2rem', textAlign: 'center' }}>
            <div style={{ marginBottom: '2rem', border: '2px dashed var(--border-color)', borderRadius: '12px', padding: '3rem' }}>
                <label style={{ 
                    cursor: 'pointer', 
                    padding: '0.5rem 1rem', 
                    border: '1px solid #444', 
                    borderRadius: '4px',
                    background: '#222',
                    color: '#ccc',
                    display: 'inline-block'
                }}>
                    {selectedFile ? 'Change File' : 'Select Audio File'}
                    <input 
                        type="file" 
                        accept="audio/*" 
                        onChange={handleFileChange}
                        style={{ display: 'none' }} 
                    />
                </label>
                {selectedFile && (
                    <div style={{ marginTop: '1rem', color: 'var(--accent-gold)' }}>
                        Selected: {selectedFile.name}
                    </div>
                )}
            </div>

            {localFiles.length > 0 && (
                <div style={{ marginBottom: '2rem' }}>
                    <div style={{ marginBottom: '0.5rem', color: '#aaa' }}>Or select a file from <code>backend/user_uploads</code>:</div>
                    <select 
                        className="input-field" 
                        value={selectedLocalFile}
                        onChange={(e) => {
                            setSelectedLocalFile(e.target.value);
                            setSelectedFile(null); // Deselect file upload if local file selected
                        }}
                        style={{ width: '100%', padding: '0.8rem', background: 'var(--bg-card)', color: 'white', border: '1px solid var(--border-color)' }}
                    >
                        <option value="">-- Select a local file --</option>
                        {localFiles.map(f => (
                            <option key={f} value={f}>{f}</option>
                        ))}
                    </select>
                </div>
            )}

            <button 
                className="btn btn-primary" 
                onClick={handleAnalyze} 
                disabled={(!selectedFile && !selectedLocalFile) || isAnalyzing}
                style={{ width: '100%' }}
            >
                {isAnalyzing ? 'Listening & Analyzing...' : 'Analyze Performance'}
            </button>

            <div style={{ margin: '1rem 0', color: '#666' }}>or</div>

            <button 
                className="btn btn-secondary" 
                onClick={handleDemoAnalyze} 
                disabled={isAnalyzing}
                style={{ width: '100%', opacity: 0.8 }}
            >
                {isAnalyzing ? 'Analyzing Demo...' : 'Try with Demo Recording'}
            </button>

            {error && (
                <div style={{ marginTop: '1rem', color: '#ff4444', padding: '1rem', background: 'rgba(255, 68, 68, 0.1)', borderRadius: '8px' }}>
                    {error}
                </div>
            )}
        </div>
      </div>

      {result && (
        <div className="card" style={{ marginTop: '2rem', animation: 'fadeIn 0.5s ease' }}>
            <div style={{ padding: '2rem' }}>
                <h2 style={{ color: 'var(--accent-gold)', marginBottom: '1.5rem' }}>Coach's Feedback</h2>
                
                {/* AI Feedback Section */}
                <div style={{ 
                    background: 'rgba(255, 255, 255, 0.05)', 
                    padding: '1.5rem', 
                    borderRadius: '8px', 
                    lineHeight: '1.6', 
                    marginBottom: '2rem',
                    borderLeft: '4px solid var(--accent-gold)'
                }}>
                    <p style={{ whiteSpace: 'pre-wrap' }}>{result.ai_feedback}</p>
                </div>

                {/* Metrics Grid */}
                <h3 style={{ marginBottom: '1rem' }}>Technical Metrics</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    <div className="stat-card">
                        <div className="stat-label">Pitch Stability</div>
                        <div className="stat-value">{result.metrics?.pitch_stability || 'N/A'}%</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label">Vocal Health</div>
                        <div className="stat-value" style={{ 
                            color: result.metrics?.health_status === 'Green' ? '#4caf50' : 
                                   result.metrics?.health_status === 'Yellow' ? '#ffeb3b' : '#f44336' 
                        }}>
                            {result.metrics?.health_status || 'Unknown'}
                        </div>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default Review;
