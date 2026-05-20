import React, { useState } from "react";
import LoginPage from "./components/Authform/LoginPage"; 
import HRDashboardLayout from "./components/HRDashboardLayout/HRDashboardLayout";

export default function App() {
  // Global application authentication state pipeline
   const [isAuthenticated, setIsAuthenticated] = useState(false);

   /**
   * Switches execution frames to render the administrative management dashboard
    */
   const handleLoginSuccess = () => {
   setIsAuthenticated(true);
  };

   // 1. If authorization token state passes, initialize CoreHR core layout engine
   if (isAuthenticated) {
    return <HRDashboardLayout />;
  }

  // 2. Otherwise fall back to the unauthenticated operational secure sign-in panel
  return <LoginPage onLoginSuccess={handleLoginSuccess} />;
}

