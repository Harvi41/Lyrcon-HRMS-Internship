import { useState } from "react";
import styles from "./AdminMissPunchingView.module.css";

/* ─── Constants ─── */
const STATUS_COLORS = {
  Pending:  { bg: "#FFF7ED", color: "#C2410C", dot: "#F97316" },
  Approved: { bg: "#F0FDF4", color: "#15803D", dot: "#22C55E" },
  Rejected: { bg: "#FFF1F2", color: "#BE123C", dot: "#F43F5E" },
};

const ROLE_COLORS = {
  Employee: { bg: "#EFF6FF", color: "#1D4ED8" },
  HR:       { bg: "#F5F3FF", color: "#6D28D9" },
};

/* ─── Mock data: all roles ─── */
const ALL_REQUESTS_MOCK = [
  {
    id: 301, name: "Riya Sharma",   empId: "EMP-042", role: "Employee",
    department: "Finance",     date: "2026-06-07", shift: "09:00 AM – 06:00 PM",
    missType: "Clock-Out", reason: "Left office from back gate; scanner was down",
    status: "Pending", submittedOn: "2026-06-08", proof: true,  adminRemark: null,
  },
  {
    id: 302, name: "Arjun Patel",   empId: "EMP-017", role: "Employee",
    department: "Engineering", date: "2026-06-05", shift: "09:00 AM – 06:00 PM",
    missType: "Clock-In",  reason: "Power failure at biometric gate",
    status: "Pending", submittedOn: "2026-06-06", proof: false, adminRemark: null,
  },
  {
    id: 303, name: "Neha Joshi",    empId: "HR-005",  role: "HR",
    department: "Human Resources", date: "2026-06-05", shift: "09:00 AM – 06:00 PM",
    missType: "Both",      reason: "Face scanner offline at HR cabin entry during system update",
    status: "Pending", submittedOn: "2026-06-06", proof: true,  adminRemark: null,
  },
  {
    id: 304, name: "Pooja Mehta",   empId: "EMP-031", role: "Employee",
    department: "Marketing",   date: "2026-06-01", shift: "09:00 AM – 06:00 PM",
    missType: "Both",      reason: "Face recognition error — system rebooting",
    status: "Approved", submittedOn: "2026-06-02", proof: true,  adminRemark: "CCTV footage verified.",
  },
  {
    id: 305, name: "Karan Desai",   empId: "EMP-055", role: "Employee",
    department: "Sales",       date: "2026-05-29", shift: "09:00 AM – 06:00 PM",
    missType: "Clock-In",  reason: "Was on client call outside office",
    status: "Rejected", submittedOn: "2026-05-30", proof: false, adminRemark: "No valid proof.",
  },
  {
    id: 306, name: "Sanjana Verma", empId: "HR-003",  role: "HR",
    department: "Human Resources", date: "2026-05-28", shift: "09:00 AM – 06:00 PM",
    missType: "Clock-In",  reason: "System maintenance window overlapped shift start",
    status: "Approved", submittedOn: "2026-05-29", proof: false, adminRemark: "Verified with access log.",
  },
];

/* ─── Badge ─── */
function StatusBadge({ status }) {
  const sc = STATUS_COLORS[status];
  return (
    <span className={styles.badge} style={{ background: sc.bg, color: sc.color }}>
      <span className={styles.dot} style={{ background: sc.dot }} />
      {status}
    </span>
  );
}

function RolePill({ role }) {
  const rc = ROLE_COLORS[role] || { bg: "#F1F5F9", color: "#475569" };
  return (
    <span className={styles.rolePill} style={{ background: rc.bg, color: rc.color }}>
      {role}
    </span>
  );
}

