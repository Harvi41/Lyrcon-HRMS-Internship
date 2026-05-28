import React, { useState, useEffect } from "react";
import styles from "../EmployeeDashboardLayout.module.css";
import { getMyTickets, createTicket } from "../../../lib/axios";

export default function HelpdeskView() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("IT Support");
  const [priority, setPriority] = useState("Medium");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const response = await getMyTickets();
      setTickets(response.data);
    } catch (error) {
      console.error("Error fetching tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await createTicket({ title, description, category, priority });
      setShowForm(false);
      setTitle("");
      setDescription("");
      setCategory("IT Support");
      setPriority("Medium");
      fetchTickets();
    } catch (error) {
      console.error("Error creating ticket:", error);
      alert("Failed to submit ticket.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Open': return styles.statusPending;
      case 'In Progress': return styles.statusApproved;
      case 'Resolved': return styles.statusApproved;
      case 'Closed': return styles.statusRejected;
      default: return styles.statusPending;
    }
  };

  return (
    <div className={styles.contentSection}>
      <header className={styles.sectionHeader}>
        <div className={styles.headerTitle}>
          <h2>Helpdesk & Support</h2>
          <p>Raise tickets for IT, HR, or Facility issues</p>
        </div>
        <div className={styles.headerActions}>
          <button 
            className={styles.primaryButton}
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? "Cancel" : "+ New Ticket"}
          </button>
        </div>
      </header>

      {showForm && (
        <div className={styles.formCard} style={{ marginBottom: "24px", padding: "24px", backgroundColor: "white", borderRadius: "12px", border: "1px solid var(--gray-200)" }}>
          <h3 style={{ marginBottom: "16px", color: "var(--gray-900)" }}>Create a New Ticket</h3>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={{ fontSize: "0.85rem", fontWeight: "500", color: "var(--gray-700)" }}>Issue Title</label>
                <input 
                  type="text" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  required
                  placeholder="E.g., Laptop not connecting to WiFi"
                  style={{ padding: "10px", borderRadius: "6px", border: "1px solid var(--gray-300)" }}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={{ fontSize: "0.85rem", fontWeight: "500", color: "var(--gray-700)" }}>Category</label>
                <select 
                  value={category} 
                  onChange={(e) => setCategory(e.target.value)}
                  style={{ padding: "10px", borderRadius: "6px", border: "1px solid var(--gray-300)" }}
                >
                  <option value="IT Support">IT Support</option>
                  <option value="HR Inquiry">HR Inquiry</option>
                  <option value="Payroll Issue">Payroll Issue</option>
                  <option value="Facilities">Facilities</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ fontSize: "0.85rem", fontWeight: "500", color: "var(--gray-700)" }}>Description</label>
              <textarea 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                required
                rows={4}
                placeholder="Please describe your issue in detail..."
                style={{ padding: "10px", borderRadius: "6px", border: "1px solid var(--gray-300)", resize: "vertical" }}
              />
            </div>

            <div style={{ alignSelf: "flex-end" }}>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className={styles.primaryButton}
                style={{ opacity: isSubmitting ? 0.7 : 1 }}
              >
                {isSubmitting ? "Submitting..." : "Submit Ticket"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className={styles.tableCard}>
        {loading ? (
          <p style={{ padding: "20px", textAlign: "center", color: "var(--gray-500)" }}>Loading tickets...</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>TICKET ID</th>
                <th>ISSUE TITLE</th>
                <th>CATEGORY</th>
                <th>DATE SUBMITTED</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {tickets.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center", padding: "40px" }}>
                    <div style={{ color: "var(--gray-400)", fontSize: "2rem", marginBottom: "10px" }}>🎫</div>
                    <p style={{ color: "var(--gray-500)", fontWeight: "500" }}>No tickets raised</p>
                    <p style={{ color: "var(--gray-400)", fontSize: "0.85rem", marginTop: "4px" }}>
                      You haven't submitted any helpdesk tickets yet.
                    </p>
                  </td>
                </tr>
              ) : (
                tickets.map((ticket) => (
                  <tr key={ticket._id}>
                    <td style={{ fontWeight: "500" }}>{ticket.ticketId}</td>
                    <td>
                      <div style={{ fontWeight: "500" }}>{ticket.title}</div>
                      {ticket.resolution && (
                        <div style={{ fontSize: "0.85rem", color: "var(--green-600)", marginTop: "4px" }}>
                          Resolution: {ticket.resolution}
                        </div>
                      )}
                    </td>
                    <td>{ticket.category}</td>
                    <td>{new Date(ticket.createdAt).toLocaleDateString()}</td>
                    <td>
                      <span className={`${styles.statusBadge} ${getStatusColor(ticket.status)}`}>
                        {ticket.status}
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
