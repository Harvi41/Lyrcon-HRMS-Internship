import React, { useState, useEffect } from 'react';
import styles from '../HRDashboardLayout.module.css';

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
    emergencyContact: '',
    salary: '' // Tracks gross monthly input dynamically
  });

  // Track operational field synchronization state transitions
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
        emergencyContact: employeeData.emergencyContact || 'Ramesh Ghevariya - +91 98331 22211',
        salary: employeeData.salary || '82400.00' // Pre-loads payroll database entry
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
        emergencyContact: '',
        salary: '' // Defaults to empty string on creative workspace reset
      });
    }
  }, [employeeData, mode, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // STATUTORY PAYROLL LEDGER MATH LOGIC
  // ═══════════════════════════════════════════════════════════════════════════
  const numericCTC = Number(formData.salary) || 0;
  
  const basicSalary = numericCTC * 0.40; 
  const hra = basicSalary * 0.25;        
  const medicalReimbursement = numericCTC > 0 ? 1250 : 0;
  const lta = numericCTC > 0 ? 2500 : 0;
  const specialAllowance = Math.max(0, numericCTC - (basicSalary + hra + medicalReimbursement + lta));

  const epfDeduction = basicSalary * 0.12; 
  const professionalTax = numericCTC > 0 ? 200 : 0; 
  
  const netTakeHomePay = Math.max(0, numericCTC - epfDeduction - professionalTax);

  const formatCurrency = (val) => {
    return val.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const submittedData = {
      ...formData,
      id: mode === 'edit' ? employeeData.id : `EMP-${Math.floor(Math.random() * 1000) + 2000}`,
      name: `${formData.firstName} ${formData.lastName}`.trim(),
      dept: formData.department,
      role: formData.designation,
      salary: formData.salary 
    };
    onSuccess(submittedData, mode);
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContentWide} onClick={(e) => e.stopPropagation()}>
        
        {/* Modal Main Header Wrapper */}
        <div className={styles.modalHeader}>
          <h2>{mode === 'edit' ? 'Edit Employee Profile' : 'Create Employee Profile'}</h2>
          <button 
            type="button" 
            className={styles.modalCloseBtn} 
            onClick={onClose}
            aria-label="Close modal"
          >
            &times;
          </button>
        </div>

        {/* Form Container with Separated Scroll Layout */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          
          <div className={styles.modalScrollForm}>
            
            {/* ── SECTION 1: PERSONAL DETAILS ── */}
            <div className={styles.modalFormSection}>
              <h3 className={styles.modalSectionSubTitle}>Personal Details</h3>
              <div className={styles.modalFormGridThree}>
                <div className={styles.modalFieldGroup}>
                  <label>First Name</label>
                  <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="Enter first name" required />
                </div>
                <div className={styles.modalFieldGroup}>
                  <label>Last Name</label>
                  <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Enter last name" required />
                </div>
                <div className={styles.modalFieldGroup}>
                  <label>Email Address</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="name@company.com" required />
                </div>
                <div className={styles.modalFieldGroup}>
                  <label>Phone Number</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+91 XXXXX XXXXX" required />
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

            {/* ── SECTION 2: EMPLOYMENT & ORGANIZATION ── */}
            <div className={styles.modalFormSection}>
              <h3 className={styles.modalSectionSubTitle}>Employment & Organization</h3>
              <div className={styles.modalFormGridThree}>
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
                  <input type="text" name="designation" value={formData.designation} onChange={handleChange} placeholder="Software Engineer" required />
                </div>
                <div className={styles.modalFieldGroup}>
                  <label>Manager ID</label>
                  <input type="text" name="managerId" value={formData.managerId} onChange={handleChange} placeholder="EMP-1002" />
                </div>
                <div className={styles.modalFieldGroup}>
                  <label>Work Location</label>
                  <input type="text" name="workLocation" value={formData.workLocation} onChange={handleChange} placeholder="HQ - Mumbai" required />
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

            {/* ── SECTION 3: ADDRESS & EMERGENCY CONTACT ── */}
            <div className={styles.modalFormSection}>
              <h3 className={styles.modalSectionSubTitle}>Address & Emergency Contact</h3>
              <div className={styles.modalFormGridTwo}>
                <div className={styles.modalFieldGroup}>
                  <label>Postal Address (Street, City, State, Zip)</label>
                  <input type="text" name="address" value={formData.address} onChange={handleChange} placeholder="Enter full address" required />
                </div>
                <div className={styles.modalFieldGroup}>
                  <label>Emergency Contact (Name - Phone)</label>
                  <input type="text" name="emergencyContact" value={formData.emergencyContact} onChange={handleChange} placeholder="Contact Name - +91 XXXXX XXXXX" required />
                </div>
              </div>
            </div>

            {/* ── SECTION 4: DETAILED STATUTORY COMPENSATION BREAKDOWN ── */}
            <div className={styles.modalFormSection}>
              <h3 className={styles.modalSectionSubTitle} style={{ color: '#4f46e5' }}>Compensation Details</h3>
              
              <div className={styles.salaryInputRow}>
                <div className={styles.modalFieldGroup}>
                  <label style={{ fontWeight: '700' }}>Gross CTC / Base Salary (Monthly)</label>
                  <div className={styles.currencyInputContainer}>
                    <span className={styles.currencyPrefix}>Core ₹</span>
                    <input 
                      type="number" 
                      name="salary" 
                      placeholder="e.g. 82400" 
                      value={formData.salary} 
                      onChange={handleChange} 
                      required 
                    />
                  </div>
                </div>
              </div>

              {/* Class-Bound Structured Itemized Ledger Block Node */}
              <div className={styles.ledgerWrapper}>
                
                {/* Table Headers */}
                <div className={styles.ledgerHeaderRow}>
                  <div>Earnings & Allowances</div>
                  <div>Monthly</div>
                  <div>Est. Annual CTC</div>
                </div>

                {/* Table Body Details */}
                <div className={styles.ledgerBody}>
                  <div className={styles.ledgerDataRow}>
                    <span>Basic Salary (40% of CTC)</span>
                    <span>₹ {formatCurrency(basicSalary)}</span>
                    <span>₹ {formatCurrency(basicSalary * 12)}</span>
                  </div>
                  <div className={styles.ledgerDataRow}>
                    <span>House Rent Allowance (25% of Basic)</span>
                    <span>₹ {formatCurrency(hra)}</span>
                    <span>₹ {formatCurrency(hra * 12)}</span>
                  </div>
                  <div className={styles.ledgerDataRow}>
                    <span>Special Allowance (Residual)</span>
                    <span>₹ {formatCurrency(specialAllowance)}</span>
                    <span>₹ {formatCurrency(specialAllowance * 12)}</span>
                  </div>
                  <div className={styles.ledgerDataRow}>
                    <span>Medical Reimbursement</span>
                    <span>₹ {formatCurrency(medicalReimbursement)}</span>
                    <span>₹ {formatCurrency(medicalReimbursement * 12)}</span>
                  </div>
                  <div className={styles.ledgerDataRow} style={{ border: 'none' }}>
                    <span>Leave Travel Allowance (LTA)</span>
                    <span>₹ {formatCurrency(lta)}</span>
                    <span>₹ {formatCurrency(lta * 12)}</span>
                  </div>
                </div>

                {/* Deductions Header Row Section */}
                <div className={styles.ledgerDeductionsHeader}>
                  <div>Statutory Deductions</div>
                  <div>Personal Voluntary PPF Contrib.</div>
                </div>

                {/* Deductions Split Layout Block */}
                <div className={styles.ledgerDeductionsSplit}>
                  <div className={styles.deductionsListColumn}>
                    <div className={styles.deductionsItemRow}>
                      <span>EPF (12% of Basic)</span>
                      <strong className={styles.deductionNegativeText}>- ₹ {formatCurrency(epfDeduction)}</strong>
                    </div>
                    <div className={styles.deductionsItemRow}>
                      <span>Professional Tax (PT)</span>
                      <strong className={styles.deductionNegativeText}>- ₹ {formatCurrency(professionalTax)}</strong>
                    </div>
                  </div>

                  <div className={styles.ppfAdvisoryBlock}>
                    <div className={styles.ppfStatusGreenDot}>
                      <span className={styles.greenPulseIndicator}></span>
                      ₹ 0.00 / User Managed
                    </div>
                    <span className={styles.ppfSubMetaText}>(PPF falls outside corporate payroll ledger limits)</span>
                  </div>
                </div>

                {/* Take-Home Net Result Balance Panel Footer */}
                <div className={styles.ledgerTakeHomeSummaryFooter}>
                  <span>Est. Net Monthly Take-Home</span>
                  <strong>₹ {formatCurrency(netTakeHomePay)}.00</strong>
                </div>

              </div>
            </div>

          </div>

          {/* Locked Action Buttons Footer Layer */}
          <div className={styles.modalActionButtons} style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
            <button type="button" className={styles.secondaryActionButton} style={{ padding: '10px 20px' }} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={styles.primaryActionButton} style={{ padding: '10px 24px' }}>
              {mode === 'edit' ? 'Save Changes' : 'Create'}
            </button>
          </div>
          
        </form>
      </div>
    </div>
  );
};

export default EmployeeModal;