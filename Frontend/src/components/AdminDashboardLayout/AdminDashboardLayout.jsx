import React, { useState } from 'react';
import Sidebar from './Common/Sidebar';
import Header from './Common/Header';
import AdminDashboardHome from './MainContent/AdminDashboardHome';
import EmployeesView from './MainContent/EmployeesView';
import AttendanceView from './MainContent/AttendanceView';
import LeaveView from './MainContent/LeaveView';
import PayrollView from './MainContent/PayrollView';
import RecruitmentView from './MainContent/RecruitmentView';
import TeamMonitoringView from './MainContent/TeamMonitoringView';
import AnnouncementsView from './MainContent/AnnouncementsView';
import RolesPermissionsView from './MainContent/RolesPermissionsView'; // FIX 1: Uncommented this import
import AssetsPanel from './MainContent/AssetsPanel';
import styles from './AdminDashboardLayout.module.css';

const AdminDashboardLayout = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const userName = user?.name || 'Admin User';
  const avatarLetter = (userName.trim()[0] || 'A').toUpperCase();

  // Unified layout router dictionary
  const pageMeta = {
    // FIX 2: Changed <HRDashboardHome /> to <AdminDashboardHome /> to match your import statement above
    dashboard: { title: "Task & Team Monitoring", component: <AdminDashboardHome /> },
    employees: { title: "Employee Overview", component: <EmployeesView /> },
    attendance: { title: "Attendance Analytics Hub", component: <AttendanceView /> },
    leave: { title: "Leave Management", component: <LeaveView /> },
    payroll: { title: "Payroll Management", component: <PayrollView /> },
    recruitment: { title: "Recruitment", component: <RecruitmentView /> },
    'team-monitoring': { title: "Team Monitoring", component: <TeamMonitoringView /> },
    announcements: { title: "Announcements", component: <AnnouncementsView /> },
    'roles-permissions': { title: "RBAC Access Control Engine", component: <RolesPermissionsView /> }, 
    assets: { title: "Asset Management", component: <AssetsPanel /> }
  };
  
  const currentPage = pageMeta[activeTab] || pageMeta.dashboard;

  return (
    <div className={styles.layoutContainer}>
      {/* 1. Left Fixed Element: Always spans 100% height without scrolling */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {/* 2. Right Flex Wrapper: Fills remainder of screen window widths */}
      <div className={styles.mainWrapper}>
        
        {/* Top Header Row Panel: Stays locked at a fixed 72px height */}
        <Header 
          title={currentPage.title}
          userName={userName}
          avatarLetter={avatarLetter}
          onLogout={onLogout}
        />
        
        {/* 3. Independent Scroll Container Window */}
        <main className={styles.contentArea}>
          {currentPage.component}
        </main>
        
      </div>
    </div>
  );
};

export default AdminDashboardLayout;