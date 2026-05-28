import React, { useState } from "react";
import styles from "./EmployeeDashboardLayout.module.css";

import Sidebar             from "./Common/Sidebar";
import Header               from "./Common/Header";
import EmployeeDashboardHome from "./MainContent/EmployeeDashboardHome";
import TasksView            from "./MainContent/TasksView";
import AttendanceView       from "./MainContent/AttendanceView";
import LeaveView            from "./MainContent/LeaveView";
import PayrollView          from "./MainContent/PayrollView";
import AnnouncementsView    from "./MainContent/AnnouncementsView";

// 1. Destructure BOTH onLogout and user from the incoming props here
export default function EmployeeDashboardLayout({ onLogout, user }) {
  const [page, setPage] = useState("dashboard");

  const renderPage = () => {
    switch (page) {
      case "dashboard":     return <EmployeeDashboardHome onNavigate={setPage} />;
      case "tasks":         return <TasksView />;
      case "attendance":    return <AttendanceView />;
      case "leave":         return <LeaveView />;
      case "payroll":       return <PayrollView />;
      case "announcements": return <AnnouncementsView />;
      default:              return <EmployeeDashboardHome onNavigate={setPage} />;
    }
  };

  return (
    <div className={styles.shell}>
      <Sidebar activePage={page} onNavigate={setPage} />
      <div className={styles.main}>
        {/* 2. Added the user={user} prop here so Header can display the dynamic name */}
        <Header activePage={page} onLogout={onLogout} user={user} />
        <div className={styles.content}>{renderPage()}</div>
      </div>
    </div>
  );
}
