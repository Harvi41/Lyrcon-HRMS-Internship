// EmployeesView.jsx
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

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. STATE-BOUND ANALYTICAL METRICS CALCULATIONS ENGINE
  // ═══════════════════════════════════════════════════════════════════════════
  const baselineTotalStaff = 142;
  const baselineInternsThisMonth = 6;
  const standardNetCTC = 82400.00;

  // Derives totals reactively relative to insertions or deletions against seed records
  const dynamicTotalStaff = baselineTotalStaff + Math.max(0, employeeDataList.length - 3);
  const totalActiveInterns = baselineInternsThisMonth + Math.max(0, employeeDataList.filter(e => e.role.toLowerCase().includes('intern')).length - 1);

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

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const { data } = await getAllEmployees();
      // Map backend data to frontend table format
      const mappedData = data.map(emp => ({
        id: emp.employeeCode,
        _id: emp._id, // Keep the MongoDB ID for updates
        name: `${emp.firstName} ${emp.lastName}`,
        email: emp.email,
        dept: emp.department,
        role: emp.designation,
        status: emp.status === 'terminated' ? 'Inactive' : 'Active',
        // Preserve raw fields for editing
        raw: emp
      }));
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

  // 4. ACTION INTERACTION PIPELINES
  const handleCreateClick = () => {
    setModalMode('create');
    setSelectedEmployee(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (employee) => {
    setModalMode('edit');
    // Map the selected row back to the modal format
    const empData = employee.raw || {};
    setSelectedEmployee({
      id: employee.id,
      _id: employee._id,
      name: employee.name,
      email: employee.email,
      phone: empData.phoneNumber,
      gender: empData.gender,
      dob: empData.dateOfBirth ? empData.dateOfBirth.split('T')[0] : '',
      joiningDate: empData.joiningDate ? empData.joiningDate.split('T')[0] : '',
      dept: empData.department,
      role: empData.designation,
      workLocation: empData.workLocation,
      managerId: empData.managerId?.employeeCode || empData.managerId || '',
      status: empData.status === 'terminated' ? 'Inactive' : 'Active',
      address: empData.address,
      emergencyContact: empData.emergencyContact,
      salary: empData.baseCTC
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
      // Parse emergency contact string (e.g. "Name - Phone") into an object expected by the backend
      let parsedEmergencyContact = { name: data.emergencyContact, phone: '' };
      if (data.emergencyContact && data.emergencyContact.includes('-')) {
        const parts = data.emergencyContact.split('-');
        parsedEmergencyContact = { name: parts[0].trim(), phone: parts.slice(1).join('-').trim() };
      }

      // Ensure managerId is a valid ObjectId, otherwise send null to prevent CastError
      const isValidObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(id);
      const safeManagerId = isValidObjectId(data.managerId) ? data.managerId : null;

      const payload = {
        employeeCode: data.id,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phoneNumber: data.phone,
        gender: data.gender,
        dateOfBirth: data.dob,
        joiningDate: data.joiningDate,
        department: data.department,
        designation: data.designation,
        managerId: safeManagerId,
        workLocation: data.workLocation,
        emergencyContact: parsedEmergencyContact,
        address: data.address,
        roleName: 'Employee', // System access role is fixed to Employee here, whereas designation handles the job title
        baseCTC: data.salary
      };

      if (mode === 'create') {
        await createEmployee(payload);
        setSuccessEmployee(data); // Revert to using the flat payload object that the modal expects
      } else {
        await updateEmployee(selectedEmployee._id, payload);
        setSuccessEmployee(data);
      }
      
      setIsSuccessModalOpen(true);
      fetchEmployees(); // Refresh the table
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
    setEmployeeDataList((prevList) => prevList.filter((emp) => emp.id !== id));
    setIsDeleteWizardOpen(false);
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

  // Removed redundant React.useEffect that overwrote the employee list

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