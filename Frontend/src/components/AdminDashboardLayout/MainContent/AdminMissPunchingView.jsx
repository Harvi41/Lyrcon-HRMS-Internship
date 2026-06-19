import React, { useState, useEffect } from "react";
import styles from "./AdminMissPunchingView.module.css";
// 🚀 Injected custom api controllers from your central middleware hub
import API from "../../../lib/axios"; 

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

/* ─── Badge ─── */
function StatusBadge({ status }) {
  const sc = STATUS_COLORS[status] || { bg: "#F1F5F9", color: "#475569", dot: "#94a3b8" };
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
  const [requests, setRequests]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [selected, setSelected]         = useState(null);
  const [remark, setRemark]             = useState("");
  const [remarkErr, setRemarkErr]       = useState("");
  const [actionMsg, setActionMsg]       = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterRole, setFilterRole]     = useState("All");
  const [search, setSearch]             = useState("");

  // 📥 1. FETCH LIVE DATABASE REQUEST NODES FRESH
  const fetchLiveRequests = async () => {
    try {
      setLoading(true);
      // Adjust this URL path parameter string to match your exact backend Router mount definition
      const res = await API.get('/misspunch/pending'); 
      const rawData = res.data?.data || res.data || [];
      
      // Ensure variables match database documents cleanly (providing generic safe string fallbacks)
      const sanitizedData = rawData.map(item => ({
        id: item._id || item.id,
        name: item.employeeId ? `${item.employeeId.firstName} ${item.employeeId.lastName}` : (item.name || "Unknown User"),
        empId: item.employeeId?.empId || item.empId || "N/A",
        role: item.employeeId?.role || item.role || "Employee",
        department: item.employeeId?.department || item.department || "General",
        date: item.date || "",
        shift: item.shift || "09:00 AM – 06:00 PM",
        missType: item.missType || "Both",
        reason: item.reason || "",
        status: item.status || "Pending",
        submittedOn: item.createdAt ? new Date(item.createdAt).toISOString().split('T')[0] : (item.submittedOn || ""),
        proof: !!item.proof,
        adminRemark: item.adminRemark || null
      }));

      setRequests(sanitizedData);
    } catch (err) {
      console.error("Failed to collect dynamic miss punch telemetry streams:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveRequests();
  }, []);

  /* ── 2. LIVE ACTION DISPATCH: SUBMITS STATE TO MONGODB ── */
  const handleAction = async (action) => {
    if (!remark.trim()) { 
      setRemarkErr("Admin remark is required before taking action."); 
      return; 
    }
    
    try {
      // Hits your backend regularization review gateway pipeline directly
      await API.post('/misspunch/review', {
        requestId: selected.id,
        status: action, // 'Approved' or 'Rejected'
        remark: remark
      });

      const targetName = selected.name;
      setActionMsg(`${targetName}'s attendance adjustment has been successfully ${action.toLowerCase()}.`);
      
      setSelected(null);
      setRemark("");
      setRemarkErr("");
      
      // Pull fresh state counters instantly to re-scale the active metrics grid cards
      await fetchLiveRequests(); 
      
      setTimeout(() => setActionMsg(""), 4500);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to commit decision state change node matrix.");
    }
  };

  /* ── Filtering ── */
  const filtered = requests.filter((r) => {
    const matchStatus = filterStatus === "All" || r.status === filterStatus;
    const matchRole   = filterRole   === "All" || r.role === filterRole;
    const matchSearch = !search.trim() ||
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.empId.toLowerCase().includes(search.toLowerCase()) ||
      r.department.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchRole && matchSearch;
  });

  const pendingCount = requests.filter((r) => r.status === "Pending").length;

  /* ── Summary ── */
  const stats = [
    { label: "Total",             count: requests.length,                                         accent: "#6366F1", icon: "📋" },
    { label: "Pending",           count: requests.filter((r) => r.status === "Pending").length,   accent: "#F97316", icon: "⏳" },
    { label: "Approved",          count: requests.filter((r) => r.status === "Approved").length,  accent: "#22C55E", icon: "✅" },
    { label: "Rejected",          count: requests.filter((r) => r.status === "Rejected").length,  accent: "#F43F5E", icon: "❌" },
    { label: "HR Requests",       count: requests.filter((r) => r.role?.toUpperCase() === "HR").length,           accent: "#8B5CF6", icon: "👤" },
    { label: "Employee Requests", count: requests.filter((r) => r.role?.toUpperCase() === "EMPLOYEE").length,     accent: "#0EA5E9", icon: "👥" },
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

      {/* ── Main Table Content Area ── */}
      <div className={styles.tableCard}>
        <div className={styles.tableHeader}>
          <h3 className={styles.sectionTitle}>All Miss Punch Requests</h3>
          <span className={styles.resultCount}>{filtered.length} result{filtered.length !== 1 ? "s" : ""}</span>
        </div>

        {loading ? (
          <div className={styles.empty} style={{ padding: "48px 0" }}>
            <p style={{ fontWeight: "600", color: "#64748b" }}>Syncing live database request queues...</p>
          </div>
        ) : filtered.length === 0 ? (
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
                          style={{ background: ROLE_COLORS[req.role]?.bg || "#f1f5f9", color: ROLE_COLORS[req.role]?.color || "#475569" }}>
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
                  style={{ background: ROLE_COLORS[selected.role]?.bg || "#f1f5f9", color: ROLE_COLORS[selected.role]?.color || "#475569" }}>
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