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
        setEmployees(response.data);
      } catch (error) {
        console.error("Error fetching directory:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDirectory();
  }, []);

  const filteredEmployees = employees.filter(emp => {
    const term = searchQuery.toLowerCase();
    const fullName = `${emp.firstName} ${emp.lastName}`.toLowerCase();
    return (
      fullName.includes(term) ||
      (emp.department && emp.department.toLowerCase().includes(term)) ||
      (emp.designation && emp.designation.toLowerCase().includes(term))
    );
  });

  // Helper to generate consistent colors based on employee name
  const getAvatarColors = (name) => {
    const colorPairs = [
      { bg: "#fee2e2", text: "#ef4444" }, // Red
      { bg: "#fef3c7", text: "#d97706" }, // Amber
      { bg: "#e0e7ff", text: "#4f46e5" }, // Indigo
      { bg: "#f0fdf4", text: "#16a34a" }, // Green
      { bg: "#fce7f3", text: "#db2777" }, // Pink
      { bg: "#e0f2fe", text: "#0284c7" }, // Sky
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colorPairs[Math.abs(hash) % colorPairs.length];
  };

  const getInitials = (first, last) => {
    return `${first?.charAt(0) || ""}${last?.charAt(0) || ""}`.toUpperCase();
  };

  return (
    <div className={styles.contentSection} style={{ gap: "28px" }}>
      {/* HEADER SECTION */}
      <header style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <h2 style={{ fontSize: "28px", fontWeight: "800", color: "#0f172a", letterSpacing: "-0.5px", margin: 0 }}>
          Company Directory
        </h2>
        <p style={{ fontSize: "14px", color: "#64748b", fontWeight: "400", margin: 0 }}>
          Find and connect with your colleagues instantly.
        </p>
      </header>

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
          gap: "12px"
        }}
      >
        {/* Search Icon */}
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
                  <td colSpan="5" style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>Loading directory...</td>
                </tr>
              ) : filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>No colleagues found matching your search.</td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => {
                  const fullName = `${emp.firstName} ${emp.lastName}`;
                  const colors = getAvatarColors(fullName);
                  
                  return (
                    <tr key={emp._id} style={{ borderBottom: "1.5px solid #f1f5f9" }}>
                      
                      {/* EMPLOYEE */}
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
                            {getInitials(emp.firstName, emp.lastName)}
                          </div>
                          <div style={{ fontSize: "15px", fontWeight: "600", color: "#0f172a" }}>
                            {fullName}
                          </div>
                        </div>
                      </td>

                      {/* ROLE */}
                      <td style={{ padding: "18px 24px" }}>
                        <span style={{ fontSize: "15px", fontWeight: "500", color: emp.designation ? "#334155" : "#94a3b8" }}>
                          {emp.designation || "—"}
                        </span>
                      </td>

                      {/* DEPARTMENT */}
                      <td style={{ padding: "18px 24px" }}>
                        {emp.department ? (
                          <div style={{ display: "inline-flex", background: "#f0fdf4", color: "#16a34a", padding: "4px 12px", borderRadius: "6px", fontSize: "13px", fontWeight: "600" }}>
                            {emp.department}
                          </div>
                        ) : (
                          <span style={{ fontSize: "15px", fontWeight: "500", color: "#94a3b8" }}>—</span>
                        )}
                      </td>

                      {/* CONTACT */}
                      <td style={{ padding: "18px 24px" }}>
                        <span style={{ fontSize: "15px", fontWeight: "500", color: "#334155" }}>
                          {emp.email}
                        </span>
                      </td>

                      {/* LOCATION */}
                      <td style={{ padding: "18px 32px" }}>
                        <div style={{ display: "inline-flex", background: "#f1f5f9", color: "#475569", padding: "4px 14px", borderRadius: "12px", fontSize: "13px", fontWeight: "600" }}>
                          {emp.workLocation || "Office"}
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
