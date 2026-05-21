import { useEffect, useState } from 'react';
import AssetsPanel from '../components/AssetsPanel';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const navigation = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'employees', label: 'Employees' },
  { key: 'attendance', label: 'Attendance' },
  { key: 'leave', label: 'Leave Management' },
  { key: 'payroll', label: 'Payroll' },
  { key: 'assets', label: 'Asset Management' },
  { key: 'roles', label: 'Roles & Permissions' },
  { key: 'settings', label: 'Settings' },
];

const dashboardBars = [
  { label: 'Mon', value: 150, tone: 'primary' },
  { label: 'Tue', value: 165, tone: 'primary' },
  { label: 'Wed', value: 175, tone: 'indigo' },
  { label: 'Thu', value: 160, tone: 'primary' },
  { label: 'Fri', value: 130, tone: 'blue' },
];

const departmentData = [
  { label: 'Engineering', value: 74, width: 230, tone: 'primary' },
  { label: 'Operations', value: 32, width: 110, tone: 'blue' },
  { label: 'HR Team', value: 18, width: 60, tone: 'green' },
];

const attendanceTrend = [
  68, 72, 70, 77, 80, 79, 82, 81, 84, 80, 86,
];

const leaveBreakdown = [
  { label: 'Casual Leave (CL)', value: 64, width: 180, tone: 'primary' },
  { label: 'Sick Leave (SL)', value: 22, width: 80, tone: 'green' },
  { label: 'Earned Leave (EL)', value: 14, width: 40, tone: 'amber' },
];

