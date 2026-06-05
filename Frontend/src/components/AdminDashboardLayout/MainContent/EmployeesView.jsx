import React, { useState, useEffect } from 'react';
import styles from '../AdminDashboardLayout.module.css';
import EmployeeModal from './EmployeeModal';
import EmployeeSuccessModal from './EmployeeSuccessModal';
import DeleteEmployeeWizard from './DeleteEmployeeWizard';
import { getAllEmployees, createEmployee, updateEmployee, deleteEmployee } from '../../../lib/axios';

const EmployeesView = () => {
  const [employeeDataList, setEmployeeDataList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Computed live dashboard metrics states
  const [newJoineesCount, setNewJoineesCount] = useState(0);
  const [averageSalary, setAverageSalary] = useState(0);

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
      const rawEmployees = Array.isArray(data) ? data : [];
      
      // ═══════════════════════════════════════════════════════════════════════════
      // DYNAMIC LIVE METRICS COMPUTATION ENGINE
      // ═══════════════════════════════════════════════════════════════════════════
      const currentPeriod = new Date();
      const currentMonth = currentPeriod.getMonth(); // Current system month
      const currentYear = currentPeriod.getFullYear();   // Current system year

      let newJoineesCounter = 0;
      let totalSalarySum = 0;
      let validSalaryRecordsCount = 0;

      rawEmployees.forEach(emp => {
        // 1. Calculate New Joinees matching current month/year context
        if (emp?.joiningDate) {
          const joinDateObj = new Date(emp.joiningDate);
          if (joinDateObj.getMonth() === currentMonth && joinDateObj.getFullYear() === currentYear) {
            newJoineesCounter++;
          }
        }

        // 2. Aggregate Base CTC metrics safely avoiding corrupt strings or null values
        const monthlyCTC = Number(emp?.baseCTC);
        if (!isNaN(monthlyCTC) && monthlyCTC > 0) {
          totalSalarySum += monthlyCTC;
          validSalaryRecordsCount++;
        }
      });

      // Commit computed runtime metrics back to display states
      setNewJoineesCount(newJoineesCounter);
      setAverageSalary(validSalaryRecordsCount > 0 ? Math.round(totalSalarySum / validSalaryRecordsCount) : 0);

      // Map raw backend schema structures safely over UI presentation nodes
      const mappedData = rawEmployees.map(emp => ({
        id: emp?.employeeCode || '',
        _id: emp?._id || '', 
        name: emp?.firstName || emp?.lastName ? `${emp.firstName || ''} ${emp.lastName || ''}`.trim() : 'Incomplete Name',
        email: emp?.email || '',
        dept: emp?.department || 'Unassigned',
        role: emp?.designation || 'Associate',
        status: emp?.status === 'terminated' ? 'Inactive' : 'Active',
        raw: emp || {}
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
      emergencyContact: empData?.emergencyContact 
      ? typeof empData.emergencyContact === 'object'
        ? `${empData.emergencyContact.name || ''} - ${empData.emergencyContact.phone || ''}`.replace(/^ - | - $/, '')
        : empData.emergencyContact
      : '',
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
    try {
      const empToDelete = employeeDataList.find(emp => emp?.id === id);
      if (empToDelete && empToDelete._id) {
        await deleteEmployee(empToDelete._id);
      }
      setEmployeeDataList((prevList) => prevList.filter((emp) => emp?.id !== id));
      setIsDeleteWizardOpen(false);
    } catch (err) {
      console.error('Failed to delete employee:', err);
      alert(err.response?.data?.message || 'Failed to delete employee.');
    }
  };

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
     
      {/* Dynamic Metrics Summary Row */}
      <div className={styles.metricsRow}>
        <div className={styles.metricCard}>
          <h3>TOTAL ACTIVE PROFILES</h3>
          <div className={styles.metricValueWrapper}>
            <span className={styles.metricValue}>
              {loading ? '...' : `${employeeDataList.length} Staff`}
            </span>
          </div>
        </div>
        
        <div className={styles.metricCard}>
          <h3>NEW JOINEES (THIS MONTH)</h3>
          <div className={styles.metricValueWrapper}>
            <span className={styles.metricValue} style={{ color: '#16a34a' }}>
              {loading ? '...' : `+${newJoineesCount} Members`}
            </span>
          </div>
        </div>
        
        <div className={styles.metricCard}>
          <h3>AVG NET CTC (MONTHLY)</h3>
          <div className={styles.metricValueWrapper}>
            <span className={styles.metricValue} style={{ color: '#6366f1' }}>
              {loading ? '...' : `₹${averageSalary.toLocaleString('en-IN')}.00`}
            </span>
          </div>
        </div>
      </div>

      {/* Hiring Velocity Insight (Connected dynamically to active roster proportions) */}
      <div className={styles.chartContainer}>
        <h3>Quarterly Hiring Velocity Insight</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '10px 0' }}>
         
          <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            <div style={{ width: '120px', fontSize: '0.88rem', fontWeight: '500', color: '#1e293b', lineHeight: '1.2' }}>
              Q1 Growth <br />Matrix
            </div>
            <div className={styles.progressBarContainer} style={{ flex: 1, margin: '0 24px', background: '#f1f5f9', height: '12px' }}>
              <div 
                className={styles.progressBarFill} 
                style={{ 
                  width: `${Math.min(100, employeeDataList.length * 2)}%`, 
                  backgroundColor: '#635bff', 
                  height: '100%',
                  transition: 'width 0.4s ease'
                }} 
              />
            </div>
            <div style={{ width: '65px', textAlign: 'right', fontSize: '0.85rem', fontWeight: '700', color: '#0f172a' }}>
              {Math.min(100, employeeDataList.length * 2)}% 
              <span style={{ display: 'block', fontSize: '0.72rem', color: '#64748b', fontWeight: '500' }}>Capacity</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            <div style={{ width: '120px', fontSize: '0.88rem', fontWeight: '500', color: '#1e293b', lineHeight: '1.2' }}>
              Active <br />Onboarding
            </div>
            <div className={styles.progressBarContainer} style={{ flex: 1, margin: '0 24px', background: '#f1f5f9', height: '12px' }}>
              <div 
                className={styles.progressBarFill} 
                style={{ 
                  width: `${Math.min(100, newJoineesCount * 15)}%`, 
                  backgroundColor: '#10b981', 
                  height: '100%',
                  transition: 'width 0.4s ease'
                }} 
              />
            </div>
            <div style={{ width: '65px', textAlign: 'right', fontSize: '0.85rem', fontWeight: '700', color: '#0f172a' }}>
              {Math.min(100, newJoineesCount * 15)}% 
              <span style={{ display: 'block', fontSize: '0.72rem', color: '#64748b', fontWeight: '500' }}>Velocity</span>
            </div>
          </div>

        </div>
      </div>

      {/* Filtering Bar */}
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

      {/* Directory Table Grid */}
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
            {loading ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                  Syncing active enterprise directory...
                </td>
              </tr>
            ) : filteredEmployees.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                  No workforce directory profiles match your input filter: "{searchQuery}"
                </td>
              </tr>
            ) : (
              filteredEmployees.map((emp, i) => (
                <tr key={emp?.id || emp?._id || i}>
                  <td><strong style={{ color: '#0f172a', fontWeight: '700' }}>{emp?.id || '—'}</strong></td>
                  <td>
                    <div className={styles.userColumnCell} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <strong className={styles.employeeNameLink} style={{ color: '#0f172a', fontWeight: '700' }}>{emp?.name || 'Incomplete Profile'}</strong>
                      <span className={styles.subTextEmail} style={{ color: '#64748b', fontSize: '0.8rem' }}>{emp?.email || '—'}</span>
                    </div>
                  </td>
                  <td style={{ color: '#475569', fontWeight: '500' }}>{emp?.dept || 'Unassigned'}</td>
                  <td style={{ color: '#475569', fontWeight: '500' }}>{emp?.role || '—'}</td>
                  <td>
                    <span
                      className={`${styles.statusLabel} ${emp?.status === 'Active' ? styles.badgeActive : styles.statusOnboard}`}
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
                      {emp?.status || 'Active'}
                    </span>
                  </td>
                  <td>
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

      <EmployeeModal isOpen={isModalOpen} onClose={handleModalClose} onSuccess={handleModalSuccess} employeeData={selectedEmployee} mode={modalMode} allEmployeesList={employeeDataList}/>
      <EmployeeSuccessModal isOpen={isSuccessModalOpen} onClose={handleSuccessClose} employeeData={successEmployee} mode={modalMode} />
      <DeleteEmployeeWizard isOpen={isDeleteWizardOpen} employee={selectedEmployeeForDelete} onClose={() => setIsDeleteWizardOpen(false)} onConfirmPurge={handleConfirmPurgeMutation} />
    </div>
  );
};

export default EmployeesView;