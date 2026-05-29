import React, { useState, useEffect } from "react";
import styles from "../EmployeeDashboardLayout.module.css";
import { getDirectory } from "../../../lib/axios";

export default function DirectoryView() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchDirectory = async () => {
      try {
        const response = await getDirectory();
        setEmployees(Array.isArray(response?.data) ? response.data : []);
      } catch (error) {
        console.error("Error fetching directory:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDirectory();
  }, []);

  // ═══════════════════════════════════════════════════════════════════════════
  // RE-ENGINEERED CRASH-PROOF FILTER ENGINE
  // ═══════════════════════════════════════════════════════════════════════════
  const filteredEmployees = Array.isArray(employees) ? employees.filter(emp => {
    const term = typeof searchQuery === 'string' ? searchQuery.toLowerCase().trim() : '';
    if (!term) return true;

    // Strict type protection conversions to handle missing name properties gracefully
    const first = typeof emp?.firstName === 'string' ? emp.firstName.toLowerCase() : '';
    const last = typeof emp?.lastName === 'string' ? emp.lastName.toLowerCase() : '';
    const fullName = `${first} ${last}`.trim();
    
    const dept = typeof emp?.department === 'string' ? emp.department.toLowerCase() : '';
    const role = typeof emp?.designation === 'string' ? emp.designation.toLowerCase() : '';

    return (
      fullName.includes(term) ||
      dept.includes(term) ||
      role.includes(term)
    );
  }) : [];

  const getAvatarColors = (name) => {
    const colorPairs = [
      { bg: "#fee2e2", text: "#ef4444" }, 
      { bg: "#fef3c7", text: "#d97706" }, 
      { bg: "#e0e7ff", text: "#4f46e5" }, 
      { bg: "#f0fdf4", text: "#16a34a" }, 
      { bg: "#fce7f3", text: "#db2777" }, 
      { bg: "#e0f2fe", text: "#0284c7" }, 
    ];
    let hash = 0;
    const cleanName = String(name || '');
    for (let i = 0; i < cleanName.length; i++) {
      hash = cleanName.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colorPairs[Math.abs(hash) % colorPairs.length];
  };

  const getInitials = (first, last) => {
    return `${first?.charAt(0) || ""}${last?.charAt(0) || ""}`.toUpperCase();
  };

  return (
    <div className={styles.contentSection} style={{ gap: "24px" }}>
      {/* 💡 FIXED: Explicit local header tag block code stripped to avoid text duplication layout overlap bugs */}

      {/* SEARCH BAR */}
      <div 
        style={{
          display: "flex",
          alignItems: "center",
          background: "#ffffff",
          border: "1.5px solid #e2e8f0",
          borderRadius: "10px",
          width: "400px",
          height: "44px",
          padding: "0 16px",
          gap: "12px",
          marginTop: "4px"
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="10" cy="10" r="7" />
          <line x1="21" y1="21" x2="15" y2="15" />
        </svg>
        <input
          type="text"
          placeholder="Search by name, department, or role..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            border: "none",
            outline: "none",
            background: "transparent",
            width: "100%",
            fontSize: "14px",
            color: "#0f172a",
          }}
        />
      </div>

      {/* MAIN DIRECTORY TABLE */}
      <div 
        style={{
          background: "#ffffff",
          borderRadius: "16px",
          boxShadow: "0 4px 20px rgba(15, 23, 42, 0.03), 0 18px 40px rgba(15, 23, 42, 0.04)",
          overflow: "hidden"
        }}
      >
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "900px" }}>
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                <th style={{ padding: "18px 32px", textAlign: "left", fontSize: "12px", fontWeight: "700", color: "#475569", letterSpacing: "0.75px" }}>EMPLOYEE</th>
                <th style={{ padding: "18px 24px", textAlign: "left", fontSize: "12px", fontWeight: "700", color: "#475569", letterSpacing: "0.75px" }}>ROLE</th>
                <th style={{ padding: "18px 24px", textAlign: "left", fontSize: "12px", fontWeight: "700", color: "#475569", letterSpacing: "0.75px" }}>DEPARTMENT</th>
                <th style={{ padding: "18px 24px", textAlign: "left", fontSize: "12px", fontWeight: "700", color: "#475569", letterSpacing: "0.75px" }}>CONTACT</th>
                <th style={{ padding: "18px 32px", textAlign: "left", fontSize: "12px", fontWeight: "700", color: "#475569", letterSpacing: "0.75px" }}>LOCATION</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>Loading company matrix layout directory...</td>
                </tr>
              ) : filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>No colleagues found matching your search parameters.</td>
                </tr>
              ) : (
                filteredEmployees.map((emp, i) => {
                  const displayFirst = emp?.firstName || '';
                  const displayLast = emp?.lastName || '';
                  const fullName = `${displayFirst} ${displayLast}`.trim() || 'Incomplete Profile';
                  const colors = getAvatarColors(fullName);
                  
                  return (
                    <tr key={emp?._id || i} style={{ borderBottom: "1.5px solid #f1f5f9" }}>
                      <td style={{ padding: "18px 32px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                          <div 
                            style={{
                              width: "48px",
                              height: "48px",
                              borderRadius: "50%",
                              background: colors.bg,
                              color: colors.text,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "15px",
                              fontWeight: "700",
                              flexShrink: 0
                            }}
                          >
                            {getInitials(emp?.firstName, emp?.lastName)}
                          </div>
                          <div style={{ fontSize: "15px", fontWeight: "600", color: "#0f172a" }}>
                            {fullName}
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: "18px 24px" }}>
                        <span style={{ fontSize: "15px", fontWeight: "500", color: emp?.designation ? "#334155" : "#94a3b8" }}>
                          {emp?.designation || "—"}
                        </span>
                      </td>

                      <td style={{ padding: "18px 24px" }}>
                        {emp?.department ? (
                          <div style={{ display: "inline-flex", background: "#f0fdf4", color: "#16a34a", padding: "4px 12px", borderRadius: "6px", fontSize: "13px", fontWeight: "600" }}>
                            {emp.department}
                          </div>
                        ) : (
                          <span style={{ fontSize: "15px", fontWeight: "500", color: "#94a3b8" }}>—</span>
                        )}
                      </td>

                      <td style={{ padding: "18px 24px" }}>
                        <span style={{ fontSize: "15px", fontWeight: "500", color: "#334155" }}>
                          {emp?.email || "—"}
                        </span>
                      </td>

                      <td style={{ padding: "18px 32px" }}>
                        <div style={{ display: "inline-flex", background: "#f1f5f9", color: "#475569", padding: "4px 14px", borderRadius: "12px", fontSize: "13px", fontWeight: "600" }}>
                          {emp?.workLocation || "Office"}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* FOOTER */}
        {!loading && (
          <div style={{ padding: "20px 32px", borderTop: "1px solid #f1f5f9" }}>
            <span style={{ fontSize: "14px", fontWeight: "500", color: "#64748b" }}>
              Showing <span style={{ fontWeight: "700", color: "#0f172a" }}>{filteredEmployees.length}</span> of <span style={{ fontWeight: "700", color: "#0f172a" }}>{employees.length}</span> results
            </span>
          </div>
        )}
      </div>
    </div>
  );
}