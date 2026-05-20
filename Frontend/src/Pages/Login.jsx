import { useState } from 'react';
import '../assets/css/style.css';

export default function Login({ onSwitch }) {
  const [email, setEmail] = useState("prince@company.com");
  const [password, setPassword] = useState("");

  return (
    <div className="auth-container">
      {/* Left Side */}
      <div className="left-side">
        <div className="left-content">
          <h1>Empower your<br />workforce.</h1>
          <p>Sign in to manage payroll, benefits,<br />and global team performance.</p>

          <div className="status-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '40px', height: '40px', background: '#4ade80', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                ✓
              </div>
              <div>
                <p style={{ fontWeight: '600' }}>Payroll Processed</p>
                <p style={{ fontSize: '14px', opacity: '0.8' }}>All employee deposits completed.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side */}
      <div className="right-side">
        <div className="form-container">
          <h2>Welcome back</h2>
          <p>Enter your details to access your dashboard.</p>

          <button className="google-btn">
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

          <button className="main-btn">Sign In to Dashboard</button>

          <p style={{ textAlign: 'center', marginTop: '32px', color: '#64748b' }}>
            New to CoreHR?{' '}
            <span className="switch-link" onClick={onSwitch}>Create workspace</span>
          </p>
        </div>
      </div>
    </div>
  );
}