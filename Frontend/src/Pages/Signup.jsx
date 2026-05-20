import { useState } from 'react';
import '../assets/css/style.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default function Signup({ onSwitch, onSignup }) {
  const [fullName, setFullName] = useState("Prince Ghevariya");
  const [email, setEmail] = useState("prince@company.com");
  const [role, setRole] = useState('hr');
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: fullName,
          email,
          password,
          role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Unable to create the account right now.');
      }

      if (typeof onSignup === 'function') {
        onSignup(data);
      }
    } catch (signupError) {
      setError(signupError.message || 'Unable to create the account right now.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container auth-page">
      {/* Left Side */}
      <div className="left-side">
        <div className="left-content">
          <h1>Build your<br />dream team.</h1>
          <p>Join thousands of modern companies<br />scaling their HR effortlessly.</p>
        </div>
      </div>

      {/* Right Side */}
      <div className="right-side">
        <form className="form-container" onSubmit={handleSubmit}>
          <h2>Set up workspace</h2>
          <p>Start managing your team in minutes.</p>

          {error ? <div className="auth-error">{error}</div> : null}

          <button className="google-btn" style={{ marginBottom: '24px' }} type="button">
            <img src="https://www.google.com/favicon.ico" alt="Google" width="20" height="20" />
            Sign up with Google
          </button>

           <div className="divider">
            <div className="divider-line"></div>
            <span className="divider-text">OR EMAIL</span>
            <div className="divider-line"></div>
          </div>

          <div className="input-group">
            <label className="input-label">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="input-field"
            />
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
            <label className="input-label">Role</label>
            <select value={role} onChange={(e) => setRole(e.target.value)} className="input-field">
              <option value="hr">HR</option>
              <option value="employee">Employee</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="input-group">
            <label className="input-label">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              placeholder="Create a strong password"
            />
          </div>

          <div className="input-group">
            <label className="input-label">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input-field"
              placeholder="Re-enter your password"
            />
          </div>

          <button className="main-btn" type="submit" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>

          <p style={{ textAlign: 'center', marginTop: '32px', color: '#64748b' }}>
            Already have an account?{' '}
            <span className="switch-link" onClick={onSwitch}>Sign in</span>
          </p>
        </form>
      </div>
    </div>
  );
}