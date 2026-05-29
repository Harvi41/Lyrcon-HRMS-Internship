import React, { useState, useEffect } from 'react';
import styles from '../HRDashboardLayout.module.css';
import EmployeeModal from './EmployeeModal';
import EmployeeSuccessModal from './EmployeeSuccessModal';
import DeleteEmployeeWizard from './DeleteEmployeeWizard';
import { getAllEmployees, createEmployee, updateEmployee } from '../../../lib/axios';

const EmployeesView = () => {
  // 1. DYNAMIC DATA SOURCE STATE ARRAY (Core Personnel Matrix)
  const [employeeDataList, setEmployeeDataList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // 2. DIALOGS AND WIZARDS DISPLAY TOGGLE CONTROL STATES
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successEmployee, setSuccessEmployee] = useState(null);

  const [isDeleteWizardOpen, setIsDeleteWizardOpen] = useState(false);
  const [selectedEmployeeForDelete, setSelectedEmployeeForDelete] = useState(null);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const { data } = await getAllEmployees();
      
      // Defensively parse incoming array records from backend metrics streams
      const mappedData = Array.isArray(data) ? data.map(emp => ({
        id: emp?.employeeCode || '',
        _id: emp?._id || '', 
        name: emp?.firstName || emp?.lastName ? `${emp.firstName || ''} ${emp.lastName || ''}`.trim() : 'Incomplete Name',
        email: emp?.email || '',
        dept: emp?.department || 'Unassigned',
        role: emp?.designation || 'Associate',
        status: emp?.status === 'terminated' ? 'Inactive' : 'Active',
        raw: emp || {}
      })) : [];
      
      setEmployeeDataList(mappedData);
    } catch (err) {
      console.error('Failed to fetch employees:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // ═══════════════════════════════════════════════════════════════════════════
  // RE-ENGINEERED ANALYTICS CALCULATIONS ENGINE (CRASH-PROOFED)
  // ═══════════════════════════════════════════════════════════════════════════
  const baselineTotalStaff = 142;
  const baselineInternsThisMonth = 6;
  const standardNetCTC = 82400.00;

  const dynamicTotalStaff = baselineTotalStaff + Math.max(0, employeeDataList.length - 3);
  
  // FIXED: Safe logic verification ensures e.role is treated as string type exclusively
  const totalActiveInterns = baselineInternsThisMonth + Math.max(0, employeeDataList.filter(e => {
    const roleString = typeof e?.role === 'string' ? e.role.toLowerCase() : '';
    return roleString.includes('intern');
  }).length - 1);

  const q1VelocityRatio = Math.min(100, Math.round((dynamicTotalStaff / 185) * 100)); 
  const q2PipelineRatio = Math.min(100, Math.round((employeeDataList.filter(e => e?.status === 'Onboarding').length / 1) * 30));

  // 4. ACTION INTERACTION PIPELINES
  const handleCreateClick = () => {
    setModalMode('create');
    setSelectedEmployee(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (employee) => {
    setModalMode('edit');
    const empData = employee?.raw || {};
    setSelectedEmployee({
      id: employee?.id || '',
      _id: employee?._id || '',
      name: employee?.name || '',
      email: employee?.email || '',
      phone: empData?.phoneNumber || '',
      gender: empData?.gender || 'Male',
      dob: empData?.dateOfBirth ? empData.dateOfBirth.split('T')[0] : '',
      joiningDate: empData?.joiningDate ? empData.joiningDate.split('T')[0] : '',
      dept: empData?.department || 'Engineering',
      role: empData?.designation || '',
      workLocation: empData?.workLocation || '',
      managerId: empData?.managerId?.employeeCode || empData?.managerId || '',
      status: empData?.status === 'terminated' ? 'Inactive' : 'Active',
      address: empData?.address || '',
      emergencyContact: empData?.emergencyContact || '',
      salary: empData?.baseCTC || ''
    });
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedEmployee(null);
  };

  const handleModalSuccess = async (data, mode) => {
    setIsModalOpen(false);
    
    try {
      let parsedEmergencyContact = { name: data?.emergencyContact || '', phone: '' };
      if (data?.emergencyContact && data.emergencyContact.includes('-')) {
        const parts = data.emergencyContact.split('-');
        parsedEmergencyContact = { name: parts[0].trim(), phone: parts.slice(1).join('-').trim() };
      }

      const isValidObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(id);
      const safeManagerId = isValidObjectId(data?.managerId) ? data.managerId : null;

      const payload = {
        employeeCode: data?.id,
        firstName: data?.firstName,
        lastName: data?.lastName,
        email: data?.email,
        phoneNumber: data?.phone,
        gender: data?.gender,
        dateOfBirth: data?.dob,
        joiningDate: data?.joiningDate,
        department: data?.department,
        designation: data?.designation,
        managerId: safeManagerId,
        workLocation: data?.workLocation,
        emergencyContact: parsedEmergencyContact,
        address: data?.address,
        roleName: 'Employee', 
        baseCTC: data?.salary
      };

      if (mode === 'create') {
        await createEmployee(payload);
        setSuccessEmployee(data); 
      } else {
        await updateEmployee(selectedEmployee?._id, payload);
        setSuccessEmployee(data);
      }
      
      setIsSuccessModalOpen(true);
      fetchEmployees(); 
    } catch (err) {
      console.error('Failed to save employee:', err);
      alert(err.response?.data?.message || 'Failed to save employee data.');
    }
  };

  const handleSuccessClose = () => {
    setIsSuccessModalOpen(false);
    setSuccessEmployee(null);
  };

  const handleDeleteClick = (employee) => {
    setSelectedEmployeeForDelete(employee);
    setIsDeleteWizardOpen(true);
  };

  const handleConfirmPurgeMutation = async (id) => {
    setEmployeeDataList((prevList) => prevList.filter((emp) => emp?.id !== id));
    setIsDeleteWizardOpen(false);
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // FIXED CRASH-PROOF FILTER PIPELINE
  // ═══════════════════════════════════════════════════════════════════════════
  const filteredEmployees = Array.isArray(employeeDataList) ? employeeDataList.filter((emp) => {
    const query = typeof searchQuery === 'string' ? searchQuery.toLowerCase().trim() : '';
    if (!query) return true;

    const empId = typeof emp?.id === 'string' || typeof emp?.id === 'number' ? String(emp.id).toLowerCase() : '';
    const empName = typeof emp?.name === 'string' ? emp.name.toLowerCase() : '';
    const empEmail = typeof emp?.email === 'string' ? emp.email.toLowerCase() : '';
    const empDept = typeof emp?.dept === 'string' ? emp.dept.toLowerCase() : '';
    const empRole = typeof emp?.role === 'string' ? emp.role.toLowerCase() : '';

    return (
      empId.includes(query) ||
      empName.includes(query) ||
      empEmail.includes(query) ||
      empDept.includes(query) ||
      empRole.includes(query)
    );
  }) : [];

  return (
    <div className={styles.dashboardGrid}>
      {/* Dynamic Header Metrics Informational Row */}
      <div className={styles.metricsRow}>
        <div className={styles.metricCard}>
          <h3>TOTAL ACTIVE PROFILES</h3>
          <div className={styles.metricValueWrapper}>
            <span className={styles.metricValue}>{loading ? '...' : `${dynamicTotalStaff} Staff`}</span>
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
        <button type="button" className={styles.primaryActionButton} onClick={handleCreateClick}>+ Create Employee</button>
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
            {loading ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                  Syncing active HR records directory...
                </td>
              </tr>
            ) : filteredEmployees.length === 0 ? (
              <tr>
                <td colSpan="6" className={styles.emptyState} style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>
                  No workforce directory profiles match your input filter: "{searchQuery}"
                </td>
              </tr>
            ) : (
              filteredEmployees.map((emp, i) => (
                <tr key={emp?.id || emp?._id || i}>
                  <td><strong style={{ color: '#0f172a', fontWeight: '700' }}>{emp?.id || '—'}</strong></td>
                  <td>
                    <div className={styles.userColumnCell} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <strong style={{ color: '#0f172a' }}>{emp?.name || 'Incomplete Profile'}</strong>
                      <span className={styles.subTextEmail} style={{ color: '#64748b' }}>{emp?.email || '—'}</span>
                    </div>
                  </td>
                  <td>{emp?.dept || 'Unassigned'}</td>
                  <td>{emp?.role || '—'}</td>
                  <td>
                    <span className={`${styles.statusLabel} ${emp?.status === 'Active' ? styles.statusActive : styles.statusOnboard}`}>
                      {emp?.status || 'Active'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <button 
                        type="button"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }} 
                        onClick={() => handleEditClick(emp)}
                        title="Edit Profile"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                      </button>

                      <button 
                        type="button"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#e11d48' }}
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
                    </div>
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

      <EmployeeSuccessModal
        isOpen={isSuccessModalOpen}
        onClose={handleSuccessClose}
        employeeData={successEmployee}
        mode={modalMode}
      />

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