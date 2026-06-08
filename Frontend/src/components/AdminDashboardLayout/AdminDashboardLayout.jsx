import React, { useState, useEffect } from 'react';
import Sidebar from './Common/Sidebar';
import Header from './Common/Header';
import AdminDashboardHome from './MainContent/AdminDashboardHome';
// import AdminUsersView from './MainContent/AdminUsersView';
import EmployeesView from './MainContent/EmployeesView';
import AttendanceView from './MainContent/AttendanceView';
import LeaveView from './MainContent/LeaveView';
import PayrollView from './MainContent/PayrollView';
import RecruitmentView from './MainContent/RecruitmentView'; // IMPORTED: Your recruitment workflow subview
import TeamMonitoringView from './MainContent/TeamMonitoringView';
import AnnouncementsView from './MainContent/AnnouncementsView'; 
import RolesPermissionsView from './MainContent/RolesPermissionsView';
import AssetsPanel from './MainContent/AssetsPanel'; 
import TasksPanel from '../HRDashboardLayout/MainContent/TasksPanel';
import AdminSettingsView from './MainContent/AdminSettingsView'; 
import styles from './AdminDashboardLayout.module.css';

import PasswordChangeBanner from "../Common/PasswordChangeBanner";
import ChangePasswordModal from "../Common/ChangePasswordModal";

const AdminDashboardLayout = ({ user, onLogout }) => {
  // Syncing default initialization to match the Sidebar lookup keys
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const userName = user?.name || 'Prince Ghevariya';
  const avatarLetter = (userName.trim()[0] || 'P').toUpperCase();

  useEffect(() => {
    // Check local storage for the flag on mount or when user changes
    const userStr = localStorage.getItem('corehr_user');
    if (userStr) {
      const parsedUser = JSON.parse(userStr);
      setMustChangePassword(!!parsedUser.mustChangePassword);
    }
  }, [user, isPasswordModalOpen]); // Re-run when modal closes

  // Unified layout router dictionary matching your sidebar IDs perfectly
  const pageMeta = {
    'Dashboard': { title: "Dashboard Overview", component: <AdminDashboardHome /> },
    // 'Users': { title: "User Provisioning Console", component: <AdminUsersView /> },
    'Employees': { title: "Employee Overview", component: <EmployeesView /> },
    'Attendance': { title: "Attendance Analytics Hub", component: <AttendanceView /> },
    'Leave Management': { title: "Leave Operations & Trends", component: <LeaveView /> },
    'Payroll': { title: "Payroll Management", component: <PayrollView /> },
    'Recruitment': { title: "Recruitment Pipeline", component: <RecruitmentView /> }, // ADDED: Mapped key routing path for recruitment
    'Roles & Permissions': { title: "RBAC Access Control Engine", component: <RolesPermissionsView /> }, 
    'Team Monitoring': { title: "Task & Team Monitoring", component: <TeamMonitoringView /> },
    'assets': { title: "Asset Management", component: <AssetsPanel /> },
    'tasks': { title: "Task Assignment Board", component: <TasksPanel userRole="admin" /> },
    'Announcements': { title: "Announcements", component: <AnnouncementsView /> },
    'Settings': { title: "System Settings", component: <AdminSettingsView user={user} onLogout={onLogout} /> }
  };
  
  const currentPage = pageMeta[activeTab] || pageMeta['Dashboard'];

  return (
    <div className={styles.layoutContainer}>
      {/* 1. Left Fixed Sidebar Layout Area */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onOpenPasswordModal={() => setIsPasswordModalOpen(true)} />
      
      {/* 2. Right Flex Context Screen Window */}
      <div className={styles.mainWrapper}>
        
        {/* Top Header Row Panel Layout block */}
        <Header 
          title={currentPage.title}
          userName={userName}
          avatarLetter={avatarLetter}
          onLogout={onLogout}
        />
        
        {mustChangePassword && (
          <PasswordChangeBanner onChangePasswordClick={() => setIsPasswordModalOpen(true)} />
        )}

        {/* 3. Independent Main Body Canvas scroll space */}
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

export default AdminDashboardLayout;