/* ══════════════════════════════════════════
   Admin Miss Punching View
══════════════════════════════════════════ */
export default function AdminMissPunchingView() {
  const [requests, setRequests]       = useState(ALL_REQUESTS_MOCK);
  const [selected, setSelected]       = useState(null);
  const [remark, setRemark]           = useState("");
  const [remarkErr, setRemarkErr]     = useState("");
  const [actionMsg, setActionMsg]     = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterRole, setFilterRole]     = useState("All");
  const [search, setSearch]             = useState("");

  /* ── Actions ── */
  const handleAction = (action) => {
    if (!remark.trim()) { setRemarkErr("Admin remark is required before taking action."); return; }
    setRequests((prev) =>
      prev.map((r) => r.id === selected.id ? { ...r, status: action, adminRemark: remark } : r)
    );
    const name = selected.name;
    setActionMsg(`${name}'s request has been ${action.toLowerCase()}.`);
    setTimeout(() => setActionMsg(""), 4500);
    setSelected(null);
    setRemark("");
    setRemarkErr("");
  };

  /* ── Filtering ── */
  const filtered = requests.filter((r) => {
    const matchStatus = filterStatus === "All" || r.status === filterStatus;
    const matchRole   = filterRole   === "All" || r.role   === filterRole;
    const matchSearch = !search.trim() ||
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.empId.toLowerCase().includes(search.toLowerCase()) ||
      r.department.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchRole && matchSearch;
  });

  const pendingCount = requests.filter((r) => r.status === "Pending").length;

  /* ── Summary ── */
  const stats = [
    { label: "Total",             count: requests.length,                                        accent: "#6366F1", icon: "📋" },
    { label: "Pending",           count: requests.filter((r) => r.status === "Pending").length,    accent: "#F97316", icon: "⏳" },
    { label: "Approved",          count: requests.filter((r) => r.status === "Approved").length,   accent: "#22C55E", icon: "✅" },
    { label: "Rejected",          count: requests.filter((r) => r.status === "Rejected").length,   accent: "#F43F5E", icon: "❌" },
    { label: "HR Requests",       count: requests.filter((r) => r.role === "HR").length,           accent: "#8B5CF6", icon: "👤" },
    { label: "Employee Requests", count: requests.filter((r) => r.role === "Employee").length,     accent: "#0EA5E9", icon: "👥" },
  ];

  return (
    <div className={styles.container}>

      {/* ── Page Header ── */}
      <div className={styles.pageHeader}>
        <div>
          <h2 className={styles.title}>Miss Punch — Admin Panel</h2>
          <p className={styles.subtitle}>
            Review and action all miss punch requests from employees and HR managers.
          </p>
        </div>
        {pendingCount > 0 && (
          <div className={styles.pendingAlert}>
            ⏳ <strong>{pendingCount}</strong> request{pendingCount > 1 ? "s" : ""} awaiting your review
          </div>
        )}
      </div>

      {/* ── Action toast ── */}
      {actionMsg && (
        <div className={styles.toastSuccess}><span>✓</span> {actionMsg}</div>
      )}

      {/* ── Stats Grid ── */}
      <div className={styles.statsGrid}>
        {stats.map(({ label, count, accent, icon }) => (
          <div key={label} className={styles.statCard} style={{ borderTop: `3px solid ${accent}` }}>
            <span className={styles.statIcon}>{icon}</span>
            <div>
              <p className={styles.statCount} style={{ color: accent }}>{count}</p>
              <p className={styles.statLabel}>{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Filters Row ── */}
      <div className={styles.filtersBar}>
        {/* Search */}
        <div className={styles.searchWrap}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search by name, ID, department…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className={styles.searchClear} onClick={() => setSearch("")}>✕</button>
          )}
        </div>

        {/* Status filter */}
        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>Status</span>
          {["All", "Pending", "Approved", "Rejected"].map((s) => (
            <button key={s}
              className={`${styles.filterBtn} ${filterStatus === s ? styles.filterBtnActive : ""}`}
              onClick={() => setFilterStatus(s)}>
              {s}
            </button>
          ))}
        </div>

        {/* Role filter */}
        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>Role</span>
          {["All", "Employee", "HR"].map((r) => (
            <button key={r}
              className={`${styles.filterBtn} ${filterRole === r ? styles.filterBtnActiveRole : ""}`}
              onClick={() => setFilterRole(r)}>
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* ── Main Table ── */}
      <div className={styles.tableCard}>
        <div className={styles.tableHeader}>
          <h3 className={styles.sectionTitle}>All Miss Punch Requests</h3>
          <span className={styles.resultCount}>{filtered.length} result{filtered.length !== 1 ? "s" : ""}</span>
        </div>

        {filtered.length === 0 ? (
          <div className={styles.empty}>
            <p>No requests match the current filters.</p>
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Person</th>
                  <th>Role</th>
                  <th>Department</th>
                  <th>Date</th>
                  <th>Shift</th>
                  <th>Miss Type</th>
                  <th>Proof</th>
                  <th>Submitted</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((req, idx) => (
                  <tr key={req.id} className={req.status === "Pending" ? styles.rowPending : ""}>
                    <td>{idx + 1}</td>
                    <td>
                      <div className={styles.personCell}>
                        <div className={styles.avatar}
                          style={{ background: ROLE_COLORS[req.role]?.bg, color: ROLE_COLORS[req.role]?.color }}>
                          {req.name.charAt(0)}
                        </div>
                        <div>
                          <span className={styles.personName}>{req.name}</span>
                          <span className={styles.personId}>{req.empId}</span>
                        </div>
                      </div>
                    </td>
                    <td><RolePill role={req.role} /></td>
                    <td>{req.department}</td>
                    <td>{req.date}</td>
                    <td className={styles.shiftCell}>{req.shift}</td>
                    <td><span className={styles.missTypePill}>{req.missType}</span></td>
                    <td>
                      {req.proof
                        ? <span className={styles.proofYes}>📎 Yes</span>
                        : <span className={styles.proofNo}>— No</span>}
                    </td>
                    <td>{req.submittedOn}</td>
                    <td><StatusBadge status={req.status} /></td>
                    <td>
                      <button
                        className={req.status === "Pending" ? styles.btnReview : styles.btnView}
                        onClick={() => { setSelected(req); setRemark(req.adminRemark || ""); setRemarkErr(""); }}>
                        {req.status === "Pending" ? "⚡ Review" : "View"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Review / Detail Modal ── */}
      {selected && (
        <div className={styles.modalOverlay} onClick={() => { setSelected(null); setRemark(""); setRemarkErr(""); }}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>

            <div className={styles.modalHeader}>
              <div>
                <h3>{selected.status === "Pending" ? "Review Miss Punch Request" : "Request Details"}</h3>
                <p className={styles.modalSubtitle}>ID #{selected.id} · Submitted {selected.submittedOn}</p>
              </div>
              <button className={styles.modalClose} onClick={() => { setSelected(null); setRemark(""); setRemarkErr(""); }}>✕</button>
            </div>

            <div className={styles.modalBody}>
              {/* Person strip */}
              <div className={styles.personStrip}>
                <div className={styles.stripAvatar}
                  style={{ background: ROLE_COLORS[selected.role]?.bg, color: ROLE_COLORS[selected.role]?.color }}>
                  {selected.name.charAt(0)}
                </div>
                <div className={styles.stripInfo}>
                  <p className={styles.stripName}>{selected.name}</p>
                  <p className={styles.stripMeta}>{selected.empId} · {selected.department}</p>
                </div>
                <div className={styles.stripRight}>
                  <RolePill role={selected.role} />
                  <StatusBadge status={selected.status} />
                </div>
              </div>

              {/* Details */}
              <div className={styles.detailGrid}>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Date</span>
                  <span className={styles.detailValue}>{selected.date}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Shift</span>
                  <span className={styles.detailValue}>{selected.shift}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Miss Type</span>
                  <span className={styles.detailValue}>{selected.missType}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Proof Attached</span>
                  <span className={styles.detailValue}>{selected.proof ? "✅ Yes" : "❌ No"}</span>
                </div>
                <div className={`${styles.detailRow} ${styles.fullWidthRow}`}>
                  <span className={styles.detailLabel}>Reason</span>
                  <span className={styles.detailValue}>{selected.reason}</span>
                </div>
              </div>

              {/* Remark + actions for Pending */}
              {selected.status === "Pending" ? (
                <div className={styles.reviewSection}>
                  <div className={styles.adminNotice}>
                    ℹ️ As System Admin, your decision is final. Approved requests will be
                    marked as present in the attendance system.
                  </div>

                  <label className={styles.label}>
                    Admin Remark <span className={styles.req}>*</span>
                  </label>
                  <textarea rows={3} value={remark}
                    placeholder="Add your remark before approving or rejecting…"
                    className={`${styles.input} ${styles.textarea} ${remarkErr ? styles.inputError : ""}`}
                    onChange={(e) => { setRemark(e.target.value); setRemarkErr(""); }} />
                  {remarkErr && <span className={styles.errMsg}>{remarkErr}</span>}

                  <div className={styles.actionBtns}>
                    <button className={styles.btnModalReject}  onClick={() => handleAction("Rejected")}>✕ Reject Request</button>
                    <button className={styles.btnModalApprove} onClick={() => handleAction("Approved")}>✓ Approve Request</button>
                  </div>
                </div>
              ) : (
                selected.adminRemark && (
                  <div className={styles.remarkDisplay}>
                    <span className={styles.detailLabel}>Admin Remark</span>
                    <p className={styles.remarkText}>"{selected.adminRemark}"</p>
                  </div>
                )
              )}
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.btnSecondary}
                onClick={() => { setSelected(null); setRemark(""); setRemarkErr(""); }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
