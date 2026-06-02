import React from 'react';

const LeaveSuccessModal = ({ isOpen, onClose, data }) => {
  if (!isOpen) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0,0,0,0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1100,
      }}
      onClick={onClose}
    >
      <div 
        style={{
          width: '480px',
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          boxShadow: '0 12px 40px rgba(0,0,0,0.18)',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '40px 0',
          fontFamily: "'Inter', 'Segoe UI', sans-serif"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '5px'
          }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round">
            <path d="M4 4 L14 14 M14 4 L4 14" />
          </svg>
        </button>

        {/* Success Checkmark Calendar Circle */}
        <div style={{ position: 'relative', width: '60px', height: '60px', marginBottom: '24px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: '#D1FAE5', border: '1.5px solid #A7F3D0', position: 'absolute', top: '8px', left: '8px' }}></div>
          <svg width="60" height="60" viewBox="-15 -15 30 30" style={{ position: 'absolute', top: 0, left: 0 }}>
            {/* Calendar Line Art Icon */}
            <rect x="-8" y="-6" width="16" height="13" rx="2" fill="none" stroke="#059669" strokeWidth="2" />
            <line x1="-8" y1="-1" x2="8" y2="-1" stroke="#059669" strokeWidth="1.5" />
            <line x1="-3" y1="-8" x2="-3" y2="-5" stroke="#059669" strokeWidth="2" strokeLinecap="round" />
            <line x1="3" y1="-8" x2="3" y2="-5" stroke="#059669" strokeWidth="2" strokeLinecap="round" />
            {/* Checkmark Overlay Badge */}
            <circle cx="6" cy="5" r="5" fill="#D1FAE5" stroke="#059669" strokeWidth="1.5" />
            <path d="M4 5 L5.5 6.5 L8 3.5" fill="none" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        {/* Header Texts */}
        <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#065F46', margin: '0 0 8px 0' }}>
          Application Submitted
        </h2>
        <p style={{ fontSize: '14px', color: '#1F2937', margin: '0 0 24px 0' }}>
          Your leave request has been sent for manager review.
        </p>

        {/* Info Display Grid Box */}
        <div style={{ width: '420px', border: '1px solid #A7F3D0', borderRadius: '8px', marginBottom: '32px', overflow: 'hidden' }}>
          {/* Top Row Split */}
          <div style={{ display: 'flex', borderBottom: '1px solid #A7F3D0' }}>
            <div style={{ flex: 1, padding: '16px', borderRight: '1px solid #A7F3D0' }}>
              <p style={{ fontSize: '13px', color: '#4B5563', margin: '0 0 4px 0' }}>Employee ID:</p>
              <p style={{ fontSize: '18px', fontWeight: '700', color: '#111827', margin: 0 }}>{data?.empId || "EMP-XXXX"}</p>
            </div>
            <div style={{ flex: 1, padding: '16px' }}>
              <p style={{ fontSize: '13px', color: '#4B5563', margin: '0 0 4px 0' }}>Leave Type:</p>
              <p style={{ fontSize: '18px', fontWeight: '700', color: '#111827', margin: 0 }}>{data?.leaveType || "N/A"}</p>
            </div>
          </div>
          
          {/* Bottom Metas */}
          <div style={{ padding: '16px', backgroundColor: '#FAFAFA' }}>
            <div style={{ display: 'flex', marginBottom: '12px' }}>
              <span style={{ width: '100px', fontSize: '14px', fontWeight: '700', color: '#059669' }}>reason:</span>
              <span style={{ fontSize: '14px', color: '#111827', fontWeight: '600' }}>{data?.reason || "N/A"}</span>
            </div>
            <div style={{ display: 'flex' }}>
              <span style={{ width: '100px', fontSize: '14px', fontWeight: '700', color: '#059669' }}>duration:</span>
              <span style={{ fontSize: '14px', color: '#4B5563' }}>
                {data?.startDate} to {data?.endDate} <span style={{ color: '#4F46E5', fontWeight: '700' }}>({data?.days} Days)</span>
              </span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button 
          onClick={onClose}
          style={{
            width: '220px',
            height: '40px',
            backgroundColor: '#4F46E5',
            color: '#FFFFFF',
            borderRadius: '8px',
            border: 'none',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          Back to Leave Hub
        </button>
      </div>
    </div>
  );
};

export default LeaveSuccessModal;
