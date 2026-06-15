import React, { useState, useEffect } from 'react';
import styles from '../HRDashboardLayout.module.css';
import API from '../../../lib/axios';

const emptyCandidateForm = {
  name: '',
  email: '',
  phone: '',
  position: '',
  experience: '',
  skills: '',
  jobRequirements: '',
  resumeText: ''
};

const RecruitmentView = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [candidateForm, setCandidateForm] = useState(emptyCandidateForm);
  const [openPositionsCount, setOpenPositionsCount] = useState(0);
  const [interviewsScheduledCount, setInterviewsScheduledCount] = useState(0);
  const [pipelineMetrics, setPipelineMetrics] = useState([
    { label: 'Applied', value: 0, width: '0%' },
    { label: 'Shortlisted', value: 0, width: '0%' },
    { label: 'Hired', value: 0, width: '0%' }
  ]);

  const fetchRecruitmentData = async () => {
    try {
      setLoading(true);
      const response = await API.get('/recruitment');
      const rawCandidates = Array.isArray(response?.data)
        ? response.data
        : (Array.isArray(response?.data?.candidates) ? response.data.candidates : []);

      let shortlistedCounter = 0;
      let hiredCounter = 0;
      let interviewsCounter = 0;

      const normalizedCandidates = rawCandidates.map((candidate, index) => {
        const rawStatus = typeof candidate?.status === 'string' ? candidate.status.trim() : 'Applied';
        const normalizedStatus = rawStatus.toLowerCase();

        if (normalizedStatus === 'hired') hiredCounter++;
        if (normalizedStatus === 'shortlisted') shortlistedCounter++;
        if (candidate?.interviewDate || normalizedStatus === 'shortlisted') interviewsCounter++;

        return {
          id: candidate?.candidateId || candidate?._id || `CAN-${2000 + index}`,
          name: candidate?.name || `${candidate?.firstName || 'Active'} ${candidate?.lastName || 'Applicant'}`.trim(),
          position: candidate?.position || candidate?.targetRole || 'Software Engineer',
          experience: candidate?.experience || '0 Years',
          interviewDate: candidate?.interviewDate
            ? new Date(candidate.interviewDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            : 'Pending',
          status: rawStatus,
          email: candidate?.email || '-',
          phone: candidate?.phone || candidate?.phoneNumber || '-',
          skills: Array.isArray(candidate?.skills) ? candidate.skills : [],
          matchScore: Number.isFinite(Number(candidate?.matchScore)) ? Number(candidate.matchScore) : 0,
          matchedSkills: Array.isArray(candidate?.matchedSkills) ? candidate.matchedSkills : [],
          missingSkills: Array.isArray(candidate?.missingSkills) ? candidate.missingSkills : [],
          aiRecommendation: candidate?.aiRecommendation || 'Manual Review',
          raw: candidate
        };
      });

      const totalApplications = normalizedCandidates.length;
      setPipelineMetrics([
        { label: 'Applied', value: totalApplications, width: totalApplications > 0 ? '100%' : '0%' },
        {
          label: 'Shortlisted',
          value: shortlistedCounter,
          width: totalApplications > 0 ? `${Math.round((shortlistedCounter / totalApplications) * 100)}%` : '0%'
        },
        {
          label: 'Hired',
          value: hiredCounter,
          width: totalApplications > 0 ? `${Math.round((hiredCounter / totalApplications) * 100)}%` : '0%'
        }
      ]);
      setOpenPositionsCount(response?.data?.openPositions || Math.max(3, Math.ceil(totalApplications / 4)));
      setInterviewsScheduledCount(interviewsCounter);
      setCandidates(normalizedCandidates);
    } catch (err) {
      console.error('Failed to resolve recruitment data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecruitmentData();
  }, []);

  const filteredCandidates = candidates.filter((candidate) => {
    const term = searchTerm.toLowerCase().trim();
    const searchMatch = (
      candidate.name.toLowerCase().includes(term) ||
      candidate.position.toLowerCase().includes(term) ||
      candidate.aiRecommendation.toLowerCase().includes(term) ||
      candidate.skills.join(' ').toLowerCase().includes(term)
    );
    const statusMatch = statusFilter === 'All' ||
      candidate.status.toLowerCase() === statusFilter.toLowerCase() ||
      (statusFilter === 'Review' && candidate.status.toLowerCase() === 'applied');

    return searchMatch && statusMatch;
  });

  const handleStatusUpdate = async (newStatus) => {
    if (!selectedCandidate) return;

    try {
      setUpdatingStatus(true);
      const candidateId = selectedCandidate.raw?._id || selectedCandidate.id;
      await API.put(`/recruitment/${candidateId}`, { status: newStatus });
      setSelectedCandidate({ ...selectedCandidate, status: newStatus });
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
      setCandidateForm(emptyCandidateForm);
      await fetchRecruitmentData();
    } catch (err) {
      setFormError(err?.response?.data?.message || 'Failed to analyze candidate.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.dashboardGrid}>
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

      <div className={styles.chartContainer} style={{ width: '100%', boxSizing: 'border-box' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '18px' }}>Recruitment Pipeline</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '10px 0', width: '100%' }}>
          {pipelineMetrics.map((item) => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
              <span style={{ width: '110px', minWidth: '110px', fontSize: '0.88rem', fontWeight: '600', color: '#475569', textAlign: 'left' }}>
                {item.label}
              </span>
              <div className={styles.progressBarContainer} style={{ flex: 1, margin: '0 20px', background: '#e2e8f0', height: '12px', borderRadius: '6px', overflow: 'hidden', position: 'relative' }}>
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
              <strong style={{ width: '40px', minWidth: '40px', textAlign: 'right', fontSize: '0.95rem', color: '#0f172a', fontWeight: '700' }}>
                {loading ? '...' : item.value}
              </strong>
            </div>
          ))}
        </div>
      </div>

      <form className={styles.chartContainer} onSubmit={handleSmartSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: '700', margin: 0 }}>Smart Candidate Analyzer</h3>
          <button type="submit" disabled={submitting} style={{ border: 'none', background: submitting ? '#94a3b8' : '#4f46e5', color: '#fff', borderRadius: '8px', padding: '10px 16px', fontWeight: '700', cursor: submitting ? 'not-allowed' : 'pointer' }}>
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
          <textarea name="jobRequirements" value={candidateForm.jobRequirements} onChange={handleFormChange} placeholder="Job requirements" rows="5" style={{ padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', resize: 'vertical', minHeight: '120px' }} />
          <textarea name="resumeText" value={candidateForm.resumeText} onChange={handleFormChange} placeholder="Paste resume text" rows="5" style={{ padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', resize: 'vertical', minHeight: '120px' }} />
        </div>
      </form>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div className={styles.actionFilterBar} style={{ margin: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <input
            type="text"
            className={styles.filterInput}
            placeholder="Filter applicants by name or position keyword..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            style={{ width: '320px', padding: '10px 16px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.9rem' }}
          />

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            {['All', 'Review', 'Shortlisted', 'Hired'].map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                style={{ padding: '8px 16px', border: statusFilter === status ? 'none' : '1px solid #cbd5e1', background: statusFilter === status ? '#4f46e5' : 'transparent', color: statusFilter === status ? '#fff' : '#475569', borderRadius: '8px', fontWeight: '600', fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.2s ease' }}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', width: '100%', flexWrap: 'wrap' }}>
          <div className={styles.activityStream} style={{ flex: selectedCandidate ? '1 1 620px' : '1 1 100%', transition: 'all 0.2s ease', width: '100%', overflowX: 'auto' }}>
            <table className={styles.activityTable} style={{ width: '100%', minWidth: '860px', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr>
                  <th>CANDIDATE</th>
                  <th>POSITION</th>
                  <th>EXPERIENCE</th>
                  <th>MATCH</th>
                  <th>SMART FIT</th>
                  <th>INTERVIEW DATE</th>
                  <th>STATUS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>Syncing active database candidate roster metrics...</td>
                  </tr>
                ) : filteredCandidates.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>No candidate profile entries found matching your filter criteria.</td>
                  </tr>
                ) : (
                  filteredCandidates.map((candidate) => {
                    const normalizedStatus = candidate.status.toLowerCase();
                    const statusColors = normalizedStatus === 'hired' || normalizedStatus === 'shortlisted'
                      ? { background: '#d1fae5', color: '#065f46', border: '1px solid #a7f3d0' }
                      : { background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a' };
                    const isCurrentSelection = selectedCandidate?.id === candidate.id;

                    return (
                      <tr key={candidate.id} style={{ backgroundColor: isCurrentSelection ? '#f1f5f9' : 'transparent', transition: 'background-color 0.15s ease' }}>
                        <td><strong style={{ color: '#0f172a', fontWeight: '700' }}>{candidate.name}</strong></td>
                        <td style={{ color: '#475569', fontWeight: '500' }}>{candidate.position}</td>
                        <td style={{ color: '#475569', fontWeight: '500' }}>{candidate.experience}</td>
                        <td style={{ color: candidate.matchScore >= 70 ? '#059669' : '#475569', fontWeight: '800' }}>{candidate.matchScore}%</td>
                        <td style={{ color: '#475569', fontWeight: '600' }}>{candidate.aiRecommendation}</td>
                        <td style={{ color: '#475569', fontWeight: '500' }}>{candidate.interviewDate}</td>
                        <td>
                          <span style={{ ...statusColors, display: 'inline-block', minWidth: '95px', textAlign: 'center', padding: '4px 12px', borderRadius: '12px', fontWeight: '600', fontSize: '0.8rem', textTransform: 'capitalize' }}>
                            {candidate.status}
                          </span>
                        </td>
                        <td>
                          <button type="button" onClick={() => setSelectedCandidate(candidate)} style={{ color: '#4f46e5', background: 'none', border: 'none', fontSize: '0.88rem', fontWeight: '600', cursor: 'pointer', padding: 0 }}>
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

          {selectedCandidate && (
            <div className={styles.chartContainer} style={{ flex: '1 1 320px', minWidth: '320px', animation: 'fadeInModal 0.2s ease-out' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '700', color: '#0f172a' }}>Candidate Inspector</h3>
                <button type="button" onClick={() => setSelectedCandidate(null)} style={{ background: 'none', border: 'none', fontSize: '1.25rem', color: '#94a3b8', cursor: 'pointer', padding: '0 4px' }}>
                  &times;
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {[
                  ['Candidate ID', selectedCandidate.id],
                  ['Full Name', selectedCandidate.name],
                  ['Target Role', selectedCandidate.position],
                  ['Experience', selectedCandidate.experience],
                  ['Email Contact', selectedCandidate.email],
                  ['Phone', selectedCandidate.phone],
                  ['Matched Skills', selectedCandidate.matchedSkills.length ? selectedCandidate.matchedSkills.join(', ') : 'No matched skills logged.'],
                  ['Missing Skills', selectedCandidate.missingSkills.length ? selectedCandidate.missingSkills.join(', ') : 'No missing skills logged.']
                ].map(([label, value]) => (
                  <div key={label} style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.02em' }}>{label}</span>
                    <span style={{ fontSize: '0.92rem', fontWeight: '600', marginTop: '4px', color: '#334155' }}>{value}</span>
                  </div>
                ))}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.02em' }}>Match Score</span>
                    <span style={{ fontSize: '1.1rem', fontWeight: '800', marginTop: '4px', color: selectedCandidate.matchScore >= 70 ? '#059669' : '#334155' }}>{selectedCandidate.matchScore}%</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.02em' }}>Smart Recommendation</span>
                    <span style={{ fontSize: '0.92rem', fontWeight: '700', marginTop: '4px', color: '#334155' }}>{selectedCandidate.aiRecommendation}</span>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '16px', marginTop: '8px' }}>
                  <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.02em', marginBottom: '12px', display: 'block' }}>Update Status</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <button type="button" onClick={() => handleStatusUpdate('Review')} disabled={updatingStatus || selectedCandidate.status.toLowerCase() === 'review'} style={{ padding: '10px 16px', border: '1px solid #cbd5e1', background: selectedCandidate.status.toLowerCase() === 'review' ? '#f1f5f9' : '#fff', color: '#475569', borderRadius: '8px', fontWeight: '600', fontSize: '0.9rem', cursor: selectedCandidate.status.toLowerCase() === 'review' || updatingStatus ? 'not-allowed' : 'pointer', opacity: selectedCandidate.status.toLowerCase() === 'review' ? 0.5 : 1 }}>
                      {updatingStatus ? 'Updating...' : 'Mark as Review'}
                    </button>
                    <button type="button" onClick={() => handleStatusUpdate('Shortlisted')} disabled={updatingStatus || selectedCandidate.status.toLowerCase() === 'shortlisted'} style={{ padding: '10px 16px', border: '1px solid #6366f1', background: selectedCandidate.status.toLowerCase() === 'shortlisted' ? '#6366f1' : '#fff', color: selectedCandidate.status.toLowerCase() === 'shortlisted' ? '#fff' : '#6366f1', borderRadius: '8px', fontWeight: '600', fontSize: '0.9rem', cursor: selectedCandidate.status.toLowerCase() === 'shortlisted' || updatingStatus ? 'not-allowed' : 'pointer', opacity: selectedCandidate.status.toLowerCase() === 'shortlisted' ? 0.5 : 1 }}>
                      {updatingStatus ? 'Updating...' : 'Mark as Shortlisted'}
                    </button>
                    <button type="button" onClick={() => handleStatusUpdate('Hired')} disabled={updatingStatus || selectedCandidate.status.toLowerCase() === 'hired'} style={{ padding: '10px 16px', border: '1px solid #10b981', background: selectedCandidate.status.toLowerCase() === 'hired' ? '#10b981' : '#fff', color: selectedCandidate.status.toLowerCase() === 'hired' ? '#fff' : '#10b981', borderRadius: '8px', fontWeight: '600', fontSize: '0.9rem', cursor: selectedCandidate.status.toLowerCase() === 'hired' || updatingStatus ? 'not-allowed' : 'pointer', opacity: selectedCandidate.status.toLowerCase() === 'hired' ? 0.5 : 1 }}>
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
