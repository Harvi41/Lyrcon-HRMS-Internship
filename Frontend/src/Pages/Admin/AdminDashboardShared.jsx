import React from 'react';
import { adminDashboardBars, adminAttendanceTrend } from './adminDashboardData';

export function AdminDashboardStatCard({ label, value, note, accent = 'primary' }) {
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

export function AdminPanel({ title, subtitle, children, className = '' }) {
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

export function AdminDashboardBars({ bars = adminDashboardBars }) {
  return (
    <div className="chart-bars">
      <div className="chart-grid-lines" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <div className="chart-bars-body">
        {bars.map((item) => (
          <div className="chart-bar-column" key={item.label}>
            <div className={`chart-bar ${item.tone}`} style={{ height: `${item.value}px` }} />
            <span className="chart-bar-label">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminTrendLineChart({ points = adminAttendanceTrend }) {
  const width = 1000;
  const height = 180;
  const paddingX = 20;
  const paddingY = 10;
  const chartPoints = points.map((value, index) => {
    const x = paddingX + (index * (width - paddingX * 2)) / (points.length - 1);
    const normalized = (value - 60) / 30;
    const y = height - paddingY - normalized * (height - paddingY * 2);
    return `${x},${y}`;
  });

  return (
    <svg className="trend-chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Attendance trend chart">
      <line x1="0" y1="160" x2={width} y2="160" className="trend-baseline" />
      <polyline points={chartPoints.join(' ')} className="trend-line" />
    </svg>
  );
}