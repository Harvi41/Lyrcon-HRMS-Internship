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

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. STATE-BOUND EXACT METRICS CALCULATIONS ENGINE
  // ═══════════════════════════════════════════════════════════════════════════
  const baselineTotalActive = 77;
  const baselineInterns = 6;
  const baselineRemote = 55;
  const baselineOnLeave = 30;

  // Reacts smoothly to insertions or deletions relative to mock base dataset length (3)
  const dynamicActiveCount = baselineTotalActive + (employeeDataList.length - 3);

  // 3. DIALOGS AND WIZARDS DISPLAY TOGGLE CONTROL STATES
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successEmployee, setSuccessEmployee] = useState(null);

  const [isDeleteWizardOpen, setIsDeleteWizardOpen] = useState(false);
  const [selectedEmployeeForDelete, setSelectedEmployeeForDelete] = useState(null);

  // 4. ACTION INTERACTION PIPELINES
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
      {/* Metrics Summary Row */}
      <div className={styles.metricsRow}>
        <div className={styles.metricCard}>
          <h3>TOTAL ACTIVE PROFILES</h3>
          <div className={styles.metricValueWrapper}>
            <span className={styles.metricValue}>{dynamicActiveCount}</span>
          </div>
        </div>
        <div className={styles.metricCard}>
          <h3>NEW JOINEES (THIS MONTH)</h3>
          <div className={styles.metricValueWrapper}>
            <span className={`${styles.metricValue} ${styles.textGreen}`}>+{baselineInterns} Interns</span>
          </div>
        </div>
        <div className={styles.metricCard}>
          <h3>REMOTE EMPLOYEES</h3>
          <div className={styles.metricValueWrapper}>
            <span className={`${styles.metricValue} ${styles.textPurpleInline}`}>{baselineRemote}</span>
          </div>
        </div>
      </div>

      {/* Employee Status Summary Progress Panel */}
      <div className={styles.chartContainer}>
        <h3>Employee Status Summary</h3>
        <div className={styles.statusSummaryContainer}>
          <div className={styles.statusMetricRow}>
            <span className={styles.statusLabelName}>Active</span>
            <div className={styles.progressBarContainer}>
              <div className={styles.progressBarFill} style={{ width: '100%', backgroundColor: '#6366f1' }}></div>
            </div>
            <strong className={styles.statusCountValue}>{dynamicActiveCount}</strong>
          </div>
          <div className={styles.statusMetricRow}>
            <span className={styles.statusLabelName}>On Leave</span>
            <div className={styles.progressBarContainer}>
              <div className={styles.progressBarFill} style={{ width: '40%', backgroundColor: '#6366f1' }}></div>
            </div>
            <strong className={styles.statusCountValue}>{baselineOnLeave}</strong>
          </div>
          <div className={styles.statusMetricRow}>
            <span className={styles.statusLabelName}>Remote</span>
            <div className={styles.progressBarContainer}>
              <div className={styles.progressBarFill} style={{ width: '68%', backgroundColor: '#6366f1' }}></div>
            </div>
            <strong className={styles.statusCountValue}>{baselineRemote}</strong>
          </div>
        </div>
      </div>

      {/* Database Filtering Bar and Action Button */}
      <div className={styles.actionFilterBar}>
        <input 
          type="text" 
          placeholder="Filter by name or keyword..." 
          className={styles.filterInput} 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button className={styles.primaryActionButton} onClick={handleCreateClick}>+ Add Employee</button>
      </div>

      {/* Core Directory Ledger Layout Table Grid */}
      <div className={styles.activityStream}>
        <table className={styles.activityTable}>
          <thead>
            <tr>
              <th>EMPLOYEE ID</th>
              <th>NAME / EMAIL</th>
              <th>DEPARTMENT</th>
              <th>DESIGNATION</th>
              <th>STATUS</th>
              <th>ACTIONS</th>
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
                  <td><strong>{emp.id}</strong></td>
                  <td>
                    <div className={styles.userColumnCell}>
                      <strong className={styles.employeeNameLink}>{emp.name}</strong>
                      <span className={styles.subTextEmail}>{emp.email}</span>
                    </div>
                  </td>
                  <td>{emp.dept}</td>
                  <td>{emp.role}</td>
                  <td>
                    <span className={`${styles.statusPillBadge} ${emp.status === 'Active' ? styles.badgeActive : styles.badgeOnboarding}`}>
                      {emp.status}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actionsFlexContainer}>
                      <button className={styles.actionButtonIcon} onClick={() => handleEditClick(emp)} title="Edit Profile">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                      </button>
                      <button className={`${styles.actionButtonIcon} ${styles.colorRed}`} onClick={() => handleDeleteClick(emp)} title="Delete Profile">
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