const payrollRows = [
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

const roleRows = [
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

const sectionMeta = {
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
  assets: {
    eyebrow: 'ASSET INVENTORY',
    description: 'Track, assign, and manage company assets across all departments.',
  },
  settings: {
    eyebrow: 'WORKSPACE SETTINGS',
    description: 'Keep the workspace aligned with security, region, and notification rules.',
  },
};

function DashboardStatCard({ label, value, note, accent = 'primary' }) {
  return (
    <article className="stat-card">
      <p className="stat-label">{label}</p>
      <div className="stat-value-row">
        <h3 className="stat-value">{value}</h3>
        {note ? <span className={`stat-note ${accent}`}>{note}</span> : null}
      </div>
    </article>
  );
}

function Panel({ title, subtitle, children, className = '' }) {
  return (
    <section className={`panel ${className}`.trim()}>
      {(title || subtitle) && (
        <div className="panel-head">
          <div>
            {title ? <h2 className="panel-title">{title}</h2> : null}
            {subtitle ? <p className="panel-subtitle">{subtitle}</p> : null}
          </div>
        </div>
      )}
      {children}
    </section>
  );
}

function DashboardBars() {
  return (
    <div className="chart-bars">
      <div className="chart-grid-lines" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <div className="chart-bars-body">
        {dashboardBars.map((item) => (
          <div className="chart-bar-column" key={item.label}>
            <div className={`chart-bar ${item.tone}`} style={{ height: `${item.value}px` }} />
            <span className="chart-bar-label">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TrendLineChart() {
  const width = 1000;
  const height = 180;
  const paddingX = 20;
  const paddingY = 10;
  const points = attendanceTrend.map((value, index) => {
    const x = paddingX + (index * (width - paddingX * 2)) / (attendanceTrend.length - 1);
    const normalized = (value - 60) / 30;
    const y = height - paddingY - normalized * (height - paddingY * 2);
    return `${x},${y}`;
  });

  return (
    <svg className="trend-chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Attendance trend chart">
      <line x1="0" y1="160" x2={width} y2="160" className="trend-baseline" />
      <polyline points={points.join(' ')} className="trend-line" />
    </svg>
  );
}

function Dashboard({ user, onLogout }) {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [summary, setSummary] = useState({
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
  });
  const userName = user?.name || 'Prince Ghevariya';
  const activeMeta = sectionMeta[activeSection] || sectionMeta.dashboard;
  const titleMap = {
    dashboard: 'HRMS Operations Intelligence',
    employees: 'Employee Registry Control',
    attendance: 'Attendance Analytics Hub',
    leave: 'Leave Operations & Trends',
    payroll: 'Payroll Processing Pipeline',
    assets: 'Company Asset Management',
    roles: 'RBAC Access Control Engine',
    settings: 'System Settings',
  };

  useEffect(() => {
    const token = window.localStorage.getItem('corehr_token');

    if (!token) {
      return;
    }

    let isMounted = true;

    const loadSummary = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/dashboard/summary`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          return;
        }

        const data = await response.json();

        if (isMounted) {
          setSummary(data);
        }
      } catch {
        // Keep the fallback snapshot if the backend is temporarily unavailable.
      }
    };

    loadSummary();

    return () => {
      isMounted = false;
    };
  }, []);

  const departmentSeries = summary.departmentBreakdown.length > 0 ? summary.departmentBreakdown : departmentData;
  const recentEmployees = summary.recentEmployees.length > 0 ? summary.recentEmployees : [
    { name: 'Prince Ghevariya', email: 'prince@company.com', department: 'Engineering', status: 'active' },
  ];
  const recentAssets = summary.recentAssets.length > 0 ? summary.recentAssets : [];

  const renderDashboard = () => (
    <>
      <div className="stat-grid">
        <DashboardStatCard label="GLOBAL HEADCOUNT" value={String(summary.totalEmployees || 0)} note={summary.activeEmployees ? `${summary.activeEmployees} active` : 'Live'} />
        <DashboardStatCard label="ACTIVE WORKFORCE RATE" value={`${summary.activeWorkforceRate || 0}%`} note={summary.inactiveEmployees ? `${summary.inactiveEmployees} off` : 'Live'} />
        <DashboardStatCard label="PENDING ACTIONS" value={`${summary.pendingActions || 0} Issues`} note={`${summary.damagedAssets || 0} damaged`} accent="warning" />
      </div>

      <div className="dashboard-grid split-grid">
        <Panel title="Weekly Clock-In Concurrency">
          <DashboardBars />
        </Panel>

        <Panel title="Department Distribution Metrics">
          <div className="department-list">
            {departmentSeries.map((item) => {
              const highestValue = Math.max(...departmentSeries.map((entry) => entry.value), 1);
              const width = item.width || Math.max(60, Math.round((item.value / highestValue) * 300));

              return (
              <div className="department-row" key={item.label}>
                <span className="department-label">{item.label}</span>
                <div className="department-track">
                  <div className={`department-fill ${item.tone || 'primary'}`} style={{ width: `${width}px` }} />
                </div>
                <strong className="department-value">{item.value}</strong>
              </div>
              );
            })}
          </div>
        </Panel>
      </div>

      <Panel title="System Activity Stream">
        <div className="activity-table">
          <div className="activity-head row">
            <span>Timestamp</span>
            <span>Actor</span>
            <span>Event Category</span>
            <span>Status Overview</span>
          </div>
          {recentEmployees.slice(0, 2).map((employee, index) => (
            <div className="activity-body row" key={`${employee.email || employee.name}-${index}`}>
              <span className="accent-text">{index === 0 ? 'Now' : 'Recent'}</span>
              <span>{employee.name}</span>
              <span>{employee.department}</span>
              <span className="success-text">{employee.status || 'active'}</span>
            </div>
          ))}
          {recentAssets.slice(0, 1).map((asset) => (
            <div className="activity-body row" key={asset.id || asset.code}>
              <span className="accent-text">Asset</span>
              <span>{asset.name}</span>
              <span>{asset.category}</span>
              <span className="success-text">{asset.damaged ? 'Needs review' : asset.status}</span>
            </div>
          ))}
        </div>
      </Panel>
    </>
  );

  const renderAttendance = () => (
    <>
      <div className="stat-grid attendance-grid">
        <DashboardStatCard label="MONTHLY AVG PRESENT RATE" value={`${summary.activeWorkforceRate || 0}%`} />
        <DashboardStatCard label="AVG CLOCK-IN TIME" value="09:04 AM" />
        <DashboardStatCard label="TOTAL LEAKAGE HOURS" value={`${summary.damagedAssets || 0}.0 hrs`} note="Alert" accent="danger" />
      </div>

      <div className="dashboard-grid">
        <Panel title="Monthly Turnout Graph (30-Day Trend View)">
          <TrendLineChart />
        </Panel>
      </div>

      <Panel title="Shift Validation Overview">
        <div className="attendance-table">
          <div className="attendance-head row">
            <span>Employee</span>
            <span>Shift Stamp</span>
            <span>Compliance Metric</span>
            <span>Overtime Detect</span>
          </div>
          <div className="attendance-body row">
            <span className="strong">{userName}</span>
            <span>09:00 AM - 06:00 PM</span>
            <span><span className="badge success">Perfect</span></span>
            <span>0.0 hrs</span>
          </div>
        </div>
      </Panel>
    </>
  );

  const renderLeave = () => (
    <>
      <div className="dashboard-grid split-grid">
        <Panel title="Monthly Leave Class Proportions">
          <div className="leave-list">
            {leaveBreakdown.map((item) => (
              <div className="leave-row" key={item.label}>
                <span className="leave-label">{item.label}</span>
                <div className="department-track">
                  <div className={`department-fill ${item.tone}`} style={{ width: `${item.width}px` }} />
                </div>
                <strong className="department-value">{item.value}%</strong>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Operational Balance Metrics">
          <p className="muted-label">Active Absences (Today)</p>
          <div className="leave-hero">{summary.inactiveEmployees || 0} Employees</div>
          <p className="success-copy">✓ Staffing limits within safe thresholds ({summary.activeWorkforceRate || 0}% available)</p>
        </Panel>
      </div>

      <Panel title="Leave Approval Queue">
        <div className="leave-table">
          <div className="leave-head row">
            <span>Employee</span>
            <span>Classification</span>
            <span>Chrono Range</span>
            <span>Status Validation</span>
            <span>Governance</span>
          </div>
          <div className="leave-body row">
            <span className="strong">Sarah Jenkins</span>
            <span>Sick Leave (SL)</span>
            <span>Oct 24 - Oct 25</span>
            <span><span className="badge warning">Pending</span></span>
            <button className="ghost-btn">Approve</button>
          </div>
        </div>
      </Panel>
    </>
  );

  const renderPayroll = () => (
    <>
      <div className="stat-grid attendance-grid">
        <DashboardStatCard label="TOTAL DISBURSED (MONTHLY)" value="₹12,45,000.00" />
        <DashboardStatCard label="PENDING REGULATORY PF" value="₹1,18,400.00" note="Due" accent="warning" />
        <article className="stat-card stat-card-action">
          <button className="main-btn inline-btn">Execute Run</button>
        </article>
      </div>

      <Panel title="Payroll Disbursement Ledger">
        <div className="payroll-table">
          <div className="payroll-head row">
            <span>Employee</span>
            <span>Base Salary</span>
            <span>Net Payout (₹)</span>
            <span>Status</span>
            <span>Payslip PDF</span>
          </div>
          {payrollRows.map((row) => (
            <div className="payroll-body row" key={row.name}>
              <div>
                <div className="strong">{row.name}</div>
                <div className="subtle">{row.department}</div>
              </div>
              <span>{row.base}</span>
              <span className="strong">{row.net}</span>
              <span><span className="badge success">{row.status}</span></span>
              <button className="ghost-btn">Download</button>
            </div>
          ))}
        </div>
      </Panel>
    </>
  );

  const renderRoles = () => (
    <div className="roles-layout">
      <Panel title="Active Database Collections" className="roles-panel">
        <div className="role-table">
          <div className="role-head row">
            <span>_id Object</span>
            <span>name Stack</span>
            <span>permissions Enum Mapping</span>
          </div>
          {roleRows.map((role) => (
            <div className={`role-row row ${role.selected ? 'selected' : ''}`} key={role.id}>
              <span className="mono">{role.id}</span>
              <span>
                <span className="role-pill">{role.name}</span>
              </span>
              <span className="role-permissions">
                {role.permissions.map((permission) => (
                  <span className="mini-pill" key={permission}>{permission}</span>
                ))}
              </span>
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="Schema Mutation Inspector" className="roles-panel inspector-panel">
        <div className="form-block">
          <label>Collection Target name</label>
          <input type="text" readOnly value="HR" />
        </div>

        <div className="permission-list">
          <p className="muted-label">Mutate permissions String Array</p>
          {['manage_employees', 'approve_leaves', 'view_reports', 'run_payroll'].map((permission, index) => (
            <label className="permission-item" key={permission}>
              <input type="checkbox" defaultChecked={index < 3} />
              <span>{permission}</span>
            </label>
          ))}
        </div>

        <button className="main-btn">Push Document Update</button>
      </Panel>
    </div>
  );

  const renderSettings = () => (
    <div className="dashboard-grid split-grid">
      <Panel title="Workspace Preferences">
        <div className="settings-grid">
          <div>
            <p className="muted-label">Theme</p>
            <p className="strong">Operations Light</p>
          </div>
          <div>
            <p className="muted-label">Region</p>
            <p className="strong">India / IST</p>
          </div>
          <div>
            <p className="muted-label">Notification Mode</p>
            <p className="strong">Shift + Email</p>
          </div>
          <div>
            <p className="muted-label">Security</p>
            <p className="strong">2FA Enabled</p>
          </div>
        </div>
      </Panel>

      <Panel title="Profile Summary">
        <div className="profile-chip">{userName.charAt(0)}</div>
        <div className="profile-name">{userName}</div>
        <p className="subtle">{user?.email || 'prince@company.com'}</p>
        <button className="ghost-btn" onClick={onLogout}>Sign out</button>
      </Panel>
    </div>
  );

  const renderSection = () => {
    switch (activeSection) {
      case 'attendance':
        return renderAttendance();
      case 'leave':
        return renderLeave();
      case 'payroll':
        return renderPayroll();
      case 'assets':
        return <AssetsPanel />;
      case 'roles':
        return renderRoles();
      case 'settings':
        return renderSettings();
      case 'employees':
        return (
          <Panel title="Employee Registry">
            <div className="settings-grid">
              <div>
                <p className="muted-label">Total Active Employees</p>
                <p className="strong">{summary.activeEmployees || 0}</p>
              </div>
              <div>
                <p className="muted-label">Open Requisitions</p>
                <p className="strong">{summary.pendingActions || 0}</p>
              </div>
              <div>
                <p className="muted-label">Assets Managed</p>
                <p className="strong">{summary.assetTotal || 0}</p>
              </div>
              <div>
                <p className="muted-label">Departments</p>
                <p className="strong">{departmentSeries.length || 0}</p>
              </div>
            </div>

            <div className="dashboard-grid" style={{ marginTop: '20px' }}>
              <div className="activity-head row">
                <span>Name</span>
                <span>Email</span>
                <span>Department</span>
                <span>Status</span>
              </div>
              {recentEmployees.map((employee) => (
                <div className="activity-body row" key={employee.id || employee.email}>
                  <span className="strong">{employee.name}</span>
                  <span>{employee.email}</span>
                  <span>{employee.department}</span>
                  <span className="success-text">{employee.status}</span>
                </div>
              ))}
            </div>
          </Panel>
        );
      case 'dashboard':
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="dashboard-app">
      <aside className="dashboard-sidebar">
        <div className="brand-row">
          <div className="brand-mark">C</div>
          <div className="brand-name">CoreHR</div>
        </div>

        <div className="sidebar-label">MAIN MENU</div>
        <nav className="sidebar-nav">
          {navigation.map((item) => (
            <button
              key={item.key}
              className={`sidebar-link ${activeSection === item.key ? 'active' : ''}`}
              onClick={() => setActiveSection(item.key)}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-topbar">
          <div className="topbar-copy">
            <p className="topbar-eyebrow">CoreHR control surface</p>
            <h1>{titleMap[activeSection] || titleMap.dashboard}</h1>
          </div>
          <div className="topbar-user">
            <button className="avatar-button" type="button" onClick={onLogout} aria-label="Log out">
              {userName.charAt(0)}
            </button>
            <div>
              <div className="topbar-name">{userName}</div>
              <div className="subtle">Operations Control</div>
            </div>
          </div>
        </header>

        <div className="dashboard-content">
          <section className="hero-panel">
            <div>
              <p className="hero-eyebrow">{activeMeta.eyebrow}</p>
              <h2 className="hero-title">{titleMap[activeSection] || titleMap.dashboard}</h2>
              <p className="hero-description">{activeMeta.description}</p>
            </div>
            <div className="hero-actions">
              <button className="ghost-btn" type="button">Export</button>
              <button className="main-btn hero-button" type="button">Create report</button>
            </div>
          </section>

          {renderSection()}
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
