import React, { useState } from "react";
import LoginPage from "./components/Authform/LoginPage"; 
import HRDashboardLayout from "./components/HRDashboardLayout/HRDashboardLayout";
import AdminDashboardLayout from "./Pages/Admin/AdminDashboardLayout";
import EmployeeDashboardLayout from "./Pages/Employee/EmployeeDashboardLayout";

const allowedRoles = new Set(['hr', 'admin', 'employee']);

function readStoredSession() {
  const token = window.localStorage.getItem('corehr_token');
  const rawUser = window.localStorage.getItem('corehr_user');
  const storedRole = window.localStorage.getItem('corehr_role');

  if (!token || !rawUser) {
    return null;
  }

  try {
    const user = JSON.parse(rawUser);
    let role = String(user?.role || storedRole || '').toLowerCase();

    if (role === 'super admin' || role === 'superadmin' || role === 'super-admin') {
      role = 'admin';
    }

    if (!allowedRoles.has(role)) {
      return null;
    }

    return { token, user, role };
  } catch {
    return null;
  }
}

export default function App() {
  const [session, setSession] = useState(() => readStoredSession());

  const handleLoginSuccess = (authData) => {
    let role = String(authData?.user?.role || '').toLowerCase();
    if (role === 'super admin' || role === 'superadmin' || role === 'super-admin') {
      role = 'admin';
    }

    if (!allowedRoles.has(role)) {
      return;
    }

    window.localStorage.setItem('corehr_role', role);

    setSession({
      token: authData.token,
      user: authData.user,
      role,
    });
  };

  const handleLogout = () => {
    window.localStorage.removeItem('corehr_token');
    window.localStorage.removeItem('corehr_user');
    window.localStorage.removeItem('corehr_role');
    setSession(null);
  };

  if (session) {
    if (session.role === 'hr') {
      return <HRDashboardLayout user={session.user} onLogout={handleLogout} />;
    }

    if (session.role === 'employee') {
      return <EmployeeDashboardLayout user={session.user} onLogout={handleLogout} />;
    }

    return <AdminDashboardLayout user={session.user} onLogout={handleLogout} />;
  }

  return <LoginPage onLoginSuccess={handleLoginSuccess} />;
}

