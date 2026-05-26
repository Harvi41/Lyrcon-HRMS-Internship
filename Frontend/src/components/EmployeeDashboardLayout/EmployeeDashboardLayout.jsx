import React, { useState, useEffect } from 'react';
import styles from './EmployeeDashboardLayout.module.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function EmployeeDashboardLayout({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [tasks, setTasks] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);

  // Completion Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [comments, setComments] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const userName = user?.name || 'Employee';
  const avatarLetter = (userName.trim()[0] || 'E').toUpperCase();

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const token = window.localStorage.getItem('corehr_token');
      const response = await fetch(`${API_BASE_URL}/api/tasks`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setTasks(data || []);
      }
    } catch (err) {
      console.error("Failed to load employee tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const token = window.localStorage.getItem('corehr_token');
      const response = await fetch(`${API_BASE_URL}/api/announcements`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setAnnouncements(data || []);
      }
    } catch (err) {
      console.error("Failed to load announcements:", err);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchAnnouncements();
  }, []);

  const handleStartTask = async (taskId) => {
    try {
      const token = window.localStorage.getItem('corehr_token');
      const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'in-progress' })
      });

      if (!response.ok) throw new Error('Failed to update task state');
      fetchTasks();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleOpenCompleteModal = (task) => {
    setSelectedTask(task);
    setComments('');
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleCompleteTask = async (e) => {
    e.preventDefault();
    if (!selectedTask) return;

    setModalLoading(true);
    setErrorMsg('');
    try {
      const token = window.localStorage.getItem('corehr_token');
      const response = await fetch(`${API_BASE_URL}/api/tasks/${selectedTask._id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'completed', comments })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to submit task status');
      }

      setIsModalOpen(false);
      fetchTasks();
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message);
    } finally {
      setModalLoading(false);
    }
  };

  const pendingCount = tasks.filter(t => t.status === 'pending').length;
  const inProgressCount = tasks.filter(t => t.status === 'in-progress').length;
  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const urgentTasks = tasks.filter(t => t.status !== 'completed' && t.priority === 'urgent');

  const menuItems = [
    { label: 'My Dashboard', id: 'dashboard' },
    { label: 'My Tasks Checklist', id: 'tasks' },
    { label: 'Company Announcements', id: 'announcements' }
  ];

  return (
    <div className={styles.layoutContainer}>
      
      {/* ── Left Sidebar Navigation ── */}
      <nav className={styles.sidebar}>
        <div className={styles.logoContainer}>
          <div className={styles.logoIcon}>E</div>
          <span className={styles.logoText}>Employee Hub</span>
        </div>

        <div className={styles.menuSection}>
          <h2 className={styles.menuTitle}>MAIN PANEL</h2>
          <ul className={styles.menuList}>
            {menuItems.map((item) => {
              const isActive = item.id === activeTab;
              return (
                <li key={item.id} className={`${styles.menuItem} ${isActive ? styles.activeMenuItem : ''}`}>
                  <button type="button" onClick={() => setActiveTab(item.id)} className={styles.sidebarMenuButton}>
                    {item.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      {/* ── Right Content Area ── */}
      <div className={styles.mainWrapper}>
        <header className={styles.topHeader}>
          <div className={styles.pageTitle}>
            {activeTab === 'dashboard' ? 'My Performance & Tasks Overview' : 
             activeTab === 'tasks' ? 'Assigned Task Worklist' : 'Announcements Board'}
          </div>
          <div className={styles.userInfo}>
            <div className={styles.userAvatar}>{avatarLetter}</div>
            <div className={styles.userName}>{userName}</div>
            <button type="button" className={styles.logoutButton} onClick={onLogout}>
              Logout
            </button>
          </div>
        </header>

        <main className={styles.contentArea}>
          {activeTab === 'dashboard' && (
            <div className={styles.dashboardGrid}>
              
              {/* Urgent Task Alert Broadcast Banner */}
              {urgentTasks.length > 0 && (
                <div style={{
                  backgroundColor: '#fee2e2',
                  border: '1px solid #fca5a5',
                  borderRadius: '12px',
                  padding: '16px 20px',
                  color: '#b91c1c',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
                }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: '#dc2626',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '700'
                  }}>!</div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '700' }}>Attention Required!</h4>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#7f1d1d' }}>
                      You have {urgentTasks.length} pending urgent task(s) that require immediate focus and action.
                    </p>
                  </div>
                </div>
              )}

              {/* Task Counters Dashboard Row */}
              <div className={styles.metricsRow}>
                <div className={styles.metricCard} style={{ borderLeft: '4px solid #6366f1' }}>
                  <h3>TOTAL TASKS ASSIGNED</h3>
                  <div className={styles.metricValueWrapper}>
                    <span className={styles.metricValue}>{tasks.length}</span>
                  </div>
                </div>
                <div className={styles.metricCard} style={{ borderLeft: '4px solid #eab308' }}>
                  <h3>PENDING</h3>
                  <div className={styles.metricValueWrapper}>
                    <span className={styles.metricValue} style={{ color: '#eab308' }}>{pendingCount}</span>
                  </div>
                </div>
                <div className={styles.metricCard} style={{ borderLeft: '4px solid #3b82f6' }}>
                  <h3>IN PROGRESS</h3>
                  <div className={styles.metricValueWrapper}>
                    <span className={styles.metricValue} style={{ color: '#3b82f6' }}>{inProgressCount}</span>
                  </div>
                </div>
                <div className={styles.metricCard} style={{ borderLeft: '4px solid #22c55e' }}>
                  <h3>COMPLETED</h3>
                  <div className={styles.metricValueWrapper}>
                    <span className={styles.metricValue} style={{ color: '#22c55e' }}>{completedCount}</span>
                  </div>
                </div>
              </div>

              {/* Action checklist preview */}
              <div className={styles.activityStream}>
                <h3>Immediate Priority Worklist</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {tasks.filter(t => t.status !== 'completed').slice(0, 3).length === 0 ? (
                    <div style={{ padding: '24px', textAlign: 'center', color: '#64748b', fontStyle: 'italic' }}>
                      🎉 Excellent! You have no outstanding tasks!
                    </div>
                  ) : (
                    tasks.filter(t => t.status !== 'completed').slice(0, 3).map(task => (
                      <div key={task._id} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '16px',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        backgroundColor: '#f8fafc'
                      }}>
                        <div>
                          <strong style={{ color: '#0f172a' }}>{task.title}</strong>
                          <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>
                            Deadline: {new Date(task.deadline).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} | Priority: {task.priority}
                          </div>
                        </div>
                        <div>
                          {task.status === 'pending' ? (
                            <button type="button" className={styles.startTaskBtn} onClick={() => handleStartTask(task._id)}>
                              Start Task
                            </button>
                          ) : (
                            <button type="button" className={styles.completeTaskBtn} onClick={() => handleOpenCompleteModal(task)}>
                              Complete Task
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tasks' && (
            <div className={styles.activityStream}>
              <h3>My Assigned Tasks Matrix</h3>
              <table className={styles.activityTable}>
                <thead>
                  <tr>
                    <th>TASK DESCRIPTION</th>
                    <th>DEADLINE</th>
                    <th>PRIORITY</th>
                    <th>STATUS</th>
                    <th>COMPLETION SUMMARY / WORK NOTES</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="6" style={{ textAlign: 'center', padding: '24px' }}>Loading task records...</td></tr>
                  ) : tasks.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                        No tasks have been assigned to your workspace profile yet.
                      </td>
                    </tr>
                  ) : (
                    tasks.map((task) => (
                      <tr key={task._id}>
                        <td>
                          <strong style={{ color: '#0f172a', fontWeight: '700' }}>{task.title}</strong>
                          <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>{task.description}</div>
                        </td>
                        <td style={{ color: '#ef4444', fontWeight: '600' }}>
                          {new Date(task.deadline).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                        <td>
                          <span 
                            className={styles.statusPillBadge}
                            style={{
                              backgroundColor: task.priority === 'urgent' ? '#fee2e2' : task.priority === 'important' ? '#ffedd5' : '#f1f5f9',
                              color: task.priority === 'urgent' ? '#dc2626' : task.priority === 'important' ? '#ea580c' : '#475569',
                              border: '1px solid',
                              borderColor: task.priority === 'urgent' ? '#fca5a5' : task.priority === 'important' ? '#fed7aa' : '#cbd5e1'
                            }}
                          >
                            {task.priority?.toUpperCase()}
                          </span>
                        </td>
                        <td>
                          <span 
                            className={`${styles.statusLabel} ${styles.statusPillBadge}`}
                            style={{
                              backgroundColor: task.status === 'completed' ? '#dcfce7' : task.status === 'in-progress' ? '#dbeafe' : '#fef9c3',
                              color: task.status === 'completed' ? '#15803d' : task.status === 'in-progress' ? '#1d4ed8' : '#a16207',
                              border: '1px solid',
                              borderColor: task.status === 'completed' ? '#bbf7d0' : task.status === 'in-progress' ? '#bfdbfe' : '#fef08a'
                            }}
                          >
                            {task.status === 'in-progress' ? 'In Progress' : task.status?.toUpperCase()}
                          </span>
                        </td>
                        <td style={{ fontStyle: 'italic', fontSize: '0.85rem', color: '#475569' }}>
                          {task.comments || <span style={{ color: '#94a3b8' }}>No work notes logged</span>}
                        </td>
                        <td>
                          {task.status === 'pending' && (
                            <button type="button" className={styles.startTaskBtn} onClick={() => handleStartTask(task._id)}>
                              Start Task
                            </button>
                          )}
                          {task.status === 'in-progress' && (
                            <button type="button" className={styles.completeTaskBtn} onClick={() => handleOpenCompleteModal(task)}>
                              Complete Task
                            </button>
                          )}
                          {task.status === 'completed' && (
                            <span style={{ color: '#22c55e', fontWeight: '700', fontSize: '0.85rem' }}>✓ Finished</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'announcements' && (
            <div className={styles.activityStream}>
              <h3>Company Notice Board</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
                {announcements.length === 0 ? (
                  <div style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>
                    No announcements published recently.
                  </div>
                ) : (
                  announcements.map((ann) => (
                    <div key={ann._id} style={{
                      padding: '20px',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      backgroundColor: '#ffffff',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h4 style={{ margin: 0, color: '#1e293b', fontSize: '1rem', fontWeight: '700' }}>{ann.title}</h4>
                        <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                          {new Date(ann.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                      <p style={{ margin: '10px 0 0 0', color: '#475569', fontSize: '0.9rem', lineHeight: '1.5' }}>
                        {ann.content}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ── Complete Task Modal Prompt ── */}
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>Log Task Completion Summary</h2>
              <button type="button" className={styles.closeButton} onClick={() => setIsModalOpen(false)}>&times;</button>
            </div>
            <form onSubmit={handleCompleteTask} className={styles.modalScrollForm}>
              {errorMsg && (
                <div style={{
                  backgroundColor: '#fee2e2',
                  border: '1px solid #fca5a5',
                  color: '#b91c1c',
                  padding: '10px',
                  borderRadius: '6px',
                  marginBottom: '16px',
                  fontSize: '0.85rem'
                }}>
                  {errorMsg}
                </div>
              )}
              
              <div style={{ marginBottom: '16px' }}>
                <strong style={{ display: 'block', marginBottom: '8px', color: '#0f172a' }}>
                  Task: {selectedTask?.title}
                </strong>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
                  Please log any work notes, comments, or references before closing this task.
                </p>
              </div>

              <div className={styles.modalFieldGroup}>
                <label style={{ fontWeight: '600', marginBottom: '6px', fontSize: '0.88rem' }}>Work Notes / Comments</label>
                <textarea 
                  required
                  placeholder="Summarize key outputs, files location, or completion milestones..."
                  value={comments} 
                  onChange={(e) => setComments(e.target.value)} 
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    minHeight: '100px',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div className={styles.modalActionButtons}>
                <button type="button" className={styles.btnCancel} onClick={() => setIsModalOpen(false)} disabled={modalLoading}>Cancel</button>
                <button type="submit" className={styles.btnSubmit} disabled={modalLoading}>
                  {modalLoading ? 'Submitting...' : 'Mark Completed'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
