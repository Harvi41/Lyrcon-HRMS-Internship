import React, { useState, useEffect, useRef } from 'react';
import styles from '../EmployeeDashboardLayout.module.css'; 
import { getAnnouncements, markAnnouncementAsRead } from '../../../lib/axios';

const pageTitles = (name) => ({
  dashboard:     `Welcome Back, ${name || "User"}`,
  tasks:         "Tasks",
  attendance:    "Attendance",
  leave:         "Leave Management",
  payroll:       "Payroll",
  announcements: "Announcements",
});

const Header = ({ activePage, onLogout, user }) => {
  const [announcements, setAnnouncements] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const dropdownRef = useRef(null);

  const currentUserName = user?.name || "Employee";
  const avatarLetter = currentUserName.charAt(0).toUpperCase();

  // 1. POLLING ENGINE: Fetch active announcements and unread counts
  const fetchNotifications = async () => {
    try {
      const { data } = await getAnnouncements();
      if (data) {
        setAnnouncements(data.announcements || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Error fetching notifications in header:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Poll every 12 seconds
    const interval = setInterval(fetchNotifications, 12000);
    return () => clearInterval(interval);
  }, []);

  // 2. CLOSE DROPDOWN ON OUTSIDE CLICK
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isDropdownOpen]);

  // 3. MARK SINGLE NOTIFICATION AS READ
  const handleItemClick = async (announcement) => {
    if (!announcement.isRead) {
      try {
        await markAnnouncementAsRead(announcement._id);
        // Optimistic UI update
        setAnnouncements((prev) =>
          prev.map((ann) => (ann._id === announcement._id ? { ...ann, isRead: true } : ann))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (error) {
        console.error('Error marking announcement as read:', error);
      }
    }
    setSelectedAnnouncement(announcement);
  };

  // 4. MARK ALL AS READ
  const handleMarkAllRead = async () => {
    const unreadList = announcements.filter((ann) => !ann.isRead);
    if (unreadList.length === 0) return;

    try {
      await Promise.all(unreadList.map((ann) => markAnnouncementAsRead(ann._id)));
      setAnnouncements((prev) => prev.map((ann) => ({ ...ann, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  // 5. CLEAR ALL NOTIFICATIONS (Mark read & clear from view)
  const handleClearAll = async () => {
    try {
      const unreadList = announcements.filter((ann) => !ann.isRead);
      if (unreadList.length > 0) {
        await Promise.all(unreadList.map((ann) => markAnnouncementAsRead(ann._id)));
      }
      setAnnouncements([]);
      setUnreadCount(0);
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  };

  // Format date helper
  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <header className={styles.topbar}>
      <h1 className={styles.pageTitle}>
        {pageTitles(currentUserName)[activePage] || ""}
      </h1>

      <div className={styles.userInfo}>
        {/* ── Notification Bell Container ── */}
        <div className={styles.notificationWrapper} ref={dropdownRef}>
          <button
            type="button"
            className={styles.bellButton}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            title="Notifications"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
            {unreadCount > 0 && <span className={styles.unreadBadge}>{unreadCount}</span>}
          </button>

          {/* Floating Dropdown Card */}
          {isDropdownOpen && (
            <div className={styles.notificationDropdown}>
              <div className={styles.dropdownHeader}>
                <h4>Notifications</h4>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {unreadCount > 0 && (
                    <button type="button" onClick={handleMarkAllRead} style={{ color: '#4f46e5', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '600' }}>
                      Mark all read
                    </button>
                  )}
                  {announcements.length > 0 && (
                    <button type="button" onClick={handleClearAll} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '600' }}>
                      Clear
                    </button>
                  )}
                </div>
              </div>

              <div className={styles.notificationList}>
                {announcements.length === 0 ? (
                  <div className={styles.emptyNotifications}>No notifications yet.</div>
                ) : (
                  announcements.map((ann) => (
                    <div
                      key={ann._id}
                      className={`${styles.notificationItem} ${!ann.isRead ? styles.notificationItemUnread : ''}`}
                      onClick={() => handleItemClick(ann)}
                    >
                      <div className={styles.notificationItemTitle}>
                        <span>{ann.title}</span>
                        {!ann.isRead && <span style={{ width: '8px', height: '8px', backgroundColor: '#3b82f6', borderRadius: '50%' }} />}
                      </div>
                      <div className={styles.notificationItemDesc}>
                        {ann.description.length > 70
                          ? ann.description.substring(0, 70) + '...'
                          : ann.description}
                      </div>
                      <div className={styles.notificationItemMeta}>
                        <span
                          className={`${styles.notificationPriorityBadge} ${ann.priority === 'High'
                            ? styles.priorityHigh
                            : ann.priority === 'Medium'
                              ? styles.priorityMedium
                              : styles.priorityLow
                            }`}
                        >
                          {ann.priority}
                        </span>
                        <span>{formatTime(ann.createdAt)}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── User Profile & Sign Out ── */}
        <span className={styles.userName}>{currentUserName}</span>
        <div className={styles.avatar}>{avatarLetter}</div>
        {onLogout ? (
          <button type="button" className={styles.logoutButton} onClick={onLogout} style={{
            border: '1px solid #dbe3ef',
            background: '#ffffff',
            color: '#334155',
            borderRadius: '999px',
            padding: '9px 15px',
            fontSize: '0.88rem',
            fontWeight: '600',
            cursor: 'pointer',
            marginLeft: '8px'
          }}>
            Sign out
          </button>
        ) : null}
      </div>

      {/* ── Beautiful Custom Center Modal for Announcement Details ── */}
      {selectedAnnouncement && (
        <div
          className={styles.modalOverlay}
          style={{ display: 'flex', zIndex: 99999 }}
          onClick={() => setSelectedAnnouncement(null)}
        >
          <div
            className={styles.modalContent}
            style={{ maxWidth: '520px', padding: '28px', position: 'relative', overflow: 'hidden' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Close Button Icon */}
            <button
              type="button"
              onClick={() => setSelectedAnnouncement(null)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: '#f1f5f9',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#64748b',
                fontWeight: 'bold',
                transition: 'background-color 0.2s ease',
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#e2e8f0'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#f1f5f9'}
            >
              ✕
            </button>

            {/* Modal Icon Indicator and Category Badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <span style={{ fontSize: '1.5rem' }}></span>
              <span
                style={{
                  fontSize: '0.78rem',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  color: '#4f46e5',
                  backgroundColor: '#eef2ff',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  letterSpacing: '0.05em'
                }}
              >
                {selectedAnnouncement.category || 'General'}
              </span>

              <span
                className={`${styles.notificationPriorityBadge} ${selectedAnnouncement.priority === 'High'
                  ? styles.priorityHigh
                  : selectedAnnouncement.priority === 'Medium'
                    ? styles.priorityMedium
                    : styles.priorityLow
                  }`}
                style={{ padding: '4px 10px', borderRadius: '6px' }}
              >
                {selectedAnnouncement.priority} Priority
              </span>
            </div>

            {/* Title */}
            <h2
              style={{
                fontSize: '1.4rem',
                fontWeight: '800',
                color: '#0f172a',
                lineHeight: '1.3',
                margin: '0 0 16px 0',
                letterSpacing: '-0.02em',
                textAlign: 'left'
              }}
            >
              {selectedAnnouncement.title}
            </h2>

            {/* Time Stamp & Sender details */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.8rem',
                color: '#94a3b8',
                borderBottom: '1px solid #f1f5f9',
                paddingBottom: '14px',
                marginBottom: '20px'
              }}
            >
              <span>By: <strong>{selectedAnnouncement.sender?.name || 'System'}</strong></span>
              <span>{formatTime(selectedAnnouncement.createdAt)}</span>
            </div>

            {/* Content Body */}
            <div
              style={{
                fontSize: '0.95rem',
                color: '#334155',
                lineHeight: '1.6',
                whiteSpace: 'pre-line',
                maxHeight: '260px',
                overflowY: 'auto',
                paddingRight: '6px',
                textAlign: 'left'
              }}
            >
              {selectedAnnouncement.description}
            </div>

            {/* Bottom Button Action */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
              <button
                type="button"
                className={styles.btnSubmit}
                style={{ borderRadius: '8px', padding: '10px 24px', background: '#4f46e5', color: '#fff', border: 'none', fontWeight: '600', cursor: 'pointer' }}
                onClick={() => setSelectedAnnouncement(null)}
              >
                Acknowledge
              </button>
            </div>

          </div>
        </div>
      )}
    </header>
  );
};

export default Header;