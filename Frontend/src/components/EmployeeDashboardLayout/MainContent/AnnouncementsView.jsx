import React, { useState } from "react";
import styles from "../EmployeeDashboardLayout.module.css";

// 1. Expanded structural baseline dataset
const INITIAL_ANNOUNCEMENTS = [
  { id: 1, title: "All-Hands Meeting",   tag: "Event",  type: "event",  body: "Join us for the quarterly all hands meeting this Friday at 4 PM.", isRecentThisWeek: true },
  { id: 2, title: "New Health Benefits", tag: "Info",   type: "info",   body: "We are excited to announce enhanced health coverage starting next month.", isRecentThisWeek: true },
  { id: 3, title: "System Maintenance",  tag: "Urgent", type: "urgent", body: "The internal system will be down for scheduled maintenance from 10 PM to 2 AM.", isRecentThisWeek: true },
  { id: 4, title: "Office Renovation Sync", tag: "Info", type: "info",  body: "The 3rd-floor conference wing will be closed for repaint schedules until next week.", isRecentThisWeek: false },
  { id: 5, title: "Tech Stack Migration Guide", tag: "Event", type: "event", body: "Join the engineering channel stream on Tuesday for the new framework repository walkthrough.", isRecentThisWeek: false },
];

export default function AnnouncementsView() {
  // 2. Wrap mock data into local React State
  const [announcements] = useState(INITIAL_ANNOUNCEMENTS);

  // ─── RUNTIME CALCULATED COUNTERS ───
  const totalAnnouncements = announcements.length;
  
  // Dynamically counts entries tagged for the current active week
  const announcementsThisWeek = announcements.filter((a) => a.isRecentThisWeek).length;

  return (
    <div className={styles.page}>
      {/* Top Metric Cards calculating live statistics from state arrays */}
      <div className={styles.statRow2}>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>TOTAL</p>
          <p className={styles.statValue}>{totalAnnouncements}</p>
        </div>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>THIS WEEK</p>
          <p className={`${styles.statValue} ${styles.indigo}`}>{announcementsThisWeek}</p>
        </div>
      </div>

      {/* Main Dynamic Announcements Board */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Recent Announcements</h2>
        <div className={styles.announceList}>
          {announcements.length === 0 ? (
            <p style={{ padding: "20px", color: "var(--gray-500)", fontSize: "0.9rem" }}>
              No official board announcements pinned.
            </p>
          ) : (
            announcements.map((a) => {
              // Standardizes type mapping strings to handle potential case anomalies smoothly
              const cleanType = (a.type || "info").toLowerCase();

              return (
                <div 
                  key={a.id || a.title} 
                  className={`${styles.announceCard} ${styles[`announce_${cleanType}`]}`}
                >
                  <div className={styles.announceHeader}>
                    <p className={styles.announceTitle}>{a.title}</p>
                    <span className={`${styles.announceTag} ${styles[`tag_${cleanType}`]}`}>
                      {a.tag || "Info"}
                    </span>
                  </div>
                  <p className={styles.announceBody}>{a.body}</p>
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}