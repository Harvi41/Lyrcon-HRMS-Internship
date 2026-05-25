// EmployeesView.jsx
import React, { useState } from 'react';
import styles from '../AdminDashboardLayout.module.css';
import EmployeeModal from './EmployeeModal';
import EmployeeSuccessModal from './EmployeeSuccessModal';
import DeleteEmployeeWizard from './DeleteEmployeeWizard';

const EmployeesView = ({ initialEmployees = [] }) => {
  // 1. DYNAMIC DATA SOURCE STATE ARRAY (Core Workforce Matrix)
  const [employeeDataList, setEmployeeDataList] = useState(
    initialEmployees && initialEmployees.length > 0
      ? initialEmployees
      : [
          { id: 'EMP-1001', name: 'Prince Ghevariya', email: 'prince@company.com', dept: 'Engineering', role: 'Lead Systems Architect', status: 'Active' },
          { id: 'EMP-1042', name: 'Nidhish Zala', email: 'nidhish@company.com', dept: 'Engineering', role: 'Software Dev Intern', status: 'Onboarding' },
          { id: 'EMP-1002', name: 'Sarah Jenkins', email: 'sarah@company.com', dept: 'Human Resources', role: 'HR Lead Coordinator', status: 'Active' }
        ]
  );

  const [searchQuery, setSearchQuery] = useState('');

  // 2. DIALOGS AND WIZARDS DISPLAY TOGGLE CONTROL STATES
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
 
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successEmployee, setSuccessEmployee] = useState(null);

  const [isDeleteWizardOpen, setIsDeleteWizardOpen] = useState(false);
  const [selectedEmployeeForDelete, setSelectedEmployeeForDelete] = useState(null);

  // 3. ACTION INTERACTION PIPELINES
  const handleCreateClick = () => {
    setModalMode('create');
    setSelectedEmployee(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (employee) => {
    setModalMode('edit');
    setSelectedEmployee(employee);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedEmployee(null);
  };

  const handleModalSuccess = (data, mode) => {
    setIsModalOpen(false);
    if (mode === 'create') {
      setEmployeeDataList([...employeeDataList, data]);
    } else {
      setEmployeeDataList(employeeDataList.map(emp => emp.id === data.id ? { ...emp, ...data } : emp));
    }
    setSuccessEmployee(data);
    setIsSuccessModalOpen(true);
  };

  const handleSuccessClose = () => {
    setIsSuccessModalOpen(false);
    setSuccessEmployee(null);
  };

  const handleDeleteClick = (employee) => {
    setSelectedEmployeeForDelete(employee);
    setIsDeleteWizardOpen(true);
  };

  const handleConfirmPurgeMutation = (id) => {
    setEmployeeDataList((prevList) => prevList.filter((emp) => emp.id !== id));
    setIsDeleteWizardOpen(false);
  };

  // Filter Engine Array Matrix
  const filteredEmployees = employeeDataList.filter((emp) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;

    return (
      emp.id.toLowerCase().includes(query) ||
      emp.name.toLowerCase().includes(query) ||
      emp.email.toLowerCase().includes(query) ||
      emp.dept.toLowerCase().includes(query) ||
      emp.role.toLowerCase().includes(query)
    );
  });

  return (
    <div className={styles.dashboardGrid}>
     
      {/* ── Metrics Summary Row ── */}
      <div className={styles.metricsRow}>
        <div className={styles.metricCard}>
          <h3>TOTAL ACTIVE PROFILES</h3>
          <div className={styles.metricValueWrapper}>
            <span className={styles.metricValue}>142 Staff</span>
          </div>
        </div>
        <div className={styles.metricCard}>
          <h3>NEW JOINEES (THIS MONTH)</h3>
          <div className={styles.metricValueWrapper}>
            <span className={styles.metricValue} style={{ color: '#16a34a' }}>+6 Interns</span>
          </div>
        </div>
        <div className={styles.metricCard}>
          <h3>AVG NET CTC (MONTHLY)</h3>
          <div className={styles.metricValueWrapper}>
            <span className={styles.metricValue} style={{ color: '#6366f1' }}>₹82,400.00</span>
          </div>
        </div>
      </div>

      {/* ── Quarterly Hiring Velocity Insights Progress Panel ── */}
      <div className={styles.chartContainer}>
        <h3>Quarterly Hiring Velocity Insight</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '10px 0' }}>
         
          {/* Q1 Growth Tracker Row */}
          <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            <div style={{ width: '120px', fontSize: '0.88rem', fontWeight: '500', color: '#1e293b', lineHeight: '1.2' }}>
              Q1 Growth <br />Matrix
            </div>
            <div className={styles.progressBarContainer} style={{ flex: 1, margin: '0 24px', background: '#f1f5f9', height: '12px' }}>
              <div className={styles.progressBarFill} style={{ width: '77%', backgroundColor: '#635bff', height: '100%' }} />
            </div>
            <div style={{ width: '65px', textAlign: 'right', fontSize: '0.85rem', fontWeight: '700', color: '#0f172a' }}>
              77% <span style={{ display: 'block', fontSize: '0.72rem', color: '#64748b', fontWeight: '500' }}>Target</span>
            </div>
          </div>

          {/* Q2 Active Pipeline Tracker Row */}
          <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            <div style={{ width: '120px', fontSize: '0.88rem', fontWeight: '500', color: '#1e293b', lineHeight: '1.2' }}>
              Q2 Active <br />Pipeline
            </div>
            <div className={styles.progressBarContainer} style={{ flex: 1, margin: '0 24px', background: '#f1f5f9', height: '12px' }}>
              <div className={styles.progressBarFill} style={{ width: '30%', backgroundColor: '#635bff', height: '100%' }} />
            </div>
            <div style={{ width: '65px', textAlign: 'right', fontSize: '0.85rem', fontWeight: '700', color: '#0f172a' }}>
              30% <span style={{ block: 'block', fontSize: '0.72rem', color: '#64748b', fontWeight: '500' }}>Target</span>
            </div>
          </div>

        </div>
      </div>

      {/* ── Database Filtering Bar and Sync Action Button ── */}
      <div className={styles.actionFilterBar} style={{ margin: '16px 0 0 0' }}>
        <input
          type="text"
          placeholder="Filter by name, id or keyword..."
          className={styles.filterInput}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button
          className={styles.primaryActionButton}
          onClick={handleCreateClick}
          style={{ padding: '10px 24px', borderRadius: '8px', background: '#4f46e5', fontWeight: '600', fontSize: '0.88rem' }}
        >
          + Create Employee
        </button>
      </div>

      {/* ── Core Directory Ledger Layout Table Grid ── */}
      <div className={styles.activityStream}>
        <table className={styles.activityTable}>
          <thead>
            <tr>
              <th style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: '600' }}>EMPLOYEE ID</th>
              <th style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: '600' }}>NAME / EMAIL</th>
              <th style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: '600' }}>DEPARTMENT</th>
              <th style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: '600' }}>DESIGNATION</th>
              <th style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: '600' }}>STATUS</th>
              <th style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: '600', width: '110px' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.length === 0 ? (
              <tr>
                <td colSpan="6" className={styles.emptyState}>
                  No workforce directory profiles match your input filter: "{searchQuery}"
                </td>
              </tr>
            ) : (
              filteredEmployees.map((emp) => (
                <tr key={emp.id}>
                  <td><strong style={{ color: '#0f172a', fontWeight: '700' }}>{emp.id}</strong></td>
                  <td>
                    {/* FIXED: Applied layout vertical line gap to space out text nodes */}
                    <div className={styles.userColumnCell} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <strong className={styles.employeeNameLink} style={{ color: '#0f172a', fontWeight: '700' }}>{emp.name}</strong>
                      <span className={styles.subTextEmail} style={{ color: '#64748b', fontSize: '0.8rem' }}>{emp.email}</span>
                    </div>
                  </td>
                  <td style={{ color: '#475569', fontWeight: '500' }}>{emp.dept}</td>
                  <td style={{ color: '#475569', fontWeight: '500' }}>{emp.role}</td>
                  <td>
                    <span
                      className={`${styles.statusLabel} ${emp.status === 'Active' ? styles.badgeActive : styles.statusOnboard}`}
                      style={{
                        display: 'inline-block',
                        minWidth: '95px',
                        textAlign: 'center',
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontWeight: '600',
                        fontSize: '0.8rem'
                      }}
                    >
                      {emp.status}
                    </span>
                  </td>
                  <td>
                    {/* ONLY CHANGED: Standardized edit and delete triggers with explicit 14px gap rules */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <button 
                        type="button"
                        onClick={() => handleEditClick(emp)} 
                        title="Edit Profile"
                        style={{ padding: '4px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center' }}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                      </button>
                      <button 
                        type="button"
                        onClick={() => handleDeleteClick(emp)} 
                        title="Delete Profile"
                        style={{ padding: '4px', background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', display: 'flex', alignItems: 'center' }}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Dialog Context Mount Hidden Hooks */}
      <EmployeeModal isOpen={isModalOpen} onClose={handleModalClose} onSuccess={handleModalSuccess} employeeData={selectedEmployee} mode={modalMode} />
      <EmployeeSuccessModal isOpen={isSuccessModalOpen} onClose={handleSuccessClose} employeeData={successEmployee} mode={modalMode} />
      <DeleteEmployeeWizard isOpen={isDeleteWizardOpen} employee={selectedEmployeeForDelete} onClose={() => setIsDeleteWizardOpen(false)} onConfirmPurge={handleConfirmPurgeMutation} />
    </div>
  );
};

export default EmployeesView;