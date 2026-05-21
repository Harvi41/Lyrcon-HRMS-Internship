import { useState, useEffect } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

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

export default function AssetsPanel() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    category: '',
    floor: '',
    status: 'available',
    assignedTo: ''
  });

  const fetchAssets = async () => {
    try {
      const token = window.localStorage.getItem('corehr_token');
      
      const response = await fetch(`${API_BASE_URL}/api/assets`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch assets');
      
      const data = await response.json();
      setAssets(data.data || data || []);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Intentionally wrap in setTimeout or ignore to avoid strict lint rule if it's overzealous
    fetchAssets();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveAsset = async (e) => {
    e.preventDefault();
    try {
      const token = window.localStorage.getItem('corehr_token');
      const url = editId ? `${API_BASE_URL}/api/assets/${editId}` : `${API_BASE_URL}/api/assets`;
      const method = editId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to save asset');
      }

      await fetchAssets(); // Refresh list
      setShowForm(false);
      setEditId(null);
      setFormData({ name: '', code: '', category: '', floor: '', status: 'available', assignedTo: '' });
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEditClick = (asset) => {
    setFormData({
      name: asset.name,
      code: asset.code,
      category: asset.category,
      floor: asset.floor,
      status: asset.status,
      assignedTo: asset.assignedTo || ''
    });
    setEditId(asset._id);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditId(null);
    setFormData({ name: '', code: '', category: '', floor: '', status: 'available', assignedTo: '' });
  };

  const handleDeleteAsset = async (id) => {
    if (!window.confirm('Are you sure you want to delete this asset?')) return;
    
    try {
      const token = window.localStorage.getItem('corehr_token');
      const response = await fetch(`${API_BASE_URL}/api/assets/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to delete asset');
      
      setAssets(assets.filter(a => a._id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <>
      <div className="stat-grid">
        <article className="stat-card">
          <p className="stat-label">TOTAL ASSETS</p>
          <div className="stat-value-row">
            <h3 className="stat-value">{assets.length}</h3>
          </div>
        </article>
        <article className="stat-card">
          <p className="stat-label">AVAILABLE ASSETS</p>
          <div className="stat-value-row">
            <h3 className="stat-value">{assets.filter(a => a.status === 'available' || !a.assignedTo).length}</h3>
          </div>
        </article>
        <article className="stat-card stat-card-action">
          <button className="main-btn inline-btn" onClick={() => showForm ? handleCancelForm() : setShowForm(true)}>
            {showForm ? 'Cancel' : 'Register New Asset'}
          </button>
        </article>
      </div>

      {showForm && (
        <Panel title={editId ? "Edit Asset Details" : "Register New Asset"} className="assets-form-panel" style={{ marginBottom: '24px' }}>
          <form onSubmit={handleSaveAsset} style={{ display: 'grid', gap: '16px', gridTemplateColumns: '1fr 1fr' }}>
            <div className="input-group">
              <label className="input-label">Asset Name</label>
              <input required type="text" name="name" value={formData.name} onChange={handleInputChange} className="input-field" placeholder="e.g. MacBook Pro M3" />
            </div>
            <div className="input-group">
              <label className="input-label">Asset Code / Serial</label>
              <input required type="text" name="code" value={formData.code} onChange={handleInputChange} className="input-field" placeholder="e.g. MAC-001" disabled={!!editId} />
            </div>
            <div className="input-group">
              <label className="input-label">Category</label>
              <input required type="text" name="category" value={formData.category} onChange={handleInputChange} className="input-field" placeholder="e.g. Laptop, Monitor" />
            </div>
            <div className="input-group">
              <label className="input-label">Floor / Location</label>
              <input required type="text" name="floor" value={formData.floor} onChange={handleInputChange} className="input-field" placeholder="e.g. Floor 3, IT Dept" />
            </div>
            <div className="input-group">
              <label className="input-label">Status</label>
              <select name="status" value={formData.status} onChange={handleInputChange} className="input-field">
                <option value="available">Available</option>
                <option value="assigned">Assigned</option>
                <option value="maintenance">Maintenance</option>
                <option value="damaged">Damaged</option>
              </select>
            </div>
            <div className="input-group">
              <label className="input-label">Assign To Employee Name</label>
              <input type="text" name="assignedTo" value={formData.assignedTo} onChange={handleInputChange} className="input-field" placeholder="e.g. John Doe" />
            </div>
            <div style={{ gridColumn: '1 / -1', marginTop: '8px', display: 'flex', gap: '12px' }}>
              <button type="submit" className="main-btn">{editId ? 'Update Asset' : 'Save Asset'}</button>
              <button type="button" className="ghost-btn" onClick={handleCancelForm}>Cancel</button>
            </div>
          </form>
        </Panel>
      )}

      <Panel title="Asset Inventory">
        <div className="payroll-table">
          <div className="payroll-head row" style={{ gridTemplateColumns: '2fr 1fr 1.5fr 1fr 1fr 1.5fr' }}>
            <span>Asset Name</span>
            <span>Code</span>
            <span>Assigned To</span>
            <span>Location</span>
            <span>Status</span>
            <span>Actions</span>
          </div>
          {loading ? <div style={{ padding: '24px', textAlign: 'center' }}>Loading...</div> : 
           error ? <div style={{ padding: '24px', textAlign: 'center', color: 'red' }}>{error}</div> :
           assets.length === 0 ? <div style={{ padding: '24px', textAlign: 'center' }}>No assets found.</div> :
           assets.map((asset) => (
            <div className="payroll-body row" key={asset._id} style={{ gridTemplateColumns: '2fr 1fr 1.5fr 1fr 1fr 1.5fr', alignItems: 'center' }}>
              <div>
                <div className="strong">{asset.name}</div>
                <div className="subtle">{asset.category}</div>
              </div>
              <span className="mono">{asset.code}</span>
              <span className={asset.assignedTo ? 'strong' : 'subtle'}>
                {asset.assignedTo ? asset.assignedTo : 'Unassigned'}
              </span>
              <span>{asset.floor}</span>
              <span>
                <span className={`badge ${asset.damaged || asset.status === 'damaged' ? 'danger' : (asset.status === 'available' && !asset.assignedTo ? 'success' : 'warning')}`}>
                  {asset.damaged ? 'Damaged' : asset.status}
                </span>
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="ghost-btn" onClick={() => handleEditClick(asset)}>Edit</button>
                <button className="ghost-btn" onClick={() => handleDeleteAsset(asset._id)} style={{ color: 'red' }}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </>
  );
}
