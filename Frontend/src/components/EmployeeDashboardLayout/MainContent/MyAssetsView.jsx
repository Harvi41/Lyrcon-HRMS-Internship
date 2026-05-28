import React, { useState, useEffect } from "react";
import styles from "../EmployeeDashboardLayout.module.css";
import { getMyAssets } from "../../../lib/axios";

export default function MyAssetsView() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const response = await getMyAssets();
        setAssets(response.data);
      } catch (error) {
        console.error("Error fetching assets:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAssets();
  }, []);

  return (
    <div className={styles.contentSection}>
      <header className={styles.sectionHeader}>
        <div className={styles.headerTitle}>
          <h2>My Assets</h2>
          <p>Company equipment currently assigned to you</p>
        </div>
      </header>

      <div className={styles.tableCard}>
        {loading ? (
          <p style={{ padding: "20px", textAlign: "center", color: "var(--gray-500)" }}>Loading your assets...</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ASSET ID</th>
                <th>NAME / BRAND</th>
                <th>CATEGORY</th>
                <th>CONDITION</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {assets.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center", padding: "40px" }}>
                    <div style={{ color: "var(--gray-400)", fontSize: "2rem", marginBottom: "10px" }}>💻</div>
                    <p style={{ color: "var(--gray-500)", fontWeight: "500" }}>No assets assigned</p>
                    <p style={{ color: "var(--gray-400)", fontSize: "0.85rem", marginTop: "4px" }}>
                      You currently have no company equipment assigned to your profile.
                    </p>
                  </td>
                </tr>
              ) : (
                assets.map((asset) => (
                  <tr key={asset._id}>
                    <td style={{ fontWeight: "500" }}>{asset._id}</td>
                    <td>
                      <div style={{ fontWeight: "500" }}>{asset.name}</div>
                      <div style={{ fontSize: "0.85rem", color: "var(--gray-500)" }}>{asset.brand}</div>
                    </td>
                    <td>{asset.category}</td>
                    <td>
                      <span className={`${styles.statusBadge} ${asset.condition.toLowerCase() === 'damaged' ? styles.statusRejected : styles.statusApproved}`}>
                        {asset.condition}
                      </span>
                    </td>
                    <td>
                      <span className={`${styles.statusBadge} ${asset.status.toLowerCase() === 'active' ? styles.statusApproved : styles.statusPending}`}>
                        {asset.status}
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
