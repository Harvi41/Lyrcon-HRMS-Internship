import React, { useState } from "react";
import LoginPage from "./components/Authform/LoginPage"; 
import HRDashboardLayout from "./components/HRDashboardLayout/HRDashboardLayout";
import Dashboard from "./Pages/Dashboard";

const allowedRoles = new Set(['hr', 'super admin', 'employee']);

function readStoredSession() {
  const token = window.localStorage.getItem('corehr_token');
  const rawUser = window.localStorage.getItem('corehr_user');
  const storedRole = window.localStorage.getItem('corehr_role');

  if (!token || !rawUser) {
    return null;
  }

  try {
    const user = JSON.parse(rawUser);
    const role = String(user?.role || storedRole || '').toLowerCase();

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
    const role = String(authData?.user?.role || '').toLowerCase();

    if (!allowedRoles.has(role)) {
      return;
    }

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

    return <Dashboard user={session.user} onLogout={handleLogout} />;
  }

  return <LoginPage onLoginSuccess={handleLoginSuccess} />;
}

