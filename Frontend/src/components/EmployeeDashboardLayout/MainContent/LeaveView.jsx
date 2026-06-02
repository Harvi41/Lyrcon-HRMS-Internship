import React, { useState, useEffect } from "react";
import styles from "../EmployeeDashboardLayout.module.css";
import { getMyLeaves, applyLeave } from "../../../lib/axios";

export default function LeaveView() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  // Main Form Inputs States
  const [formType, setFormType] = useState("Casual Leave (CL)");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");

  const TOTAL_ALLOWED_LEAVES = 20;

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const { data } = await getMyLeaves();
      const mapped = data.map(r => ({
        id: r._id,
        type: r.leaveType,
        rawStart: r.startDate,
        rawEnd: r.endDate,
        dates: `${formatDateDisplay(r.startDate)} - ${formatDateDisplay(r.endDate)}`,
        status: r.status,
        reason: r.reason
      }));
      setRecords(mapped);
    } catch (error) {
      console.error("Failed to fetch leaves:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateDaysCount = (start, end) => {
    if (!start || !end) return 0;
    const sDate = new Date(start);
    const eDate = new Date(end);
    const timeDiff = eDate.getTime() - sDate.getTime();
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24)) + 1;
    return days > 0 ? days : 0;
  };

  const usedLeaves = records.reduce((total, rec) => total + calculateDaysCount(rec.rawStart, rec.rawEnd), 0);
  const availableLeaves = TOTAL_ALLOWED_LEAVES - usedLeaves;

  const getDaysByType = (typeLabel) => {
    return records
      .filter(rec => rec.type.toLowerCase().includes(typeLabel.toLowerCase()))
      .reduce((total, rec) => total + calculateDaysCount(rec.rawStart, rec.rawEnd), 0);
  };

  const casualDays = getDaysByType("casual");
  const sickDays = getDaysByType("sick");
  const earnedDays = getDaysByType("earned") || getDaysByType("vacation");

  const leaveTypes = [
    { label: "Casual Leave", days: casualDays, pct: usedLeaves > 0 ? Math.min(100, Math.round((casualDays / TOTAL_ALLOWED_LEAVES) * 100)) : 0, color: "#6366f1" },
    { label: "Sick Leave",     days: sickDays,     pct: usedLeaves > 0 ? Math.min(100, Math.round((sickDays / TOTAL_ALLOWED_LEAVES) * 100)) : 0, color: "#22c55e" },
    { label: "Earned Leave", days: earnedDays, pct: usedLeaves > 0 ? Math.min(100, Math.round((earnedDays / TOTAL_ALLOWED_LEAVES) * 100)) : 0, color: "#eab308" },
  ];

  const formatDateDisplay = (dateString) => {
    if (!dateString) return "";
    const options = { month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const handleApplyLeave = async (e) => {
    e.preventDefault();
    if (new Date(startDate) > new Date(endDate)) return alert("Start date cannot be after the End date!");
    if (!reason.trim()) return alert("Reason is required.");

    try {
      await applyLeave({
        leaveType: formType,
        startDate,
        endDate,
        reason
      });
      alert("Leave application submitted successfully!");
      setStartDate("");
      setEndDate("");
      setReason("");
      setFormType("Casual Leave (CL)");
      fetchLeaves();
    } catch (error) {
      console.error("Failed to apply leave:", error);
      alert(error?.response?.data?.message || "Failed to submit leave application.");
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.statRow3}>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>TOTAL LEAVE</p>
          <p className={styles.statValue}>{TOTAL_ALLOWED_LEAVES}</p>
        </div>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>AVAILABLE</p>
          <p className={`${styles.statValue} ${styles.green}`}>{availableLeaves < 0 ? 0 : availableLeaves}</p>
        </div>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>USED</p>
          <p className={`${styles.statValue} ${styles.indigo}`}>{usedLeaves}</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Leave Breakdown By Type</h3>
          <div className={styles.leaveBreakdownGrid}>
            {leaveTypes.map((lt) => (
              <div key={lt.label} className={styles.leaveTypeItem} style={{ marginBottom: "14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <p className={styles.leaveTypeLabel}>{lt.label}</p>
                  <span style={{ fontSize: "0.8rem", fontWeight: "700", color: "var(--gray-500)" }}>
                    {lt.days} days ({lt.pct}%)
                  </span>
                </div>
                <div className={styles.progressTrack} style={{ marginTop: "4px" }}>
                  <div className={styles.progressBar} style={{ width: `${lt.pct}%`, background: lt.color, transition: "width 0.3s ease" }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Apply For Leave</h3>
          <form onSubmit={handleApplyLeave} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <label style={{ fontSize: "0.75rem", fontWeight: "600", color: "var(--gray-500)" }}>LEAVE TYPE</label>
              <select className={styles.addInput} value={formType} onChange={(e) => setFormType(e.target.value)}>
                <option value="Casual Leave (CL)">Casual Leave (CL)</option>
                <option value="Sick Leave (SL)">Sick Leave (SL)</option>
                <option value="Earned Leave (EL)">Earned Leave (EL)</option>
                <option value="Unpaid">Unpaid Leave</option>
              </select>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label style={{ fontSize: "0.75rem", fontWeight: "600", color: "var(--gray-500)" }}>START DATE</label>
                <input type="date" className={styles.addInput} value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label style={{ fontSize: "0.75rem", fontWeight: "600", color: "var(--gray-500)" }}>END DATE</label>
                <input type="date" className={styles.addInput} value={endDate} min={startDate} onChange={(e) => setEndDate(e.target.value)} required />
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <label style={{ fontSize: "0.75rem", fontWeight: "600", color: "var(--gray-500)" }}>REASON</label>
              <input type="text" className={styles.addInput} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason for leave" required />
            </div>

            <button type="submit" className={styles.addBtn} style={{ padding: "10px 16px", marginTop: "8px" }}>
              Submit Leave Application
            </button>
          </form>
        </div>
      </div>

      <div className={styles.tableCard}>
        {loading ? (
          <p style={{ padding: "20px", textAlign: "center", color: "var(--gray-500)" }}>Loading leave history...</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>LEAVE TYPE</th><th>LEAVE DATA</th><th>REASON</th><th>STATUS VALIDATION</th>
              </tr>
            </thead>
            <tbody>
              {records.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: "center", color: "var(--gray-500)", padding: "20px" }}>No leave records found.</td>
                </tr>
              ) : (
                records.map((r) => (
                  <tr key={r.id}>
                    <td className={styles.bold}>{r.type}</td>
                    <td>{r.dates}</td>
                    <td>{r.reason}</td>
                    <td>
                      <span className={r.status === 'Approved' ? styles.badgeGreen : r.status === 'Rejected' ? styles.badgeRed : styles.badgeYellow}>
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}