import React from 'react';

export default function PasswordChangeBanner({ onChangePasswordClick }) {
  return (
    <div style={bannerContainerStyle}>
      <div style={bannerContentStyle}>
        <div style={textWrapperStyle}>
          <svg style={iconStyle} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <h4 style={titleStyle}>Action Required: Change Temporary Password</h4>
            <p style={descriptionStyle}>
              You are currently using a temporary or default password. For the security of your account, please update it immediately.
            </p>
          </div>
        </div>
        <button onClick={onChangePasswordClick} style={buttonStyle}>
          Change Password Now
        </button>
      </div>
    </div>
  );
}

const bannerContainerStyle = {
  backgroundColor: '#fffbeb', // Amber 50
  borderBottom: '1px solid #fde68a', // Amber 200
  padding: '12px 24px',
  width: '100%',
  boxSizing: 'border-box',
};

const bannerContentStyle = {
  maxWidth: '1200px',
  margin: '0 auto',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: '16px',
};

const textWrapperStyle = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: '12px',
};

const iconStyle = {
  width: '24px',
  height: '24px',
  color: '#d97706', // Amber 600
  flexShrink: 0,
  marginTop: '2px',
};

const titleStyle = {
  margin: '0 0 4px 0',
  color: '#92400e', // Amber 800
  fontSize: '0.95rem',
  fontWeight: '600',
};

const descriptionStyle = {
  margin: 0,
  color: '#b45309', // Amber 700
  fontSize: '0.875rem',
};

const buttonStyle = {
  backgroundColor: '#d97706', // Amber 600
  color: '#ffffff',
  border: 'none',
  padding: '8px 16px',
  borderRadius: '6px',
  fontSize: '0.875rem',
  fontWeight: '600',
  cursor: 'pointer',
  whiteSpace: 'nowrap',
  transition: 'background-color 0.2s',
};
