import React, { useState } from "react";
import styles from "../EmployeeDashboardLayout.module.css";

export default function LeaveView() {
  // 1. Initial leave applications dataset state
  const [records, setRecords] = useState([
    { id: 1, employee: "Sarah Jenkins", type: "Sick Leave (SL)", dates: "May 10 - May 12", rawStart: "2026-05-10", rawEnd: "2026-05-12", status: "Pending" },
  ]);

  // Main Form Inputs States (For applying a new leave)
  const [formType, setFormType] = useState("Vacation Leave");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Modal Control States - tracking explicit data points rather than objects to prevent desync
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editTargetId, setEditTargetId] = useState(null);
  const [editType, setEditType] = useState("Vacation Leave");
  const [editStart, setEditStart] = useState("");
  const [editEnd, setEditEnd] = useState("");

  // Constant rule boundaries
  const TOTAL_ALLOWED_LEAVES = 20;

  // Helper utility to calculate day count ranges
  const calculateDaysCount = (start, end) => {
    if (!start || !end) return 0;
    const sDate = new Date(start);
    const eDate = new Date(end);
    const timeDiff = eDate.getTime() - sDate.getTime();
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24)) + 1;
    return days > 0 ? days : 0;
  };

  // ─── DYNAMIC STATISTICS RECIPES ───
  const usedLeaves = records.reduce((total, rec) => total + calculateDaysCount(rec.rawStart, rec.rawEnd), 0);
  const availableLeaves = TOTAL_ALLOWED_LEAVES - usedLeaves;

  const getDaysByType = (typeLabel) => {
    return records
      .filter(rec => rec.type.toLowerCase().includes(typeLabel.toLowerCase().split(" ")[0]))
      .reduce((total, rec) => total + calculateDaysCount(rec.rawStart, rec.rawEnd), 0);
  };

  const vacationDays = getDaysByType("Vacation");
  const sickDays = getDaysByType("Sick");
  const personalDays = getDaysByType("Personal");

  const leaveTypes = [
    { label: "Vacation Leave", days: vacationDays, pct: usedLeaves > 0 ? Math.min(100, Math.round((vacationDays / TOTAL_ALLOWED_LEAVES) * 100)) : 0, color: "#6366f1" },
    { label: "Sick Leave",     days: sickDays,     pct: usedLeaves > 0 ? Math.min(100, Math.round((sickDays / TOTAL_ALLOWED_LEAVES) * 100)) : 0, color: "#22c55e" },
    { label: "Personal Leave", days: personalDays, pct: usedLeaves > 0 ? Math.min(100, Math.round((personalDays / TOTAL_ALLOWED_LEAVES) * 100)) : 0, color: "#eab308" },
  ];

  const formatDateDisplay = (dateString) => {
    if (!dateString) return "";
    const options = { month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // ─── ACTION HANDLERS ───

  // A. Create a new request
  const handleApplyLeave = (e) => {
    e.preventDefault();
    if (new Date(startDate) > new Date(endDate)) return alert("Start date cannot be after the End date!");

    const formattedRangeText = `${formatDateDisplay(startDate)} - ${formatDateDisplay(endDate)}`;
    const newRequest = {
      id: Date.now(),
      employee: "Prince Ghevariya",
      type: formType,
      dates: formattedRangeText,
      rawStart: startDate,
      rawEnd: endDate,
      status: "Pending"
    };

    setRecords(prev => [...prev, newRequest]);
    setStartDate("");
    setEndDate("");
    setFormType("Vacation Leave");
  };

  // B. Initialize the Edit Modal with values from the selected record row
  const openEditModal = (record) => {
    setEditTargetId(record.id);
    setEditType(record.type);
    setEditStart(record.rawStart);
    setEditEnd(record.rawEnd);
    setIsEditOpen(true);
  };

  // C. Save edited alterations back into the core records state array
  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (new Date(editStart) > new Date(editEnd)) return alert("Start date cannot be after the End date!");

    const formattedRangeText = `${formatDateDisplay(editStart)} - ${formatDateDisplay(editEnd)}`;

    setRecords(prev => prev.map(rec => 
      rec.id === editTargetId 
        ? { ...rec, type: editType, dates: formattedRangeText, rawStart: editStart, rawEnd: editEnd } 
        : rec
    ));

    // Clear and close edit modal cleanly
    setIsEditOpen(false);
    setEditTargetId(null);
  };

  // D. Initialize the Delete Confirmation Modal
  const openDeleteModal = (id) => {
    setDeleteTargetId(id);
    setIsDeleteOpen(true);
  };

  // E. Execute the final record removal
  const handleConfirmDelete = () => {
    setRecords(prev => prev.filter(rec => rec.id !== deleteTargetId));
    setIsDeleteOpen(false);
    setDeleteTargetId(null);
  };

  return (
    <div className={styles.page}>
      {/* Metrics Header Summary Blocks */}
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

      {/* Main Grid View section */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        
        {/* Left Card View: Breakdown bars */}
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

        {/* Right Card View: Application Submission Form Container */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Apply For Leave</h3>
          <form onSubmit={handleApplyLeave} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <label style={{ fontSize: "0.75rem", fontWeight: "600", color: "var(--gray-500)" }}>LEAVE TYPE</label>
              <select className={styles.addInput} value={formType} onChange={(e) => setFormType(e.target.value)}>
                <option value="Vacation Leave">Vacation Leave</option>
                <option value="Sick Leave (SL)">Sick Leave (SL)</option>
                <option value="Personal Leave">Personal Leave</option>
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

            <button type="submit" className={styles.addBtn} style={{ padding: "10px 16px", marginTop: "8px" }}>
              Submit Leave Application
            </button>
          </form>
        </div>
      </div>

      {/* Main Leave Logs Table */}
      <div className={styles.tableCard}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>EMPLOYEE</th><th>LEAVE TYPE</th><th>LEAVE DATA</th><th>STATUS VALIDATION</th><th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r) => (
              <tr key={r.id}>
                <td className={styles.bold}>{r.employee}</td>
                <td>{r.type}</td>
                <td>{r.dates}</td>
                <td><span className={styles.badgeYellow}>{r.status}</span></td>
                <td>
                  <div className={styles.actionBtns}>
                    <button className={styles.iconBtn} title="Edit Entry" onClick={() => openEditModal(r)}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </button>
                    <button className={`${styles.iconBtn} ${styles.iconBtnRed}`} title="Delete Entry" onClick={() => openDeleteModal(r.id)}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ═════════════════════════════════════════════════════════════════════════
          FIXED POPUP MODAL: DELETE CONFIRMATION
          ═════════════════════════════════════════════════════════════════════════ */}
      {isDeleteOpen && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <h3 style={{ fontFamily: "Sora, sans-serif", marginBottom: "12px", color: "var(--gray-900)" }}>Confirm Deletion</h3>
            <p style={{ fontSize: "0.9rem", color: "var(--gray-600)", marginBottom: "20px" }}>
              Are you sure you want to retract and permanently delete this leave application record?
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button type="button" className={styles.cancelBtn} style={{ padding: "8px 16px" }} onClick={() => { setIsDeleteOpen(false); setDeleteTargetId(null); }}>
                Cancel
              </button>
              <button type="button" className={styles.addBtn} style={{ padding: "8px 16px", backgroundColor: "var(--accent-red)", boxShadow: "none" }} onClick={handleConfirmDelete}>
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════════
          FIXED POPUP MODAL: EDIT REQUEST FORM
          ═════════════════════════════════════════════════════════════════════════ */}
      {isEditOpen && (
        <div style={modalOverlayStyle}>
          <div style={{ ...modalContentStyle, maxWidth: "450px" }}>
            <h3 style={{ fontFamily: "Sora, sans-serif", marginBottom: "16px", color: "var(--gray-900)" }}>Edit Leave Details</h3>
            <form onSubmit={handleSaveEdit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "4px", textAlign: "left" }}>
                <label style={{ fontSize: "0.75rem", fontWeight: "600", color: "var(--gray-500)" }}>LEAVE TYPE</label>
                <select 
                  className={styles.addInput}
                  value={editType}
                  onChange={(e) => setEditType(e.target.value)}
                >
                  <option value="Vacation Leave">Vacation Leave</option>
                  <option value="Sick Leave (SL)">Sick Leave (SL)</option>
                  <option value="Personal Leave">Personal Leave</option>
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", textAlign: "left" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label style={{ fontSize: "0.75rem", fontWeight: "600", color: "var(--gray-500)" }}>START DATE</label>
                  <input 
                    type="date" 
                    className={styles.addInput}
                    value={editStart} 
                    onChange={(e) => setEditStart(e.target.value)}
                    required
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label style={{ fontSize: "0.75rem", fontWeight: "600", color: "var(--gray-500)" }}>END DATE</label>
                  <input 
                    type="date" 
                    className={styles.addInput}
                    value={editEnd} 
                    min={editStart}
                    onChange={(e) => setEditEnd(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
                <button type="button" className={styles.cancelBtn} style={{ padding: "8px 16px" }} onClick={() => { setIsEditOpen(false); setEditTargetId(null); }}>
                  Cancel
                </button>
                <button type="submit" className={styles.addBtn} style={{ padding: "8px 16px" }}>
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Layout styles
const modalOverlayStyle = {
  position: "fixed",
  top: 0, left: 0,
  width: "100vw", height: "100vh",
  backgroundColor: "rgba(15, 21, 53, 0.6)", 
  display: "flex", alignItems: "center", justifyContent: "center",
  zIndex: 9999,
};

const modalContentStyle = {
  backgroundColor: "#ffffff",
  padding: "24px",
  borderRadius: "10px",
  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
  width: "90%", maxWidth: "400px",
  textAlign: "center",
};