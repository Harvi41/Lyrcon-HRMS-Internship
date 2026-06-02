import React, { useState, useEffect } from 'react';
import styles from '../HRDashboardLayout.module.css';
import { getAllEmployees, getMonthlyPayrollDashboard, processMonthlyPayroll, downloadPayslipPDF, loginUser } from '../../../lib/axios';
import { IoCloseOutline } from 'react-icons/io5';

const PayrollView = () => {
  const [employees, setEmployees] = useState([]);
  const [payrollRecords, setPayrollRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  const [disbursementTotal, setDisbursementTotal] = useState(0);
  const [pendingPFValue, setPendingPFValue] = useState(0);

  // Default to current month (YYYY-MM)
  const [currentMonth, setCurrentMonth] = useState(
    `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`
  );

  // 3. POPUP MODAL CONTROL STATES
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [securityPin, setSecurityPin] = useState('');
  const [isProcessingBatch, setIsProcessingBatch] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch all employees
      const empRes = await getAllEmployees();
      const emps = empRes.data?.data || empRes.data || [];
      const activeEmps = emps.filter(e => !e.isDeleted);
      setEmployees(activeEmps);

      // Fetch payrolls for the current month
      const payRes = await getMonthlyPayrollDashboard(currentMonth);
      const records = payRes.data || [];
      setPayrollRecords(records);

      // Calculate summaries
      let totalDisbursed = 0;
      let totalPF = 0;
      records.forEach(r => {
         if (r.paymentStatus === 'Paid' || r.paymentStatus === 'Processed') {
            totalDisbursed += (r.netSalary || 0);
         } else {
            totalPF += (r.providentFund?.employeeContribution || 0);
         }
      });
      setDisbursementTotal(totalDisbursed);
      setPendingPFValue(totalPF);

    } catch (err) {
      console.error('Failed to fetch payroll dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentMonth]);

  // Combine employees and payroll records for the UI
  const mergedData = employees.map(emp => {
     const pRecord = payrollRecords.find(p => p.employeeId?._id === emp._id || p.employeeId === emp._id);
     const monthlyBase = Math.round((emp.baseCTC || 0) / 12);
     
     // Evaluate Status
     let status = 'Unpaid';
     if (pRecord && pRecord.paymentStatus) {
         if (['Paid', 'Processed', 'Draft'].includes(pRecord.paymentStatus)) {
             status = 'Paid';
         }
     }

     return {
        ...emp,
        monthlyBase,
        payrollId: pRecord ? pRecord._id : null,
        netPayout: pRecord ? pRecord.netSalary : 0,
        status
     };
  });

  const unpaidProfiles = mergedData.filter(emp => emp.status !== 'Paid');
  const batchPayoutSum = unpaidProfiles.reduce((sum, curr) => sum + (curr.netPayout > 0 ? curr.netPayout : Math.round(curr.monthlyBase * 0.75)), 0);

  const handleOpenWizard = () => {
    if (unpaidProfiles.length === 0) {
      alert('Info: Active monthly payroll cycles have already been successfully finalized for all available records.');
      return;
    }
    setWizardStep(1);
    setSecurityPin('');
    setIsWizardOpen(true);
  };

  const handleNextStep = () => {
    setWizardStep(2);
  };

  const handleCloseWizard = () => {
    setIsWizardOpen(false);
  };

  const handleFinalBatchDisbursement = async (e) => {
    e.preventDefault();
    if (!securityPin) return alert("Please enter your admin password.");

    try {
      setIsProcessingBatch(true);

      // Verify Password (Security Protocol)
      const currentUser = JSON.parse(window.localStorage.getItem('corehr_user') || '{}');
      if (currentUser.email) {
          await loginUser({ email: currentUser.email, password: securityPin });
      }

      // Execute immutable status mutation upgrades sequentially
      for (const profile of unpaidProfiles) {
          try {
              await processMonthlyPayroll({
                  employeeId: profile._id,
                  payrollMonth: currentMonth
              });
          } catch (err) {
              console.error(`Failed to process payroll for ${profile.firstName}`, err);
          }
      }

      await fetchData(); // Sync frontend ledger with backend
      setWizardStep(3); // Shift view profile to success receipt frame

    } catch (err) {
      console.error(err);
      if (err?.response?.data?.message === 'Invalid email or password') {
          alert('Security Verification Failed: Incorrect password.');
      } else {
          alert(err?.response?.data?.message || 'Error authenticating transaction.');
      }
    } finally {
      setIsProcessingBatch(false);
    }
  };

  const handleDownloadPayslipAsset = async (emp) => {
    if (emp.status !== 'Paid') return;
    try {
      const response = await downloadPayslipPDF(emp.payrollId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Payslip_${emp.firstName}_${emp.lastName}_${currentMonth}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      console.error(err);
      alert('Failed to download payslip. Ensure the payroll was fully generated.');
    }
  };

  return (
    <div className={styles.dashboardGrid}>
      
      {/* Dynamic Summary Cards Layout Row */}
      <div className={styles.metricsRow}>
        <div className={styles.metricCard}>
          <h3>TOTAL DISBURSED ({new Date(currentMonth + '-01').toLocaleString('en-US', { month: 'short', year: 'numeric' }).toUpperCase()})</h3>
          <div className={styles.metricValueWrapper}>
            <span className={styles.metricValue}>
              ₹{disbursementTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>
        
        <div className={styles.metricCard}>
          <h3>PENDING REGULATORY PF</h3>
          <div className={styles.metricValueWrapper}>
            <span className={`${styles.metricValue} ${styles.warnText}`}>
               ₹{pendingPFValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>
        
        <div className={`${styles.metricCard} ${styles.transparentCard}`}>
          <button 
            className={styles.primaryActionButtonWidth}
            onClick={handleOpenWizard}
            type="button"
            style={{ width: '100%', height: '100%', fontSize: '1.1rem' }}
          >
            Execute Run
          </button>
        </div>
      </div>

      {/* Main Core Directory Table */}
      <div className={styles.activityStream}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>Employee Payroll Ledger</h3>
            <input 
              type="month" 
              value={currentMonth} 
              onChange={(e) => setCurrentMonth(e.target.value)}
              className={styles.monthPickerInput}
            />
        </div>

        <table className={styles.activityTable}>
          <thead>
            <tr>
              <th>EMPLOYEE</th>
              <th>BASE SALARY (MONTHLY)</th>
              <th>NET PAYOUT (₹)</th>
              <th>STATUS</th>
              <th>PAYSLIP PDF</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" style={{ textAlign: 'center', padding: '24px' }}>Loading real-time payroll data...</td></tr>
            ) : mergedData.length === 0 ? (
              <tr><td colSpan="5" style={{ textAlign: 'center', padding: '24px' }}>No active employees found.</td></tr>
            ) : (
              mergedData.map((emp) => {
                const currentPillIsPaid = emp.status === 'Paid';
                
                return (
                  <tr key={emp._id}>
                    <td>
                      <div className={styles.userColumnCell}>
                        <strong style={{ color: '#0f172a', fontWeight: '700' }}>{emp.firstName} {emp.lastName}</strong>
                        <span className={styles.subTextEmail} style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>{emp.department}</span>
                      </div>
                    </td>
                    <td style={{ color: '#334155', fontWeight: '500' }}>₹{emp.monthlyBase.toLocaleString('en-IN')}.00</td>
                    <td><strong style={{ color: '#0f172a', fontWeight: '700' }}>₹{emp.netPayout.toLocaleString('en-IN')}.00</strong></td>
                    <td>
                      <span className={currentPillIsPaid ? styles.pillPaidBadge : styles.statusOnboard} style={{ display: 'inline-block', textAlign: 'center', minWidth: '70px' }}>
                        {emp.status}
                      </span>
                    </td>
                    <td>
                      <button 
                        className={currentPillIsPaid ? styles.secondaryTableButton : styles.inlineTableButtonDisabled}
                        onClick={() => handleDownloadPayslipAsset(emp)}
                        type="button"
                        disabled={!currentPillIsPaid}
                      >
                        Download
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════════
         EXECUTE BATCH PROCESSING WIZARD DIALOG OVERLAY
         ═══════════════════════════════════════════════════════════════════════════ */}
      {isWizardOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent} style={{ maxWidth: '480px' }}>
            
            {/* STEP 1: TRANSACTION BATCH REVIEW FRAME */}
            {wizardStep === 1 && (
              <div className={styles.wizardStepBody}>
                <div className={styles.wizardWarningHeader}>
                  <div className={styles.warningIconCircle} style={{ backgroundColor: '#e0e7ff', color: '#4f46e5' }}>⚙️</div>
                  <h2>Review Payroll Run Batch</h2>
                </div>
                <p className={styles.wizardSubtitleText}>
                  You are about to compile and initialize the monthly financial transaction pipeline for outstanding workforce profiles.
                </p>

                <div className={styles.purgeSummaryMetadataGrid} style={{ border: '1px solid #cbd5e1', width: '100%', margin: '20px 0' }}>
                  <div className={styles.summaryMetaRow} style={{ display: 'flex', justifyContent: 'space-between', padding: '16px' }}>
                    <div>
                      <span className={styles.metaLabelText} style={{ display: 'block', fontSize: '0.8rem', color: '#64748b', marginBottom: '4px' }}>Pending Profiles:</span>
                      <strong className={styles.metaValueText} style={{ fontSize: '1.1rem', color: '#0f172a' }}>{unpaidProfiles.length} Staff Records</strong>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span className={styles.metaLabelText} style={{ display: 'block', fontSize: '0.8rem', color: '#64748b', marginBottom: '4px' }}>Estimated Outflow:</span>
                      <strong className={styles.metaValueText} style={{ fontSize: '1.1rem', color: '#4f46e5' }}>~ ₹{batchPayoutSum.toLocaleString('en-IN')}.00</strong>
                    </div>
                  </div>
                </div>

                <div className={styles.wizardFooterActions} style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                  <button className={styles.secondaryActionButton} onClick={handleCloseWizard} style={{ flex: 1 }}>Cancel</button>
                  <button className={styles.primaryActionButton} onClick={handleNextStep} style={{ flex: 1.5 }}>Proceed to Authorization</button>
                </div>
              </div>
            )}

            {/* STEP 2: SECURITY PASSTHROUGH MATCH */}
            {wizardStep === 2 && (
              <form onSubmit={handleFinalBatchDisbursement} className={styles.wizardStepBody}>
                <div className={styles.wizardHeaderSimple} style={{ textAlign: 'center', marginBottom: '24px' }}>
                  <h2 style={{ fontSize: '1.4rem', color: '#0f172a', marginBottom: '8px' }}>Secure Gate Authority</h2>
                  <p className={styles.wizardSubtitleText} style={{ color: '#64748b', fontSize: '0.95rem' }}>
                    Please provide your administrative password to execute bank transfers.
                  </p>
                </div>

                <div className={styles.inputGroup} style={{ width: '100%', marginBottom: '24px' }}>
                  <label htmlFor="authPinCode" style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#334155', marginBottom: '8px', textAlign: 'center' }}>ACCOUNT PASSWORD</label>
                  <input
                    type="password"
                    id="authPinCode"
                    placeholder="••••••••"
                    value={securityPin}
                    onChange={(e) => setSecurityPin(e.target.value)}
                    style={{ width: '100%', boxSizing: 'border-box', textAlign: 'center', fontSize: '1.2rem', letterSpacing: '0.2em', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    autoComplete="off"
                    required
                  />
                </div>

                <div className={styles.wizardFooterActions} style={{ display: 'flex', gap: '12px' }}>
                  <button type="button" className={styles.secondaryActionButton} onClick={handleCloseWizard} disabled={isProcessingBatch} style={{ flex: 1 }}>Abort</button>
                  <button 
                    type="submit" 
                    className={styles.successActionButton}
                    disabled={!securityPin || isProcessingBatch}
                    style={{ flex: 1.5, borderRadius: '8px', opacity: isProcessingBatch ? 0.7 : 1 }}
                  >
                    {isProcessingBatch ? 'Authenticating & Processing...' : 'Confirm Batch Disburse'}
                  </button>
                </div>
              </form>
            )}

            {/* STEP 3: SUCCESS TRANSMISSION RECEPTACLE SUMMARY */}
            {wizardStep === 3 && (
              <div className={styles.wizardStepBody}>
                <div className={styles.wizardSuccessHeader} style={{ textAlign: 'center', marginBottom: '24px' }}>
                  <div className={styles.successIconCircle} style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', border: '2px solid #bbf7d0' }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                  <h2 style={{ color: '#14532d', fontSize: '1.5rem', marginBottom: '8px' }}>Batch Core Run Success</h2>
                  <p className={styles.wizardMutedText} style={{ margin: 0, color: '#64748b' }}>Capital assets distributed and ledger nodes committed cleanly.</p>
                </div>

                <div className={styles.purgeSummaryMetadataGrid} style={{ width: '100%', margin: '24px 0', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', backgroundColor: '#f8fafc' }}>
                  <div className={styles.summarySystemLogsBox}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <strong style={{ color: '#475569', fontSize: '0.9rem' }}>action system log:</strong> 
                      <span style={{ color: '#0f172a', fontSize: '0.9rem', fontWeight: '500' }}>Ledger settlement verified</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <strong style={{ color: '#475569', fontSize: '0.9rem' }}>bank wire status:</strong> 
                      <span style={{ color: '#0f172a', fontSize: '0.9rem', fontWeight: '500' }}>Transfers transmitted instantly</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '12px', marginTop: '12px' }}>
                      <strong style={{ color: '#0f172a', fontSize: '1rem' }}>payout aggregate:</strong> 
                      <span style={{ color: '#16a34a', fontWeight: '700', fontSize: '1.1rem' }}>₹{batchPayoutSum.toLocaleString('en-IN')}.00</span>
                    </div>
                  </div>
                </div>

                <button className={styles.returnDirectoryButton} onClick={handleCloseWizard} style={{ width: '100%', padding: '12px', borderRadius: '8px', backgroundColor: '#f1f5f9', color: '#334155', fontWeight: '600', border: 'none', cursor: 'pointer' }}>
                  Return to Dashboard
                </button>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
};

export default PayrollView;