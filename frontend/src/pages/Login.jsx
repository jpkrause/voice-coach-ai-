import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = ({ onLogin }) => {
  const [nickname, setNickname] = useState('');
  const [voiceType, setVoiceType] = useState('Tenor');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nickname.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/users/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nickname: nickname,
          voice_type: voiceType,
          settings_genre: "Pop"
        }),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const user = await response.json();
      localStorage.setItem('user_id', user.id);
      localStorage.setItem('user_name', user.nickname);
      
      if (onLogin) onLogin(user);
      navigate('/');
      
    } catch (error) {
      console.error(error);
      alert('Login failed. Check console.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      background: 'var(--bg-dark)',
      color: 'var(--text-primary)'
    }}>
      <div className="card" style={{ maxWidth: '400px', width: '100%', textAlign: 'center' }}>
        <h1 style={{ color: 'var(--accent-cyan)', marginBottom: '1rem' }}>VocalCoach AI</h1>
        <p style={{ marginBottom: '2rem', color: '#888' }}>Dein persönlicher KI-Gesangstrainer</p>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem', textAlign: 'left' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Nickname</label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              style={{
                width: '100%',
                padding: '0.8rem',
                borderRadius: '4px',
                border: '1px solid #444',
                background: '#222',
                color: 'white'
              }}
              placeholder="Wie sollen wir dich nennen?"
              required
            />
          </div>
          
          <div style={{ marginBottom: '2rem', textAlign: 'left' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Stimmfach (Optional)</label>
            <select
              value={voiceType}
              onChange={(e) => setVoiceType(e.target.value)}
              style={{
                width: '100%',
                padding: '0.8rem',
                borderRadius: '4px',
                border: '1px solid #444',
                background: '#222',
                color: 'white'
              }}
            >
              <option value="Sopran">Sopran</option>
              <option value="Mezzo-Sopran">Mezzo-Sopran</option>
              <option value="Alt">Alt</option>
              <option value="Tenor">Tenor</option>
              <option value="Bariton">Bariton</option>
              <option value="Bass">Bass</option>
            </select>
          </div>

          <button 
            type="submit" 
            className="btn-primary" 
            style={{ width: '100%' }}
            disabled={loading}
          >
            {loading ? 'Lade...' : 'Start Training 🚀'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
