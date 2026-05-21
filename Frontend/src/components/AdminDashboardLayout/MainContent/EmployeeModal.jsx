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
      // Parse name for simplicity in this demo
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
      // Clear form for create
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
    // Simulate API call
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
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2>{mode === 'edit' ? 'Edit Employee Profile' : 'Create Employee Profile'}</h2>
          <button className={styles.closeButton} onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Personal Details */}
          <div className={styles.formSection}>
            <h3 className={styles.formSectionTitle}>Personal Details</h3>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>First Name</label>
                <input type="text" name="firstName" className={styles.formInput} value={formData.firstName} onChange={handleChange} required />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Last Name</label>
                <input type="text" name="lastName" className={styles.formInput} value={formData.lastName} onChange={handleChange} required />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Email Address</label>
                <input type="email" name="email" className={styles.formInput} value={formData.email} onChange={handleChange} required />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Phone Number</label>
                <input type="tel" name="phone" className={styles.formInput} value={formData.phone} onChange={handleChange} required />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Gender</label>
                <select name="gender" className={styles.formSelect} value={formData.gender} onChange={handleChange}>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Date of Birth</label>
                <input type="date" name="dob" className={styles.formInput} value={formData.dob} onChange={handleChange} required />
              </div>
            </div>
          </div>

          {/* Employment & Organization */}
          <div className={styles.formSection}>
            <h3 className={styles.formSectionTitle}>Employment & Organization</h3>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Joining Date</label>
                <input type="date" name="joiningDate" className={styles.formInput} value={formData.joiningDate} onChange={handleChange} required />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Department</label>
                <select name="department" className={styles.formSelect} value={formData.department} onChange={handleChange}>
                  <option value="Engineering">Engineering</option>
                  <option value="Human Resources">Human Resources</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Sales">Sales</option>
                  <option value="Finance">Finance</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Designation</label>
                <input type="text" name="designation" className={styles.formInput} value={formData.designation} onChange={handleChange} required />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Manager ID</label>
                <input type="text" name="managerId" className={styles.formInput} value={formData.managerId} onChange={handleChange} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Work Location</label>
                <input type="text" name="workLocation" className={styles.formInput} value={formData.workLocation} onChange={handleChange} required />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Status</label>
                <select name="status" className={styles.formSelect} value={formData.status} onChange={handleChange}>
                  <option value="Active">Active</option>
                  <option value="Onboarding">Onboarding</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          {/* Address & Emergency Contact */}
          <div className={styles.formSection}>
            <h3 className={styles.formSectionTitle}>Address & Emergency Contact</h3>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Postal Address (Street, City, State, Country, Zip)</label>
                <input type="text" name="address" className={styles.formInput} value={formData.address} onChange={handleChange} required />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Emergency Contact (Name - Phone)</label>
                <input type="text" name="emergencyContact" className={styles.formInput} value={formData.emergencyContact} onChange={handleChange} required />
              </div>
            </div>
          </div>

          <div className={styles.modalActions}>
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
