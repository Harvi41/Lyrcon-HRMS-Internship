import { useEffect, useState } from 'react';
import Login from './Pages/Login';
import Signup from './Pages/Signup';
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

  const handleSignup = (session) => {
    enterDashboard(session?.user || null, session?.token);
  };

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
          onSwitch={() => setView('signup')}
          onLogin={handleLogin}
        />
      )}
      {view === 'signup' && (
        <Signup
          onSwitch={() => setView('login')}
          onSignup={handleSignup}
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