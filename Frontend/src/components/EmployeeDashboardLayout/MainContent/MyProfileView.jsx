import React, { useState, useEffect } from "react";
import styles from "../EmployeeDashboardLayout.module.css";
import API, { getMe } from "../../../lib/axios";

export default function MyProfileView() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔐 Password Change States
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [securityMessage, setSecurityMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await getMe();
        setProfile(response.data);
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) {
    return <div className={styles.loadingState}>Loading Profile...</div>;
  }

  if (!profile) {
    return <div className={styles.emptyState}>Failed to load profile.</div>;
  }

  // Helpers
  const getInitials = (first, last) => {
    return `${first?.charAt(0) || ""}${last?.charAt(0) || ""}`.toUpperCase();
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString('en-GB'); // DD/MM/YYYY
  };

  // 🔐 Form submission pipeline for password update validation
  const handlePasswordResetSubmit = async (e) => {
    e.preventDefault();
    setSecurityMessage({ text: '', type: '' });

    if (newPassword.length < 6) {
      setSecurityMessage({ text: 'New password must be at least 6 characters long.', type: 'error' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setSecurityMessage({ text: 'New passwords do not match.', type: 'error' });
      return;
    }

    try {
      setPasswordLoading(true);
      
      // Hits your core auth utility route instance
      const response = await API.post('/auth/change-password', {
        oldPassword,
        newPassword
      });

      if (response.data?.success || response.status === 200) {
        setSecurityMessage({ text: 'Your login credentials updated successfully!', type: 'success' });
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      console.error("Credential modification failure:", err);
      setSecurityMessage({ 
        text: err.response?.data?.message || 'Error executing secure reset. Check old credentials.', 
        type: 'error' 
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className={styles.contentSection}>
      
      {/* TOP CARD: Identity Block */}
      <div 
        style={{
          display: "flex",
          alignItems: "center",
          background: "#ffffff",
          borderRadius: "16px",
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04), 0 10px 24px rgba(15, 23, 42, 0.03)",
          height: "140px",
          padding: "0 32px 0 110px",
          marginBottom: "24px"
        }}
      >
        {/* Left Gradient Edge */}
        <div 
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: "16px",
            background: "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)"
          }}
        />

        {/* Avatar */}
        <div
          style={{
            position: "absolute",
            left: "35px",
            width: "60px",
            height: "60px",
            borderRadius: "50%",
            background: "#f1f5f9",
            display: "flex",
            alignItems: "center",
            justify: "center",
            color: "#4f46e5",
            fontSize: "20px",
            fontWeight: "700",
            justifyContent: "center"
          }}
        >
          {getInitials(profile.firstName, profile.lastName)}
        </div>

        {/* Name & Title */}
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: "22px", fontWeight: "700", color: "#0f172a", marginBottom: "4px" }}>
            {profile.firstName} {profile.lastName}
          </h3>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "15px" }}>
            <span style={{ fontWeight: "500", color: "#4f46e5" }}>{profile.designation || "Employee"}</span>
            <span style={{ color: "#cbd5e1" }}>|</span>
            <span style={{ fontWeight: "500", color: "#475569" }}>{profile.department || "General"}</span>
          </div>
        </div>

        {/* Employee Code */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", paddingRight: "40px" }}>
          <span style={{ fontSize: "12px", fontWeight: "600", color: "#94a3b8", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "4px" }}>
            Employee Code
          </span>
          <span style={{ fontSize: "18px", fontWeight: "700", color: "#0f172a", letterSpacing: "0.5px" }}>
            {profile.employeeCode}
          </span>
        </div>

        {/* Status Badge */}
        <div 
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            background: profile.status === 'active' ? "#ecfdf5" : "#fef2f2",
            padding: "6px 14px",
            borderRadius: "20px",
            height: "fit-content"
          }}
        >
          <div 
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: profile.status === 'active' ? "#10b981" : "#ef4444"
            }}
          />
          <span 
            style={{ 
              fontSize: "13px", 
              fontWeight: "600", 
              color: profile.status === 'active' ? "#065f46" : "#991b1b",
              textTransform: "capitalize"
            }}
          >
            {profile.status}
          </span>
        </div>
      </div>

      {/* MID CARD: Details Block */}
      <div 
        style={{
          background: "#ffffff",
          borderRadius: "16px",
          boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04), 0 10px 24px rgba(15, 23, 42, 0.03)",
          padding: "36px",
          display: "flex",
          flexDirection: "column",
          gap: "24px",
          marginBottom: "24px"
        }}
      >
        {/* Card Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center", color: "#16a34a" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
            </svg>
          </div>
          <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#0f172a", margin: 0 }}>
            Personal Information
          </h3>
        </div>

        <div style={{ height: "1.5px", background: "#f1f5f9", width: "100%" }} />

        {/* Grid of details */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", rowGap: "32px", columnGap: "40px", paddingTop: "8px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <span style={{ fontSize: "13px", fontWeight: "600", color: "#94a3b8", letterSpacing: "0.5px" }}>Full Name</span>
            <span style={{ fontSize: "15px", fontWeight: "600", color: "#1e293b" }}>{profile.firstName} {profile.lastName}</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <span style={{ fontSize: "13px", fontWeight: "600", color: "#94a3b8", letterSpacing: "0.5px" }}>Email Address</span>
            <span style={{ fontSize: "15px", fontWeight: "600", color: "#1e293b" }}>{profile.email}</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <span style={{ fontSize: "13px", fontWeight: "600", color: "#94a3b8", letterSpacing: "0.5px" }}>Joining Date</span>
            <span style={{ fontSize: "15px", fontWeight: "600", color: "#1e293b" }}>
              {formatDate(profile.joiningDate) || <span style={{ color: "#cbd5e1", fontStyle: "italic", fontWeight: "500" }}>Not Provided</span>}
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <span style={{ fontSize: "13px", fontWeight: "600", color: "#94a3b8", letterSpacing: "0.5px" }}>Reporting Manager</span>
            <span style={{ fontSize: "15px", fontWeight: "500", color: profile.managerId ? "#1e293b" : "#64748b" }}>
              {profile.managerId ? `${profile.managerId.firstName} ${profile.managerId.lastName}` : "None"}
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <span style={{ fontSize: "13px", fontWeight: "600", color: "#94a3b8", letterSpacing: "0.5px" }}>Phone Number</span>
            {profile.phoneNumber ? <span style={{ fontSize: "15px", fontWeight: "500", color: "#1e293b" }}>{profile.phoneNumber}</span> : <span style={{ fontSize: "15px", fontWeight: "500", color: "#cbd5e1", fontStyle: "italic" }}>Not Provided</span>}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <span style={{ fontSize: "13px", fontWeight: "600", color: "#94a3b8", letterSpacing: "0.5px" }}>Gender</span>
            {profile.gender ? <span style={{ fontSize: "15px", fontWeight: "500", color: "#1e293b" }}>{profile.gender}</span> : <span style={{ fontSize: "15px", fontWeight: "500", color: "#cbd5e1", fontStyle: "italic" }}>Not Provided</span>}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <span style={{ fontSize: "13px", fontWeight: "600", color: "#94a3b8", letterSpacing: "0.5px" }}>Date of Birth</span>
            {profile.dateOfBirth ? <span style={{ fontSize: "15px", fontWeight: "500", color: "#1e293b" }}>{formatDate(profile.dateOfBirth)}</span> : <span style={{ fontSize: "15px", fontWeight: "500", color: "#cbd5e1", fontStyle: "italic" }}>Not Provided</span>}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <span style={{ fontSize: "13px", fontWeight: "600", color: "#94a3b8", letterSpacing: "0.5px" }}>Work Location</span>
            {profile.workLocation ? <span style={{ fontSize: "15px", fontWeight: "500", color: "#1e293b" }}>{profile.workLocation}</span> : <span style={{ fontSize: "15px", fontWeight: "500", color: "#cbd5e1", fontStyle: "italic" }}>Not Assigned</span>}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════════
          ✅ NEW ADDITION: Secure Self-Service Password Adjustment Panel
         ═══════════════════════════════════════════════════════════════════════════ */}
      <div 
        style={{
          background: "#ffffff",
          borderRadius: "16px",
          boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04), 0 10px 24px rgba(15, 23, 42, 0.03)",
          padding: "36px",
          display: "flex",
          flexDirection: "column",
          gap: "24px"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center", color: "#ef4444" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          </div>
          <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#0f172a", margin: 0 }}>
            Security Settings
          </h3>
        </div>

        <div style={{ height: "1.5px", background: "#f1f5f9", width: "100%" }} />

        {securityMessage.text && (
          <div style={{
            padding: '12px 16px', borderRadius: '8px', fontSize: '0.88rem', fontWeight: '600', textAlign: 'left',
            backgroundColor: securityMessage.type === 'success' ? '#f0fdf4' : '#fef2f2',
            border: `1px solid ${securityMessage.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
            color: securityMessage.type === 'success' ? '#15803d' : '#b91c1c'
          }}>
            {securityMessage.type === 'success' ? '✅ ' : '⚠️ '} {securityMessage.text}
          </div>
        )}

        <form onSubmit={handlePasswordResetSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', maxWidth: '800px', textAlign: 'left' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', gridColumn: '1 / -1' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>Current Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={oldPassword} 
              onChange={(e) => setOldPassword(e.target.value)}
              required
              disabled={passwordLoading}
              style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', maxWidth: '380px' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>New Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={newPassword} 
              onChange={(e) => setNewPassword(e.target.value)}
              required
              disabled={passwordLoading}
              style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>Confirm New Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={passwordLoading}
              style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
            />
          </div>

          <div style={{ gridColumn: '1 / -1', paddingTop: '8px' }}>
            <button 
              type="submit" 
              disabled={passwordLoading}
              style={{
                backgroundColor: '#4f46e5', color: '#ffffff', padding: '10px 24px', borderRadius: '8px', 
                border: 'none', fontWeight: '600', fontSize: '14px', cursor: 'pointer', transition: 'background 0.2s'
              }}
            >
              {passwordLoading ? 'Updating Account credentials...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>

    </div>
  );
}