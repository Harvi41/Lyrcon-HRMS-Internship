// AssetsPanel.jsx
import React, { useState, useEffect } from 'react';
import styles from '../AdminDashboardLayout.module.css';
import AssetFormModal from './AssetFormModal';
import AssetDeleteWizard from './AssetDeleteWizard';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function AssetsPanel() {
  const [assets, setAssets] = useState([
    // Seed initial visual state matching your screens in case API layer isn't committed yet
    { _id: 'AST-101', name: 'Macbook Pro', category: 'Laptop', assignedTo: 'Prince', status: 'Active', modelNumber: '95765-43210', brand: 'Apple', manufactureYear: '2025', issueDate: '01/01/2026', returnDate: '', condition: 'Excellent' }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Dialog Workflows States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState('create');
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [assetForDelete, setAssetForDelete] = useState(null);

  const fetchAssets = async () => {
    try {
      setLoading(true);
      const token = window.localStorage.getItem('corehr_token');
      const response = await fetch(`${API_BASE_URL}/api/assets`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch hardware assets matrix');
      const data = await response.json();
      setAssets(data.data || data || []);
      setError(null);
    } catch (err) {
      console.warn("API fallback context invoked:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const handleCreateClick = () => {
    setFormMode('create');
    setSelectedAsset(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (asset) => {
    setFormMode('edit');
    setSelectedAsset(asset);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (asset) => {
    setAssetForDelete(asset);
    setIsDeleteOpen(true);
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    fetchAssets();
  };

  const handleDeleteSuccess = (purgedId) => {
    setIsDeleteOpen(false);
    setAssets(prev => prev.filter(a => a._id !== purgedId));
  };

  const filteredAssets = assets.filter(asset => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      asset._id?.toLowerCase().includes(query) ||
      asset.name?.toLowerCase().includes(query) ||
      asset.category?.toLowerCase().includes(query) ||
      asset.assignedTo?.toLowerCase().includes(query)
    );
  });

  return (
    <div className={styles.dashboardGrid}>
      
      {/* ── Top Analytical Inventory Metrics Row ── */}
      <div className={styles.metricsRow} style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
        <div className={styles.metricCard}>
          <h3>TOTAL ASSETS REGISTERED</h3>
          <div className={styles.metricValueWrapper}>
            <span className={styles.metricValue}>{assets.length} Devices</span>
          </div>
        </div>
        <div className={styles.metricCard}>
          <h3>ACTIVE IN-USE ALLOCATIONS</h3>
          <div className={styles.metricValueWrapper}>
            <span className={styles.metricValue} style={{ color: '#6366f1' }}>
              {assets.filter(a => a.status?.toLowerCase() === 'active' || a.assignedTo).length} Assigned
            </span>
          </div>
        </div>
      </div>

      {/* ── Toolbar Action Filtering Controller ── */}
      <div className={styles.actionFilterBar} style={{ margin: '12px 0 0 0' }}>
        <input 
          type="text" 
          placeholder="Filter assets by name, code or operator..." 
          className={styles.filterInput}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button type="button" className={styles.primaryActionButton} onClick={handleCreateClick}>
          + Create Asset
        </button>
      </div>

      {/* ── Main Data Inventory Grid Table ── */}
      <div className={styles.activityStream}>
        <table className={styles.activityTable}>
          <thead>
            <tr>
              <th style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: '600' }}>ASSET ID</th>
              <th style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: '600' }}>ASSET NAME</th>
              <th style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: '600' }}>CATEGORY</th>
              <th style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: '600' }}>ASSIGNED TO</th>
              <th style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: '600' }}>STATUS</th>
              <th style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: '600', width: '110px' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: '24px' }}>Loading inventory...</td></tr>
            ) : filteredAssets.length === 0 ? (
              <tr>
                <td colSpan="6" className={styles.emptyState} style={{ padding: '24px', textAlign: 'center' }}>
                  No registered hardware profiles matched validation tokens.
                </td>
              </tr>
            ) : (
              filteredAssets.map((asset) => (
                <tr key={asset._id}>
                  <td><strong style={{ color: '#0f172a', fontFamily: 'monospace' }}>{asset._id}</strong></td>
                  <td><strong style={{ color: '#0f172a', fontWeight: '700' }}>{asset.name}</strong></td>
                  <td style={{ color: '#475569', fontWeight: '500' }}>{asset.category}</td>
                  <td style={{ color: '#0f172a', fontWeight: '600' }}>{asset.assignedTo || 'Unassigned'}</td>
                  <td>
                    <span className={`${styles.statusLabel} ${styles.statusActive}`}>
                      {asset.status || 'Active'}
                    </span>
                  </td>
                  <td>
                    {/* FIXED: Added inline display flex and a 14px gap spacing rule between the trigger shapes */}
                    <div className={styles.tableActionFlexContainerIconicRow} style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <button type="button" className={styles.iconicTableActionButton} onClick={() => handleEditClick(asset)} title="Edit Asset" style={{ padding: '4px', background: 'none', border: 'none', cursor: 'pointer' }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                      </button>
                      <button type="button" className={`${styles.iconicTableActionButton} ${styles.iconicDeleteColorBtn}`} onClick={() => handleDeleteClick(asset)} title="Scrub Asset" style={{ padding: '4px', background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626' }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Workflow Modal Triggers */}
      <AssetFormModal isOpen={isFormOpen} mode={formMode} assetData={selectedAsset} onClose={() => setIsFormOpen(false)} onSaved={handleFormSuccess} />
      <AssetDeleteWizard isOpen={isDeleteOpen} asset={assetForDelete} onClose={() => setIsDeleteOpen(false)} onPurgeConfirmed={handleDeleteSuccess} />
    </div>
  );
}