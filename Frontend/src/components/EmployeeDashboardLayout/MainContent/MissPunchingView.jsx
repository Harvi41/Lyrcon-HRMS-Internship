import React, { useState, useEffect } from "react";
import styles from "./MissPunchingView.module.css";
import API from "../../../lib/axios"; 

const STATUS_COLORS = {
  Pending: { bg: "#FFF7ED", color: "#C2410C", dot: "#F97316" },
  Approved: { bg: "#F0FDF4", color: "#15803D", dot: "#22C55E" },
  Rejected: { bg: "#FFF1F2", color: "#BE123C", dot: "#F43F5E" },
};

const SHIFTS = [
  { label: "General — 09:00 AM to 06:00 PM", value: "09:00 AM – 06:00 PM" },
  { label: "Morning — 06:00 AM to 02:00 PM",  value: "06:00 AM – 02:00 PM" },
  { label: "Evening — 02:00 PM to 10:00 PM",  value: "02:00 PM – 10:00 PM" },
  { label: "Night   — 10:00 PM to 06:00 AM",  value: "10:00 PM – 06:00 AM" },
];

export default function MissPunchingView() {
  const [showForm, setShowForm] = useState(false);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);

  const [form, setForm] = useState({
    date: "",
    shift: "",
    missType: "Both",
    reason: "",
    proof: null,
  });

  const [errors, setErrors] = useState({});

  const fetchMyRequests = async () => {
    try {
      setLoading(true);
      const res = await API.get('/attendance/my-logs');
      const rawLogs = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      
      const missPunchItems = rawLogs.filter(log => 
        log.isRegularized || log.status === "Pending" || log.status === "Approved" || log.status === "Rejected"
      );

      const mappedRequests = missPunchItems.map((item, index) => ({
        id: item._id || item.id || index,
        date: item.date || "",
        shift: item.shift || "09:00 AM – 06:00 PM",
        reason: item.reason || "Biometric attendance regularization.",
        status: item.status || "Pending",
        submittedOn: item.createdAt ? new Date(item.createdAt).toISOString().split("T")[0] : "",
        hrRemark: item.hrRemark || item.adminRemark || item.remark || null
      }));

      setRequests(mappedRequests);
    } catch (err) {
      console.error("Failed to synchronize employee missed punch logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyRequests();
  }, []);

  const validate = () => {
    const e = {};
    if (!form.date) e.date = "Date is required.";
    if (!form.shift) e.shift = "Shift is required.";
    if (!form.reason.trim()) e.reason = "Reason is required.";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }

    try {
      setLoading(true);
      await API.post('/misspunch/apply', {
        date: form.date,
        shift: form.shift,
        missType: form.missType,
        reason: form.reason
      });

      setForm({ date: "", shift: "", missType: "Both", reason: "", proof: null });
      setErrors({});
      setShowForm(false);
      setSuccessMsg("Miss punch request submitted successfully!");
      
      await fetchMyRequests();
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to submit request.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Miss Punch Requests</h2>
          <p className={styles.subtitle}>
            Missed face attendance? Submit a request — HR &amp; Admin will review and approve it.
          </p>
        </div>
        <button className={styles.btnPrimary} onClick={() => { setShowForm((v) => !v); setErrors({}); }}>
          {showForm ? "✕ Cancel" : "+ New Request"}
        </button>
      </div>

      {successMsg && (
        <div className={styles.successToast}>
          <span className={styles.toastIcon}>✓</span> {successMsg}
        </div>
      )}

      {showForm && (
        <div className={styles.formCard}>
          <h3 className={styles.formTitle}>Submit Miss Punch Request</h3>
          <div className={styles.formGrid}>
            <div className={styles.field}>
              <label className={styles.label}>Date of Miss Punch <span className={styles.req}>*</span></label>
              <input type="date" className={`${styles.input} ${errors.date ? styles.inputError : ""}`} value={form.date} max={todayStr} onChange={(e) => handleChange("date", e.target.value)} />
              {errors.date && <span className={styles.errMsg}>{errors.date}</span>}
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Shift Timing <span className={styles.req}>*</span></label>
              <select className={`${styles.input} ${errors.shift ? styles.inputError : ""}`} value={form.shift} onChange={(e) => handleChange("shift", e.target.value)}>
                <option value="">Select shift</option>
                {SHIFTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
              {errors.shift && <span className={styles.errMsg}>{errors.shift}</span>}
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Missed Punch Type</label>
              <div className={styles.radioGroup}>
                {["Clock-In", "Clock-Out", "Both"].map((opt) => (
                  <label key={opt} className={styles.radioLabel}>
                    <input type="radio" name="missType" value={opt} checked={form.missType === opt} onChange={() => handleChange("missType", opt)} />
                    {opt}
                  </label>
                ))}
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Supporting Evidence <span className={styles.optional}>(optional)</span></label>
              <input type="file" accept="image/*,application/pdf" className={styles.fileInput} onChange={(e) => handleChange("proof", e.target.files[0] || null)} />
              <p className={styles.hint}>Upload photo, CCTV screenshot, or any proof (JPG/PNG/PDF)</p>
            </div>

            <div className={`${styles.field} ${styles.fullWidth}`}>
              <label className={styles.label}>Reason <span className={styles.req}>*</span></label>
              <textarea className={`${styles.input} ${styles.textarea} ${errors.reason ? styles.inputError : ""}`} placeholder="Briefly explain why the face attendance was missed…" value={form.reason} rows={3} onChange={(e) => handleChange("reason", e.target.value)} />
              {errors.reason && <span className={styles.errMsg}>{errors.reason}</span>}
            </div>
          </div>

          <div className={styles.formActions}>
            <button className={styles.btnSecondary} onClick={() => setShowForm(false)}>Discard</button>
            <button className={styles.btnPrimary} onClick={handleSubmit}>Submit Request</button>
          </div>
        </div>
      )}

      <div className={styles.summaryRow}>
        {[
          { label: "Total", count: requests.length, icon: "📋", accent: "#6366F1" },
          { label: "Pending", count: requests.filter((r) => r.status === "Pending").length, icon: "⏳", accent: "#F97316" },
          { label: "Approved", count: requests.filter((r) => r.status === "Approved").length, icon: "✅", accent: "#22C55E" },
          { label: "Rejected", count: requests.filter((r) => r.status === "Rejected").length, icon: "❌", accent: "#F43F5E" },
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

      <div className={styles.tableCard}>
        <h3 className={styles.sectionTitle}>Your Requests</h3>
        {loading ? (
          <div className={styles.empty}><p>Syncing tracking histories with cloud database...</p></div>
        ) : requests.length === 0 ? (
          <div className={styles.empty}>
            <p>No miss punch requests yet.</p>
            <p>Click <strong>+ New Request</strong> to submit one.</p>
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>#</th><th>Date</th><th>Shift</th><th>Reason</th><th>Submitted On</th><th>Status</th><th>Action</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req, idx) => {
                  const sc = STATUS_COLORS[req.status] || { bg: "#F1F5F9", color: "#475569", dot: "#94a3b8" };
                  return (
                    <tr key={req.id}>
                      <td>{idx + 1}</td>
                      <td>{req.date}</td>
                      <td className={styles.shiftCell}>{req.shift}</td>
                      <td className={styles.reasonCell}>{req.reason}</td>
                      <td>{req.submittedOn}</td>
                      <td>
                        <span className={styles.badge} style={{ background: sc.bg, color: sc.color }}>
                          <span className={styles.dot} style={{ background: sc.dot }} />
                          {req.status}
                        </span>
                      </td>
                      <td>
                        <button className={styles.btnView} onClick={() => setSelectedRequest(req)}>View</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedRequest && (
        <div className={styles.modalOverlay} onClick={() => setSelectedRequest(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Request Details</h3>
              <button className={styles.modalClose} onClick={() => setSelectedRequest(null)}>✕</button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.detailGrid}>
                <div className={styles.detailRow}><span className={styles.detailLabel}>Date</span><span className={styles.detailValue}>{selectedRequest.date}</span></div>
                <div className={styles.detailRow}><span className={styles.detailLabel}>Shift</span><span className={styles.detailValue}>{selectedRequest.shift}</span></div>
                <div className={styles.detailRow}><span className={styles.detailLabel}>Submitted On</span><span className={styles.detailValue}>{selectedRequest.submittedOn}</span></div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Status</span>
                  <span className={styles.badge} style={{ background: (STATUS_COLORS[selectedRequest.status] || STATUS_COLORS.Pending).bg, color: (STATUS_COLORS[selectedRequest.status] || STATUS_COLORS.Pending).color }}>
                    <span className={styles.dot} style={{ background: (STATUS_COLORS[selectedRequest.status] || STATUS_COLORS.Pending).dot }} />
                    {selectedRequest.status}
                  </span>
                </div>
                <div className={`${styles.detailRow} ${styles.fullWidthRow}`}><span className={styles.detailLabel}>Reason</span><span className={styles.detailValue}>{selectedRequest.reason}</span></div>
                {selectedRequest.hrRemark && (
                  <div className={`${styles.detailRow} ${styles.fullWidthRow}`}>
                    <span className={styles.detailLabel}>HR/Admin Remark</span>
                    <span className={styles.detailValue} style={{ fontStyle: "italic" }}>"{selectedRequest.hrRemark}"</span>
                  </div>
                )}
              </div>
              {selectedRequest.status === "Pending" && (
                <div className={styles.pendingNote}>⏳ Request is awaiting review from HR / System Admin.</div>
              )}
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.btnPrimary} onClick={() => setSelectedRequest(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}