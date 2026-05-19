import { useState } from 'react';
import '../assets/css/style.css';

export default function Signup({ onSwitch }) {
  const [role, setRole] = useState("Employee");

  return (
    <div className="auth-container">
      {/* Left Side */}
      <div className="left-side">
        <div className="left-content">
          <h1>Build your<br />dream team.</h1>
          <p>Join thousands of modern companies<br />scaling their HR effortlessly.</p>

          <div className="status-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '40px', height: '40px', background: '#4ade80', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'white' }}>
                ✓
              </div>
              <div>
                <p style={{ fontWeight: '600' }}>Onboarding Complete</p>
                <p style={{ fontSize: '14px', opacity: '0.8' }}>Prince Ghevariya has joined the team.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side */}
      <div className="right-side">
        <div className="form-container">
          <h2>Set up workspace</h2>
          <p>Start managing your team in minutes.</p>

          <button className="google-btn" style={{ marginBottom: '24px' }}>
            <img src="https://www.google.com/favicon.ico" alt="Google" width="20" height="20" />
            Sign up with Google
          </button>

          <div className="input-group">
            <label className="input-label">Full Name</label>
            <input type="text" defaultValue="Prince Ghevariya" className="input-field" />
          </div>

          <div className="input-group">
            <label className="input-label">Work Email</label>
            <input type="email" defaultValue="prince@company.com" className="input-field" />
          </div>

          <div className="input-group">
            <label className="input-label">Select Role</label>
            <div className="role-buttons">
              {['Admin', 'HR', 'Employee'].map((r) => (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  className={`role-btn ${role === r ? 'active' : ''}`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Password</label>
            <input type="password" placeholder="Create a strong password" className="input-field" />
          </div>

          <button className="main-btn">Create Account</button>

          <p style={{ textAlign: 'center', marginTop: '32px', color: '#64748b' }}>
            Already have an account?{' '}
            <span className="switch-link" onClick={onSwitch}>Sign in</span>
          </p>
        </div>
      </div>
    </div>
  );
}