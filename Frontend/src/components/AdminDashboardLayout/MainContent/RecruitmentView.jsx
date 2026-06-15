import React, { useState, useEffect } from 'react';
import styles from '../AdminDashboardLayout.module.css';
import API from '../../../lib/axios'; // 💡 Uses your centralized custom Axios instance 

const RecruitmentView = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [candidateForm, setCandidateForm] = useState({
    name: '',
    email: '',
    phone: '',
    position: '',
    experience: '',
    skills: '',
    jobRequirements: '',
    resumeText: ''
  });

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
          skills: Array.isArray(cand?.skills) ? cand.skills : [],
          matchScore: Number.isFinite(Number(cand?.matchScore)) ? Number(cand.matchScore) : 0,
          matchedSkills: Array.isArray(cand?.matchedSkills) ? cand.matchedSkills : [],
          missingSkills: Array.isArray(cand?.missingSkills) ? cand.missingSkills : [],
          aiSummary: cand?.aiSummary || '',
          aiRecommendation: cand?.aiRecommendation || 'Manual Review',
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
    const searchMatch = (
      cand.name.toLowerCase().includes(term) ||
      cand.position.toLowerCase().includes(term) ||
      cand.aiRecommendation.toLowerCase().includes(term) ||
      cand.skills.join(' ').toLowerCase().includes(term)
    );

    // Filter by status
    const statusMatch = statusFilter === 'All' || 
      cand.status.toLowerCase() === statusFilter.toLowerCase() ||
      (statusFilter === 'Review' && cand.status.toLowerCase() === 'applied');

    return searchMatch && statusMatch;
  });

  const handleViewDetails = (cand) => {
    setSelectedCandidate(cand);
  };

  const handleStatusUpdate = async (newStatus) => {
    if (!selectedCandidate) return;
    
    try {
      setUpdatingStatus(true);
      const candidateId = selectedCandidate.raw?._id || selectedCandidate.id;
      
      if (!candidateId) {
        throw new Error('Candidate ID not found');
      }
      
      const response = await API.put(`/recruitment/${candidateId}`, { status: newStatus });
      
      // Update local state
      setSelectedCandidate({ ...selectedCandidate, status: newStatus });
      
      // Refresh the candidate list
      await fetchRecruitmentData();
    } catch (err) {
      console.error('Failed to update candidate status:', err);
      alert('Failed to update status. Please try again.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setCandidateForm((current) => ({ ...current, [name]: value }));
  };

  const handleSmartSubmit = async (event) => {
    event.preventDefault();
    setFormError('');

    if (!candidateForm.name || !candidateForm.position || !candidateForm.jobRequirements || !candidateForm.resumeText) {
      setFormError('Name, position, job requirements, and resume text are required.');
      return;
    }

    try {
      setSubmitting(true);
      await API.post('/recruitment', candidateForm);
      setCandidateForm({
        name: '',
        email: '',
        phone: '',
        position: '',
        experience: '',
        skills: '',
        jobRequirements: '',
        resumeText: ''
      });
      await fetchRecruitmentData();
    } catch (err) {
      setFormError(err?.response?.data?.message || 'Failed to analyze candidate.');
    } finally {
      setSubmitting(false);
    }
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

      {/* ═══════════════════════════════════════════════════════════════════════════
          ✅ FIXED LAYOUT REINFORCEMENT: Recruitment Pipeline Progress Bars
          Injected absolute inline layout boundaries to lock container alignment.
         ═══════════════════════════════════════════════════════════════════════════ */}
      <div className={styles.chartContainer} style={{ width: '100%', boxSizing: 'border-box' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '18px' }}>Recruitment Pipeline</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '10px 0', width: '100%' }}>
          {pipelineMetrics.map((item) => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
              {/* Text Label Column */}
              <span style={{ width: '110px', minWidth: '110px', fontSize: '0.88rem', fontWeight: '600', color: '#475569', textAlign: 'left' }}>
                {item.label}
              </span>
              
              {/* Central Bar Tracker Housing Track */}
              <div 
                className={styles.progressBarContainer} 
                style={{ flex: 1, margin: '0 20px', background: '#e2e8f0', height: '12px', borderRadius: '6px', overflow: 'hidden', position: 'relative' }}
              >
                <div 
                  className={styles.progressBarFill} 
                  style={{ 
                    width: item.width, 
                    backgroundColor: item.label === 'Hired' ? '#10b981' : (item.label === 'Shortlisted' ? '#6366f1' : '#4f46e5'), 
                    height: '100%',
                    borderRadius: '6px',
                    transition: 'width 0.4s ease-out'
                  }} 
                />
              </div>

              {/* Counter Metrics Column */}
              <strong style={{ width: '40px', minWidth: '40px', textAlign: 'right', fontSize: '0.95rem', color: '#0f172a', fontWeight: '700' }}>
                {loading ? '...' : item.value}
              </strong>
            </div>
          ))}
        </div>
      </div>

      <form
        className={styles.chartContainer}
        onSubmit={handleSmartSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', boxSizing: 'border-box' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: '700', margin: 0 }}>Smart Candidate Analyzer</h3>
          <button
            type="submit"
            disabled={submitting}
            style={{
              border: 'none',
              background: submitting ? '#94a3b8' : '#4f46e5',
              color: '#fff',
              borderRadius: '8px',
              padding: '10px 16px',
              fontWeight: '700',
              cursor: submitting ? 'not-allowed' : 'pointer'
            }}
          >
            {submitting ? 'Analyzing...' : 'Analyze Candidate'}
          </button>
        </div>

        {formError && (
          <div style={{ color: '#b91c1c', background: '#fee2e2', border: '1px solid #fecaca', padding: '10px 12px', borderRadius: '8px', fontSize: '0.86rem', fontWeight: '600' }}>
            {formError}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '12px' }}>
          <input name="name" value={candidateForm.name} onChange={handleFormChange} placeholder="Candidate name" style={{ padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px' }} />
          <input name="email" value={candidateForm.email} onChange={handleFormChange} placeholder="Email" style={{ padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px' }} />
          <input name="phone" value={candidateForm.phone} onChange={handleFormChange} placeholder="Phone" style={{ padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px' }} />
          <input name="position" value={candidateForm.position} onChange={handleFormChange} placeholder="Position applied for" style={{ padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px' }} />
          <input name="experience" value={candidateForm.experience} onChange={handleFormChange} placeholder="Experience, e.g. 3 Years" style={{ padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px' }} />
          <input name="skills" value={candidateForm.skills} onChange={handleFormChange} placeholder="Skills, comma separated" style={{ padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px' }} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
          <textarea
            name="jobRequirements"
            value={candidateForm.jobRequirements}
            onChange={handleFormChange}
            placeholder="Job requirements"
            rows="5"
            style={{ padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', resize: 'vertical', minHeight: '120px' }}
          />
          <textarea
            name="resumeText"
            value={candidateForm.resumeText}
            onChange={handleFormChange}
            placeholder="Paste resume text"
            rows="5"
            style={{ padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', resize: 'vertical', minHeight: '120px' }}
          />
        </div>
      </form>

      {/* Main Applicants Panel Split Splitter Layout */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Search Action Filter Toolbar Bar */}
        <div className={styles.actionFilterBar} style={{ margin: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
          <input 
            type="text" 
            className={styles.filterInput} 
            placeholder="Filter applicants by name or position keyword..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '320px', padding: '10px 16px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.9rem' }}
          />
          
          {/* Status Filter Buttons */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {['All', 'Review', 'Shortlisted', 'Hired'].map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                style={{
                  padding: '8px 16px',
                  border: statusFilter === status ? 'none' : '1px solid #cbd5e1',
                  background: statusFilter === status ? '#4f46e5' : 'transparent',
                  color: statusFilter === status ? '#fff' : '#475569',
                  borderRadius: '8px',
                  fontWeight: '600',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                {status}
              </button>
            ))}
          </div>
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
                  <th style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: '600' }}>MATCH</th>
                  <th style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: '600' }}>SMART FIT</th>
                  <th style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: '600' }}>INTERVIEW DATE</th>
                  <th style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: '600' }}>STATUS</th>
                  <th style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: '600', width: '60px' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                      Syncing active database candidate roster metrics...
                    </td>
                  </tr>
                ) : filteredCandidates.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
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
                        style={{ 
                          backgroundColor: isCurrentSelection ? '#f1f5f9' : 'transparent',
                          transition: 'background-color 0.15s ease'
                        }}
                      >
                        <td><strong style={{ color: '#0f172a', fontWeight: '700' }}>{cand.name}</strong></td>
                        <td style={{ color: '#475569', fontWeight: '500' }}>{cand.position}</td>
                        <td style={{ color: '#475569', fontWeight: '500' }}>{cand.experience}</td>
                        <td style={{ color: cand.matchScore >= 70 ? '#059669' : '#475569', fontWeight: '800' }}>{cand.matchScore}%</td>
                        <td style={{ color: '#475569', fontWeight: '600' }}>{cand.aiRecommendation}</td>
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

                <div className={styles.settingsPreferencesGrid} style={{ gridTemplateColumns: '1fr 1fr', rowGap: 0, margin: 0 }}>
                  <div className={styles.preferenceNodeCell}>
                    <span className={styles.preferenceMetaLabel}>Match Score</span>
                    <span style={{ fontSize: '1.1rem', fontWeight: '800', marginTop: '4px', color: selectedCandidate.matchScore >= 70 ? '#059669' : '#334155' }}>{selectedCandidate.matchScore}%</span>
                  </div>
                  <div className={styles.preferenceNodeCell}>
                    <span className={styles.preferenceMetaLabel}>Smart Recommendation</span>
                    <span style={{ fontSize: '0.92rem', fontWeight: '700', marginTop: '4px', color: '#334155' }}>{selectedCandidate.aiRecommendation}</span>
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

                <div className={styles.preferenceNodeCell}>
                  <span className={styles.preferenceMetaLabel}>Matched Skills</span>
                  <span style={{ fontSize: '0.86rem', fontWeight: '600', marginTop: '4px', color: '#0f172a' }}>
                    {selectedCandidate.matchedSkills.length ? selectedCandidate.matchedSkills.join(', ') : 'No matched skills logged.'}
                  </span>
                </div>

                <div className={styles.preferenceNodeCell}>
                  <span className={styles.preferenceMetaLabel}>Missing Skills</span>
                  <span style={{ fontSize: '0.86rem', fontWeight: '600', marginTop: '4px', color: '#0f172a' }}>
                    {selectedCandidate.missingSkills.length ? selectedCandidate.missingSkills.join(', ') : 'No missing skills logged.'}
                  </span>
                </div>

                {/* Status Update Buttons */}
                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '16px', marginTop: '8px' }}>
                  <span className={styles.preferenceMetaLabel} style={{ marginBottom: '12px', display: 'block' }}>Update Status</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => handleStatusUpdate('Applied')}
                      disabled={updatingStatus || selectedCandidate.status.toLowerCase() === 'applied'}
                      style={{
                        padding: '10px 16px',
                        border: '1px solid #cbd5e1',
                        background: selectedCandidate.status.toLowerCase() === 'applied' ? '#f1f5f9' : '#fff',
                        color: '#475569',
                        borderRadius: '8px',
                        fontWeight: '600',
                        fontSize: '0.9rem',
                        cursor: selectedCandidate.status.toLowerCase() === 'applied' || updatingStatus ? 'not-allowed' : 'pointer',
                        opacity: selectedCandidate.status.toLowerCase() === 'applied' ? 0.5 : 1,
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {updatingStatus ? 'Updating...' : 'Mark as Review'}
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => handleStatusUpdate('Shortlisted')}
                      disabled={updatingStatus || selectedCandidate.status.toLowerCase() === 'shortlisted'}
                      style={{
                        padding: '10px 16px',
                        border: '1px solid #6366f1',
                        background: selectedCandidate.status.toLowerCase() === 'shortlisted' ? '#6366f1' : '#fff',
                        color: selectedCandidate.status.toLowerCase() === 'shortlisted' ? '#fff' : '#6366f1',
                        borderRadius: '8px',
                        fontWeight: '600',
                        fontSize: '0.9rem',
                        cursor: selectedCandidate.status.toLowerCase() === 'shortlisted' || updatingStatus ? 'not-allowed' : 'pointer',
                        opacity: selectedCandidate.status.toLowerCase() === 'shortlisted' ? 0.5 : 1,
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {updatingStatus ? 'Updating...' : 'Mark as Shortlisted'}
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => handleStatusUpdate('Hired')}
                      disabled={updatingStatus || selectedCandidate.status.toLowerCase() === 'hired'}
                      style={{
                        padding: '10px 16px',
                        border: '1px solid #10b981',
                        background: selectedCandidate.status.toLowerCase() === 'hired' ? '#10b981' : '#fff',
                        color: selectedCandidate.status.toLowerCase() === 'hired' ? '#fff' : '#10b981',
                        borderRadius: '8px',
                        fontWeight: '600',
                        fontSize: '0.9rem',
                        cursor: selectedCandidate.status.toLowerCase() === 'hired' || updatingStatus ? 'not-allowed' : 'pointer',
                        opacity: selectedCandidate.status.toLowerCase() === 'hired' ? 0.5 : 1,
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {updatingStatus ? 'Updating...' : 'Mark as Hired'}
                    </button>
                  </div>
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
