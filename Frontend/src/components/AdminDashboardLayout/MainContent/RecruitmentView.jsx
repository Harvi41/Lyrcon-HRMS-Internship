// RecruitmentView.jsx
import React, { useState } from 'react';
import styles from '../AdminDashboardLayout.module.css';

const RecruitmentView = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Track the active candidate record selected for closer inspection
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  // 1. STATE-DRIVEN RECRUITMENT PIPELINE PARAMETERS
  const [pipelineMetrics] = useState([
    { label: 'Applied', value: 77, width: '85%' },
    { label: 'Shortlisted', value: 30, width: '38%' },
    { label: 'Hired', value: 55, width: '65%' }
  ]);

  // 2. APPLICANTS DATA SEED MATRIX
  const [candidates] = useState([
    {
      id: 'CAN-2011',
      name: 'Prince Ghevariya',
      position: 'FullStack Dev',
      experience: '2 Years',
      interviewDate: 'May 21',
      status: 'Shortlisted',
      email: 'prince.g@gmail.com',
      phone: '+91 99887 76655',
      notes: 'Strong performance in MERN technical assessment. Good problem-solving communication skills.'
    },
    {
      id: 'CAN-2042',
      name: 'Nidhish Zala',
      position: 'Data Analyst',
      experience: '5 Years',
      interviewDate: 'May 25',
      status: 'Pending',
      email: 'nidhish.zala@yahoo.com',
      phone: '+91 98765 43210',
      notes: 'Awaiting completion of managerial technical evaluation sequence.'
    },
    {
      id: 'CAN-2089',
      name: 'Sarah Jenkins',
      position: 'HR intern',
      experience: '0 Year',
      interviewDate: 'May 28',
      status: 'Shortlisted',
      email: 'sarah.j@outlook.com',
      phone: '+91 91122 33445',
      notes: 'Enthusiastic candidate, structured task organizational skills shown during screening.'
    }
  ]);

  const filteredCandidates = candidates.filter(cand =>
    cand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cand.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewDetails = (cand) => {
    setSelectedCandidate(cand);
  };

  return (
    <div className={styles.dashboardGrid}>

      {/* Top Metrics Row Panels */}
      <div className={styles.metricsRow}>
        <div className={styles.metricCard}>
          <h3>OPEN POSITIONS</h3>
          <div className={styles.metricValueWrapper}>
            <span className={styles.metricValue}>12</span>
          </div>
        </div>
        
        <div className={styles.metricCard}>
          <h3>APPLICATIONS RECEIVED</h3>
          <div className={styles.metricValueWrapper}>
            <span className={styles.metricValue} style={{ color: '#10b981' }}>80</span>
          </div>
        </div>

        <div className={styles.metricCard}>
          <h3>INTERVIEWS SCHEDULED</h3>
          <div className={styles.metricValueWrapper}>
            <span className={styles.metricValue} style={{ color: '#6366f1' }}>24</span>
          </div>
        </div>
      </div>

      {/* Full-width Recruitment Pipeline Progress Visualizer */}
      <div className={styles.chartContainer}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '18px' }}>Recruitment Pipeline</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '10px 0' }}>
          {pipelineMetrics.map((item) => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
              <span style={{ width: '120px', fontSize: '0.88rem', fontWeight: '500', color: '#1e293b' }}>
                {item.label}
              </span>
              <div className={styles.progressBarContainer} style={{ flex: 1, margin: '0 24px', background: '#f1f5f9', height: '12px' }}>
                <div 
                  className={styles.progressBarFill} 
                  style={{ width: item.width, backgroundColor: '#635bff', height: '100%' }} 
                />
              </div>
              <strong style={{ width: '40px', textAlign: 'right', fontSize: '0.95rem', color: '#0f172a', fontWeight: '700' }}>
                {item.value}
              </strong>
            </div>
          ))}
        </div>
      </div>

      {/* Split Frame: Appears when a candidate details card option is clicked */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Input Control Filter Section */}
        <div className={styles.actionFilterBar} style={{ margin: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <input 
            type="text" 
            className={styles.filterInput} 
            placeholder="Filter by name or position..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '320px', padding: '10px 16px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.9rem' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', width: '100%' }}>
          
          {/* Main Candidate Table Ledger Grid */}
          <div className={styles.activityStream} style={{ flex: selectedCandidate ? 1.5 : 1, transition: 'all 0.2s ease' }}>
            <table className={styles.activityTable} style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr>
                  <th style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: '600' }}>CANDIDATE</th>
                  <th style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: '600' }}>POSITION</th>
                  <th style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: '600' }}>EXPERIENCE</th>
                  <th style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: '600' }}>INTERVIEW DATE</th>
                  <th style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: '600' }}>STATUS</th>
                  <th style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: '600', width: '60px' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredCandidates.map((cand) => {
                  const isShortlisted = cand.status === 'Shortlisted';
                  const targetStatusClass = isShortlisted ? styles.badgeActive : styles.statusOnboard;
                  const isCurrentSelection = selectedCandidate?.id === cand.id;

                  return (
                    <tr 
                      key={cand.id}
                      onClick={() => handleViewDetails(cand)}
                      style={{ 
                        cursor: 'pointer',
                        backgroundColor: isCurrentSelection ? '#f1f5f9' : 'transparent',
                        transition: 'background-color 0.15s ease'
                      }}
                    >
                      <td><strong style={{ color: '#0f172a', fontWeight: '700' }}>{cand.name}</strong></td>
                      <td style={{ color: '#475569', fontWeight: '500' }}>{cand.position}</td>
                      <td style={{ color: '#475569', fontWeight: '500' }}>{cand.experience}</td>
                      <td style={{ color: '#475569', fontWeight: '500' }}>{cand.interviewDate}</td>
                      <td>
                        <span 
                          className={`${styles.statusPillBadge} ${targetStatusClass}`} 
                          style={{ 
                            display: 'inline-block', 
                            minWidth: '95px', 
                            textAlign: 'center', 
                            padding: '4px 12px', 
                            borderRadius: '12px',
                            fontWeight: '600',
                            fontSize: '0.8rem'
                          }}
                        >
                          {cand.status}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewDetails(cand);
                          }}
                          style={{ color: '#4f46e5', background: 'none', border: 'none', fontSize: '0.88rem', fontWeight: '600', cursor: 'pointer', padding: 0 }}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* DYNAMIC CANDIDATE DETAILS SIDEBAR COMPONENT PANEL */}
          {selectedCandidate && (
            <div className={styles.chartContainer} style={{ flex: 1, minWidth: '320px', animation: 'fadeInModal 0.2s ease-out' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '700', color: '#0f172a' }}>Candidate Inspector</h3>
                <button 
                  onClick={() => setSelectedCandidate(null)}
                  style={{ background: 'none', border: 'none', fontSize: '1.25rem', color: '#94a3b8', cursor: 'pointer', padding: '0 4px' }}
                >
                  &times;
                </button>
              </div>

              {/* Data Properties Node Cells Block */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className={styles.preferenceNodeCell}>
                  <span className={styles.preferenceMetaLabel}>Candidate ID</span>
                  <span className={styles.preferenceValueText} style={{ fontFamily: 'monospace' }}>{selectedCandidate.id}</span>
                </div>
                
                <div className={styles.preferenceNodeCell}>
                  <span className={styles.preferenceMetaLabel}>Full Name</span>
                  <span className={styles.preferenceValueText}>{selectedCandidate.name}</span>
                </div>

                <div className={styles.settingsPreferencesGrid} style={{ gridTemplateColumns: '1fr 1fr', rowGap: 0, margin: 0 }}>
                  <div className={styles.preferenceNodeCell}>
                    <span className={styles.preferenceMetaLabel}>Target Role</span>
                    <span style={{ fontSize: '0.92rem', fontWeight: '600', marginTop: '4px', color: '#334155' }}>{selectedCandidate.position}</span>
                  </div>
                  <div className={styles.preferenceNodeCell}>
                    <span className={styles.preferenceMetaLabel}>Experience</span>
                    <span style={{ fontSize: '0.92rem', fontWeight: '600', marginTop: '4px', color: '#334155' }}>{selectedCandidate.experience}</span>
                  </div>
                </div>

                <div className={styles.preferenceNodeCell}>
                  <span className={styles.preferenceMetaLabel}>Email Contact</span>
                  <span style={{ fontSize: '0.9rem', fontWeight: '500', marginTop: '4px', color: '#0f172a' }}>{selectedCandidate.email}</span>
                </div>

                <div className={styles.preferenceNodeCell}>
                  <span className={styles.preferenceMetaLabel}>Phone</span>
                  <span style={{ fontSize: '0.9rem', fontWeight: '500', marginTop: '4px', color: '#0f172a' }}>{selectedCandidate.phone}</span>
                </div>

                <div className={styles.preferenceNodeCell} style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <span className={styles.preferenceMetaLabel}>Evaluation Notes</span>
                  <p style={{ margin: '6px 0 0 0', fontSize: '0.85rem', color: '#475569', lineHeight: '1.4', fontWeight: '500' }}>
                    {selectedCandidate.notes}
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

    </div>
  );
};

export default RecruitmentView;