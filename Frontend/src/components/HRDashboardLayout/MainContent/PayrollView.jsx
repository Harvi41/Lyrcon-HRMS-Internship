import React, { useState, useEffect } from "react";
import styles from "../HRDashboardLayout.module.css";
import {
  getAllEmployees,
  getMonthlyPayrollDashboard,
  processMonthlyPayroll,
  downloadPayslipPDF,
  loginUser,
} from "../../../lib/axios";

const PayrollView = () => {
  const [employees, setEmployees] = useState([]);
  const [payrollRecords, setPayrollRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  const [disbursementTotal, setDisbursementTotal] = useState(0);
  const [pendingPFValue, setPendingPFValue] = useState(0);

  // Default to current month (YYYY-MM)
  const [currentMonth, setCurrentMonth] = useState(
    `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`,
  );

  // POPUP MODAL CONTROL STATES
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [securityPin, setSecurityPin] = useState("");
  const [isProcessingBatch, setIsProcessingBatch] = useState(false);
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState([]);

  // State to track selected employee checkboxes inside the wizard run list
  // const [selectedEmployeeIds, setSelectedEmployeeIds] = useState([]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // 1. Fetch all employees
      const empRes = await getAllEmployees();
      const emps = empRes.data?.data || empRes.data || [];
      const activeEmps = emps.filter((e) => !e.isDeleted);

      // 2. Fetch payrolls for the current month
      const payRes = await getMonthlyPayrollDashboard(currentMonth);
      const records = payRes.data || [];

      setEmployees(activeEmps);
      setPayrollRecords(records);

      // 3. ROBUST DYNAMIC SUMMARY GENERATOR ENGINE (FIXED PF ACCUMULATION)
      let totalDisbursed = 0;
      let totalPF = 0;

      activeEmps.forEach((emp) => {
        const pRecord = records.find(
          (p) => p?.employeeId?._id === emp?._id || p?.employeeId === emp?._id,
        );

        let isPaid = false;
        if (pRecord && pRecord?.paymentStatus) {
          const recordStatusClean = pRecord.paymentStatus.toLowerCase().trim();
          if (
            ["paid", "processed", "draft", "success"].includes(
              recordStatusClean,
            )
          ) {
            isPaid = true;
          }
        }

        if (isPaid && pRecord) {
          totalDisbursed += Number(pRecord.netSalary || 0);
        } else {
          if (pRecord?.providentFund?.employeeContribution) {
            totalPF += Number(pRecord.providentFund.employeeContribution);
          } else {
            const monthlyBase = Math.round((Number(emp?.baseCTC) || 0) / 12);
            const basicSalarySplit =
              monthlyBase > 0 ? monthlyBase * 0.5 : 15000;
            totalPF += Math.round(basicSalarySplit * 0.12);
          }
        }
      });

      setDisbursementTotal(totalDisbursed);
      setPendingPFValue(totalPF);
    } catch (err) {
      console.error("Failed to fetch payroll dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentMonth]);

  // Combine employees and payroll records for the UI list layout table safely
  const mergedData = employees.map((emp) => {
    const pRecord = payrollRecords.find(
      (p) => p?.employeeId?._id === emp?._id || p?.employeeId === emp?._id,
    );
    const monthlyBase = Math.round((emp?.baseCTC || 0) / 12);

    let status = "Unpaid";
    if (pRecord && pRecord?.paymentStatus) {
      const recordStatusClean = pRecord.paymentStatus.toLowerCase().trim();
      if (
        ["paid", "processed", "draft", "success"].includes(recordStatusClean)
      ) {
        status = "Paid";
      }
    }

    return {
      ...emp,
      monthlyBase,
      payrollId: pRecord ? pRecord._id : null,
      netPayout: pRecord
        ? Number(pRecord.netSalary) || 0
        : Math.round(monthlyBase * 0.75),
      status,
    };
  });

  const unpaidProfiles = mergedData.filter((emp) => emp.status !== "Paid");

  // Open the target selection dialog box panel
  const handleOpenWizard = () => {
    if (unpaidProfiles.length === 0) {
      alert(
        "Info: Active monthly payroll cycles have already been successfully finalized for all available records.",
      );
      return;
    }

    // Automatically check every unpaid profile to start with
    setSelectedEmployeeIds(unpaidProfiles.map((emp) => emp._id));
    setWizardStep(1);
    setSecurityPin("");
    setIsWizardOpen(true);
  };

  // Checkbox toggle logic matching targeted profiles
  const handleToggleEmployeeSelection = (employeeId) => {
    if (selectedEmployeeIds.includes(employeeId)) {
      setSelectedEmployeeIds((prev) => prev.filter((id) => id !== employeeId));
    } else {
      setSelectedEmployeeIds((prev) => [...prev, employeeId]);
    }
  };

  // Master Select All / Unselect All checkbox toggle action
  const handleToggleSelectAll = () => {
    if (selectedEmployeeIds.length === unpaidProfiles.length) {
      setSelectedEmployeeIds([]);
    } else {
      setSelectedEmployeeIds(unpaidProfiles.map((emp) => emp._id));
    }
  };

  // Calculate runtime sum based on checkboxes checking state matrix definitions
  const activeSelectedProfiles = unpaidProfiles.filter((emp) =>
    selectedEmployeeIds.includes(emp._id),
  );
  const dynamicBatchPayoutSum = activeSelectedProfiles.reduce(
    (sum, curr) => sum + curr.netPayout,
    0,
  );

  const handleNextStep = () => {
    if (selectedEmployeeIds.length === 0) {
      alert("Please check at least one employee profile box to proceed.");
      return;
    }
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

      const cachedData =
        window.localStorage.getItem("corehr_user") ||
        window.localStorage.getItem("user");
      const currentUser = JSON.parse(cachedData || "{}");

      const finalEmailToSend =
        currentUser?.email || currentUser?.user?.email || currentUser?.username;

      if (!finalEmailToSend) {
        alert(
          "Session Error: Could not parse your administrative login email address out of active local cache files.",
        );
        setIsProcessingBatch(false);
        return;
      }

      // Re-authenticate securely via the backend router login endpoint gate
      await loginUser({ email: finalEmailToSend, password: securityPin });

      // Executes asynchronous pipeline explicitly ONLY for checked selection arrays

      await Promise.all(
        activeSelectedProfiles.map(async (profile) => {
          try {
            // ✅ Enforces exact spelling match parameters with the backend validation keys
            await processMonthlyPayroll({
              employeeId: profile._id || profile.id || profile.raw?._id, // 🛡️ Triple-check fallback variables
              payrollMonth: currentMonth, // 👈 Ensure this matches exactly what the backend reads
            });
          } catch (err) {
            console.error(
              `Failed to process individual row run for component id: ${profile._id}`,
              err,
            );
          }
        }),
      );

      await fetchData();
      setWizardStep(3);
    } catch (err) {
      console.error("Disbursement authentication crash caught:", err);
      if (
        err?.response?.status === 400 ||
        err?.response?.status === 401 ||
        err?.response?.data?.message?.includes("password")
      ) {
        alert(
          "Security Verification Failed: Incorrect operational password verification entry.",
        );
      } else {
        alert(
          err?.response?.data?.message ||
          "Error processing transaction workflow sequence.",
        );
      }
    } finally {
      setIsProcessingBatch(false);
    }
  };

  const handleDownloadPayslipAsset = async (emp) => {
    if (emp?.status !== "Paid" || !emp?.payrollId) return;
    try {
      const response = await downloadPayslipPDF(emp.payrollId);
      const url = window.URL.createObjectURL(
        new Blob([response.data], { type: "application/pdf" }),
      );
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `Payslip_${emp.firstName || "Employee"}_${currentMonth}.pdf`,
      );
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      console.error(err);
      alert(
        "Failed to download payslip. Ensure the payroll was fully generated.",
      );
    }
  };

  const getDisplayPeriodLabel = () => {
    const parts = currentMonth.split("-");
    if (parts.length === 2) {
      const date = new Date(Number(parts[0]), Number(parts[1]) - 1, 1);
      return date
        .toLocaleString("en-US", { month: "short", year: "numeric" })
        .toUpperCase();
    }
    return currentMonth;
  };

  return (
    <div className={styles.dashboardGrid}>
      {/* Dynamic Summary Cards Layout Row */}
      <div
        className={styles.metricsRow}
        style={{ gridTemplateColumns: "repeat(3, 1fr)" }}
      >
        <div className={styles.metricCard}>
          <h3>TOTAL DISBURSED ({getDisplayPeriodLabel()})</h3>
          <div className={styles.metricValueWrapper}>
            <span className={styles.metricValue}>
              ₹
              {disbursementTotal.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
        </div>

        <div className={styles.metricCard}>
          <h3>PENDING REGULATORY PF</h3>
          <div className={styles.metricValueWrapper}>
            <span className={`${styles.metricValue} ${styles.warnText}`}>
              ₹
              {pendingPFValue.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
        </div>

        <div className={`${styles.metricCard} ${styles.transparentCard}`}>
          <button
            className={styles.primaryActionButtonWidth}
            onClick={handleOpenWizard}
            type="button"
            style={{
              width: "100%",
              height: "100%",
              fontSize: "1.1rem",
              cursor: "pointer",
            }}
          >
            Execute Run
          </button>
        </div>
      </div>

      {/* Main Core Table Ledger Layout Grid */}
      <div className={styles.activityStream}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
          }}
        >
          <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 600 }}>
            Employee Payroll Ledger
          </h3>
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
              <th style={{ width: '40px', textAlign: 'center' }}>
                <input
                  type="checkbox"
                  checked={unpaidProfiles.length > 0 && selectedEmployeeIds.length === unpaidProfiles.length}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedEmployeeIds(unpaidProfiles.map(emp => emp._id));
                    } else {
                      setSelectedEmployeeIds([]);
                    }
                  }}
                  disabled={unpaidProfiles.length === 0}
                  style={{ cursor: unpaidProfiles.length === 0 ? 'not-allowed' : 'pointer' }}
                />
              </th>
              <th>EMPLOYEE</th>
              <th>BASE SALARY (MONTHLY)</th>
              <th>NET PAYOUT (₹)</th>
              <th>STATUS</th>
              <th>PAYSLIP PDF</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan="5"
                  style={{
                    textAlign: "center",
                    padding: "24px",
                    color: "#64748b",
                  }}
                >
                  Loading real-time payroll data...
                </td>
              </tr>
            ) : mergedData.length === 0 ? (
              <tr>
                <td
                  colSpan="5"
                  style={{
                    textAlign: "center",
                    padding: "24px",
                    color: "#64748b",
                  }}
                >
                  No active employees found.
                </td>
              </tr>
            ) : (
              mergedData.map((emp) => {
                const currentPillIsPaid = emp.status === "Paid";

                return (
                  <tr key={emp._id}>
                    <td style={{ textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={selectedEmployeeIds.includes(emp._id)}
                        onChange={() => {
                          setSelectedEmployeeIds(prev =>
                            prev.includes(emp._id)
                              ? prev.filter(id => id !== emp._id)
                              : [...prev, emp._id]
                          );
                        }}
                        disabled={currentPillIsPaid}
                        style={{ cursor: currentPillIsPaid ? 'not-allowed' : 'pointer' }}
                      />
                    </td>
                    <td>
                      <div className={styles.userColumnCell}>
                        <strong style={{ color: "#0f172a", fontWeight: "700" }}>
                          {emp.firstName} {emp.lastName}
                        </strong>
                        <span
                          className={styles.subTextEmail}
                          style={{
                            fontSize: "0.8rem",
                            color: "#64748b",
                            marginTop: "2px",
                          }}
                        >
                          {emp.department}
                        </span>
                      </div>
                    </td>
                    <td style={{ color: "#334155", fontWeight: "500" }}>
                      ₹{emp.monthlyBase.toLocaleString("en-IN")}.00
                    </td>
                    <td>
                      <strong style={{ color: "#0f172a", fontWeight: "700" }}>
                        ₹{emp.netPayout.toLocaleString("en-IN")}.00
                      </strong>
                    </td>
                    <td>
                      <span
                        className={
                          currentPillIsPaid
                            ? styles.pillPaidBadge
                            : styles.statusOnboard
                        }
                        style={{
                          display: "inline-block",
                          textAlign: "center",
                          minWidth: "70px",
                        }}
                      >
                        {emp.status}
                      </span>
                    </td>
                    <td>
                      <button
                        className={
                          currentPillIsPaid
                            ? styles.secondaryTableButton
                            : styles.inlineTableButtonDisabled
                        }
                        onClick={() => handleDownloadPayslipAsset(emp)}
                        type="button"
                        disabled={!currentPillIsPaid}
                        style={{
                          cursor: currentPillIsPaid ? "pointer" : "not-allowed",
                        }}
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

      {/* RE-ENGINEERED OVERLAY DIALOG BOX WITH INTERNAL EMPLOYEE CHECKBOXES */}
      {isWizardOpen && (
        <div className={styles.modalOverlay}>
          <div
            className={styles.modalContent}
            style={{ maxWidth: "520px", padding: "24px", borderRadius: "12px" }}
          >
            {/* STEP 1: CHECKBOX SELECTION LIST DRAWER */}
            {wizardStep === 1 && (
              <div className={styles.wizardStepBody}>
                <div
                  className={styles.wizardWarningHeader}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    marginBottom: "12px",
                  }}
                >
                  <div
                    style={{
                      padding: "6px 10px",
                      backgroundColor: "#e0e7ff",
                      color: "#4f46e5",
                      borderRadius: "50%",
                      fontSize: "1.2rem",
                    }}
                  >
                    ⚙️
                  </div>
                  <h2 style={{ fontSize: "1.25rem", margin: 0 }}>
                    Select Employees for Payroll
                  </h2>
                </div>
                <p
                  style={{
                    fontSize: "0.88rem",
                    color: "#64748b",
                    textAlign: "left",
                    marginBottom: "16px",
                  }}
                >
                  Check the box next to each employee you want to include in
                  this processing cycle.
                </p>

                {/* Master Select Toggle Bar */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "10px 14px",
                    background: "#f8fafc",
                    borderRadius: "8px",
                    marginBottom: "12px",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      fontSize: "0.88rem",
                      fontWeight: "600",
                      color: "#334155",
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={
                        selectedEmployeeIds.length === unpaidProfiles.length &&
                        unpaidProfiles.length > 0
                      }
                      onChange={handleToggleSelectAll}
                      style={{ transform: "scale(1.15)", cursor: "pointer" }}
                    />
                    Select All Unpaid ({unpaidProfiles.length})
                  </label>
                  <span
                    style={{
                      fontSize: "0.85rem",
                      color: "#64748b",
                      fontWeight: "500",
                    }}
                  >
                    Checked: <strong>{selectedEmployeeIds.length}</strong>
                  </span>
                </div>

                {/* Individual Checkbox Scrollable List Area Wrapper */}
                <div
                  style={{
                    maxHeight: "240px",
                    overflowY: "auto",
                    border: "1px solid #cbd5e1",
                    borderRadius: "8px",
                    padding: "6px 0",
                    backgroundColor: "#fff",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  {unpaidProfiles.map((emp) => {
                    const isChecked = selectedEmployeeIds.includes(emp._id);
                    return (
                      <label
                        key={emp._id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          padding: "10px 16px",
                          cursor: "pointer",
                          transition: "background 0.15s",
                          borderBottom: "1px solid #f1f5f9",
                          background: isChecked ? "#f5f3ff" : "transparent",
                          textAlign: "left",
                        }}
                        className={styles.checkboxRowItem}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() =>
                            handleToggleEmployeeSelection(emp._id)
                          }
                          style={{ transform: "scale(1.1)", cursor: "pointer" }}
                        />
                        <div
                          style={{ display: "flex", flexDirection: "column" }}
                        >
                          <span
                            style={{
                              fontSize: "0.9rem",
                              fontWeight: "600",
                              color: "#1e293b",
                            }}
                          >
                            {emp.firstName} {emp.lastName}
                          </span>
                          <span
                            style={{ fontSize: "0.75rem", color: "#64748b" }}
                          >
                            {emp.department} • ₹
                            {emp.netPayout.toLocaleString("en-IN")}.00
                          </span>
                        </div>
                      </label>
                    );
                  })}
                </div>

                {/* Calculated Running Financial Metrics Summary Box */}
                <div
                  style={{
                    marginTop: "16px",
                    padding: "12px 16px",
                    background: "#f0fdf4",
                    borderRadius: "8px",
                    border: "1px solid #bbf7d0",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.85rem",
                      fontWeight: "600",
                      color: "#166534",
                    }}
                  >
                    Target Batch Total Outflow:
                  </span>
                  <strong style={{ fontSize: "1.05rem", color: "#15803d" }}>
                    ₹{dynamicBatchPayoutSum.toLocaleString("en-IN")}.00
                  </strong>
                </div>

                <div
                  className={styles.wizardFooterActions}
                  style={{ display: "flex", gap: "12px", marginTop: "20px" }}
                >
                  <button
                    type="button"
                    className={styles.secondaryActionButton}
                    onClick={handleCloseWizard}
                    style={{ flex: 1, cursor: "pointer" }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className={styles.primaryActionButton}
                    onClick={handleNextStep}
                    style={{ flex: 1.5, cursor: "pointer" }}
                  >
                    Proceed to Authorization
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: SECURITY AUTHORIZATION passthrough */}
            {wizardStep === 2 && (
              <form
                onSubmit={handleFinalBatchDisbursement}
                className={styles.wizardStepBody}
              >
                <div style={{ textAlign: "center", marginBottom: "20px" }}>
                  <h2
                    style={{
                      fontSize: "1.35rem",
                      color: "#0f172a",
                      margin: "0 0 6px 0",
                    }}
                  >
                    Secure Gate Authority
                  </h2>
                  <p
                    style={{ color: "#64748b", fontSize: "0.88rem", margin: 0 }}
                  >
                    Please enter your password to authorize payroll disburse for{" "}
                    <strong>{selectedEmployeeIds.length}</strong> selected
                    accounts.
                  </p>
                </div>

                <div
                  style={{
                    width: "100%",
                    marginBottom: "20px",
                    textAlign: "left",
                  }}
                >
                  <label
                    htmlFor="authPinCode"
                    style={{
                      display: "block",
                      fontSize: "0.8rem",
                      fontWeight: "600",
                      color: "#475569",
                      marginBottom: "6px",
                    }}
                  >
                    ADMIN PASSWORD
                  </label>
                  <input
                    type="password"
                    id="authPinCode"
                    placeholder="••••••••"
                    value={securityPin}
                    onChange={(e) => setSecurityPin(e.target.value)}
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      padding: "12px",
                      borderRadius: "8px",
                      border: "1px solid #cbd5e1",
                      fontSize: "1.1rem",
                      letterSpacing: "0.1em",
                    }}
                    autoComplete="current-password"
                    required
                  />
                </div>

                <div
                  className={styles.wizardFooterActions}
                  style={{ display: "flex", gap: "12px" }}
                >
                  <button
                    type="button"
                    className={styles.secondaryActionButton}
                    onClick={() => setWizardStep(1)}
                    disabled={isProcessingBatch}
                    style={{ flex: 1, cursor: "pointer" }}
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className={styles.successActionButton}
                    disabled={!securityPin || isProcessingBatch}
                    style={{
                      flex: 1.5,
                      cursor: isProcessingBatch ? "not-allowed" : "pointer",
                    }}
                  >
                    {isProcessingBatch
                      ? "Processing Disbursement Run..."
                      : "Confirm Disburse"}
                  </button>
                </div>
              </form>
            )}

            {/* STEP 3: TRANSACTION RUN SUCCESS SCREEN */}
            {wizardStep === 3 && (
              <div className={styles.wizardStepBody}>
                <div style={{ textAlign: "center", marginBottom: "20px" }}>
                  <div
                    style={{
                      width: "56px",
                      height: "56px",
                      borderRadius: "50%",
                      backgroundColor: "#dcfce7",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 12px",
                      border: "2px solid #bbf7d0",
                    }}
                  >
                    <svg
                      width="26"
                      height="26"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#16a34a"
                      strokeWidth="3"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                  <h2
                    style={{
                      color: "#14532d",
                      fontSize: "1.4rem",
                      margin: "0 0 4px 0",
                    }}
                  >
                    Disbursement Successful
                  </h2>
                  <p
                    style={{ color: "#64748b", fontSize: "0.88rem", margin: 0 }}
                  >
                    Financial ledger nodes updated cleanly.
                  </p>
                </div>

                <div
                  style={{
                    width: "100%",
                    margin: "20px 0",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    padding: "16px",
                    backgroundColor: "#f8fafc",
                    textAlign: "left",
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "0.88rem",
                    }}
                  >
                    <span style={{ color: "#475569" }}>Accounts Paid:</span>
                    <span style={{ color: "#0f172a", fontWeight: "600" }}>
                      {activeSelectedProfiles.length} Profiles
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "0.88rem",
                    }}
                  >
                    <span style={{ color: "#475569" }}>
                      Total Net Capital Disbursed:
                    </span>
                    <span style={{ color: "#16a34a", fontWeight: "700" }}>
                      ₹{dynamicBatchPayoutSum.toLocaleString("en-IN")}.00
                    </span>
                  </div>
                </div>

                <button
                  className={styles.returnDirectoryButton}
                  onClick={handleCloseWizard}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "8px",
                    backgroundColor: "#f1f5f9",
                    color: "#334155",
                    fontWeight: "600",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
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
