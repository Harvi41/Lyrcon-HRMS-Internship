import React, { useState } from 'react';
import styles from '../HRDashboardLayout.module.css';
import EmployeeModal from './EmployeeModal';
import EmployeeSuccessModal from './EmployeeSuccessModal';
import DeleteEmployeeWizard from './DeleteEmployeeWizard';

const EmployeesView = () => {
  // 1. DYNAMIC DATA SOURCE STATE ARRAY (Core Personnel Matrix)
  const [employeeDataList, setEmployeeDataList] = useState([
const EmployeesView = ({ initialEmployees = [] }) => {
  const [employeeDataList, setEmployeeDataList] = useState(initialEmployees && initialEmployees.length > 0 ? initialEmployees : [
    { id: 'EMP-1001', name: 'Prince Ghevariya', email: 'prince@company.com', dept: 'Engineering', role: 'Lead Systems Architect', status: 'Active' },
    { id: 'EMP-1042', name: 'Nidhish Zala', email: 'nidhish@company.com', dept: 'Engineering', role: 'Software Dev Intern', status: 'Onboarding' },
    { id: 'EMP-1002', name: 'Sarah Jenkins', email: 'sarah@company.com', dept: 'Human Resources', role: 'HR Lead Coordinator', status: 'Active' }
  ]);

  const [searchQuery, setSearchQuery] = useState('');

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. STATE-BOUND ANALYTICAL METRICS CALCULATIONS ENGINE
  // ═══════════════════════════════════════════════════════════════════════════
  const baselineTotalStaff = 142;
  const baselineInternsThisMonth = 6;
  const standardNetCTC = 82400.00;

  // Derives totals reactively relative to insertions or deletions against seed records
  const dynamicTotalStaff = baselineTotalStaff + (employeeDataList.length - 3);
  const totalActiveInterns = baselineInternsThisMonth + (employeeDataList.filter(e => e.role.toLowerCase().includes('intern')).length - 1);

  // Computes progress-bar analytics cleanly using live status fields
  const q1VelocityRatio = Math.min(100, Math.round((dynamicTotalStaff / 185) * 100)); // Fixed targeting capacity at 185 profiles
  const q2PipelineRatio = Math.min(100, Math.round((employeeDataList.filter(e => e.status === 'Onboarding').length / 1) * 30));

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
  };

  // Live Multi-Field Lookahead Filtering Engine Matrix
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
  // update local state when parent provides new employee list
  React.useEffect(() => {
    if (initialEmployees && initialEmployees.length > 0) {
      setEmployeeDataList(initialEmployees);
    }
  }, [initialEmployees]);

  return (
    <div className={styles.dashboardGrid}>
      {/* Dynamic Header Metrics Informational Row */}
      <div className={styles.metricsRow}>
        <div className={styles.metricCard}>
          <h3>TOTAL ACTIVE PROFILES</h3>
          <div className={styles.metricValueWrapper}>
            <span className={styles.metricValue}>{dynamicTotalStaff} Staff</span>
          </div>
        </div>
        <div className={styles.metricCard}>
          <h3>NEW JOINEES (THIS MONTH)</h3>
          <div className={styles.metricValueWrapper}>
            <span className={`${styles.metricValue} ${styles.statusCommitted}`}>+{totalActiveInterns} Interns</span>
          </div>
        </div>
        <div className={styles.metricCard}>
          <h3>AVG NET CTC (MONTHLY)</h3>
          <div className={styles.metricValueWrapper}>
            <span className={`${styles.metricValue} ${styles.timeLink}`}>
              ₹{standardNetCTC.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {/* Dynamic Hiring Goals Target Matrix Progress Bars */}
      <div className={styles.chartContainer}>
        <h3>Quarterly Hiring Velocity Insight</h3>
        <div className={styles.chartPlaceholderVertical}>
          <div className={styles.deptMetricRow}>
            <span>Q1 Growth Matrix</span>
            <div className={styles.progressBarContainer}>
              <div className={styles.progressBarFill} style={{ width: `${q1VelocityRatio}%`, backgroundColor: '#5d55fa', transition: 'width 0.4s ease' }}></div>
            </div>
            <strong>{q1VelocityRatio}% Target</strong>
          </div>
          <div className={styles.deptMetricRow}>
            <span>Q2 Active Pipeline</span>
            <div className={styles.progressBarContainer}>
              <div className={styles.progressBarFill} style={{ width: `${q2PipelineRatio}%`, backgroundColor: '#5d55fa', transition: 'width 0.4s ease' }}></div>
            </div>
            <strong>{q2PipelineRatio}% Target</strong>
          </div>
        </div>
      </div>

      {/* Database Filtering Inputs and Insertion Triggers */}
      <div className={styles.actionFilterBar}>
        <input 
          type="text" 
          placeholder="Filter by name, id or keyword..." 
          className={styles.filterInput} 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button className={styles.primaryActionButton} onClick={handleCreateClick}>+ Create Employee</button>
      </div>

      {/* Main Core Directory Ledger Layout Table Grid */}
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
                <td colSpan="6" className={styles.emptyState} style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>
                  No workforce directory profiles match your input filter: "{searchQuery}"
                </td>
              </tr>
            ) : (
              filteredEmployees.map((emp) => (
                <tr key={emp.id}>
                  <td><strong>{emp.id}</strong></td>
                  <td>
                    <div className={styles.userColumnCell}>
                      <strong>{emp.name}</strong>
                      <span className={styles.subTextEmail}>{emp.email}</span>
                    </div>
                  </td>
                  <td>{emp.dept}</td>
                  <td>{emp.role}</td>
                  <td>
                    <span className={`${styles.statusLabel} ${emp.status === 'Active' ? styles.statusActive : styles.statusOnboard}`}>
                      {emp.status}
                    </span>
                  </td>
                  <td>
                    {/* Action Item: Edit Configuration Form Mount Trigger */}
                    <button 
                      style={{ background: 'none', border: 'none', cursor: 'pointer' }} 
                      onClick={() => handleEditClick(emp)}
                      title="Edit Profile"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                    </button>

                    {/* Action Item: Multi-Step Deletion Pipeline Wizard Trigger */}
                    <button 
                      style={{ background: 'none', border: 'none', cursor: 'pointer', marginLeft: '10px', color: '#e11d48' }}
                      onClick={() => handleDeleteClick(emp)}
                      title="Delete Profile"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                      </svg>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Creation and Modification Form Dialogs Context Mounts */}
      <EmployeeModal 
        isOpen={isModalOpen} 
        onClose={handleModalClose} 
        onSuccess={handleModalSuccess}
        employeeData={selectedEmployee}
        mode={modalMode}
      />

      {/* Process Actions Execution Notification Feedback Drawer */}
      <EmployeeSuccessModal
        isOpen={isSuccessModalOpen}
        onClose={handleSuccessClose}
        employeeData={successEmployee}
        mode={modalMode}
      />

      {/* Multi-Step Verification Deletion Target Wizard Layer */}
      <DeleteEmployeeWizard
        isOpen={isDeleteWizardOpen}
        employee={selectedEmployeeForDelete}
        onClose={() => setIsDeleteWizardOpen(false)}
        onConfirmPurge={handleConfirmPurgeMutation}
      />
    </div>
  );
};

export default EmployeesView;