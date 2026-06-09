import { useState } from "react";
import styles from "./HRMissPunchingView.module.css";

/* ─── Constants ─── */
const STATUS_COLORS = {
  Pending:  { bg: "#FFF7ED", color: "#C2410C", dot: "#F97316" },
  Approved: { bg: "#F0FDF4", color: "#15803D", dot: "#22C55E" },
  Rejected: { bg: "#FFF1F2", color: "#BE123C", dot: "#F43F5E" },
};

const SHIFTS = [
  { label: "General — 09:00 AM to 06:00 PM", value: "09:00 AM – 06:00 PM" },
  { label: "Morning — 06:00 AM to 02:00 PM",  value: "06:00 AM – 02:00 PM" },
  { label: "Evening — 02:00 PM to 10:00 PM",  value: "02:00 PM – 10:00 PM" },
  { label: "Night   — 10:00 PM to 06:00 AM",  value: "10:00 PM – 06:00 AM" },
];

/* ─── Mock: HR's own requests ─── */
const MY_MOCK = [
  {
    id: 101,
    date: "2026-06-05",
    shift: "09:00 AM – 06:00 PM",
    missType: "Clock-In",
    reason: "Face scanner offline at HR cabin entry",
    status: "Approved",
    submittedOn: "2026-06-06",
    adminRemark: "Verified with access log.",
  },
  {
    id: 102,
    date: "2026-06-03",
    shift: "09:00 AM – 06:00 PM",
    missType: "Both",
    reason: "System maintenance window overlapped shift start",
    status: "Pending",
    submittedOn: "2026-06-04",
    adminRemark: null,
  },
];

/* ─── Mock: Employee requests assigned to HR ─── */
const TEAM_MOCK = [
  {
    id: 201,
    employee: "Riya Sharma",
    empId: "EMP-042",
    department: "Finance",
    date: "2026-06-07",
    shift: "09:00 AM – 06:00 PM",
    missType: "Clock-Out",
    reason: "Left office from back gate; scanner was down",
    status: "Pending",
    submittedOn: "2026-06-08",
    proof: true,
    hrRemark: null,
  },
  {
    id: 202,
    employee: "Arjun Patel",
    empId: "EMP-017",
    department: "Engineering",
    date: "2026-06-05",
    shift: "09:00 AM – 06:00 PM",
    missType: "Clock-In",
    reason: "Power failure at biometric gate",
    status: "Pending",
    submittedOn: "2026-06-06",
    proof: false,
    hrRemark: null,
  },
  {
    id: 203,
    employee: "Pooja Mehta",
    empId: "EMP-031",
    department: "Marketing",
    date: "2026-06-01",
    shift: "09:00 AM – 06:00 PM",
    missType: "Both",
    reason: "Face recognition error — system rebooting",
    status: "Approved",
    submittedOn: "2026-06-02",
    proof: true,
    hrRemark: "CCTV confirmed entry and exit.",
  },
  {
    id: 204,
    employee: "Karan Desai",
    empId: "EMP-055",
    department: "Sales",
    date: "2026-05-29",
    shift: "09:00 AM – 06:00 PM",
    missType: "Clock-In",
    reason: "Was on client call outside office during punch time",
    status: "Rejected",
    submittedOn: "2026-05-30",
    proof: false,
    hrRemark: "No valid reason provided for absence from scanner.",
  },
];

/* ─── Badge ─── */
function Badge({ status }) {
  const sc = STATUS_COLORS[status];
  return (
    <span className={styles.badge} style={{ background: sc.bg, color: sc.color }}>
      <span className={styles.dot} style={{ background: sc.dot }} />
      {status}
    </span>
  );
}

