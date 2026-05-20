import { useState } from 'react';
import '../assets/css/style.css';

export default function Signup({ onSwitch }) {
  const [fullName, setFullName] = useState("Prince Ghevariya");
  const [email, setEmail] = useState("prince@company.com");
  const [employeeId, setEmployeeId] = useState("PRINCE001");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  return (
    <div className="auth-container">
      {/* Left Side */}
      <div className="left-side">
        <div className="left-content">
          <h1>Build your<br />dream team.</h1>
          <p>Join thousands of modern companies<br />scaling their HR effortlessly.</p>
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
            <label className="input-label">Employee ID</label>
            <input
              type="text"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              className="input-field"
              placeholder="Enter your Employee ID"
            />
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