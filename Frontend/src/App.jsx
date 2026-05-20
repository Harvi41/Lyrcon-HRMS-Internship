import { useEffect, useState } from 'react';
import Login from './Pages/Login';
import Dashboard from './Pages/Dashboard';

function App() {
  const [view, setView] = useState('login');
  const [user, setUser] = useState(null);

  const enterDashboard = (sessionUser, token) => {
    if (token) {
      window.localStorage.setItem('corehr_token', token);
    }

    if (sessionUser) {
      window.localStorage.setItem('corehr_user', JSON.stringify(sessionUser));
      setUser(sessionUser);
    }

    setView('dashboard');
  };

  useEffect(() => {
    const storedToken = window.localStorage.getItem('corehr_token');
    const storedUser = window.localStorage.getItem('corehr_user');

    if (storedToken) {
      try {
        setUser(storedUser ? JSON.parse(storedUser) : null);
      } catch {
        setUser(null);
      }
      setView('dashboard');
    }
  }, []);

  const handleLogin = (session) => {
    enterDashboard(session?.user || null, session?.token);
  };

  // Signup flow removed — users should be created via admin/seeders

  const handleLogout = () => {
    window.localStorage.removeItem('corehr_token');
    window.localStorage.removeItem('corehr_user');
    setUser(null);
    setView('login');
  };

  return (
    <>
      {view === 'login' && (
        <Login
          onLogin={handleLogin}
        />
      )}
      {view === 'dashboard' && (
        <Dashboard
          user={user}
          onLogout={handleLogout}
        />
      )}
    </>
  );
}

export default App;
