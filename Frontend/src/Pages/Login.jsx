import { useState } from 'react';
import '../assets/css/style.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default function Login({ onSwitch, onLogin }) {
  const [email, setEmail] = useState("prince@company.com");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Unable to sign in right now.');
      }

      if (typeof onLogin === 'function') {
        onLogin(data);
      }
    } catch (loginError) {
      setError(loginError.message || 'Unable to sign in right now.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container auth-page">
      {/* Left Side */}
      <div className="left-side">
        <div className="left-content">
          <h1>Empower your<br />workforce.</h1>
          <p>Sign in to manage payroll, benefits,<br />and global team performance.</p>
        </div>
      </div>

      {/* Right Side */}
      <div className="right-side">
        <form className="form-container" onSubmit={handleSubmit}>
          <h2>Welcome back</h2>
          <p>Enter your details to access your dashboard.</p>

          {error ? <div className="auth-error">{error}</div> : null}

          <button className="google-btn" type="button">
            <img src="https://www.google.com/favicon.ico" alt="Google" width="20" height="20" />
            Sign in with Google
          </button>

          <div className="divider">
            <div className="divider-line"></div>
            <span className="divider-text">OR EMAIL</span>
            <div className="divider-line"></div>
          </div>

          <div className="input-group">
            <label className="input-label">Work Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
            />
          </div>

          <div className="input-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label className="input-label">Password</label>
              <a href="#" style={{ color: '#2563eb', fontSize: '14px' }}>Forgot password?</a>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              placeholder="••••••••••"
            />
          </div>

          <button className="main-btn" type="submit" disabled={loading}>
            {loading ? 'Signing In...' : 'Sign In to Dashboard'}
          </button>

          <p style={{ textAlign: 'center', marginTop: '32px', color: '#64748b' }}>
            New to CoreHR?{' '}
            <span className="switch-link" onClick={onSwitch}>Create workspace</span>
          </p>
        </form>
      </div>
    </div>
  );
}