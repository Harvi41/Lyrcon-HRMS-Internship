import React, { useState } from "react";
import styles from "../EmployeeDashboardLayout.module.css";

const INITIAL_TASKS = [
  { id: 1, title: "Complete Performance Review",  desc: "Fill out self-assessment form",        done: false },
  { id: 2, title: "Submit Expense Report",        desc: "Submit April expense claim",           done: false },
  { id: 3, title: "Team Meeting Preparation",     desc: "Prepare presentation for weekly sync", done: true  },
  { id: 4, title: "Update Project Documentation", desc: "Add API Documentation",                done: false },
];

export default function TasksView() {
  const [tasks, setTasks]       = useState(INITIAL_TASKS);
  const [filter, setFilter]     = useState("");
  const [showAdd, setShowAdd]   = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc]   = useState("");

  // Popup Modal Control States for Editing & Deleting
  const [editModal, setEditModal] = useState({ isOpen: false, task: null });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, taskId: null });

  // 1. Core State Handlers
  const toggle = (id) => setTasks((p) => p.map((t) => t.id === id ? { ...t, done: !t.done } : t));

  const addTask = (e) => {
    e.preventDefault(); // Prevents page reload
    if (!newTitle.trim()) return;
    
    setTasks((p) => [...p, { id: Date.now(), title: newTitle.trim(), desc: newDesc.trim(), done: false }]);
    setNewTitle(""); 
    setNewDesc(""); 
    setShowAdd(false);
  };

  // 2. Edit Action Pipeline
  const executeEditUpdate = (e) => {
    e.preventDefault();
    const target = editModal.task;
    if (!target.title.trim()) return;

    setTasks((prev) => prev.map((t) => t.id === target.id ? { ...t, title: target.title.trim(), desc: target.desc.trim() } : t));
    setEditModal({ isOpen: false, task: null });
  };

  // 3. Delete Action Pipeline
  const executeDelete = () => {
    setTasks((prev) => prev.filter((t) => t.id !== deleteModal.taskId));
    setDeleteModal({ isOpen: false, taskId: null });
  };

  // ─── RUNTIME CALCULATED COUNTERS ───
  const filtered = tasks.filter((t) => t.title.toLowerCase().includes(filter.toLowerCase()));
  const total     = tasks.length;
  const pending   = tasks.filter((t) => !t.done).length;
  const completed = tasks.filter((t) => t.done).length;

  return (
    <div className={styles.page}>
      {/* Metrics Header Row */}
      <div className={styles.statRow3}>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>TOTAL</p>
          <p className={styles.statValue}>{total}</p>
        </div>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>PENDING</p>
          <p className={`${styles.statValue} ${styles.indigo}`}>{pending}</p>
        </div>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>COMPLETED</p>
          <p className={`${styles.statValue} ${styles.green}`}>{completed}</p>
        </div>
      </div>

      {/* Toolbar Options Container */}
      <div className={styles.toolbar}>
        <input className={styles.filterInput} placeholder="Filter by name or keyword..." value={filter} onChange={(e) => setFilter(e.target.value)} />
        <button className={styles.addBtn} onClick={() => setShowAdd(true)}>+ Add Task</button>
      </div>

      {/* Inline Section: Create New Task Box */}
      {showAdd && (
        <form onSubmit={addTask} className={styles.addBox}>
          <input className={styles.addInput} placeholder="Task title" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} required />
          <input className={styles.addInput} placeholder="Description" value={newDesc}  onChange={(e) => setNewDesc(e.target.value)} required />
          <div className={styles.addActions}>
            <button type="submit" className={styles.saveBtn}>Save</button>
            <button type="button" className={styles.cancelBtn} onClick={() => setShowAdd(false)}>Cancel</button>
          </div>
        </form>
      )}

      {/* Main Rendered Task Array Board */}
      <div className={styles.tableCard}>
        {filtered.length === 0 ? (
          <p style={{ padding: "20px", textAlign: "center", color: "var(--gray-500)", fontSize: "0.9rem" }}>No tasks found matching query.</p>
        ) : (
          filtered.map((task) => (
            <div key={task.id} className={`${styles.taskRow} ${task.done ? styles.taskDone : ""}`} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "16px", flex: 1 }}>
                <button
                  className={`${styles.checkBtn} ${task.done ? styles.checkBtnDone : ""}`}
                  onClick={() => toggle(task.id)}
                >
                  {task.done && (
                    <svg width="12" height="12" viewBox="0 0 13 13" fill="none">
                      <path d="M2 6.5l3.5 3.5 5.5-6" stroke="#4f46e5" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </button>
                <div className={styles.taskText}>
                  <p className={`${styles.taskTitle} ${task.done ? styles.strikethrough : ""}`}>{task.title}</p>
                  <p className={styles.taskDesc}>{task.desc}</p>
                </div>
              </div>

              {/* Functional Dynamic Edit/Delete Inline Row Buttons */}
              <div className={styles.actionBtns} style={{ paddingRight: "14px" }}>
                <button className={styles.iconBtn} title="Edit Task" onClick={() => setEditModal({ isOpen: true, task: { ...task } })}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                </button>
                <button className={`${styles.iconBtn} ${styles.iconBtnRed}`} title="Delete Task" onClick={() => setDeleteModal({ isOpen: true, taskId: task.id })}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
                  </svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ═════════════════════════════════════════════════════════════════════════
          CUSTOM POPUP MODAL: CONFIRM TASK DELETE
          ═════════════════════════════════════════════════════════════════════════ */}
      {deleteModal.isOpen && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <h3 style={{ fontFamily: "Sora, sans-serif", marginBottom: "12px", color: "var(--gray-900)", fontSize: "1.1rem" }}>Confirm Deletion</h3>
            <p style={{ fontSize: "0.875rem", color: "var(--gray-500)", marginBottom: "20px", lineHeight: "1.5" }}>
              Are you sure you want to permanently clear this task item from your workspace dashboard logs?
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button className={styles.cancelBtn} style={{ padding: "8px 16px" }} onClick={() => setDeleteModal({ isOpen: false, taskId: null })}>Cancel</button>
              <button className={styles.addBtn} style={{ padding: "8px 16px", backgroundColor: "var(--accent-red)", boxShadow: "none" }} onClick={executeDelete}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════════
          CUSTOM POPUP MODAL: EDIT TASK DETAILS FORM
          ═════════════════════════════════════════════════════════════════════════ */}
      {editModal.isOpen && (
        <div style={modalOverlayStyle}>
          <div style={{ ...modalContentStyle, maxWidth: "440px" }}>
            <h3 style={{ fontFamily: "Sora, sans-serif", marginBottom: "16px", color: "var(--gray-900)", textAlign: "left", fontSize: "1.1rem" }}>Modify Task Details</h3>
            <form onSubmit={executeEditUpdate} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "4px", textAlign: "left" }}>
                <label style={{ fontSize: "0.72rem", fontWeight: "700", color: "var(--gray-400)", letterSpacing: "0.05em" }}>TASK TITLE</label>
                <input 
                  type="text" 
                  className={styles.addInput} 
                  value={editModal.task.title} 
                  onChange={(e) => setEditModal({ ...editModal, task: { ...editModal.task, title: e.target.value } })}
                  required
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "4px", textAlign: "left" }}>
                <label style={{ fontSize: "0.72rem", fontWeight: "700", color: "var(--gray-400)", letterSpacing: "0.05em" }}>DESCRIPTION DETAILS</label>
                <input 
                  type="text" 
                  className={styles.addInput} 
                  value={editModal.task.desc} 
                  onChange={(e) => setEditModal({ ...editModal, task: { ...editModal.task, desc: e.target.value } })}
                  required
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
                <button type="button" className={styles.cancelBtn} style={{ padding: "8px 16px" }} onClick={() => setEditModal({ isOpen: false, task: null })}>Cancel</button>
                <button type="submit" className={styles.addBtn} style={{ padding: "8px 16px" }}>Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Modal overlay system styles 
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