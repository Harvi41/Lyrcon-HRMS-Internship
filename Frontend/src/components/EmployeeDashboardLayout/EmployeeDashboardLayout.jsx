import React, { useState, useEffect } from "react";
import styles from "./EmployeeDashboardLayout.module.css";

import Sidebar             from "./Common/Sidebar";
import Header               from "./Common/Header";
import EmployeeDashboardHome from "./MainContent/EmployeeDashboardHome";
import TasksView            from "./MainContent/TasksView";
import AttendanceView       from "./MainContent/AttendanceView";
import MissPunchingView     from "./MainContent/MissPunchingView";
import LeaveView            from "./MainContent/LeaveView";
import PayrollView          from "./MainContent/PayrollView";
import AnnouncementsView    from "./MainContent/AnnouncementsView";
import MyProfileView        from "./MainContent/MyProfileView";
import MyAssetsView         from "./MainContent/MyAssetsView";
import DirectoryView        from "./MainContent/DirectoryView";

import PasswordChangeBanner from "../Common/PasswordChangeBanner";
import ChangePasswordModal from "../Common/ChangePasswordModal";

// 1. Destructure BOTH onLogout and user from the incoming props here
export default function EmployeeDashboardLayout({ onLogout, user }) {
  const [page, setPage] = useState("dashboard");
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [mustChangePassword, setMustChangePassword] = useState(false);

  useEffect(() => {
    // Check local storage for the flag on mount or when user changes
    const userStr = localStorage.getItem('corehr_user');
    if (userStr) {
      const parsedUser = JSON.parse(userStr);
      setMustChangePassword(!!parsedUser.mustChangePassword);
    }
  }, [user, isPasswordModalOpen]); // Re-run when modal closes

  const renderPage = () => {
    switch (page) {
      case "dashboard":     return <EmployeeDashboardHome onNavigate={setPage} />;
      case "tasks":         return <TasksView />;
      case "attendance":    return <AttendanceView />;
      case "miss-punch":    return <MissPunchingView />;
      case "leave":         return <LeaveView />;
      case "payroll":       return <PayrollView />;
      case "announcements": return <AnnouncementsView />;
      case "profile":       return <MyProfileView />;
      case "assets":        return <MyAssetsView />;
      case "directory":     return <DirectoryView />;
      default:              return <EmployeeDashboardHome onNavigate={setPage} />;
    }
  };

  return (
    <div className={styles.shell}>
      <Sidebar activePage={page} onNavigate={setPage} onOpenPasswordModal={() => setIsPasswordModalOpen(true)} />
      <div className={styles.main}>
        {/* 2. Added the user={user} prop here so Header can display the dynamic name */}
        <Header activePage={page} onLogout={onLogout} user={user} />
        {mustChangePassword && (
          <PasswordChangeBanner onChangePasswordClick={() => setIsPasswordModalOpen(true)} />
        )}
        <div className={styles.content}>{renderPage()}</div>
      </div>
      
      <ChangePasswordModal 
        isOpen={isPasswordModalOpen} 
        onClose={() => setIsPasswordModalOpen(false)}
        onSuccess={() => {
          setIsPasswordModalOpen(false);
          setMustChangePassword(false);
        }}
      />
    </div>
  );
}
