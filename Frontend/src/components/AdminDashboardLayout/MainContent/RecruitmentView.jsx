import React, { useState, useEffect } from 'react';
import styles from '../AdminDashboardLayout.module.css';
import API from '../../../lib/axios'; // 💡 Uses your centralized custom Axios instance 

const RecruitmentView = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  // Dynamic state values for the summary metrics row cards
  const [openPositionsCount, setOpenPositionsCount] = useState(0);
  const [interviewsScheduledCount, setInterviewsScheduledCount] = useState(0);

  // Dynamic state storage for pipeline progress bars
  const [pipelineMetrics, setPipelineMetrics] = useState([
    { label: 'Applied', value: 0, width: '0%' },
    { label: 'Shortlisted', value: 0, width: '0%' },
    { label: 'Hired', value: 0, width: '0%' }
  ]);

  const fetchRecruitmentData = async () => {
    try {
      setLoading(true);
      // Adjust this endpoint string to match your exact backend server route map
      const response = await API.get('/recruitment');
      
      // Defensively parse your response payload array structure
      const rawCandidates = Array.isArray(response?.data) 
        ? response.data 
        : (Array.isArray(response?.data?.candidates) ? response.data.candidates : []);

      let appliedCounter = 0;
      let shortlistedCounter = 0;
      let hiredCounter = 0;
      let interviewsCounter = 0;

      const normalizedCandidates = rawCandidates.map((cand, idx) => {
        const rawStatus = typeof cand?.status === 'string' ? cand.status.trim() : 'Applied';
        
        // Count statuses dynamically based on backend records
        if (rawStatus.toLowerCase() === 'hired') hiredCounter++;
        else if (rawStatus.toLowerCase() === 'shortlisted') shortlistedCounter++;
        else appliedCounter++; // Baseline bucket index entry

        // Increment dynamic interview configurations if date properties exist
        if (cand?.interviewDate || cand?.status?.toLowerCase() === 'shortlisted') {
          interviewsCounter++;
        }

        return {
          id: cand?.candidateId || cand?._id || `CAN-${2000 + idx}`,
          name: cand?.name || `${cand?.firstName || 'Active'} ${cand?.lastName || 'Applicant'}`.trim(),
          position: cand?.position || cand?.targetRole || 'Software Engineer',
          experience: cand?.experience || '0 Years',
          interviewDate: cand?.interviewDate ? new Date(cand.interviewDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Pending',
          status: rawStatus,
          email: cand?.email || '—',
          phone: cand?.phone || cand?.phoneNumber || '—',
          notes: cand?.notes || cand?.evaluation || 'No structural evaluation feedback logged yet.',
          raw: cand
        };
      });

      // Compute dynamic percentages for the pipeline visualizer bars
      const totalApps = normalizedCandidates.length;
      const appliedWidth = totalApps > 0 ? '100%' : '0%';
      const shortlistedWidth = totalApps > 0 ? `${Math.round((shortlistedCounter / totalApps) * 100)}%` : '0%';
      const hiredWidth = totalApps > 0 ? `${Math.round((hiredCounter / totalApps) * 100)}%` : '0%';

      // Feed calculated live database values back into UI tracking metrics
      setPipelineMetrics([
        { label: 'Applied', value: totalApps, width: appliedWidth },
        { label: 'Shortlisted', value: shortlistedCounter, width: shortlistedWidth },
        { label: 'Hired', value: hiredCounter, width: hiredWidth }
      ]);

      // Handle structural fallbacks for Open Job Openings dynamically if supplied by backend configuration rules
      setOpenPositionsCount(response?.data?.openPositions || Math.max(3, Math.ceil(totalApps / 4)));
      setInterviewsScheduledCount(interviewsCounter);
      setCandidates(normalizedCandidates);

    } catch (err) {
      console.error('Failed to resolve dynamic recruitment ecosystem feed matrix:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecruitmentData();
  }, []);

  const filteredCandidates = candidates.filter(cand => {
    const term = searchTerm.toLowerCase().trim();
    return (
      cand.name.toLowerCase().includes(term) ||
      cand.position.toLowerCase().includes(term)
    );
  });

  const handleViewDetails = (cand) => {
    setSelectedCandidate(cand);
  };

  return (
    <div className={styles.dashboardGrid}>

      {/* Dynamic Summary Row Cards */}
      <div className={styles.metricsRow}>
        <div className={styles.metricCard}>
          <h3>OPEN POSITIONS</h3>
          <div className={styles.metricValueWrapper}>
            <span className={styles.metricValue}>{loading ? '...' : openPositionsCount}</span>
          </div>
        </div>
        
        <div className={styles.metricCard}>
          <h3>APPLICATIONS RECEIVED</h3>
          <div className={styles.metricValueWrapper}>
            <span className={styles.metricValue} style={{ color: '#10b981' }}>
              {loading ? '...' : candidates.length}
            </span>
          </div>
        </div>

        <div className={styles.metricCard}>
          <h3>INTERVIEWS SCHEDULED</h3>
          <div className={styles.metricValueWrapper}>
            <span className={styles.metricValue} style={{ color: '#6366f1' }}>
              {loading ? '...' : interviewsScheduledCount}
            </span>
          </div>
        </div>
      </div>

      {/* Live Recruitment Pipeline Visualizer Progress Bars */}
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
                  style={{ 
                    width: item.width, 
                    backgroundColor: item.label === 'Hired' ? '#10b981' : (item.label === 'Shortlisted' ? '#6366f1' : '#635bff'), 
                    height: '100%',
                    transition: 'width 0.4s ease-out'
                  }} 
                />
              </div>
              <strong style={{ width: '40px', textAlign: 'right', fontSize: '0.95rem', color: '#0f172a', fontWeight: '700' }}>
                {loading ? '...' : item.value}
              </strong>
            </div>
          ))}
        </div>
      </div>

      {/* Main Applicants Panel Split Splitter Layout */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Search Action Filter Toolbar Bar */}
        <div className={styles.actionFilterBar} style={{ margin: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <input 
            type="text" 
            className={styles.filterInput} 
            placeholder="Filter applicants by name or position keyword..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '320px', padding: '10px 16px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.9rem' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', width: '100%' }}>
          
          {/* Candidates Ledger Data Grid Table */}
          <div className={styles.activityStream} style={{ flex: selectedCandidate ? 1.4 : 1, transition: 'all 0.2s ease', width: '100%' }}>
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
                {loading ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                      Syncing active database candidate roster metrics...
                    </td>
                  </tr>
                ) : filteredCandidates.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                      No candidate profile entries found matching your filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredCandidates.map((cand) => {
                    const normalizedStatus = cand.status.toLowerCase();
                    const targetStatusClass = normalizedStatus === 'hired' || normalizedStatus === 'shortlisted' 
                      ? styles.badgeActive 
                      : styles.statusOnboard;
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
                              fontSize: '0.8rem',
                              textTransform: 'capitalize'
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
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Side Drawer Panel For In-Depth Candidate Inspections */}
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