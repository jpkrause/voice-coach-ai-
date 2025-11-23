import { Link, useLocation } from 'react-router-dom';
import '../App.css';

const Layout = ({ children }) => {
  const location = useLocation();
  
  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <div>
      <nav style={{ 
        padding: '1.5rem 2rem', 
        borderBottom: '1px solid #333', 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'var(--bg-primary)'
      }}>
        <div style={{ fontSize: '1.5rem', fontFamily: 'var(--font-heading)', color: 'var(--accent-gold)' }}>
          VOCAL COACH AI
        </div>
        <div>
          <Link to="/" className={`nav-link ${isActive('/')}`}>Dashboard</Link>
          <Link to="/exercises" className={`nav-link ${isActive('/exercises')}`}>Library</Link>
          <Link to="/review" className={`nav-link ${isActive('/review')}`}>Review</Link>
          <Link to="/profile" className={`nav-link ${isActive('/profile')}`}>Profile</Link>
        </div>
      </nav>
      <main className="container">
        {children}
      </main>
    </div>
  );
};

export default Layout;
