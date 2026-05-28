import React, { useState } from "react";
import LoginPage from "./components/Authform/LoginPage";
import ResetPasswordPage from "./components/Authform/ResetPasswordPage";
import HRDashboardLayout from "./components/HRDashboardLayout/HRDashboardLayout";
import AdminDashboardLayout from "./components/AdminDashboardLayout/AdminDashboardLayout";
import EmployeeDashboardLayout from "./components/EmployeeDashboardLayout/EmployeeDashboardLayout";

// Standardized lookup set for allowed lower-cased role mappings
const allowedRoles = new Set(['hr', 'admin', 'employee']);

function normalizeRole(roleString) {
  const cleanRole = String(roleString || '').trim().toLowerCase();

  // Map any Super Admin variations to the target 'admin' dashboard layer
  if (cleanRole === 'super admin' || cleanRole === 'superadmin' || cleanRole === 'super-admin') {
    return 'admin';
  }
  return cleanRole;
}

function readStoredSession() {
  const token = window.localStorage.getItem('corehr_token');
  const rawUser = window.localStorage.getItem('corehr_user');
  const storedRole = window.localStorage.getItem('corehr_role');

  if (!token || !rawUser) {
    return null;
  }

  try {
    const user = JSON.parse(rawUser);

    // Safely normalize the incoming role string
    const role = normalizeRole(user?.role || storedRole);

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
  const [resetToken, setResetToken] = useState(() => {
    const queryParams = new URLSearchParams(window.location.search);
    return queryParams.get('token');
  });

  const handleLoginSuccess = (authData) => {
    // 1. Core safety check for incoming payloads
    if (!authData || !authData.token || !authData.user) {
      console.error("Invalid authentication payload received from backend.");
      return;
    }

    // 2. Normalize role string to match React view conditionals
    const role = normalizeRole(authData.user.role);

    if (!allowedRoles.has(role)) {
      alert(`Access Denied: Role '${authData.user.role}' does not match frontend layout access trees.`);
      return;
    }

    // 3. Persist session tokens securely in the user's browser storage
    window.localStorage.setItem('corehr_token', authData.token);
    window.localStorage.setItem('corehr_user', JSON.stringify(authData.user));
    window.localStorage.setItem('corehr_role', role);

    // 4. Update core state engine to trigger immediate layout re-render
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

  // ═══════════════════════════════════════════════════════════════════════════
  // PASSWORD RESET INTERCEPT ROUTER
  // ═══════════════════════════════════════════════════════════════════════════
  if (resetToken) {
    return (
      <ResetPasswordPage
        token={resetToken}
        onComplete={() => {
          window.history.replaceState({}, document.title, '/');
          setResetToken(null);
        }}
      />
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ROLE-BASED DASHBOARD ROUTING ENGINE
  // ═══════════════════════════════════════════════════════════════════════════
  if (session) {
    switch (session.role) {
      case 'hr':
        return <HRDashboardLayout user={session.user} onLogout={handleLogout} />;

      case 'employee':
        return <EmployeeDashboardLayout user={session.user} onLogout={handleLogout} />;

      case 'admin':
        // This natively catches both 'admin' and parsed 'super admin' strings now!
        return <AdminDashboardLayout user={session.user} onLogout={handleLogout} />;

      default:
        return <LoginPage onLoginSuccess={handleLoginSuccess} />;
    }
  }

  // Fallback state: Render the login form if no active session exists
  return <LoginPage onLoginSuccess={handleLoginSuccess} />;
}
