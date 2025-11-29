import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import RangeFinder from '../components/RangeFinder';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [showRangeFinder, setShowRangeFinder] = useState(false);
  const [trends, setTrends] = useState([]);

  useEffect(() => {
    const userId = localStorage.getItem('user_id') || 1; // Fallback to 1 for dev
    
    // Fetch User
    fetch(`http://localhost:8000/users/${userId}`)
      .then(res => {
        if (res.status === 404) throw new Error("User not found");
        return res.json();
      })
      .then(data => {
        setUser(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        if (err.message === "User not found") {
             // If user doesn't exist, redirect to login
             localStorage.removeItem('user_id');
             navigate('/login');
        }
        setLoading(false);
      });

    // Fetch Trends
    fetch(`http://localhost:8000/stats/trends?user_id=${userId}`)
        .then(res => res.json())
        .then(data => {
            // Format date for chart (DD/MM)
            const formatted = data.map(d => ({
                ...d,
                displayDate: new Date(d.date).toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' })
            }));
            setTrends(formatted);
        })
        .catch(err => console.error("Trend fetch error:", err));
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

  // Proactive AI Warning Logic
  const checkVocalFatigue = () => {
      if (trends.length < 3) return null;
      const last3 = trends.slice(-3);
      // Check if jitter is increasing (Trend)
      if (last3[0].jitter < last3[1].jitter && last3[1].jitter < last3[2].jitter) {
          // Check if latest is actually high (above 1.0%)
          if (last3[2].jitter > 1.0) {
               return "⚠️ Warning: Your vocal jitter is trending up. Consider taking a rest day.";
          }
      }
      return null;
  };
  const fatigueWarning = checkVocalFatigue();

  return (
    <div>
      <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>Welcome back, {user.nickname}</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem' }}>
          Keep your voice healthy and your spirit high.
        </p>
      </div>

      {/* Quick Actions (Phase 9.1) */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '2rem' }}>
           <Link to="/exercises">
             <button className="btn-primary" style={{ padding: '0.8rem 1.5rem', borderRadius: '20px', fontSize: '1rem' }}>
               🚀 Daily Warmup
             </button>
           </Link>
           <button 
             className="btn-secondary" 
             style={{ padding: '0.8rem 1.5rem', borderRadius: '20px', fontSize: '1rem', background: '#333' }}
             onClick={() => setShowRangeFinder(true)}
           >
             🔍 Quick Range Check
           </button>
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

      <div style={{ marginTop: '3rem', textAlign: 'center', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        <Link to="/exercises">
          <button className="btn-primary" style={{ fontSize: '1.2rem', padding: '1rem 3rem' }}>
            Start Training
          </button>
        </Link>
        <button 
            className="btn-secondary" 
            style={{ fontSize: '1.2rem', padding: '1rem 3rem' }}
            onClick={() => setShowRangeFinder(!showRangeFinder)}
        >
            {showRangeFinder ? "Close Range Finder" : "Check Vocal Range"}
        </button>
      </div>

      {showRangeFinder && (
          <div style={{ marginTop: '2rem' }}>
              <RangeFinder />
          </div>
      )}

      {/* Vocal Health Monitor (Trends) */}
      <div style={{ marginTop: '4rem' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', textAlign: 'center', color: '#eee' }}>Vocal Health Monitor</h2>
        
        {fatigueWarning && (
            <div style={{ 
                background: 'rgba(255, 193, 7, 0.1)', 
                border: '1px solid #ffc107', 
                color: '#ffc107', 
                padding: '1rem', 
                borderRadius: '8px', 
                textAlign: 'center',
                marginBottom: '1rem'
            }}>
                {fatigueWarning}
            </div>
        )}

        <div className="card" style={{ height: '400px', padding: '2rem' }}>
            <h4 style={{ textAlign: 'center', marginBottom: '1rem', color: '#888' }}>Performance Score History</h4>
            {trends.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trends} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                        <XAxis dataKey="displayDate" stroke="#888" tick={{fontSize: 12}} />
                        <YAxis stroke="#888" domain={[0, 100]} />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                            itemStyle={{ color: '#fff' }}
                        />
                        <Line 
                            type="monotone" 
                            dataKey="score" 
                            name="Score"
                            stroke="#00f2ff" 
                            strokeWidth={3} 
                            dot={{r: 4, fill: '#00f2ff'}} 
                            activeDot={{r: 6, fill: '#fff'}} 
                        />
                        {/* Jitter Line (Secondary) */}
                         <Line 
                            type="monotone" 
                            dataKey="jitter" 
                            name="Jitter %"
                            stroke="#ffc107" 
                            strokeWidth={2} 
                            strokeDasharray="5 5"
                            dot={false}
                        />
                    </LineChart>
                </ResponsiveContainer>
            ) : (
                <div style={{ textAlign: 'center', color: '#666', marginTop: '120px' }}>
                    <p style={{ fontSize: '1.2rem' }}>No data available yet.</p>
                    <p>Complete your first exercise to see your progress!</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
