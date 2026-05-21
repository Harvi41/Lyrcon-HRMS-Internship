export const adminNavigation = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'employees', label: 'Employees' },
  { key: 'attendance', label: 'Attendance' },
  { key: 'leave', label: 'Leave Management' },
  { key: 'payroll', label: 'Payroll' },
  { key: 'roles', label: 'Roles & Permissions' },
  { key: 'settings', label: 'Settings' },
];

export const adminTitleMap = {
  dashboard: 'HRMS Operations Intelligence',
  employees: 'Employee Registry Control',
  attendance: 'Attendance Analytics Hub',
  leave: 'Leave Operations & Trends',
  payroll: 'Payroll Processing Pipeline',
  roles: 'RBAC Access Control Engine',
  settings: 'System Settings',
};

export const adminSectionMeta = {
  dashboard: {
    eyebrow: 'EXECUTIVE SNAPSHOT',
    description: 'A clean command center for workforce, attendance, and payroll operations.',
  },
  employees: {
    eyebrow: 'WORKFORCE REGISTRY',
    description: 'Track the employee base, new joins, and review cycles in one place.',
  },
  attendance: {
    eyebrow: 'TIME & PRESENCE',
    description: 'Monitor shifts, attendance patterns, and leakage signals across the week.',
  },
  leave: {
    eyebrow: 'LEAVE CONTROL',
    description: 'Balance leave requests, staffing coverage, and approval flow.',
  },
  payroll: {
    eyebrow: 'PAYROLL RUNS',
    description: 'Review monthly payouts, deductions, and execution status before release.',
  },
  roles: {
    eyebrow: 'ACCESS GOVERNANCE',
    description: 'Inspect collections, permissions, and role mutations with confidence.',
  },
  settings: {
    eyebrow: 'WORKSPACE SETTINGS',
    description: 'Keep the workspace aligned with security, region, and notification rules.',
  },
};

export const adminDashboardBars = [
  { label: 'Mon', value: 150, tone: 'primary' },
  { label: 'Tue', value: 165, tone: 'primary' },
  { label: 'Wed', value: 175, tone: 'indigo' },
  { label: 'Thu', value: 160, tone: 'primary' },
  { label: 'Fri', value: 130, tone: 'blue' },
];

export const adminDepartmentData = [
  { label: 'Engineering', value: 74, width: 230, tone: 'primary' },
  { label: 'Operations', value: 32, width: 110, tone: 'blue' },
  { label: 'HR Team', value: 18, width: 60, tone: 'green' },
];

export const adminAttendanceTrend = [68, 72, 70, 77, 80, 79, 82, 81, 84, 80, 86];

export const adminLeaveBreakdown = [
  { label: 'Casual Leave (CL)', value: 64, width: 180, tone: 'primary' },
  { label: 'Sick Leave (SL)', value: 22, width: 80, tone: 'green' },
  { label: 'Earned Leave (EL)', value: 14, width: 40, tone: 'amber' },
];

export const adminPayrollRows = [
  {
    name: 'Prince Ghevariya',
    department: 'Engineering',
    base: '₹1,85,000.00',
    net: '₹1,62,400.00',
    status: 'Paid',
  },
  {
    name: 'Aanya Patel',
    department: 'Operations',
    base: '₹92,000.00',
    net: '₹84,400.00',
    status: 'Paid',
  },
  {
    name: 'Meera Shah',
    department: 'HR',
    base: '₹76,500.00',
    net: '₹71,250.00',
    status: 'Paid',
  },
];

export const adminRoleRows = [
  {
    id: '64f1a29b3c...',
    name: 'HR',
    permissions: ['manage_employees', 'approve_leaves', 'view_reports'],
    selected: true,
  },
  {
    id: '64f1a29b4d...',
    name: 'Admin',
    permissions: ['run_payroll', 'manage_roles', 'audit_logs'],
    selected: false,
  },
];

export const adminInitialSummary = {
  totalEmployees: 0,
  activeEmployees: 0,
  inactiveEmployees: 0,
  activeWorkforceRate: 0,
  assetTotal: 0,
  damagedAssets: 0,
  pendingActions: 0,
  departmentBreakdown: [],
  recentEmployees: [],
  recentAssets: [],
};

export const adminDefaultRecentEmployees = [
  { name: 'Prince Ghevariya', email: 'prince@company.com', department: 'Engineering', status: 'active' },
];