import React, { useState } from 'react';
import { changePassword } from '../../lib/axios';

export default function ChangePasswordModal({ isOpen, onClose, onSuccess }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      return setError('New passwords do not match.');
    }
    if (newPassword.length < 6) {
      return setError('Password must be at least 6 characters.');
    }

    setLoading(true);
    try {
      await changePassword({ currentPassword, newPassword });
      
      // Update local storage user object to reflect the change
      const userStr = localStorage.getItem('corehr_user');
      if (userStr) {
        const user = JSON.parse(userStr);
        user.mustChangePassword = false;
        localStorage.setItem('corehr_user', JSON.stringify(user));
      }

      setLoading(false);
      setIsSuccess(true);
      
      // Reset state and close modal after 2 seconds
      setTimeout(() => {
        setIsSuccess(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        onSuccess();
      }, 2000);

    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to change password. Please try again.');
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading && !isSuccess) {
      setError('');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      onClose();
    }
  };

  if (isSuccess) {
    return (
      <div style={overlayStyle}>
        <div style={{ ...modalStyle, padding: '40px 20px', textAlign: 'center' }}>
          <div style={successIconContainer}>
            <svg style={successSvgStyle} viewBox="0 0 52 52">
              <circle style={successCircleStyle} cx="26" cy="26" r="23" fill="none" />
              <path style={successCheckStyle} fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
            </svg>
          </div>
          <h2 style={{ color: '#16a34a', marginTop: '20px', fontSize: '1.25rem', animation: 'fadeIn 0.5s ease-in forwards' }}>
            Password Changed Successfully!
          </h2>
        </div>
        <style>
          {`
            @keyframes dash {
              0% { stroke-dashoffset: 1000; }
              100% { stroke-dashoffset: 0; }
            }
            @keyframes pop {
              0% { transform: scale(0.8); opacity: 0; }
              100% { transform: scale(1); opacity: 1; }
            }
            @keyframes fadeIn {
              0% { opacity: 0; transform: translateY(10px); }
              100% { opacity: 1; transform: translateY(0); }
            }
          `}
        </style>
      </div>
    );
  }

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <div style={headerStyle}>
          <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#1e293b' }}>Change Password</h2>
          <button onClick={handleClose} style={closeButtonStyle} disabled={loading}>&times;</button>
        </div>
        <form onSubmit={handleSubmit} style={formStyle}>
          {error && <div style={errorStyle}>{error}</div>}
          
          <div style={inputGroupStyle}>
            <label style={labelStyle}>Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              style={inputStyle}
              required
              disabled={loading}
            />
          </div>

          <div style={inputGroupStyle}>
            <label style={labelStyle}>New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              style={inputStyle}
              required
              disabled={loading}
            />
          </div>

          <div style={inputGroupStyle}>
            <label style={labelStyle}>Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={inputStyle}
              required
              disabled={loading}
            />
            {newPassword && confirmPassword ? (
              <span style={{ fontSize: '0.8rem', marginTop: '2px', fontWeight: '500', color: newPassword === confirmPassword ? '#16a34a' : '#ef4444' }}>
                {newPassword === confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
              </span>
            ) : null}
          </div>

          <div style={actionRowStyle}>
            <button type="button" onClick={handleClose} style={cancelButtonStyle} disabled={loading}>
              Cancel
            </button>
            <button type="submit" style={submitButtonStyle} disabled={loading}>
              {loading ? 'Updating...' : 'Change Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Inline Styles for simplicity and zero dependencies
const overlayStyle = {
  position: 'fixed',
  top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(15, 23, 42, 0.6)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 9999,
  backdropFilter: 'blur(4px)',
};

const modalStyle = {
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  width: '100%',
  maxWidth: '400px',
  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  overflow: 'hidden',
};

const headerStyle = {
  padding: '20px 24px',
  borderBottom: '1px solid #e2e8f0',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

const closeButtonStyle = {
  background: 'none',
  border: 'none',
  fontSize: '1.5rem',
  color: '#64748b',
  cursor: 'pointer',
  padding: 0,
  lineHeight: 1,
};

const formStyle = {
  padding: '24px',
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
};

const inputGroupStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
};

const labelStyle = {
  fontSize: '0.875rem',
  fontWeight: '500',
  color: '#475569',
};

const inputStyle = {
  padding: '10px 12px',
  border: '1px solid #cbd5e1',
  borderRadius: '6px',
  fontSize: '0.95rem',
  outline: 'none',
  transition: 'border-color 0.2s',
};

const errorStyle = {
  backgroundColor: '#fef2f2',
  color: '#ef4444',
  padding: '10px 12px',
  borderRadius: '6px',
  fontSize: '0.875rem',
  border: '1px solid #fecaca',
};

const actionRowStyle = {
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '12px',
  marginTop: '8px',
};

const cancelButtonStyle = {
  padding: '10px 16px',
  backgroundColor: '#ffffff',
  border: '1px solid #cbd5e1',
  color: '#475569',
  borderRadius: '6px',
  cursor: 'pointer',
  fontWeight: '500',
};

const submitButtonStyle = {
  padding: '10px 16px',
  backgroundColor: '#4f46e5',
  border: 'none',
  color: '#ffffff',
  borderRadius: '6px',
  cursor: 'pointer',
  fontWeight: '500',
};

// Success animation styles
const successIconContainer = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  animation: 'pop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards'
};

const successSvgStyle = {
  width: '80px',
  height: '80px',
  stroke: '#16a34a',
  strokeWidth: '4',
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  overflow: 'visible'
};

const successCircleStyle = {
  strokeDasharray: '1000',
  strokeDashoffset: '1000',
  animation: 'dash 1.2s ease-in-out forwards'
};

const successCheckStyle = {
  strokeDasharray: '1000',
  strokeDashoffset: '1000',
  animation: 'dash 0.9s ease-in-out forwards 0.3s'
};
