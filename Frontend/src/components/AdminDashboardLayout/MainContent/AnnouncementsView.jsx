import React, { useState, useEffect } from 'react';
import styles from '../AdminDashboardLayout.module.css';
import { getAnnouncements, publishAnnouncement, getTargetOptions } from '../../../lib/axios';

const AnnouncementsView = () => {
  // 1. DATA AND METRIC STATES
  const [announcements, setAnnouncements] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [highPriorityCount, setHighPriorityCount] = useState(0);
  const [publishedTodayCount, setPublishedTodayCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const displayedAnnouncements = showAll ? announcements : announcements.slice(0, 5);

  // 2. FORM STATES
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('General');
  const [priority, setPriority] = useState('Medium');
  const [targetAudience, setTargetAudience] = useState('all');
  const [targetGroup, setTargetGroup] = useState('');
  const [targetRecipient, setTargetRecipient] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState('');
  const [formError, setFormError] = useState('');

  // 3. TARGET CHOICES STATES
  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);

  // Fetch all backend data
  const loadData = async () => {
    try {
      setLoading(true);
      const [annResponse, targetResponse] = await Promise.all([
        getAnnouncements(),
        getTargetOptions()
      ]);

      if (annResponse.data) {
        const list = annResponse.data.announcements || [];
        setAnnouncements(list);
        setTotalCount(list.length);

        // Live metric calculations
        setHighPriorityCount(list.filter(ann => ann.priority === 'High').length);

        const today = new Date().toDateString();
        setPublishedTodayCount(list.filter(ann => new Date(ann.createdAt).toDateString() === today).length);
      }

      if (targetResponse.data) {
        setDepartments(targetResponse.data.departments || []);
        setUsers(targetResponse.data.users || []);

        // Set default target selections if lists populated
        if (targetResponse.data.departments?.length > 0) {
          setTargetGroup(targetResponse.data.departments[0]);
        }
        if (targetResponse.data.users?.length > 0) {
          setTargetRecipient(targetResponse.data.users[0].id);
        }
      }
    } catch (err) {
      console.error('Error loading announcement dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Form Submission Handler
  const handlePublish = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setFormError('Please fill out all required fields.');
      return;
    }

    setSubmitting(true);
    setFormError('');
    setFormSuccess('');

    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        category,
        priority,
        targetAudience,
        targetGroup: targetAudience === 'group' ? targetGroup : undefined,
        targetRecipient: targetAudience === 'individual' ? targetRecipient : undefined
      };

      await publishAnnouncement(payload);

      setFormSuccess('Announcement successfully published & broadcasted!');
      setTitle('');
      setDescription('');

      // Refresh list
      loadData();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Error publishing announcement.');
    } finally {
      setSubmitting(false);
    }
  };

  // Helper mapping matrix to assign priority tag styles
  const getPriorityClass = (priorityLevel) => {
    switch (priorityLevel) {
      case 'High':
        return styles.priorityHigh;
      case 'Medium':
        return styles.priorityMedium;
      case 'Low':
      default:
        return styles.priorityLow;
    }
  };

  // Format date helper
  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className={styles.dashboardGrid}>
      {/* ── TOP METRICS HUB ROW ── */}
      <div className={styles.metricsRow}>
        <div className={styles.metricCard}>
          <h3>TOTAL BROADCASTS</h3>
          <div className={styles.metricValueWrapper}>
            <span className={styles.metricValue}>{totalCount}</span>
          </div>
        </div>

        <div className={styles.metricCard}>
          <h3>CRITICAL ALERTS</h3>
          <div className={styles.metricValueWrapper}>
            <span className={`${styles.metricValue} ${styles.actionValue}`}>{highPriorityCount}</span>
          </div>
        </div>
        <div className={styles.metricCard}>
          <h3>PUBLISHED TODAY</h3>
          <div className={styles.metricValueWrapper}>
            <span className={`${styles.metricValue} ${styles.statusCommitted}`}>{publishedTodayCount}</span>
          </div>
        </div>
      </div>

      {/* ── SPLIT WORKSPACE: Left Form, Right Feeds ── */}
      <div className={styles.chartsRow} style={{ alignItems: 'flex-start', gap: '24px' }}>

        {/* LEFT COLUMN: PUBLISH ANNOUNCEMENT FORM */}
        <div className={styles.chartContainer} style={{ flex: 1 }}>
          <div className={styles.formHeaderContainer}>
            <h3 className={styles.formHeaderTitle}>
              <span className={styles.formHeaderIcon}></span> Publish Announcement
            </h3>
          </div>

          <form onSubmit={handlePublish} className={styles.announcementForm}>
            {formSuccess && (
              <div className={`${styles.alertBox} ${styles.alertBoxSuccess}`}>
                <span>✓</span> {formSuccess}
              </div>
            )}
            {formError && (
              <div className={`${styles.alertBox} ${styles.alertBoxError}`}>
                <span>⚠️</span> {formError}
              </div>
            )}

            <div className={styles.inputGroup}>
              <label htmlFor="announcementTitle">Announcement Title *</label>
              <input
                type="text"
                id="announcementTitle"
                placeholder="e.g., Office Maintenance Scheduled"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="announcementDesc">Description / Details *</label>
              <textarea
                id="announcementDesc"
                placeholder="Type details of the announcement here..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div className={styles.inputGroupGrid}>
              <div className={styles.inputGroup}>
                <label htmlFor="announcementCategory">Category</label>
                <select
                  id="announcementCategory"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="General">General</option>
                  <option value="IT Notice">IT Notice</option>
                  <option value="HR Notice">HR Notice</option>
                  <option value="Policy Update">Policy Update</option>
                  <option value="Event Alert">Event Alert</option>
                </select>
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="announcementPriority">Priority</label>
                <select
                  id="announcementPriority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="announcementTarget">Target Audience *</label>
              <select
                id="announcementTarget"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
              >
                <option value="all">All (Everyone)</option>
                <option value="hr">Only HR Manager Profiles</option>
                <option value="employee">Only Employees</option>
                <option value="group">Specific Department / Group</option>
                <option value="individual">Individual Recipient</option>
              </select>
            </div>

            {/* Contextual Target Selections */}
            {targetAudience === 'group' && (
              <div className={styles.inputGroup}>
                <label htmlFor="announcementTargetGroup">Target Department *</label>
                <select
                  id="announcementTargetGroup"
                  value={targetGroup}
                  onChange={(e) => setTargetGroup(e.target.value)}
                >
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                  {departments.length === 0 && <option value="">No departments available</option>}
                </select>
              </div>
            )}

            {targetAudience === 'individual' && (
              <div className={styles.inputGroup}>
                <label htmlFor="announcementTargetRecipient">Target Employee *</label>
                <select
                  id="announcementTargetRecipient"
                  value={targetRecipient}
                  onChange={(e) => setTargetRecipient(e.target.value)}
                >
                  {users.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.name} - {u.email} ({u.role})
                    </option>
                  ))}
                  {users.length === 0 && <option value="">No users available</option>}
                </select>
              </div>
            )}

            <button
              type="submit"
              className={styles.broadcastButton}
              disabled={submitting}
            >
              {submitting ? 'Publishing & Broadcasting...' : 'Broadcast Announcement'}
            </button>
          </form>
        </div>

        {/* RIGHT COLUMN: ACTIVE ANNOUNCEMENTS LIST */}
        <div className={styles.chartContainer} style={{ flex: 1.5 }}>
          <div className={styles.announcementFeedHeader}>
            <h3 className={styles.announcementFeedTitle}>
              Active Announcements Feed
            </h3>
          </div>

          <div className={styles.activityStream} style={{ padding: 0, border: 'none', boxShadow: 'none', marginTop: '14px', width: '100%' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                Loading corporate feeds...
              </div>
            ) : announcements.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#64748b', fontStyle: 'italic' }}>
                No active announcements published. Use the editor to broadcast your first update!
              </div>
            ) : (
              <table className={styles.activityTable} style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th>ANNOUNCEMENT</th>
                    <th>CATEGORY</th>
                    <th>TARGET</th>
                    <th>DATE</th>
                    <th style={{ textAlign: 'center' }}>PRIORITY</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedAnnouncements.map((item) => (
                    <tr key={item._id}>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <strong>{item.title}</strong>
                          <span style={{ fontSize: '0.8rem', color: '#64748b', whiteSpace: 'pre-line' }}>{item.description}</span>
                          <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontStyle: 'italic' }}>By: {item.sender?.name || 'System'}</span>
                        </div>
                      </td>
                      <td style={{ color: '#475569' }}>
                        <span className={styles.pillPaidBadge} style={{ border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', color: '#475569', fontWeight: '600' }}>
                          {item.category}
                        </span>
                      </td>
                      <td style={{ color: '#475569', fontSize: '0.85rem' }}>
                        <span style={{ textTransform: 'capitalize', fontWeight: '600' }}>{item.targetAudience}</span>
                        {item.targetAudience === 'group' && <span style={{ color: '#6366f1' }}> ({item.targetGroup})</span>}
                        {item.targetAudience === 'individual' && <span style={{ color: '#059669' }}> ({item.targetRecipient?.name})</span>}
                      </td>
                      <td style={{ color: '#64748b', fontSize: '0.85rem' }}>{formatDate(item.createdAt)}</td>
                      <td style={{ textAlign: 'center' }}>
                        <span
                          className={`${styles.notificationPriorityBadge} ${getPriorityClass(item.priority)}`}
                          style={{ display: 'inline-block', minWidth: '70px', textAlign: 'center', padding: '3px 8px', borderRadius: '6px' }}
                        >
                          {item.priority}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {announcements.length > 5 && (
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => setShowAll(!showAll)}
                  className={styles.secondaryTableButton}
                  style={{ padding: '8px 24px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}
                >
                  {showAll ? 'Show Recent 5 Only' : `See All Announcements (${announcements.length})`}
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AnnouncementsView;