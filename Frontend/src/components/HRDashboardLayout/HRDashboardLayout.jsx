import React, { useState, useEffect } from 'react';
import Sidebar from './Common/Sidebar';
import Header from './Common/Header';
import HRDashboardHome from './MainContent/HRDashboardHome';
import EmployeesView from './MainContent/EmployeesView';
import AttendanceView from './MainContent/AttendanceView';
import LeaveView from './MainContent/LeaveView';
import PayrollView from './MainContent/PayrollView';
import RecruitmentView from './MainContent/RecruitmentView';
import AnnouncementsView from './MainContent/AnnouncementsView';
import RolesPermissionsView from './MainContent/RolesPermissionsView';
import AssetsPanel from './MainContent/AssetsPanel';
import TasksPanel from './MainContent/TasksPanel';
import styles from './HRDashboardLayout.module.css';

import PasswordChangeBanner from "../Common/PasswordChangeBanner";
import ChangePasswordModal from "../Common/ChangePasswordModal";

const HRDashboardLayout = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const userName = user?.name || 'HR User';
  const avatarLetter = (userName.trim()[0] || 'H').toUpperCase();

  useEffect(() => {
    // Check local storage for the flag on mount or when user changes
    const userStr = localStorage.getItem('corehr_user');
    if (userStr) {
      const parsedUser = JSON.parse(userStr);
      setMustChangePassword(!!parsedUser.mustChangePassword);
    }
  }, [user, isPasswordModalOpen]); // Re-run when modal closes

  // Unified layout router dictionary
  const pageMeta = {
    dashboard: { title: "HRMS Operational Intelligence", component: <HRDashboardHome /> },
    employees: { title: "Employee Overview", component: <EmployeesView /> },
    attendance: { title: "Attendance Analytics Hub", component: <AttendanceView /> },
    leave: { title: "Leave Management", component: <LeaveView /> },
    payroll: { title: "Payroll Management", component: <PayrollView /> },
    recruitment: { title: "Recruitment", component: <RecruitmentView /> },
    announcements: { title: "Announcements", component: <AnnouncementsView /> },
    'roles-permissions': { title: "RBAC Access Control Engine", component: <RolesPermissionsView /> }, // FIXED: Added missing trailing comma here
    assets: { title: "Asset Management", component: <AssetsPanel /> },
    tasks: { title: "Task Assignment Board", component: <TasksPanel userRole="hr" /> }
  };

  const currentPage = pageMeta[activeTab] || pageMeta.dashboard;

  return (
    <div className={styles.layoutContainer}>
      {/* 1. Left Fixed Element: Always spans 100% height without scrolling */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onOpenPasswordModal={() => setIsPasswordModalOpen(true)} />

      {/* 2. Right Flex Wrapper: Fills remainder of screen window widths */}
      <div className={styles.mainWrapper}>

        {/* Top Header Row Panel: Stays locked at a fixed 72px height */}
        <Header
          title={currentPage.title}
          userName={userName}
          avatarLetter={avatarLetter}
          onLogout={onLogout}
        />

        {mustChangePassword && (
          <PasswordChangeBanner onChangePasswordClick={() => setIsPasswordModalOpen(true)} />
        )}

        {/* 3. Independent Scroll Container Window */}
        <main className={styles.contentArea}>
          {currentPage.component}
        </main>

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
};

export default HRDashboardLayout;