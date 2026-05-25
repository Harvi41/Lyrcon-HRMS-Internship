import React, { useState } from 'react';
import styles from '../HRDashboardLayout.module.css';

import { jsPDF } from 'jspdf';

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

    const monthName = new Date().toLocaleString('en-US', { month: 'long' });
    const doc = new jsPDF();

    // Styles & Titles
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(33, 28, 109);
    doc.text("CoreHR Management Payroll Ledger", 105, 20, { align: "center" });

    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(`Salary Statement - ${monthName} ${new Date().getFullYear()}`, 105, 28, { align: "center" });

    // Employee Detils
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    
    doc.text(`Employee ID: ${emp.id}`, 20, 45);
    doc.text(`Staff Name: ${emp.name}`, 20, 52);
    doc.text(`Department: ${emp.dept || 'N/A'}`, 20, 59);

    // Box for financial
    doc.setLineWidth(0.5);
    doc.setDrawColor(200, 200, 200);
    doc.rect(20, 68, 170, 75);

    doc.setFont("helvetica", "bold");
    doc.text("Earnings & Regulatory Deductions", 25, 78);
    
    doc.setFont("helvetica", "normal");
    doc.text("Base Salary (Gross Earnings)", 25, 90);
    doc.text(`Rs. ${emp.baseSalary.toLocaleString('en-IN')}.00`, 180, 90, { align: "right" });

    doc.setDrawColor(230, 230, 230);
    doc.line(25, 95, 185, 95);

    doc.text("Provident Fund / Tax Withholding", 25, 105);
    const deductions = emp.baseSalary - emp.netPayout;
    doc.text(`- Rs. ${deductions.toLocaleString('en-IN')}.00`, 180, 105, { align: "right" });

    doc.line(25, 110, 185, 110);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("NET CASH PAYOUT", 25, 125);
    const netPayoutStr = `Rs. ${emp.netPayout.toLocaleString('en-IN')}.00`;
    doc.text(netPayoutStr, 180, 125, { align: "right" });

    // Footer
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text("Generated securely via CoreHR Corporate Cloud Portal.", 105, 160, { align: "center" });

    // Properties
    const filename = `lyrcon_${monthName.toLowerCase()}_salary.pdf`;
    doc.setProperties({
        title: filename,
        subject: `Salary Statement for ${emp.name}`,
    });

    const pdfBlobUrl = doc.output('bloburl');
    // Open in a new Chrome tab/window for the user to view using PDF viewer
    window.open(pdfBlobUrl, '_blank');
    
    // Automatically trigger a download as well
    const virtualAnchorNode = document.createElement('a');
    virtualAnchorNode.setAttribute('href', pdfBlobUrl);
    virtualAnchorNode.setAttribute('download', filename);
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