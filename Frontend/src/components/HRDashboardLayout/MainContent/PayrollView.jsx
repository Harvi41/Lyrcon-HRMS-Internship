import React, { useState } from 'react';
import styles from '../HRDashboardLayout.module.css';

const PayrollView = () => {
  // 1. DYNAMIC METRICS SUMMARY STATE
  const [disbursementTotal, setDisbursementTotal] = useState(1245000);
  const pendingPFValue = "₹1,18,400.00";

  // 2. CORE LEDGER LIST DATA SEED MATRIX
  const [payrollEmployees, setPayrollEmployees] = useState([
    { id: 'EMP-1001', name: 'Prince Ghevariya', dept: 'Engineering', baseSalary: 185000, netPayout: 162400, status: 'Paid' },
    { id: 'EMP-1042', name: 'Nidhish Zala', dept: 'Engineering', baseSalary: 95000, netPayout: 82100, status: 'Unpaid' },
    { id: 'EMP-1002', name: 'Sarah Jenkins', dept: 'Human Resources', baseSalary: 110000, netPayout: 96200, status: 'Unpaid' }
  ]);

  // 3. POPUP MODAL CONTROL STATES
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [securityPin, setSecurityPin] = useState('');

  // Computations for processing review metrics
  const unpaidProfiles = payrollEmployees.filter(emp => emp.status === 'Unpaid');
  const batchPayoutSum = unpaidProfiles.reduce((sum, curr) => sum + curr.netPayout, 0);

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

  // 4. ATOMIC BATCH TRANSACTION SUBMISSION
  const handleFinalBatchDisbursement = (e) => {
    e.preventDefault();
    if (securityPin === '1234') {
      // Execute immutable status mutation upgrades
      setDisbursementTotal(prevSum => prevSum + batchPayoutSum);
      setPayrollEmployees(prevList => 
        prevList.map(emp => emp.status === 'Unpaid' ? { ...emp, status: 'Paid' } : emp)
      );
      setWizardStep(3); // Shift view profile to success receipt frame
    }
  };

  // 5. FILE EXPORTER STREAM GENERATOR
  const handleDownloadPayslipAsset = (emp) => {
    if (emp.status !== 'Paid') return;

    const documentationBody = `
============================================================
             COREHR MANAGEMENT PAYROLL LEDGER STATEMENT
============================================================
  Employee ID       : ${emp.id}
  Staff Name        : ${emp.name}
  Allocated Dept    : ${emp.dept}
------------------------------------------------------------
  Base Earnings Struct  : ₹${emp.baseSalary.toLocaleString('en-IN')}.00
  Regulatory Provident  : Deductions Finalized
------------------------------------------------------------
  NET CASH PAYOUT   : ₹${emp.netPayout.toLocaleString('en-IN')}.00
  TXN TRANSFER LOG  : Committed & Released
============================================================
   Generated securely via CoreHR Corporate Cloud Portal
    `;

    const blobFileElement = new Blob([documentationBody], { type: 'text/plain;charset=utf-8;' });
    const virtualAnchorNode = document.createElement('a');
    virtualAnchorNode.setAttribute('href', URL.createObjectURL(blobFileElement));
    virtualAnchorNode.setAttribute('download', `Payslip_${emp.id}_Statement.txt`);
    virtualAnchorNode.style.visibility = 'hidden';
    document.body.appendChild(virtualAnchorNode);
    virtualAnchorNode.click();
    document.body.removeChild(virtualAnchorNode);
  };

  return (
    <div className={styles.dashboardGrid}>
      {/* Dynamic Summary Cards Layout Row */}
      <div className={styles.metricsRow}>
        <div className={styles.metricCard}>
          <h3>TOTAL DISBURSED (MONTHLY)</h3>
          <div className={styles.metricValueWrapper}>
            <span className={styles.metricValue}>
              ₹{disbursementTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>
        
        <div className={styles.metricCard}>
          <h3>PENDING REGULATORY PF</h3>
          <div className={styles.metricValueWrapper}>
            <span className={`${styles.metricValue} ${styles.warnText}`}>{pendingPFValue}</span>
          </div>
        </div>
        
        <div className={`${styles.metricCard} ${styles.transparentCard}`}>
          <button 
            className={styles.primaryActionButtonWidth}
            onClick={handleOpenWizard}
            type="button"
          >
            Execute Run
          </button>
        </div>
      </div>

      {/* Main Core Directory Table */}
      <div className={styles.activityStream}>
        <table className={styles.activityTable}>
          <thead>
            <tr>
              <th>EMPLOYEE</th>
              <th>BASE SALARY</th>
              <th>NET PAYOUT (₹)</th>
              <th>STATUS</th>
              <th>PAYSLIP PDF</th>
            </tr>
          </thead>
          <tbody>
            {payrollEmployees.map((emp) => {
              const currentPillIsPaid = emp.status === 'Paid';
              
              return (
                <tr key={emp.id || emp.name}>
                  <td>
                    <div className={styles.userColumnCell}>
                      <strong>{emp.name}</strong>
                      <span className={styles.subTextEmail}>{emp.dept}</span>
                    </div>
                  </td>
                  <td>₹{emp.baseSalary.toLocaleString('en-IN')}.00</td>
                  <td><strong>₹{emp.netPayout.toLocaleString('en-IN')}.00</strong></td>
                  <td>
                    <span className={currentPillIsPaid ? styles.pillPaidBadge : styles.statusOnboard} style={{ display: 'inline-block', textAlign: 'center', minWidth: '60px' }}>
                      {emp.status}
                    </span>
                  </td>
                  <td>
                    <button 
                      className={currentPillIsPaid ? styles.secondaryTableButton : styles.inlineTableButtonDisabled}
                      onClick={() => handleDownloadPayslipAsset(emp)}
                      type="button"
                    >
                      Download
                    </button>
                  </td>
                </tr>
              );
            })}
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

                <div className={styles.purgeSummaryMetadataGrid} style={{ border: '1px solid #cbd5e1', width: '100%' }}>
                  <div className={styles.summaryMetaRow}>
                    <div>
                      <span className={styles.metaLabelText}>Pending Profiles:</span>
                      <strong className={styles.metaValueText}>{unpaidProfiles.length} Staff Records</strong>
                    </div>
                    <div>
                      <span className={styles.metaLabelText}>Total Outflow Volume:</span>
                      <strong className={styles.metaValueText} style={{ color: '#4f46e5' }}>₹{batchPayoutSum.toLocaleString('en-IN')}.00</strong>
                    </div>
                  </div>
                </div>

                <div className={styles.wizardFooterActions}>
                  <button className={styles.secondaryActionButton} onClick={handleCloseWizard}>Cancel</button>
                  <button className={styles.primaryActionButton} onClick={handleNextStep}>Proceed to Authorization</button>
                </div>
              </div>
            )}

            {/* STEP 2: SECURITY PASSTHROUGH MATCH */}
            {wizardStep === 2 && (
              <form onSubmit={handleFinalBatchDisbursement} className={styles.wizardStepBody}>
                <div className={styles.wizardHeaderSimple}>
                  <h2>Secure Gate Authority</h2>
                  <p className={styles.wizardSubtitleText}>
                    Please provide your administrative authorization code PIN to execute bank transfers.
                  </p>
                </div>

                <div className={styles.nameTemplateTargetBox} style={{ fontSize: '0.9rem', padding: '10px' }}>
                  💡 Test Code Tip: Enter <strong>1234</strong> to approve transaction
                </div>

                <div className={styles.inputGroup} style={{ width: '100%', marginBottom: '12px' }}>
                  <label htmlFor="authPinCode">Secure System PIN</label>
                  <input
                    type="password"
                    id="authPinCode"
                    placeholder="••••"
                    maxLength="4"
                    value={securityPin}
                    onChange={(e) => setSecurityPin(e.target.value)}
                    style={{ textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.3em', padding: '8px' }}
                    autoComplete="off"
                    required
                  />
                </div>

                <div className={styles.wizardFooterActions}>
                  <button type="button" className={styles.secondaryActionButton} onClick={handleCloseWizard}>Abort</button>
                  <button 
                    type="submit" 
                    className={styles.successActionButton}
                    disabled={securityPin !== '1234'}
                    style={{ borderRadius: '10px' }}
                  >
                    Confirm Batch Disburse
                  </button>
                </div>
              </form>
            )}

            {/* STEP 3: SUCCESS TRANSMISSION RECEPTACLE SUMMARY */}
            {wizardStep === 3 && (
              <div className={styles.wizardStepBody}>
                <div className={styles.wizardSuccessHeader}>
                  <div className={styles.successIconCircle} style={{ backgroundColor: '#dcfce7', borderColor: '#bbf7d0' }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                  <h2 style={{ color: '#14532d' }}>Batch Core Run Success</h2>
                  <p className={styles.wizardMutedText} style={{ margin: 0 }}>Capital assets distributed and ledger nodes committed cleanly.</p>
                </div>

                <div className={styles.purgeSummaryMetadataGrid} style={{ width: '100%', margin: '18px 0' }}>
                  <div className={styles.summarySystemLogsBox} style={{ borderTop: 'none' }}>
                    <p><strong>action system log:</strong> <span>Ledger settlement verified</span></p>
                    <p><strong>bank wire status:</strong> <span>Transfers transmitted instantly</span></p>
                    <p><strong>payout aggregate:</strong> <span style={{ color: '#16a34a', fontWeight: '700' }}>₹{batchPayoutSum.toLocaleString('en-IN')}.00</span></p>
                  </div>
                </div>

                <button className={styles.returnDirectoryButton} onClick={handleCloseWizard}>
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