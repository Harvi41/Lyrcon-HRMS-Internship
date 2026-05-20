import { useEffect, useState } from 'react';
import Login from './Pages/Login';
import Signup from './Pages/Signup';
import Dashboard from './Pages/Dashboard';

function App() {
  const [view, setView] = useState('login');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = window.localStorage.getItem('corehr_user');
    const storedToken = window.localStorage.getItem('corehr_token');

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setView('dashboard');
    }
  }, []);

  const handleLogin = ({ user: loggedInUser, token }) => {
    window.localStorage.setItem('corehr_token', token);
    window.localStorage.setItem('corehr_user', JSON.stringify(loggedInUser));
    setUser(loggedInUser);
    setView('dashboard');
  };

  const handleSignup = ({ user: createdUser, token }) => {
    window.localStorage.setItem('corehr_token', token || '');
    window.localStorage.setItem('corehr_user', JSON.stringify(createdUser));
    setUser(createdUser);
    setView('dashboard');
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