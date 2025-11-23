import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = localStorage.getItem('user_id') || 1; // Fallback to 1 for dev
    fetch(`http://localhost:8000/users/${userId}`)
      .then(res => res.json())
      .then(data => {
        setUser(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading Profile...</div>;
  if (!user) return <div>User not found. Is backend running?</div>;

  // Level Progress Calculation
  const currentLevel = user.level;
  const nextLevel = currentLevel + 1;
  // If Level 1, range is 0 to 400. If Level > 1, range is lvl^2*100 to (lvl+1)^2*100
  const currentLevelMinXP = currentLevel === 1 ? 0 : Math.pow(currentLevel, 2) * 100;
  const nextLevelXP = Math.pow(nextLevel, 2) * 100;
  
  const progressPercent = Math.min(100, Math.max(0, 
    ((user.xp - currentLevelMinXP) / (nextLevelXP - currentLevelMinXP)) * 100
  ));

  return (
    <div>
      <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>Welcome back, {user.nickname}</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem' }}>
          Keep your voice healthy and your spirit high.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
        {/* Level Card */}
        <div className="card" style={{ textAlign: 'center' }}>
          <h3 style={{ color: 'var(--text-secondary)', fontSize: '1rem', textTransform: 'uppercase' }}>Current Level</h3>
          <div style={{ fontSize: '4rem', fontWeight: 'bold', color: 'var(--accent-gold)' }}>{user.level}</div>
          
          {/* Progress Bar */}
          <div style={{ width: '100%', height: '8px', background: '#333', borderRadius: '4px', margin: '1rem 0', position: 'relative', overflow: 'hidden' }}>
             <div style={{ 
                 width: `${progressPercent}%`, 
                 height: '100%', 
                 background: 'var(--accent-gold)', 
                 borderRadius: '4px',
                 transition: 'width 0.5s ease'
             }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#888' }}>
              <span>{user.xp} XP</span>
              <span>{nextLevelXP} XP (Next Level)</span>
          </div>
        </div>

        {/* XP Card - Removed duplicate info, replaced with Badge Case */}
        <div className="card" style={{ textAlign: 'center' }}>
          <h3 style={{ color: 'var(--text-secondary)', fontSize: '1rem', textTransform: 'uppercase' }}>Trophy Case</h3>
          {user.badges && user.badges.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem' }}>
                  {user.badges.map((badge, idx) => (
                      <span key={idx} style={{ fontSize: '2rem', title: badge }}>🏆</span>
                  ))}
              </div>
          ) : (
              <div style={{ marginTop: '1.5rem', color: '#555', fontStyle: 'italic' }}>
                  No trophies yet. Keep training!
              </div>
          )}
        </div>

        {/* Streak Card */}
        <div className="card" style={{ textAlign: 'center' }}>
          <h3 style={{ color: 'var(--text-secondary)', fontSize: '1rem', textTransform: 'uppercase' }}>Daily Streak</h3>
          <div style={{ fontSize: '4rem', fontWeight: 'bold', color: user.current_streak > 0 ? 'var(--success)' : 'var(--text-secondary)' }}>
            {user.current_streak} <span style={{ fontSize: '1.5rem' }}>🔥</span>
          </div>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Days in a row</div>
        </div>
      </div>

      <div style={{ marginTop: '3rem', textAlign: 'center' }}>
        <Link to="/exercises">
          <button className="btn-primary" style={{ fontSize: '1.2rem', padding: '1rem 3rem' }}>
            Start Training
          </button>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
