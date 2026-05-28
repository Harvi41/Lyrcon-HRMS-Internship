import React, { useState, useEffect } from "react";
import styles from "../EmployeeDashboardLayout.module.css";
import { getAnnouncements } from "../../../lib/axios";

export default function AnnouncementsView() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const { data } = await getAnnouncements();
      
      const announcementsArray = Array.isArray(data) ? data : (data.announcements || []);
      const mapped = announcementsArray.map(a => ({
        id: a._id,
        title: a.title,
        tag: a.category || "Info",
        type: a.priority === "High" ? "urgent" : a.priority === "Medium" ? "event" : "info",
        body: a.description,
        isRecentThisWeek: new Date(a.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      }));
      setAnnouncements(mapped);
    } catch (error) {
      console.error("Failed to fetch announcements:", error);
    } finally {
      setLoading(false);
    }
  };

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
          {loading ? (
             <p style={{ padding: "20px", color: "var(--gray-500)", fontSize: "0.9rem" }}>Loading announcements...</p>
          ) : announcements.length === 0 ? (
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