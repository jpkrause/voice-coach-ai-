import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    nickname: '',
    voice_type: '',
    settings_genre: ''
  });
  
  const navigate = useNavigate();

  useEffect(() => {
    const userId = localStorage.getItem('user_id');
    
    if (!userId) {
        navigate('/login');
        return;
    }
    
    fetch(`http://localhost:8000/users/${userId}`)
      .then(res => {
        if (res.status === 404) {
             throw new Error("User not found");
        }
        return res.json();
      })
      .then(data => {
        setUser(data);
        setEditForm({
            nickname: data.nickname,
            voice_type: data.voice_type,
            settings_genre: data.settings_genre
        });
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        if (err.message === "User not found") {
            // Logout and redirect
            localStorage.removeItem('user_id');
            localStorage.removeItem('user_name');
            alert("Session expired. Please log in again.");
            navigate('/login');
        }
        setLoading(false);
      });
  }, [navigate]);

  const handleSave = async () => {
      if (!user) return;
      
      try {
        const response = await fetch(`http://localhost:8000/users/${user.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(editForm)
        });
        
        if (response.ok) {
            const updatedUser = await response.json();
            setUser(updatedUser);
            setIsEditing(false);
            localStorage.setItem('user_name', updatedUser.nickname); // Update local cache
        } else {
            alert("Failed to update profile.");
        }
      } catch (err) {
          console.error("Update failed", err);
          alert("Error updating profile.");
      }
  };

  const handleCancel = () => {
      setEditForm({
          nickname: user.nickname,
          voice_type: user.voice_type,
          settings_genre: user.settings_genre
      });
      setIsEditing(false);
  };

  if (loading) return <div style={{ textAlign: 'center', marginTop: '4rem', color: '#888' }}>Loading Profile...</div>;
  if (!user) return null; // Should redirect

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', paddingBottom: '4rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '2.5rem', color: 'var(--accent-gold)', margin: 0 }}>My Profile</h1>
          {!isEditing && (
              <button 
                className="btn-secondary" 
                onClick={() => setIsEditing(true)}
                style={{ padding: '0.5rem 1.5rem' }}
              >
                  ✏️ Edit Profile
              </button>
          )}
      </div>
      
      {/* Main Profile Card */}
      <div className="card" style={{ padding: '3rem', marginBottom: '2rem', display: 'flex', gap: '3rem', flexWrap: 'wrap', alignItems: 'start' }}>
        {/* Avatar Section */}
        <div style={{ flexShrink: 0, textAlign: 'center' }}>
            <div style={{ 
                width: '150px', 
                height: '150px', 
                borderRadius: '50%', 
                background: 'linear-gradient(135deg, #333 0%, #111 100%)', 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                fontSize: '4rem',
                border: '4px solid var(--bg-primary)',
                boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
                margin: '0 auto 1rem auto'
            }}>
                {user.voice_type === 'Bass' || user.voice_type === 'Bariton' ? '🦁' : '🦅'}
            </div>
            <div style={{ color: '#666', fontSize: '0.9rem' }}>Member since 2024</div>
        </div>

        {/* Info Section */}
        <div style={{ flex: 1, minWidth: '300px' }}>
            {isEditing ? (
                <div style={{ display: 'grid', gap: '1.5rem' }}>
                    <div>
                        <label style={{ display: 'block', color: '#888', marginBottom: '0.5rem' }}>Nickname</label>
                        <input 
                            type="text" 
                            value={editForm.nickname}
                            onChange={(e) => setEditForm({...editForm, nickname: e.target.value})}
                            style={{ width: '100%', padding: '0.8rem', borderRadius: '4px', border: '1px solid #444', background: '#222', color: 'white' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', color: '#888', marginBottom: '0.5rem' }}>Voice Type</label>
                        <select 
                            value={editForm.voice_type}
                            onChange={(e) => setEditForm({...editForm, voice_type: e.target.value})}
                            style={{ width: '100%', padding: '0.8rem', borderRadius: '4px', border: '1px solid #444', background: '#222', color: 'white' }}
                        >
                             <option value="Sopran">Sopran</option>
                             <option value="Mezzo-Sopran">Mezzo-Sopran</option>
                             <option value="Alt">Alt</option>
                             <option value="Tenor">Tenor</option>
                             <option value="Bariton">Bariton</option>
                             <option value="Bass">Bass</option>
                             <option value="Unknown">Unknown</option>
                        </select>
                    </div>
                    <div>
                        <label style={{ display: 'block', color: '#888', marginBottom: '0.5rem' }}>Preferred Genre</label>
                        <select 
                            value={editForm.settings_genre}
                            onChange={(e) => setEditForm({...editForm, settings_genre: e.target.value})}
                            style={{ width: '100%', padding: '0.8rem', borderRadius: '4px', border: '1px solid #444', background: '#222', color: 'white' }}
                        >
                             <option value="Pop">Pop</option>
                             <option value="Rock">Rock</option>
                             <option value="Klassik">Klassik</option>
                             <option value="Jazz">Jazz</option>
                        </select>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                        <button className="btn-primary" onClick={handleSave}>Save Changes</button>
                        <button className="btn-secondary" onClick={handleCancel} style={{ background: '#333' }}>Cancel</button>
                    </div>
                </div>
            ) : (
                <>
                    <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: '#fff' }}>{user.nickname}</h2>
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                        <span style={{ background: 'rgba(0, 242, 255, 0.1)', color: 'var(--accent-cyan)', padding: '0.3rem 0.8rem', borderRadius: '12px', fontSize: '0.9rem', border: '1px solid var(--accent-cyan)' }}>
                            {user.voice_type || "No Voice Type"}
                        </span>
                        <span style={{ background: '#333', color: '#ccc', padding: '0.3rem 0.8rem', borderRadius: '12px', fontSize: '0.9rem' }}>
                            {user.settings_genre || "Pop"}
                        </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', borderTop: '1px solid #333', paddingTop: '2rem' }}>
                        <div>
                            <div style={{ color: '#888', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Level</div>
                            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--accent-gold)' }}>{user.level}</div>
                        </div>
                        <div>
                            <div style={{ color: '#888', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>XP</div>
                            <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{user.xp}</div>
                        </div>
                        <div>
                            <div style={{ color: '#888', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Streak</div>
                            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--success)' }}>{user.current_streak}</div>
                        </div>
                    </div>
                </>
            )}
        </div>
      </div>

      {/* Badges Section */}
      <h3 style={{ marginBottom: '1.5rem', color: '#eee', paddingLeft: '0.5rem' }}>Achievements</h3>
      <div className="card" style={{ padding: '2rem' }}>
        {user.badges && user.badges.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' }}>
            {user.badges.map((badge, idx) => (
              <div key={idx} style={{ 
                background: '#252525', 
                padding: '1.5rem', 
                borderRadius: '12px', 
                textAlign: 'center',
                border: '1px solid #333',
                transition: 'transform 0.2s',
                cursor: 'default'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🏆</div>
                <div style={{ fontWeight: 'bold', color: '#ddd' }}>{badge}</div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.3 }}>🛡️</div>
              <p>No achievements yet.</p>
              <p style={{ fontSize: '0.9rem' }}>Complete exercises and maintain your streak to earn badges!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
