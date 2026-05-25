// EmployeeModal.jsx
import React, { useState, useEffect } from 'react';
import styles from '../AdminDashboardLayout.module.css'; 

const EmployeeModal = ({ isOpen, onClose, onSuccess, employeeData, mode }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    gender: 'Male',
    dob: '',
    joiningDate: '',
    department: 'Engineering',
    designation: '',
    workLocation: '',
    managerId: '',
    status: 'Active',
    address: '',
    emergencyContact: ''
  });

  useEffect(() => {
    if (employeeData && mode === 'edit') {
      const names = employeeData.name ? employeeData.name.split(' ') : ['', ''];
      
      setFormData({
        firstName: names[0] || '',
        lastName: names.slice(1).join(' ') || '',
        email: employeeData.email || '',
        phone: employeeData.phone || '+91 98765 43210',
        gender: employeeData.gender || 'Male',
        dob: employeeData.dob || '1995-08-15',
        joiningDate: employeeData.joiningDate || '2022-04-12',
        department: employeeData.dept || 'Engineering',
        designation: employeeData.role || '',
        workLocation: employeeData.workLocation || 'HQ - Mumbai',
        managerId: employeeData.managerId || 'EMP-1002 (Sarah J.)',
        status: employeeData.status || 'Active',
        address: employeeData.address || '102 Sky Tower, Andheri East, MH, IN, 400069',
        emergencyContact: employeeData.emergencyContact || 'Ramesh Ghevariya - +91 98331 22211'
      });
    } else {
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        gender: 'Male',
        dob: '',
        joiningDate: '',
        department: 'Engineering',
        designation: '',
        workLocation: '',
        managerId: '',
        status: 'Active',
        address: '',
        emergencyContact: ''
      });
    }
  }, [employeeData, mode, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const submittedData = {
      ...formData,
      id: mode === 'edit' ? employeeData.id : `EMP-${Math.floor(Math.random() * 1000) + 2000}`,
      name: `${formData.firstName} ${formData.lastName}`.trim(),
      dept: formData.department,
      role: formData.designation
    };
    onSuccess(submittedData, mode);
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContentWide} onClick={(e) => e.stopPropagation()}>
        
        {/* Modal Main Header Wrapper */}
        <div className={styles.modalHeader}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0f172a', margin: 0 }}>
            {mode === 'edit' ? 'Edit Employee Profile' : 'Create Employee Profile'}
          </h2>
          <button 
            type="button" 
            className={styles.btnCancel} 
            onClick={onClose} 
            style={{ padding: '2px 10px', minWidth: 'auto', border: 'none', background: 'transparent', fontSize: '1.65rem', color: '#64748b' }}
          >
            &times;
          </button>
        </div>

        {/* Scrollable Form Workspace Canvas Area */}
        <form onSubmit={handleSubmit} className={styles.modalScrollForm}>
          
          {/* Section 1: Personal Details */}
          <div className={styles.modalFormSection}>
            <h3 className={styles.modalSectionSubTitle}>Personal Details</h3>
            <div className={styles.modalFormGridTwo}>
              <div className={styles.modalFieldGroup}>
                <label>First Name</label>
                <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required />
              </div>
              <div className={styles.modalFieldGroup}>
                <label>Last Name</label>
                <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required />
              </div>
              <div className={styles.modalFieldGroup}>
                <label>Email Address</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} required />
              </div>
              <div className={styles.modalFieldGroup}>
                <label>Phone Number</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required />
              </div>
              <div className={styles.modalFieldGroup}>
                <label>Gender</label>
                <select name="gender" value={formData.gender} onChange={handleChange}>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className={styles.modalFieldGroup}>
                <label>Date of Birth</label>
                <input type="date" name="dob" value={formData.dob} onChange={handleChange} required />
              </div>
            </div>
          </div>

          {/* Section 2: Employment & Organization */}
          <div className={styles.modalFormSection}>
            <h3 className={styles.modalSectionSubTitle}>Employment & Organization</h3>
            <div className={styles.modalFormGridTwo}>
              <div className={styles.modalFieldGroup}>
                <label>Joining Date</label>
                <input type="date" name="joiningDate" value={formData.joiningDate} onChange={handleChange} required />
              </div>
              <div className={styles.modalFieldGroup}>
                <label>Department</label>
                <select name="department" value={formData.department} onChange={handleChange}>
                  <option value="Engineering">Engineering</option>
                  <option value="Human Resources">Human Resources</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Sales">Sales</option>
                  <option value="Finance">Finance</option>
                </select>
              </div>
              <div className={styles.modalFieldGroup}>
                <label>Designation</label>
                <input type="text" name="designation" value={formData.designation} onChange={handleChange} required />
              </div>
              <div className={styles.modalFieldGroup}>
                <label>Manager ID</label>
                <input type="text" name="managerId" value={formData.managerId} onChange={handleChange} />
              </div>
              <div className={styles.modalFieldGroup}>
                <label>Work Location</label>
                <input type="text" name="workLocation" value={formData.workLocation} onChange={handleChange} required />
              </div>
              <div className={styles.modalFieldGroup}>
                <label>Status</label>
                <select name="status" value={formData.status} onChange={handleChange}>
                  <option value="Active">Active</option>
                  <option value="Onboarding">Onboarding</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Address & Emergency Contact */}
          <div className={styles.modalFormSection}>
            <h3 className={styles.modalSectionSubTitle}>Address & Emergency Contact</h3>
            <div className={styles.modalFormGridTwo}>
              <div className={styles.modalFieldGroup}>
                <label>Postal Address (Street, City, State, Zip)</label>
                <input type="text" name="address" value={formData.address} onChange={handleChange} required />
              </div>
              <div className={styles.modalFieldGroup}>
                <label>Emergency Contact (Name - Phone)</label>
                <input type="text" name="emergencyContact" value={formData.emergencyContact} onChange={handleChange} required />
              </div>
            </div>
          </div>

          {/* Action Trigger Buttons Footer Row */}
          <div className={styles.modalActionButtons} style={{ margin: 0, paddingBottom: 0 }}>
            <button type="button" className={styles.btnCancel} onClick={onClose}>Cancel</button>
            <button type="submit" className={styles.btnSubmit}>
              {mode === 'edit' ? 'Save Changes' : 'Create'}
            </button>
          </div>
          
        </form>
      </div>
    </div>
  );
};

export default EmployeeModal;