import React, { useState } from 'react';
import styles from '../HRDashboardLayout.module.css';
import EmployeeModal from './EmployeeModal';
import EmployeeSuccessModal from './EmployeeSuccessModal';

const EmployeesView = () => {
  const [employeeDataList, setEmployeeDataList] = useState([
    { id: 'EMP-1001', name: 'Prince Ghevariya', email: 'prince@company.com', dept: 'Engineering', role: 'Lead Systems Architect', status: 'Active' },
    { id: 'EMP-1042', name: 'Nidhish Zala', email: 'nidhish@company.com', dept: 'Engineering', role: 'Software Dev Intern', status: 'Onboarding' },
    { id: 'EMP-1002', name: 'Sarah Jenkins', email: 'sarah@company.com', dept: 'Human Resources', role: 'HR Lead Coordinator', status: 'Active' }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successEmployee, setSuccessEmployee] = useState(null);

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

  return (
    <div className={styles.dashboardGrid}>
      {/* Context Top Mini Widgets Row */}
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
            <span className={`${styles.metricValue} ${styles.statusCommitted}`}>+6 Interns</span>
          </div>
        </div>
        <div className={styles.metricCard}>
          <h3>AVG NET CTC (MONTHLY)</h3>
          <div className={styles.metricValueWrapper}>
            <span className={`${styles.metricValue} ${styles.timeLink}`}>₹82,400.00</span>
          </div>
        </div>
      </div>

      {/* Target Metrics Status Card Container */}
      <div className={styles.chartContainer}>
        <h3>Quarterly Hiring Velocity Insight</h3>
        <div className={styles.chartPlaceholderVertical}>
          <div className={styles.deptMetric}>
            <span>Q1 Growth Matrix</span>
            <div className={styles.progressBar}><div style={{ width: '77%' }}></div></div>
            <strong>77% Target</strong>
          </div>
          <div className={styles.deptMetric}>
            <span>Q2 Active Pipeline</span>
            <div className={styles.progressBar}><div style={{ width: '30%' }}></div></div>
            <strong>30% Target</strong>
          </div>
        </div>
      </div>

      {/* Database Search Filter bar */}
      <div className={styles.actionFilterBar}>
        <input type="text" placeholder="Filter by name or keyword..." className={styles.filterInput} />
        <button className={styles.primaryActionButton} onClick={handleCreateClick}>+ Create Employee</button>
      </div>

      {/* Main Core Directory Table */}
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
            {employeeDataList.map((emp) => (
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
                  <button 
                    style={{ background: 'none', border: 'none', cursor: 'pointer' }} 
                    onClick={() => handleEditClick(emp)}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinelinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                  </button>
                  <button style={{ background: 'none', border: 'none', cursor: 'pointer', marginLeft: '10px', color: '#e11d48' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinelinejoin="round">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      <line x1="10" y1="11" x2="10" y2="17"></line>
                      <line x1="14" y1="11" x2="14" y2="17"></line>
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <EmployeeModal 
        isOpen={isModalOpen} 
        onClose={handleModalClose} 
        onSuccess={handleModalSuccess}
        employeeData={selectedEmployee}
        mode={modalMode}
      />

      <EmployeeSuccessModal
        isOpen={isSuccessModalOpen}
        onClose={handleSuccessClose}
        employeeData={successEmployee}
        mode={modalMode}
      />
    </div>
  );
};

export default EmployeesView;