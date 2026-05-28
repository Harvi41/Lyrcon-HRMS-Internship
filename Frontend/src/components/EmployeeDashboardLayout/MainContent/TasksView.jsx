import React, { useState, useEffect } from "react";
import styles from "../EmployeeDashboardLayout.module.css";
import { getTasks, updateTaskStatus } from "../../../lib/axios";

export default function TasksView() {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);

  // 1. Fetch data on mount
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const { data } = await getTasks();
      // Ensure we map backend properties properly (e.g. status)
      const mappedTasks = data.map(t => ({
        id: t._id,
        title: t.title,
        desc: t.description,
        done: t.status === "completed"
      }));
      setTasks(mappedTasks);
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  // 2. Core State Handlers
  const toggle = async (id, currentStatus) => {
    // Optimistic UI update
    setTasks((p) => p.map((t) => t.id === id ? { ...t, done: !t.done } : t));
    
    try {
      const newStatus = currentStatus ? "in-progress" : "completed";
      await updateTaskStatus(id, { status: newStatus });
    } catch (error) {
      console.error("Failed to update task status:", error);
      // Revert if error
      setTasks((p) => p.map((t) => t.id === id ? { ...t, done: currentStatus } : t));
      alert("Could not update task status.");
    }
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
        {/* Employees cannot create new tasks, removed Add button */}
      </div>

      {/* Main Rendered Task Array Board */}
      <div className={styles.tableCard}>
        {loading ? (
          <p style={{ padding: "20px", textAlign: "center", color: "var(--gray-500)", fontSize: "0.9rem" }}>Loading tasks...</p>
        ) : filtered.length === 0 ? (
          <p style={{ padding: "20px", textAlign: "center", color: "var(--gray-500)", fontSize: "0.9rem" }}>No tasks found matching query.</p>
        ) : (
          filtered.map((task) => (
            <div key={task.id} className={`${styles.taskRow} ${task.done ? styles.taskDone : ""}`} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "16px", flex: 1 }}>
                <button
                  className={`${styles.checkBtn} ${task.done ? styles.checkBtnDone : ""}`}
                  onClick={() => toggle(task.id, task.done)}
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
            </div>
          ))
        )}
      </div>
    </div>
  );
}