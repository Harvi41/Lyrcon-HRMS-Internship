// AssetFormModal.jsx
import React, { useState, useEffect } from 'react';
import styles from '../HRDashboardLayout.module.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function AssetFormModal({ isOpen, mode, assetData, onClose, onSaved }) {
  const [currentStep, setCurrentStep] = useState(1); // 1 = Entry Form, 2 = Success Broadcaster Snapshot
  const [formData, setFormData] = useState({
    name: '', _id: '', category: '', modelNumber: '', brand: '', manufactureYear: '',
    assignedTo: '', department: 'Engineering', issueDate: '', returnDate: '', status: 'Active', condition: 'Excellent', assetValue: ''
  });
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
      setErrorMsg('');
      if (mode === 'edit' && assetData) {
        setFormData({ ...assetData });
      } else {
        setFormData({
          name: '', _id: `AST-${Math.floor(Math.random() * 900) + 100}`, category: '', modelNumber: '', brand: '', manufactureYear: '',
          assignedTo: '', department: 'Engineering', issueDate: new Date().toLocaleDateString('en-GB'), returnDate: '', status: 'Active', condition: 'Excellent', assetValue: ''
        });
      }

      // Fetch employees list for drop down assignment
      const fetchEmployees = async () => {
        try {
          const token = window.localStorage.getItem('corehr_token');
          const response = await fetch(`${API_BASE_URL}/api/employees`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (response.ok) {
            const data = await response.json();
            setEmployees(data || []);
          }
        } catch (err) {
          console.error("Failed to load employees for asset management dropdown:", err);
        }
      };
      fetchEmployees();
    }
  }, [isOpen, mode, assetData]);

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmission = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    try {
      const token = window.localStorage.getItem('corehr_token');
      const url = mode === 'edit' ? `${API_BASE_URL}/api/assets/${assetData._id}` : `${API_BASE_URL}/api/assets`;
      const method = mode === 'edit' ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Operation failed on ledger states');
      }

      setCurrentStep(2);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'An unexpected error occurred while saving the asset.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={currentStep === 2 ? onSaved : undefined}>
      <div className={styles.modalContentWide} onClick={(e) => e.stopPropagation()} style={{ maxWidth: currentStep === 2 ? '500px' : '840px' }}>
        
        {/* ── STEP 1: FORM FIELDS CANVAS ── */}
        {currentStep === 1 && (
          <>
            <div className={styles.modalHeader}>
              <h2>{mode === 'edit' ? 'Edit Assets Information' : 'Create & Assign Asset'}</h2>
              <button type="button" className={styles.closeButton} onClick={onClose}>&times;</button>
            </div>

            <form onSubmit={handleFormSubmission} className={styles.modalScrollForm}>
              {errorMsg && (
                <div style={{
                  backgroundColor: '#fee2e2',
                  border: '1px solid #fca5a5',
                  color: '#b91c1c',
                  padding: '12px 16px',
                  borderRadius: '6px',
                  marginBottom: '16px',
                  fontSize: '0.88rem',
                  fontWeight: '500'
                }}>
                  {errorMsg}
                </div>
              )}

              <div className={styles.modalFormSection}>
                <h4 className={styles.modalSectionSubTitle}>Asset Information</h4>
                <div className={styles.modalFormGridThree}>
                  <div className={styles.modalFieldGroup}>
                    <label>Asset Name</label>
                    <input required type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="e.g., MacBook Pro, Logitech Rally" />
                  </div>
                  <div className={styles.modalFieldGroup}>
                    <label>Asset ID</label>
                    <input required type="text" name="_id" value={formData._id} onChange={handleInputChange} disabled={mode === 'edit'} />
                  </div>
                  <div className={styles.modalFieldGroup}>
                    <label>Category</label>
                    <input required type="text" name="category" value={formData.category} onChange={handleInputChange} placeholder="Laptop, Keyboard, Monitor" />
                  </div>
                  <div className={styles.modalFieldGroup}>
                    <label>Model Number</label>
                    <input type="text" name="modelNumber" value={formData.modelNumber} onChange={handleInputChange} placeholder="e.g., M3 Max, 32GB RAM" />
                  </div>
                  <div className={styles.modalFieldGroup}>
                    <label>Brand</label>
                    <input type="text" name="brand" value={formData.brand} onChange={handleInputChange} placeholder="e.g., Apple, Dell" />
                  </div>
                  <div className={styles.modalFieldGroup}>
                    <label>Manufacture Year</label>
                    <input type="text" name="manufactureYear" value={formData.manufactureYear} onChange={handleInputChange} placeholder="2025" />
                  </div>
                </div>
              </div>

              <div className={styles.modalFormSection}>
                <h4 className={styles.modalSectionSubTitle}>Assignment & Allocation</h4>
                <div className={styles.modalFormGridThree}>
                  <div className={styles.modalFieldGroup}>
                    <label>Assign To Employee</label>
                    <select 
                      name="assignedTo" 
                      value={formData.assignedTo} 
                      onChange={handleInputChange}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1.5px solid #cbd5e1',
                        borderRadius: '6px',
                        fontSize: '0.9rem',
                        color: '#334155',
                        backgroundColor: '#ffffff'
                      }}
                    >
                      <option value="">Unassigned</option>
                      {employees.map(emp => {
                        const fullName = `${emp.firstName} ${emp.lastName}`;
                        const valueStr = `${fullName} (${emp.employeeCode})`;
                        return (
                          <option key={emp._id} value={valueStr}>
                            {fullName} ({emp.employeeCode})
                          </option>
                        );
                      })}
                    </select>
                  </div>
                  <div className={styles.modalFieldGroup}>
                    <label>Department</label>
                    <select name="department" value={formData.department} onChange={handleInputChange}>
                      <option value="Engineering">Engineering</option>
                      <option value="Human Resources">Human Resources</option>
                      <option value="Marketing">Marketing</option>
                    </select>
                  </div>
                  <div className={styles.modalFieldGroup}>
                    <label>Asset Value (₹)</label>
                    <input type="text" name="assetValue" value={formData.assetValue} onChange={handleInputChange} placeholder="95,000" />
                  </div>
                  <div className={styles.modalFieldGroup}>
                    <label>Issue Date</label>
                    <input type="text" name="issueDate" value={formData.issueDate} onChange={handleInputChange} />
                  </div>
                  <div className={styles.modalFieldGroup}>
                    <label>Return Date</label>
                    <input type="text" name="returnDate" value={formData.returnDate} onChange={handleInputChange} placeholder="dd/mm/yyyy" />
                  </div>
                </div>
              </div>

              <div className={styles.modalFormSection}>
                <h4 className={styles.modalSectionSubTitle}>Asset Status & Parameters</h4>
                <div className={styles.modalFormGridTwo}>
                  <div className={styles.modalFieldGroup}>
                    <label>Status</label>
                    <select name="status" value={formData.status} onChange={handleInputChange}>
                      <option value="Active">Active</option>
                      <option value="In Use">In Use</option>
                      <option value="Maintenance">Maintenance</option>
                    </select>
                  </div>
                  <div className={styles.modalFieldGroup}>
                    <label>Condition</label>
                    <select name="condition" value={formData.condition} onChange={handleInputChange}>
                      <option value="Excellent">Excellent</option>
                      <option value="Good">Good</option>
                      <option value="Damaged">Damaged</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className={styles.modalActionButtons} style={{ margin: 0, padding: 0, border: 'none' }}>
                <button type="button" className={styles.btnCancel} onClick={onClose} disabled={loading}>Cancel</button>
                <button type="submit" className={styles.btnSubmit} disabled={loading}>
                  {loading ? 'Saving...' : (mode === 'edit' ? 'Save Changes' : 'Create Asset')}
                </button>
              </div>
            </form>
          </>
        )}

        {/* ── STEP 2: BROADCASTER SUCCESS NOTIFICATION ── */}
        {currentStep === 2 && (
          <div className={styles.wizardStepBody} style={{ padding: '32px' }}>
            <div className={styles.successIcon}><span>&#10003;</span></div>
            <h2 className={styles.successTitle}>Asset {mode === 'edit' ? 'Updated!' : 'Created Successfully!'}</h2>
            <p className={styles.successSubtitle}>The transaction operations successfully modified ledger states.</p>
            
            <div className={styles.successDetailsCard} style={{ width: '100%' }}>
              <div className={styles.successDetailsHeader}>
                <div className={styles.successDetailsColumn}>
                  <div className={styles.successLabel}>Asset ID</div>
                  <div className={styles.successValue}>{formData._id}</div>
                </div>
                <div className={styles.successDetailsColumn}>
                  <div className={styles.successLabel}>Asset Name</div>
                  <div className={styles.successValue}>{formData.name}</div>
                </div>
              </div>
              <div className={styles.successDetailsBody}>
                <div className={styles.successDetailRow}>
                  <strong>Allocation Operator:</strong>
                  <span>{formData.assignedTo || 'Unassigned'}</span>
                </div>
                <div className={styles.successDetailRow}>
                  <strong>Hardware Category:</strong>
                  <span>{formData.category}</span>
                </div>
              </div>
            </div>

            <button type="button" className={styles.returnDirectoryButton} onClick={onSaved}>
              Back to Directory
            </button>
          </div>
        )}

      </div>
    </div>
  );
}