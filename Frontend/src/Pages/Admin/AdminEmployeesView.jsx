import React, { useEffect, useState } from 'react';
import { AdminPanel } from './AdminDashboardShared';
import EmployeesView from '../../components/HRDashboardLayout/MainContent/EmployeesView';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function AdminEmployeesView() {
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    const token = window.localStorage.getItem('corehr_token');
    if (!token) return;

    let isMounted = true;

    (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/employees`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!res.ok) return;

        const data = await res.json();
        if (isMounted && Array.isArray(data)) {
          setEmployees(data);
        }
      } catch (err) {
        // ignore - keep local data
      }
    })();

    return () => { isMounted = false; };
  }, []);

  return (
    <AdminPanel title="Employee Registry">
      <EmployeesView initialEmployees={employees} />
    </AdminPanel>
  );
}