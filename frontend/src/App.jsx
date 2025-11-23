import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Exercises from './pages/Exercises';
import Review from './pages/Review';
import Login from './pages/Login';
import './App.css';

function App() {
  // Initialize directly from localStorage to avoid useEffect flash/warning
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem('user_id');
  });

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  /*
  const handleLogout = () => {
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_name');
    setIsAuthenticated(false);
  };
  */

  return (
    <Router>
      <Routes>
        <Route path="/login" element={
          !isAuthenticated ? <Login onLogin={handleLogin} /> : <Navigate to="/" />
        } />
        
        <Route path="*" element={
          isAuthenticated ? (
            <Layout>
               {/* Pass logout handler if needed in Layout */}
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/exercises" element={<Exercises />} />
                <Route path="/review" element={<Review />} />
                <Route path="/profile" element={<Dashboard />} />
              </Routes>
            </Layout>
          ) : (
            <Navigate to="/login" />
          )
        } />
      </Routes>
    </Router>
  );
}

export default App;