/* ══════════════════════════════════════════
   HR Miss Punching View
══════════════════════════════════════════ */
export default function HRMissPunchingView() {
  const [activeTab, setActiveTab] = useState("mine"); // "mine" | "team"

  /* ── My Requests state ── */
  const [myRequests, setMyRequests] = useState(MY_MOCK);
  const [showForm, setShowForm]     = useState(false);
  const [mySelected, setMySelected] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [form, setForm] = useState({ date: "", shift: "", missType: "Both", reason: "", proof: null });
  const [errors, setErrors] = useState({});

  /* ── Team Requests state ── */
  const [teamRequests, setTeamRequests] = useState(TEAM_MOCK);
  const [teamSelected, setTeamSelected] = useState(null);
  const [remark, setRemark]             = useState("");
  const [remarkErr, setRemarkErr]       = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [actionMsg, setActionMsg]       = useState("");

  const todayStr = new Date().toISOString().split("T")[0];

  /* ── My Requests handlers ── */
  const validate = () => {
    const e = {};
    if (!form.date)         e.date   = "Date is required.";
    if (!form.shift)        e.shift  = "Shift is required.";
    if (!form.reason.trim()) e.reason = "Reason is required.";
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setMyRequests([{ id: Date.now(), date: form.date, shift: form.shift,
      missType: form.missType, reason: form.reason, status: "Pending",
      submittedOn: todayStr, adminRemark: null }, ...myRequests]);
    setForm({ date: "", shift: "", missType: "Both", reason: "", proof: null });
    setErrors({});
    setShowForm(false);
    setSuccessMsg("Your miss punch request has been submitted to System Admin.");
    setTimeout(() => setSuccessMsg(""), 4500);
  };

  const handleChange = (field, value) => {
    setForm((p) => ({ ...p, [field]: value }));
    setErrors((p) => ({ ...p, [field]: undefined }));
  };

  /* ── Team Requests handlers ── */
  const handleAction = (action) => {
    if (!remark.trim()) { setRemarkErr("Remark is required before taking action."); return; }
    setTeamRequests((prev) =>
      prev.map((r) =>
        r.id === teamSelected.id ? { ...r, status: action, hrRemark: remark } : r
      )
    );
    setActionMsg(`Request ${action.toLowerCase()} successfully.`);
    setTimeout(() => setActionMsg(""), 4000);
    setTeamSelected(null);
    setRemark("");
    setRemarkErr("");
  };

  const filteredTeam = filterStatus === "All"
    ? teamRequests
    : teamRequests.filter((r) => r.status === filterStatus);

  const pendingCount = teamRequests.filter((r) => r.status === "Pending").length;

  /* ══ RENDER ══ */
  return (
    <div className={styles.container}>


      {/* ── Tab Bar ── */}
      <div className={styles.tabBar}>
        <button
          className={`${styles.tab} ${activeTab === "mine" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab("mine")}
        >
          My Requests
          <span className={styles.tabCount}>{myRequests.length}</span>
        </button>
        <button
          className={`${styles.tab} ${activeTab === "team" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab("team")}
        >
          Team Requests
          {pendingCount > 0 && (
            <span className={styles.tabBadgePending}>{pendingCount}</span>
          )}
        </button>
      </div>

      {/* ════════════════════════════
          TAB: MY REQUESTS
      ════════════════════════════ */}
      {activeTab === "mine" && (
        <div>
          {/* Header row */}
          <div className={styles.sectionHeader}>
            <p className={styles.sectionDesc}>
              Missed face attendance? Submit to System Admin for approval.
            </p>
            <button
              className={styles.btnPrimary}
              onClick={() => { setShowForm((v) => !v); setErrors({}); }}
            >
              {showForm ? "✕ Cancel" : "+ New Request"}
            </button>
          </div>

          {successMsg && (
            <div className={styles.toastSuccess}>
              <span>✓</span> {successMsg}
            </div>
          )}

          {/* Form */}
          {showForm && (
            <div className={styles.formCard}>
              <h3 className={styles.formTitle}>Submit Miss Punch Request</h3>
              <div className={styles.formGrid}>

                <div className={styles.field}>
                  <label className={styles.label}>Date of Miss Punch <span className={styles.req}>*</span></label>
                  <input type="date" max={todayStr} value={form.date}
                    className={`${styles.input} ${errors.date ? styles.inputError : ""}`}
                    onChange={(e) => handleChange("date", e.target.value)} />
                  {errors.date && <span className={styles.errMsg}>{errors.date}</span>}
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Shift Timing <span className={styles.req}>*</span></label>
                  <select value={form.shift}
                    className={`${styles.input} ${errors.shift ? styles.inputError : ""}`}
                    onChange={(e) => handleChange("shift", e.target.value)}>
                    <option value="">Select shift</option>
                    {SHIFTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                  {errors.shift && <span className={styles.errMsg}>{errors.shift}</span>}
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Missed Punch Type</label>
                  <div className={styles.radioGroup}>
                    {["Clock-In", "Clock-Out", "Both"].map((opt) => (
                      <label key={opt} className={styles.radioLabel}>
                        <input type="radio" name="hrMissType" value={opt}
                          checked={form.missType === opt}
                          onChange={() => handleChange("missType", opt)} />
                        {opt}
                      </label>
                    ))}
                  </div>
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Supporting Evidence <span className={styles.optional}>(optional)</span></label>
                  <input type="file" accept="image/*,application/pdf" className={styles.fileInput}
                    onChange={(e) => handleChange("proof", e.target.files[0] || null)} />
                  <p className={styles.hint}>JPG / PNG / PDF accepted</p>
                </div>

                <div className={`${styles.field} ${styles.fullWidth}`}>
                  <label className={styles.label}>Reason <span className={styles.req}>*</span></label>
                  <textarea rows={3} value={form.reason}
                    placeholder="Why was face attendance missed?"
                    className={`${styles.input} ${styles.textarea} ${errors.reason ? styles.inputError : ""}`}
                    onChange={(e) => handleChange("reason", e.target.value)} />
                  {errors.reason && <span className={styles.errMsg}>{errors.reason}</span>}
                </div>
              </div>

              <div className={styles.formActions}>
                <button className={styles.btnSecondary} onClick={() => setShowForm(false)}>Discard</button>
                <button className={styles.btnPrimary} onClick={handleSubmit}>Submit to Admin</button>
              </div>
            </div>
          )}

          {/* Summary */}
          <div className={styles.summaryRow}>
            {[
              { label: "Total",    count: myRequests.length,                                      icon: "📋", accent: "#6366F1" },
              { label: "Pending",  count: myRequests.filter((r) => r.status === "Pending").length,  icon: "⏳", accent: "#F97316" },
              { label: "Approved", count: myRequests.filter((r) => r.status === "Approved").length, icon: "✅", accent: "#22C55E" },
              { label: "Rejected", count: myRequests.filter((r) => r.status === "Rejected").length, icon: "❌", accent: "#F43F5E" },
            ].map(({ label, count, icon, accent }) => (
              <div key={label} className={styles.summaryCard} style={{ borderTop: `3px solid ${accent}` }}>
                <span className={styles.summaryIcon}>{icon}</span>
                <div>
                  <p className={styles.summaryCount} style={{ color: accent }}>{count}</p>
                  <p className={styles.summaryLabel}>{label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Table */}
          <div className={styles.tableCard}>
            <h3 className={styles.sectionTitle}>My Miss Punch Requests</h3>
            {myRequests.length === 0 ? (
              <div className={styles.empty}><p>No requests yet. Click <strong>+ New Request</strong> to submit one.</p></div>
            ) : (
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead><tr>
                    <th>#</th><th>Date</th><th>Shift</th><th>Type</th>
                    <th>Reason</th><th>Submitted</th><th>Status</th><th>Action</th>
                  </tr></thead>
                  <tbody>
                    {myRequests.map((req, idx) => (
                      <tr key={req.id}>
                        <td>{idx + 1}</td>
                        <td>{req.date}</td>
                        <td className={styles.shiftCell}>{req.shift}</td>
                        <td><span className={styles.missTypePill}>{req.missType}</span></td>
                        <td className={styles.reasonCell}>{req.reason}</td>
                        <td>{req.submittedOn}</td>
                        <td><Badge status={req.status} /></td>
                        <td>
                          <button className={styles.btnView} onClick={() => setMySelected(req)}>View</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* My Request Detail Modal */}
          {mySelected && (
            <div className={styles.modalOverlay} onClick={() => setMySelected(null)}>
              <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                  <h3>Request Details</h3>
                  <button className={styles.modalClose} onClick={() => setMySelected(null)}>✕</button>
                </div>
                <div className={styles.modalBody}>
                  <div className={styles.detailGrid}>
                    <div className={styles.detailRow}><span className={styles.detailLabel}>Date</span><span className={styles.detailValue}>{mySelected.date}</span></div>
                    <div className={styles.detailRow}><span className={styles.detailLabel}>Shift</span><span className={styles.detailValue}>{mySelected.shift}</span></div>
                    <div className={styles.detailRow}><span className={styles.detailLabel}>Miss Type</span><span className={styles.detailValue}>{mySelected.missType}</span></div>
                    <div className={styles.detailRow}><span className={styles.detailLabel}>Submitted</span><span className={styles.detailValue}>{mySelected.submittedOn}</span></div>
                    <div className={styles.detailRow}><span className={styles.detailLabel}>Status</span><Badge status={mySelected.status} /></div>
                    <div className={`${styles.detailRow} ${styles.fullWidthRow}`}><span className={styles.detailLabel}>Reason</span><span className={styles.detailValue}>{mySelected.reason}</span></div>
                    {mySelected.adminRemark && (
                      <div className={`${styles.detailRow} ${styles.fullWidthRow}`}>
                        <span className={styles.detailLabel}>Admin Remark</span>
                        <span className={styles.detailValue} style={{ fontStyle: "italic" }}>"{mySelected.adminRemark}"</span>
                      </div>
                    )}
                  </div>
                  {mySelected.status === "Pending" && (
                    <div className={styles.pendingNote}>⏳ Awaiting review from System Admin.</div>
                  )}
                </div>
                <div className={styles.modalFooter}>
                  <button className={styles.btnPrimary} onClick={() => setMySelected(null)}>Close</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════════
          TAB: TEAM REQUESTS
      ════════════════════════════ */}
      {activeTab === "team" && (
        <div>
          {actionMsg && (
            <div className={styles.toastSuccess}><span>✓</span> {actionMsg}</div>
          )}

          {/* Filter + Summary */}
          <div className={styles.teamTopRow}>
            <div className={styles.summaryRow}>
              {[
                { label: "Total",    count: teamRequests.length,                                      accent: "#6366F1" },
                { label: "Pending",  count: teamRequests.filter((r) => r.status === "Pending").length,  accent: "#F97316" },
                { label: "Approved", count: teamRequests.filter((r) => r.status === "Approved").length, accent: "#22C55E" },
                { label: "Rejected", count: teamRequests.filter((r) => r.status === "Rejected").length, accent: "#F43F5E" },
              ].map(({ label, count, accent }) => (
                <div key={label} className={styles.summaryCard} style={{ borderTop: `3px solid ${accent}` }}>
                  <div>
                    <p className={styles.summaryCount} style={{ color: accent }}>{count}</p>
                    <p className={styles.summaryLabel}>{label}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.filterRow}>
              <label className={styles.filterLabel}>Filter by Status</label>
              <div className={styles.filterGroup}>
                {["All", "Pending", "Approved", "Rejected"].map((s) => (
                  <button key={s}
                    className={`${styles.filterBtn} ${filterStatus === s ? styles.filterBtnActive : ""}`}
                    onClick={() => setFilterStatus(s)}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Team Table */}
          <div className={styles.tableCard}>
            <h3 className={styles.sectionTitle}>Employee Miss Punch Requests</h3>
            {filteredTeam.length === 0 ? (
              <div className={styles.empty}><p>No requests found for selected filter.</p></div>
            ) : (
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead><tr>
                    <th>#</th><th>Employee</th><th>Department</th><th>Date</th>
                    <th>Shift</th><th>Type</th><th>Proof</th><th>Status</th><th>Action</th>
                  </tr></thead>
                  <tbody>
                    {filteredTeam.map((req, idx) => (
                      <tr key={req.id}>
                        <td>{idx + 1}</td>
                        <td>
                          <div className={styles.empCell}>
                            <span className={styles.empName}>{req.employee}</span>
                            <span className={styles.empId}>{req.empId}</span>
                          </div>
                        </td>
                        <td>{req.department}</td>
                        <td>{req.date}</td>
                        <td className={styles.shiftCell}>{req.shift}</td>
                        <td><span className={styles.missTypePill}>{req.missType}</span></td>
                        <td>
                          {req.proof
                            ? <span className={styles.proofYes}>📎 Yes</span>
                            : <span className={styles.proofNo}>— No</span>}
                        </td>
                        <td><Badge status={req.status} /></td>
                        <td>
                          <button className={styles.btnView} onClick={() => { setTeamSelected(req); setRemark(req.hrRemark || ""); setRemarkErr(""); }}>
                            {req.status === "Pending" ? "Review" : "View"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Team Review Modal */}
          {teamSelected && (
            <div className={styles.modalOverlay} onClick={() => { setTeamSelected(null); setRemark(""); setRemarkErr(""); }}>
              <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                  <h3>{teamSelected.status === "Pending" ? "Review Request" : "Request Details"}</h3>
                  <button className={styles.modalClose} onClick={() => { setTeamSelected(null); setRemark(""); setRemarkErr(""); }}>✕</button>
                </div>
                <div className={styles.modalBody}>

                  {/* Employee info strip */}
                  <div className={styles.empStrip}>
                    <div className={styles.empAvatar}>{teamSelected.employee.charAt(0)}</div>
                    <div>
                      <p className={styles.empStripName}>{teamSelected.employee}</p>
                      <p className={styles.empStripMeta}>{teamSelected.empId} · {teamSelected.department}</p>
                    </div>
                    <Badge status={teamSelected.status} />
                  </div>

                  <div className={styles.detailGrid}>
                    <div className={styles.detailRow}><span className={styles.detailLabel}>Date</span><span className={styles.detailValue}>{teamSelected.date}</span></div>
                    <div className={styles.detailRow}><span className={styles.detailLabel}>Shift</span><span className={styles.detailValue}>{teamSelected.shift}</span></div>
                    <div className={styles.detailRow}><span className={styles.detailLabel}>Miss Type</span><span className={styles.detailValue}>{teamSelected.missType}</span></div>
                    <div className={styles.detailRow}><span className={styles.detailLabel}>Submitted</span><span className={styles.detailValue}>{teamSelected.submittedOn}</span></div>
                    <div className={styles.detailRow}><span className={styles.detailLabel}>Proof Attached</span><span className={styles.detailValue}>{teamSelected.proof ? "✅ Yes" : "❌ No"}</span></div>
                    <div className={`${styles.detailRow} ${styles.fullWidthRow}`}><span className={styles.detailLabel}>Reason</span><span className={styles.detailValue}>{teamSelected.reason}</span></div>
                  </div>

                  {/* Remark textarea + actions — only if Pending */}
                  {teamSelected.status === "Pending" ? (
                    <div className={styles.reviewSection}>
                      <label className={styles.label}>
                        HR Remark <span className={styles.req}>*</span>
                      </label>
                      <textarea rows={3} value={remark}
                        placeholder="Add your remark before approving or rejecting…"
                        className={`${styles.input} ${styles.textarea} ${remarkErr ? styles.inputError : ""}`}
                        onChange={(e) => { setRemark(e.target.value); setRemarkErr(""); }} />
                      {remarkErr && <span className={styles.errMsg}>{remarkErr}</span>}

                      <div className={styles.actionBtns}>
                        <button className={styles.btnReject} onClick={() => handleAction("Rejected")}>✕ Reject</button>
                        <button className={styles.btnApprove} onClick={() => handleAction("Approved")}>✓ Approve</button>
                      </div>
                    </div>
                  ) : (
                    teamSelected.hrRemark && (
                      <div className={styles.remarkDisplay}>
                        <span className={styles.detailLabel}>HR Remark</span>
                        <p className={styles.remarkText}>"{teamSelected.hrRemark}"</p>
                      </div>
                    )
                  )}
                </div>
                <div className={styles.modalFooter}>
                  <button className={styles.btnSecondary} onClick={() => { setTeamSelected(null); setRemark(""); setRemarkErr(""); }}>Close</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
