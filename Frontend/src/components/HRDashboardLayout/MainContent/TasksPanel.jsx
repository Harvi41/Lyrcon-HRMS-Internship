import React, { useState, useEffect } from 'react';
import styles from '../HRDashboardLayout.module.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function TasksPanel({ userRole = 'hr' }) {
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedTo: '',
    priority: 'normal',
    deadline: ''
  });

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const token = window.localStorage.getItem('corehr_token');
      const response = await fetch(`${API_BASE_URL}/api/tasks`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to load company tasks matrix');
      const data = await response.json();
      setTasks(data || []);
    } catch (err) {
      console.error("Failed to load tasks:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const token = window.localStorage.getItem('corehr_token');
      const response = await fetch(`${API_BASE_URL}/api/employees`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setEmployees(data || []);
      }
    } catch (err) {
      console.error("Failed to fetch employees list for task dropdown:", err);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchEmployees();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleOpenAssignModal = () => {
    setFormData({
      title: '',
      description: '',
      assignedTo: '',
      priority: 'normal',
      deadline: ''
    });
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleAssignTask = async (e) => {
    e.preventDefault();
    if (!formData.assignedTo) {
      setErrorMsg('Please select an employee to assign this task.');
      return;
    }

    setModalLoading(true);
    setErrorMsg('');
    try {
      const token = window.localStorage.getItem('corehr_token');
      const response = await fetch(`${API_BASE_URL}/api/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to assign task');

      setIsModalOpen(false);
      fetchTasks();
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message);
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      const token = window.localStorage.getItem('corehr_token');
      const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete task');
      }

      fetchTasks();
    } catch (err) {
      alert(err.message);
    }
  };

  // Filter Tasks
  const filteredTasks = tasks.filter(task => {
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = !query || 
      task.title?.toLowerCase().includes(query) ||
      task.description?.toLowerCase().includes(query) ||
      `${task.assignedTo?.firstName} ${task.assignedTo?.lastName}`.toLowerCase().includes(query);

    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div className={styles.dashboardGrid}>
      
      {/* ── Top Analytical Task Metrics Row ── */}
      <div className={styles.metricsRow} style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className={styles.metricCard} style={{ borderLeft: '4px solid #6366f1' }}>
          <h3>TOTAL ASSIGNED TASKS</h3>
          <div className={styles.metricValueWrapper}>
            <span className={styles.metricValue}>{tasks.length}</span>
          </div>
        </div>
        <div className={styles.metricCard} style={{ borderLeft: '4px solid #eab308' }}>
          <h3>PENDING</h3>
          <div className={styles.metricValueWrapper}>
            <span className={styles.metricValue} style={{ color: '#eab308' }}>
              {tasks.filter(t => t.status === 'pending').length}
            </span>
          </div>
        </div>
        <div className={styles.metricCard} style={{ borderLeft: '4px solid #3b82f6' }}>
          <h3>IN PROGRESS</h3>
          <div className={styles.metricValueWrapper}>
            <span className={styles.metricValue} style={{ color: '#3b82f6' }}>
              {tasks.filter(t => t.status === 'in-progress').length}
            </span>
          </div>
        </div>
        <div className={styles.metricCard} style={{ borderLeft: '4px solid #22c55e' }}>
          <h3>COMPLETED</h3>
          <div className={styles.metricValueWrapper}>
            <span className={styles.metricValue} style={{ color: '#22c55e' }}>
              {tasks.filter(t => t.status === 'completed').length}
            </span>
          </div>
        </div>
      </div>

      {/* ── Action and Filters Toolbar ── */}
      <div className={styles.actionFilterBar} style={{ margin: '12px 0 0 0', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <input 
          type="text" 
          placeholder="Search by title, description or employee..." 
          className={styles.filterInput}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ flex: 1, minWidth: '240px' }}
        />
        
        <select 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)} 
          className={styles.filterInput}
          style={{ width: '150px' }}
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>

        <select 
          value={priorityFilter} 
          onChange={(e) => setPriorityFilter(e.target.value)} 
          className={styles.filterInput}
          style={{ width: '150px' }}
        >
          <option value="all">All Priorities</option>
          <option value="urgent">Urgent</option>
          <option value="important">Important</option>
          <option value="normal">Normal</option>
        </select>

        <button type="button" className={styles.primaryActionButton} onClick={handleOpenAssignModal}>
          + Assign Task
        </button>
      </div>

      {/* ── Main Data Inventory Grid Table ── */}
      <div className={styles.activityStream}>
        <table className={styles.activityTable}>
          <thead>
            <tr>
              <th style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: '600' }}>TASK TITLE</th>
              <th style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: '600' }}>ASSIGNED TO</th>
              <th style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: '600' }}>DEADLINE</th>
              <th style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: '600' }}>PRIORITY</th>
              <th style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: '600' }}>STATUS</th>
              <th style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: '600' }}>WORK NOTES / COMMENTS</th>
              <th style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: '600', width: '80px' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '24px' }}>Loading tasks...</td></tr>
            ) : filteredTasks.length === 0 ? (
              <tr>
                <td colSpan="7" className={styles.emptyState} style={{ padding: '24px', textAlign: 'center' }}>
                  No tasks matches the filter criteria.
                </td>
              </tr>
            ) : (
              filteredTasks.map((task) => (
                <tr key={task._id}>
                  <td>
                    <strong style={{ color: '#0f172a', fontWeight: '700' }}>{task.title}</strong>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>{task.description}</div>
                  </td>
                  <td style={{ color: '#0f172a', fontWeight: '600' }}>
                    {task.assignedTo ? `${task.assignedTo.firstName} ${task.assignedTo.lastName}` : 'Unassigned'}
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>{task.assignedTo?.employeeCode}</div>
                  </td>
                  <td style={{ color: '#ef4444', fontWeight: '600' }}>
                    {new Date(task.deadline).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td>
                    <span 
                      className={`${styles.priorityBadge} ${styles['priority' + (task.priority?.charAt(0).toUpperCase() + task.priority?.slice(1)) || 'Normal']}`}
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
                    {task.comments || <span style={{ color: '#94a3b8' }}>No work notes provided yet</span>}
                  </td>
                  <td>
                    <button 
                      type="button" 
                      className={styles.iconicTableActionButton} 
                      onClick={() => handleDeleteTask(task._id)} 
                      title="Scrub/Delete Task" 
                      style={{ color: '#dc2626', padding: '4px', background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Assign Task Form Modal ── */}
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContentWide} style={{ maxWidth: '600px', backgroundColor: '#ffffff', borderRadius: '12px', overflow: 'hidden' }}>
            <div className={styles.modalHeader}>
              <h2>Assign New Task</h2>
              <button type="button" className={styles.closeButton} onClick={() => setIsModalOpen(false)}>&times;</button>
            </div>
            
            <form onSubmit={handleAssignTask} className={styles.modalScrollForm} style={{ padding: '24px' }}>
              {errorMsg && (
                <div style={{
                  backgroundColor: '#fee2e2',
                  border: '1px solid #fca5a5',
                  color: '#b91c1c',
                  padding: '12px',
                  borderRadius: '6px',
                  marginBottom: '16px',
                  fontSize: '0.88rem'
                }}>
                  {errorMsg}
                </div>
              )}

              <div className={styles.modalFieldGroup} style={{ marginBottom: '16px' }}>
                <label style={{ fontWeight: '600', display: 'block', marginBottom: '6px' }}>Task Title</label>
                <input 
                  required 
                  type="text" 
                  name="title" 
                  placeholder="e.g., Finalize Monthly Financial Reconciliation"
                  value={formData.title} 
                  onChange={handleInputChange} 
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div className={styles.modalFieldGroup} style={{ marginBottom: '16px' }}>
                <label style={{ fontWeight: '600', display: 'block', marginBottom: '6px' }}>Description</label>
                <textarea 
                  name="description" 
                  placeholder="Provide scope guidelines, documents reference etc."
                  value={formData.description} 
                  onChange={handleInputChange} 
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', minHeight: '80px', fontFamily: 'inherit' }}
                />
              </div>

              <div className={styles.modalFormGridTwo} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div className={styles.modalFieldGroup}>
                  <label style={{ fontWeight: '600', display: 'block', marginBottom: '6px' }}>Priority Level</label>
                  <select 
                    name="priority" 
                    value={formData.priority} 
                    onChange={handleInputChange}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#fff' }}
                  >
                    <option value="normal">Normal</option>
                    <option value="important">Important</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div className={styles.modalFieldGroup}>
                  <label style={{ fontWeight: '600', display: 'block', marginBottom: '6px' }}>Deadline Date</label>
                  <input 
                    required
                    type="date" 
                    name="deadline" 
                    value={formData.deadline} 
                    onChange={handleInputChange} 
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div className={styles.modalFieldGroup} style={{ marginBottom: '24px' }}>
                <label style={{ fontWeight: '600', display: 'block', marginBottom: '6px' }}>Assign To Employee</label>
                <select 
                  name="assignedTo" 
                  value={formData.assignedTo} 
                  onChange={handleInputChange}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#fff' }}
                >
                  <option value="">-- Choose Employee --</option>
                  {employees.map(emp => {
                    const fullName = `${emp.firstName} ${emp.lastName}`;
                    return (
                      <option key={emp._id} value={emp._id}>
                        {fullName} ({emp.employeeCode})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className={styles.modalActionButtons} style={{ padding: '12px 0 0 0', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" className={styles.btnCancel} onClick={() => setIsModalOpen(false)} disabled={modalLoading}>Cancel</button>
                <button type="submit" className={styles.btnSubmit} disabled={modalLoading}>
                  {modalLoading ? 'Assigning...' : 'Assign Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
